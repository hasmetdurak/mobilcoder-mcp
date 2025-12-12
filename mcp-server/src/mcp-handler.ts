import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WebRTCConnection } from './webrtc';
import { 
  validatePath, 
  validateFile, 
  validateCommand, 
  sanitizeInput, 
  sanitizePath,
  rateLimiters,
  securityLogger,
  generateSecureToken
} from './security';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Queue to store commands received from mobile
const commandQueue: string[] = [];

export async function setupMCPServer(webrtc: WebRTCConnection): Promise<void> {
  // Create MCP server
  const server = new Server(
    {
      name: 'mobile-coder-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Set up error handling
  server.onerror = (error: any) => {
    console.error('[MCP Error]', error);
    securityLogger.log('mcp_server_error', { error: error.message || 'Unknown error' }, 'medium');
  };

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_next_command',
          description: 'Get next pending command from mobile device',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'send_message',
          description: 'Send a message or status update to mobile device',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to send to user',
              },
            },
            required: ['message'],
          },
        },
        {
          name: 'list_directory',
          description: 'List files and directories in a path',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The directory path to list (relative to cwd)',
              },
            },
          },
        },
        {
          name: 'read_file',
          description: 'Read contents of a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The file path to read',
              },
            },
            required: ['path'],
          },
        },
      ],
    };
  });

  // Handle tool calls from MCP (Claude/Cursor)
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;

    if (name === 'get_next_command') {
      const command = commandQueue.shift();
      if (!command) {
        return { content: [{ type: 'text', text: 'No pending commands.' }] };
      }
      return { content: [{ type: 'text', text: command }] };
    }

    if (name === 'send_message') {
      const message = (args as { message?: string })?.message;
      if (!message) {
        return { content: [{ type: 'text', text: 'Error: Message is required' }], isError: true };
      }
      
      // Sanitize message content
      const sanitizedMessage = sanitizeInput(message);
      
      // Check if message contains diff data
      if (typeof args === 'object' && (args as any).diff) {
        webrtc.send({
          type: 'result',
          data: {
            diff: (args as any).diff,
            oldCode: (args as any).oldCode,
            newCode: (args as any).newCode,
            fileName: (args as any).fileName
          },
          timestamp: Date.now()
        });
      } else {
        webrtc.send({ type: 'result', data: sanitizedMessage, timestamp: Date.now() });
      }
      
      return { content: [{ type: 'text', text: `Message sent to mobile: ${typeof args === 'object' ? 'Diff data' : sanitizedMessage}` }] };
    }

    if (name === 'list_directory') {
      try {
        const requestId = generateSecureToken(16);
        const fileList = await handleListDirectory(process.cwd(), args as any, requestId);
        return { content: [{ type: 'text', text: JSON.stringify(fileList) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: error.message }], isError: true };
      }
    }

    if (name === 'read_file') {
      try {
        const requestId = generateSecureToken(16);
        const content = await handleReadFile(process.cwd(), args as any, requestId);
        return { content: [{ type: 'text', text: content }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: error.message }], isError: true };
      }
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  });

  // Connect WebRTC listeners
  webrtc.onConnect(() => {
    console.log('📱 [MCP] Mobile device connected');
    securityLogger.log('mobile_device_connected', { timestamp: Date.now() }, 'low');
  });

  webrtc.onMessage(async (message: any) => {
    // Handle command queueing
    if (message.type === 'command' && message.text) {
      const sanitizedCommand = sanitizeInput(message.text);
      
      // Rate limiting
      if (!rateLimiters.commands.isAllowed('command')) {
        securityLogger.logRateLimitExceeded('command', 'queue_command');
        webrtc.send({
          type: 'error',
          data: 'Rate limit exceeded. Please try again later.',
          timestamp: Date.now()
        });
        return;
      }
      
      // Command validation
      const commandValidation = validateCommand(sanitizedCommand);
      if (!commandValidation.valid) {
        securityLogger.logBlockedCommand(sanitizedCommand, commandValidation.error || 'Unknown reason');
        webrtc.send({
          type: 'error',
          data: 'Command blocked for security reasons.',
          timestamp: Date.now()
        });
        return;
      }
      
      console.log(`   [MCP] Queuing command: ${sanitizedCommand}`);
      commandQueue.push(sanitizedCommand);
    }

    // Handle direct tool calls from mobile (for File Explorer)
    if (message.type === 'tool_call') {
      const { tool, data, id } = message;
      console.log(`🛠️ [MCP] Tool call received: ${tool}`, data);

      try {
        let result;
        if (tool === 'list_directory') {
          result = await handleListDirectory(process.cwd(), data, id);
        } else if (tool === 'read_file') {
          result = await handleReadFile(process.cwd(), data, id);
        } else {
          throw new Error(`Unknown tool: ${tool}`);
        }

        webrtc.send({
          type: 'tool_result',
          id: id, // Echo back ID for correlation
          tool: tool,
          data: result,
          timestamp: Date.now()
        });
      } catch (error: any) {
        console.error(`❌ [MCP] Tool execution failed: ${error.message}`);
        securityLogger.log('tool_execution_failed', { tool, error: error.message }, 'medium');
        webrtc.send({
          type: 'tool_result',
          id: id,
          tool: tool,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
  });

  // Start MCP server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('✅ MCP Server initialized (stdio transport)');
  securityLogger.log('mcp_server_started', { timestamp: Date.now() }, 'low');
}

// Helper functions for file system operations
async function handleListDirectory(cwd: string, args: { path?: string }, requestId?: string) {
  const dirPath = args?.path || '.';
  const sanitizedPath = sanitizePath(dirPath);
  
  // Rate limiting
  if (!rateLimiters.fileOperations.isAllowed(requestId || 'unknown')) {
    securityLogger.logRateLimitExceeded(requestId || 'unknown', 'list_directory');
    throw new Error('Rate limit exceeded for directory operations');
  }
  
  // Security validation
  const pathValidation = validatePath(sanitizedPath, cwd);
  if (!pathValidation.valid) {
    securityLogger.logPathTraversal(sanitizedPath, path.resolve(cwd, sanitizedPath));
    throw new Error(`Access denied: ${pathValidation.error}`);
  }

  try {
    const stats = await fs.promises.stat(path.resolve(cwd, sanitizedPath));
    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory');
    }
    
    const files = await fs.promises.readdir(path.resolve(cwd, sanitizedPath), { withFileTypes: true });
    const fileList = files.map((f) => ({
      name: f.name,
      isDirectory: f.isDirectory(),
      path: path.join(sanitizedPath, f.name).replace(/\\/g, '/'), // Normalize paths
    }));

    // Sort: directories first, then files
    fileList.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });

    return fileList;
  } catch (error: any) {
    securityLogger.log('directory_list_error', { path: sanitizedPath, error: error.message }, 'medium');
    throw new Error(`Error listing directory: ${error.message}`);
  }
}

async function handleReadFile(cwd: string, args: { path?: string }, requestId?: string) {
  const filePath = args?.path;
  if (!filePath) throw new Error('Path is required');

  const sanitizedPath = sanitizePath(filePath);
  
  // Rate limiting
  if (!rateLimiters.fileOperations.isAllowed(requestId || 'unknown')) {
    securityLogger.logRateLimitExceeded(requestId || 'unknown', 'read_file');
    throw new Error('Rate limit exceeded for file operations');
  }
  
  // Security validation
  const fileValidation = validateFile(sanitizedPath, cwd);
  if (!fileValidation.valid) {
    securityLogger.log('file_access_denied', { path: sanitizedPath, reason: fileValidation.error }, 'high');
    throw new Error(`Access denied: ${fileValidation.error}`);
  }

  try {
    const fullPath = path.resolve(cwd, sanitizedPath);
    const stats = await fs.promises.stat(fullPath);
    if (stats.isDirectory()) {
      throw new Error('Path is a directory, not a file');
    }
    
    return await fs.promises.readFile(fullPath, 'utf-8');
  } catch (error: any) {
    securityLogger.log('file_read_error', { path: sanitizedPath, error: error.message }, 'medium');
    throw new Error(`Error reading file: ${error.message}`);
  }
}
