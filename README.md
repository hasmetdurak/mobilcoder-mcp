# MobileCoderMCP

Code from anywhere, right from your phone. Connect your mobile device to Cursor, Windsurf, or VS Code and start coding on the go.

I built this because I wanted to code during my commute, lunch breaks, or whenever I'm away from my desk. No complicated setup, no credit card required - just sign in and start coding.

## What is this?

MobileCoderMCP is a simple web app that connects your phone to your desktop code editor using the Model Context Protocol (MCP). It creates a direct, encrypted connection between your devices, so you can send commands and see results in real-time.

Think of it as a remote control for your code editor, but instead of clicking buttons, you just type what you want to do in plain English.

## Features

- **Works on any phone** - Just open it in your browser, no app store needed
- **Direct editor integration** - Works with Cursor, Windsurf, VS Code, and Gravity IDE
- **Real-time updates** - See your changes instantly on your desktop
- **Completely free** - No hidden costs, no credit card required
- **Secure by default** - End-to-end encrypted, your code never touches our servers

## How it works

```
Your Phone → WebRTC (P2P) → Your Computer → Code Editor
```

The connection is direct between your devices. We only use a small signaling server (Cloudflare Workers) to help establish the initial connection. After that, everything flows directly between your phone and computer.

## Quick start

### On your phone

1. Visit the web app (or bookmark it)
2. Sign in with Google
3. Get your connection code

### On your computer

1. Run this command:
   ```bash
   npx mobile-coder-mcp init
   ```
2. Enter the code from your phone
3. That's it! Start coding.

The MCP server will automatically configure itself for Cursor or Windsurf. If you're using VS Code, you'll need to install an MCP extension first.

## Installation

### Prerequisites

- Node.js 18+ on your computer
- A modern browser on your phone
- Cursor, Windsurf, VS Code, or Gravity IDE installed

### Step-by-step

1. **Clone this repo** (if you want to run it yourself):
   ```bash
   git clone https://github.com/hasmetdurak/mobilcoder-mcp.git
   cd mobilcoder-mcp
   ```

2. **Install dependencies**:
   ```bash
   # Root level
   npm install
   
   # MCP server
   cd mcp-server && npm install && cd ..
   
   # Web app
   cd web && npm install && cd ..
   ```

3. **Set up Firebase** (for authentication):
   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Sign-In
   - Create a `.env` file in the `web` directory:
     ```env
     VITE_FIREBASE_API_KEY=your_key_here
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_SIGNALING_SERVER=https://your-worker.workers.dev
     ```

4. **Deploy the signaling server** (Cloudflare Workers):
   ```bash
   cd workers
   npm install
   npx wrangler deploy
   ```
   Update the `VITE_SIGNALING_SERVER` in your `.env` with the deployed URL.

5. **Run locally**:
   ```bash
   # Web app
   cd web && npm run dev
   
   # MCP server (in another terminal)
   cd mcp-server && npm run build && npm start -- --code=YOUR_CODE
   ```

## Project structure

```
mobilecoder-mcp/
├── mcp-server/          # The MCP server that runs on your computer
│   ├── src/
│   │   ├── index.ts     # CLI commands (init, start, etc.)
│   │   ├── webrtc.ts    # WebRTC connection handling
│   │   └── mcp-handler.ts # MCP protocol implementation
│   └── package.json
├── web/                 # The React web app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/         # Utilities (auth, webrtc, storage)
│   │   └── store/        # State management (Zustand)
│   └── package.json
├── workers/             # Cloudflare Workers (signaling server)
│   └── signaling.ts     # WebRTC signaling endpoints
└── README.md
```

## Usage

### First time setup

1. Open the web app on your phone
2. Sign in with Google
3. You'll see a connection code on the dashboard
4. On your computer, run:
   ```bash
   npx mobile-coder-mcp init --code=YOUR_CODE
   ```
5. The server will auto-configure your editor
6. Go back to your phone and tap "Connect"
7. Start coding!

### Daily use

1. Open the web app (you're already signed in)
2. It automatically connects to your desktop if it's online
3. Type a command and hit send
4. Watch the magic happen on your desktop

### Example commands

```
"Add a dark mode toggle to the settings page"
"Fix the bug in the login form validation"
"Create a new component called UserCard"
"Update the README with installation instructions"
```

## Development

### MCP Server

```bash
# Build
cd mcp-server
npm run build

# Start with a code
npm start -- --code=ABC123

# Check status
npm start -- status

# Reset config
npm start -- reset
```

### Web App

```bash
cd web
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Deployment

### Web App (Cloudflare Pages)

1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `cd web && npm install && npm run build`
3. Output directory: `web/dist`
4. Add environment variables from your `.env`

### Signaling Server (Cloudflare Workers)

```bash
cd workers
npx wrangler deploy
```

### MCP Server (NPM)

If you want to publish the MCP server as an npm package:

```bash
cd mcp-server
npm publish
```

## How I built this

I started this project because I was frustrated that I couldn't code when I was away from my desk. I wanted something simple, free, and secure.

**Tech choices:**
- **React + Vite** - Fast development, great DX
- **WebRTC** - Direct P2P connection, no server costs
- **Cloudflare Workers** - Free signaling server (100K requests/day)
- **MCP Protocol** - Native editor integration
- **Zustand** - Simple state management

The whole thing runs on free tiers, so there are no infrastructure costs. The connection is direct between your devices, so your code never touches any server.

## Troubleshooting

**Can't connect?**
- Make sure your computer is on and connected to the internet
- Check that the MCP server is running
- Verify your editor (Cursor/Windsurf) is open
- Try restarting the MCP server

**Commands not working?**
- Make sure your project folder is open in the editor
- Check that the files you're referencing actually exist
- Look at the error message for specific details

**Connection keeps dropping?**
- Check your internet connection on both devices
- Try disabling VPN temporarily
- Check firewall settings

For more help, check out the [User Guide](USER_GUIDE.md).

## Contributing

Found a bug? Have an idea? Pull requests are welcome!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT - Do whatever you want with it.

## Support

- **Documentation**: Check out [USER_GUIDE.md](USER_GUIDE.md)
- **Issues**: Open an issue on GitHub
- **Questions**: Feel free to reach out

---

Built with ❤️ by a developer who codes on the go
