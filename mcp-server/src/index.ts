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
  .description('Initialize MCP server and configure Cursor/Windsurf')
  .option('-c, --code <code>', 'Connection code from mobile app')
  .option('-s, --signaling <url>', 'Signaling server URL', 'https://mcp-signal.workers.dev')
  .action(async (options) => {
    const code = options.code || generateConnectionCode();
    const signalingUrl = options.signaling;

    console.log('🚀 Initializing MobileCoderMCP...\n');

    // Create MCP config for Cursor
    const cursorConfigPath = path.join(os.homedir(), '.cursor', 'mcp.json');
    await configureCursor(cursorConfigPath, code, signalingUrl);

    // Create MCP config for Windsurf
    const windsurfConfigPath = path.join(os.homedir(), '.codeium', 'windsurf', 'mcp_config.json');
    await configureWindsurf(windsurfConfigPath, code, signalingUrl);

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
  .action(async () => {
    console.log('🔄 Resetting MobileCoderMCP...\n');
    
    const cursorConfigPath = path.join(os.homedir(), '.cursor', 'mcp.json');
    const windsurfConfigPath = path.join(os.homedir(), '.codeium', 'windsurf', 'mcp_config.json');

    await removeFromConfig(cursorConfigPath, 'mobile-coder');
    await removeFromConfig(windsurfConfigPath, 'mobile-coder');

    console.log('✅ Configuration reset complete\n');
  });

program.parse();

function generateConnectionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function configureCursor(configPath: string, code: string, signalingUrl: string) {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let config: any = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️  Could not read existing Cursor config, creating new one');
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
  console.log('✅ Cursor configuration updated');
}

async function configureWindsurf(configPath: string, code: string, signalingUrl: string) {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let config: any = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️  Could not read existing Windsurf config, creating new one');
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
  console.log('✅ Windsurf configuration updated');
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

