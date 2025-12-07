import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WebRTCConnection } from './webrtc';

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
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_next_command',
          description: 'Get the next pending command from the mobile device',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'send_message',
          description: 'Send a message or status update to the mobile device',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to send to the user',
              },
            },
            required: ['message'],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'get_next_command') {
      const command = commandQueue.shift();

      if (!command) {
        return {
          content: [
            {
              type: 'text',
              text: 'No pending commands.',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: command,
          },
        ],
      };
    }

    if (name === 'send_message') {
      const message = (args as { message?: string })?.message;

      if (!message) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Message is required',
            },
          ],
          isError: true,
        };
      }

      // Send message to mobile via WebRTC
      webrtc.send({
        type: 'result', // Using 'result' type for general messages for now
        data: message,
        timestamp: Date.now(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Message sent to mobile: ${message}`,
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

  // Connect WebRTC listeners
  // Note: We don't call connect() here anymore, UniversalAgent handles that
  webrtc.onConnect(() => {
    console.log('📱 [MCP] Mobile device connected');
  });

  webrtc.onMessage((message) => {
    // If it's a command, add it to the queue
    if (message.type === 'command' && message.text) {
      console.log(`   [MCP] Queuing command: ${message.text}`);
      commandQueue.push(message.text);
    }
  });

  // Start MCP server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('✅ MCP Server initialized (stdio transport)');
}

