import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WebRTCConnection } from './webrtc';

export async function startMCPServer(webrtc: WebRTCConnection): Promise<void> {
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
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'execute_command',
          description: 'Execute a coding command from mobile device',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The command to execute (e.g., "Add a login form", "Fix the navbar")',
              },
            },
            required: ['command'],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'execute_command') {
      const command = (args as { command?: string })?.command;
      
      if (!command) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Command is required',
            },
          ],
          isError: true,
        };
      }

      // Send command to mobile via WebRTC (for acknowledgment)
      // The actual execution happens through MCP protocol to Cursor/Windsurf
      webrtc.send({
        type: 'command_received',
        command: command,
        timestamp: Date.now(),
      });

      // Return the command for Cursor/Windsurf to process
      // The AI will interpret and execute the command
      return {
        content: [
          {
            type: 'text',
            text: `Command received: ${command}\n\nThis command will be processed by the AI assistant. The mobile device has been notified.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  });

  // Connect WebRTC
  console.log('🔗 Connecting to mobile device...');
  webrtc.onConnect(() => {
    console.log('📱 Mobile device connected and ready!');
  });

  webrtc.onMessage((message) => {
    console.log('📨 Message from mobile:', message);
  });

  webrtc.onDisconnect(() => {
    console.log('📱 Mobile device disconnected');
  });

  try {
    await webrtc.connect();
  } catch (error) {
    console.error('Failed to connect WebRTC:', error);
  }

  // Start MCP server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('🚀 MCP server started and ready!');
  console.log('   Waiting for commands from mobile device...\n');

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    webrtc.disconnect();
    process.exit(0);
  });
}

