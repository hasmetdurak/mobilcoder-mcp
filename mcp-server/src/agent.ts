import { WebRTCConnection } from './webrtc';
import { setupMCPServer } from './mcp-handler';
import { CLIAdapter } from './adapters/cli-adapter';

export class UniversalAgent {
    private webrtc: WebRTCConnection;
    private cliAdapter: CLIAdapter;
    private activeTool: 'mcp' | 'cli' = 'mcp';

    constructor(webrtc: WebRTCConnection) {
        this.webrtc = webrtc;
        this.cliAdapter = new CLIAdapter();
    }

    async start() {
        console.log('🚀 Universal Agent starting...');

        // Initialize MCP Server (Cursor integration)
        // We run this in parallel because it sets up its own listeners
        // Note: In the future, we might want to wrap this better
        setupMCPServer(this.webrtc).catch(err => {
            console.error('Failed to start MCP server:', err);
        });

        // Initialize CLI Adapter listeners
        this.cliAdapter.onOutput((data) => {
            this.webrtc.send({
                type: 'cli_output',
                data: data,
                timestamp: Date.now()
            });
        });

        // Override the WebRTC message handler to route commands
        // We need to be careful not to conflict with mcp-handler's listeners
        // Currently mcp-handler adds its own listener. SimplePeer supports multiple listeners.

        this.webrtc.onMessage((message) => {
            this.handleMessage(message);
        });

        try {
            await this.webrtc.connect();
        } catch (error) {
            console.error('Failed to connect WebRTC:', error);
        }
    }

    private handleMessage(message: any) {
        // console.log('Universal Agent received:', message);

        if (message.type === 'switch_tool') {
            this.activeTool = message.tool;
            console.log(`🔄 Switched active tool to: ${this.activeTool}`);

            this.webrtc.send({
                type: 'system',
                message: `Switched to ${this.activeTool}`
            });
            return;
        }

        if (message.type === 'cli_command') {
            const command = message.command;
            console.log(`💻 Received CLI command: ${command}`);
            this.cliAdapter.execute(command);
        }

        // MCP commands are handled by mcp-handler.ts directly via its own listener
    }
}
