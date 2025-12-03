#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { startMCPServer } from './mcp-handler';
import { WebRTCConnection } from './webrtc';

const program = new Command();

program
  .name('mobile-coder-mcp')
  .description('MCP server for MobileCoderMCP - enables mobile to desktop coding')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize MCP server and configure IDE')
  .option('-c, --code <code>', 'Connection code from mobile app')
  .option('-s, --signaling <url>', 'Signaling server URL', 'https://mcp-signal.workers.dev')
  .option('-i, --ide <ide>', 'IDE to configure (cursor, windsurf, vscode, qoder, treai, kiro, all)', 'all')
  .action(async (options) => {
    const code = options.code || generateConnectionCode();
    const signalingUrl = options.signaling;
    const ide = options.ide.toLowerCase();

    console.log('🚀 Initializing MobileCoderMCP...\n');

    const configs = {
      cursor: path.join(os.homedir(), '.cursor', 'mcp.json'),
      windsurf: path.join(os.homedir(), '.codeium', 'windsurf', 'mcp_config.json'),
      vscode: path.join(os.homedir(), '.vscode', 'mcp.json'),
      qoder: path.join(os.homedir(), '.qoder', 'mcp.json'),
      treai: path.join(os.homedir(), '.treai', 'mcp.json'),
      kiro: path.join(os.homedir(), '.kiro', 'mcp.json'),
    };

    if (ide === 'all') {
      for (const [ideName, configPath] of Object.entries(configs)) {
        await configureIDE(configPath, ideName, code, signalingUrl);
      }
    } else if (configs[ide as keyof typeof configs]) {
      await configureIDE(configs[ide as keyof typeof configs], ide, code, signalingUrl);
    } else {
      console.error(`❌ Unknown IDE: ${ide}`);
      console.log('   Supported: cursor, windsurf, vscode, qoder, treai, kiro, all');
      process.exit(1);
    }

    console.log(`\n✅ Setup complete!`);
    console.log(`\n📋 Your connection code: ${code}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Open your mobile app`);
    console.log(`   2. Enter this code: ${code}`);
    console.log(`   3. Start coding from your phone!\n`);
  });

program
  .command('start')
  .description('Start the MCP server')
  .option('-c, --code <code>', 'Connection code')
  .option('-s, --signaling <url>', 'Signaling server URL', 'https://mcp-signal.workers.dev')
  .action(async (options) => {
    if (!options.code) {
      console.error('❌ Error: Connection code is required');
      console.log('   Use: mobile-coder-mcp start --code=YOUR_CODE');
      process.exit(1);
    }

    console.log('🔌 Starting MCP server...');
    console.log(`   Connection code: ${options.code}`);
    console.log(`   Signaling server: ${options.signaling}\n`);

    // Initialize WebRTC connection
    const webrtc = new WebRTCConnection(options.code, options.signaling);

    // Start MCP server with WebRTC handler
    await startMCPServer(webrtc);
  });

program
  .command('status')
  .description('Check connection status')
  .action(() => {
    console.log('📊 Checking connection status...\n');
    // TODO: Implement status check
    console.log('Status: Not implemented yet');
  });

program
  .command('reset')
  .description('Reset connection and remove config')
  .option('-i, --ide <ide>', 'IDE to reset (cursor, windsurf, vscode, qoder, treai, kiro, all)', 'all')
  .action(async (options) => {
    console.log('🔄 Resetting MobileCoderMCP...\n');

    const configs = {
      cursor: path.join(os.homedir(), '.cursor', 'mcp.json'),
      windsurf: path.join(os.homedir(), '.codeium', 'windsurf', 'mcp_config.json'),
      vscode: path.join(os.homedir(), '.vscode', 'mcp.json'),
      qoder: path.join(os.homedir(), '.qoder', 'mcp.json'),
      treai: path.join(os.homedir(), '.treai', 'mcp.json'),
      kiro: path.join(os.homedir(), '.kiro', 'mcp.json'),
    };

    const ide = options.ide.toLowerCase();

    if (ide === 'all') {
      for (const configPath of Object.values(configs)) {
        await removeFromConfig(configPath, 'mobile-coder');
      }
    } else if (configs[ide as keyof typeof configs]) {
      await removeFromConfig(configs[ide as keyof typeof configs], 'mobile-coder');
    }

    console.log('✅ Configuration reset complete\n');
  });

program.parse();

function generateConnectionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function configureIDE(configPath: string, ideName: string, code: string, signalingUrl: string) {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let config: any = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn(`⚠️  Could not read existing ${ideName} config, creating new one`);
    }
  }

  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  const serverPath = path.join(__dirname, '..', 'dist', 'index.js');

  config.mcpServers['mobile-coder'] = {
    command: 'node',
    args: [serverPath, 'start', '--code', code, '--signaling', signalingUrl],
    env: {
      MCP_CONNECTION_CODE: code,
      MCP_SIGNALING_URL: signalingUrl
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ ${ideName.charAt(0).toUpperCase() + ideName.slice(1)} configuration updated`);
}

async function removeFromConfig(configPath: string, serverName: string) {
  if (!fs.existsSync(configPath)) {
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.mcpServers && config.mcpServers[serverName]) {
      delete config.mcpServers[serverName];
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Removed ${serverName} from ${path.basename(configPath)}`);
    }
  } catch (e) {
    console.warn(`⚠️  Could not update ${configPath}`);
  }
}
