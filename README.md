# MobileCoderMCP

🚀 **Code from Anywhere** - Use Cursor from your phone. Free forever.

MobileCoderMCP is a web-based mobile app that connects directly to your desktop coding environment (Cursor, Windsurf, Zed, etc.) via MCP protocol. Users sign in with Google, do one-time MCP setup, and instantly start coding from their phone.

## Features

- 📱 **Works on Any Phone** - Progressive Web App, no app store needed
- 🎯 **Direct Cursor Integration** - Seamless connection via MCP protocol
- ⚡ **Real-time Code Changes** - See your changes instantly on desktop
- 🆓 **Completely Free** - No costs, no credit card required
- 🔐 **End-to-End Encrypted** - Your code stays private and secure

## Architecture

- **Frontend**: React + Vite + TypeScript (Cloudflare Pages)
- **MCP Server**: Node.js + TypeScript (runs on desktop)
- **Signaling**: Cloudflare Workers (WebRTC coordination)
- **Connection**: WebRTC P2P (direct connection, no server costs)

## Quick Setup

### 1. Clone the repository

```bash
git clone https://github.com/hasmetdurak/mobilcoder-mcp.git
cd mobilcoder-mcp
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install MCP server dependencies
cd mcp-server
npm install

# Install web app dependencies
cd ../web
npm install
```

### 3. Setup Firebase (for authentication)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Create a `.env` file in the `web` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SIGNALING_SERVER=https://mcp-signal.workers.dev
```

### 4. Deploy Cloudflare Worker (Signaling Server)

```bash
cd workers
npm install
npx wrangler deploy
```

Update the signaling URL in your `.env` file with the deployed worker URL.

### 5. Build and run

**Web App (Development):**
```bash
cd web
npm run dev
```

**MCP Server (Development):**
```bash
cd mcp-server
npm run build
npm start -- --code=YOUR_CODE --signaling=YOUR_SIGNALING_URL
```

## Usage

### First Time Setup

1. Visit the web app and sign in with Google
2. Get your connection code from the dashboard
3. Run on your computer:
   ```bash
   npx mobile-coder-mcp init --code=YOUR_CODE
   ```
4. Start coding from your phone!

### Daily Usage

1. Open the web app (already logged in)
2. Auto-connects to desktop (if online)
3. Start typing commands immediately

## Project Structure

```
mobilecoder-mcp/
├── mcp-server/          # MCP server for desktop
│   ├── src/
│   │   ├── index.ts     # CLI entry point
│   │   ├── webrtc.ts    # WebRTC connection
│   │   └── mcp-handler.ts # MCP protocol
│   └── package.json
├── web/                 # React web app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities
│   │   └── store/       # State management
│   └── package.json
├── workers/             # Cloudflare Workers
│   └── signaling.ts     # WebRTC signaling
└── README.md
```

## Development

### MCP Server Commands

```bash
# Initialize and configure
mobile-coder-mcp init --code=ABC123

# Start server
mobile-coder-mcp start --code=ABC123

# Check status
mobile-coder-mcp status

# Reset configuration
mobile-coder-mcp reset
```

### Web App Development

```bash
cd web
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

### Cloudflare Pages (Web App)

1. Connect your GitHub repo to Cloudflare Pages
2. Set build command: `cd web && npm install && npm run build`
3. Set output directory: `web/dist`
4. Add environment variables from `.env`

### Cloudflare Workers (Signaling)

```bash
cd workers
npx wrangler deploy
```

### NPM Package (MCP Server)

```bash
cd mcp-server
npm publish
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for developers who code on the go**

