workbox-91016641.js:44 workbox Router is responding to: /
chunk-6GSFWH52.js?v=4ef7884a:21551 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
simple-peer.js?v=4ef7884a:2328 Uncaught ReferenceError: global is not defined
    at ../node_modules/randombytes/browser.js (simple-peer.js?v=4ef7884a:2328:18)
    at __require (chunk-G3PMV62Z.js?v=4ef7884a:8:50)
    at ../node_modules/simple-peer/index.js (simple-peer.js?v=4ef7884a:5016:23)
    at __require (chunk-G3PMV62Z.js?v=4ef7884a:8:50)
    at simple-peer.js?v=4ef7884a:5859:16
workbox-91016641.js:44 workbox Router is responding to: /registerSW.js
(dizin):1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
(dizin):1 Error while trying to use the following icon from the Manifest: http://localhost:3000/icon-192.png (Download error or resource isn't a valid image)
workbox-91016641.js:44 workbox Router is responding to: /
# MobileCoderMCP 2.0 - Universal AI CLI Controller

**The first and only universal mobile controller for AI development tools.**

Control Claude Code, Gemini CLI, Codex CLI, Cursor, Windsurf, VS Code, and Gravity IDE from your mobile device. Send commands, review changes, and manage projects from anywhere.

![Status](https://img.shields.io/badge/Status-Beta-blue) ![Version](https://img.shields.io/badge/Version-2.0-green)

---

## 🚀 Vision

**MobileCoderMCP 2.0** transforms your mobile device into a universal remote control for your AI coding workflow. Whether you use Anthropic's Claude Code, Google's Gemini CLI, or the Cursor IDE, you can now control them all from a single, beautiful mobile interface.

### Why?
- **Claude Code** ($20/mo) is desktop-only.
- **Gemini CLI** is free but terminal-only.
- **Cursor/Windsurf** are desktop applications.
- **You** want to code from anywhere.

---

## ✨ Key Features

### 1. Universal CLI Adapter (The Core Innovation)
Unlike other tools that lock you into one ecosystem, MobileCoderMCP acts as a universal bridge. It detects which AI tools you have installed and automatically configures them.

- ✅ **Claude Code Support:** Full control over Anthropic's agent.
- ✅ **Gemini CLI Support:** Web-grounded coding with Google's latest models.
- ✅ **Cursor/Windsurf Integration:** Direct MCP connection to your favorite IDEs.
- ✅ **Terminal Access:** Run standard shell commands (git, npm, etc.) remotely.

### 2. Mobile OS Interface
A premium, app-like experience running in your mobile browser.
- **Tool Selector:** Switch between Claude, Gemini, and Cursor instantly.
- **Smart Chat:** Context-aware chat interface for each tool.
- **Diff Viewer:** Review code changes on your phone before applying.
- **Offline Queue:** Queue commands when you lose signal.

### 3. Zero Config Connection
- **WebRTC P2P:** Direct encrypted connection between phone and desktop.
- **No Cloud Costs:** Your code never touches our servers.
- **QR Code Pairing:** Scan once, connect forever.

---

## 🛠 Architecture

```
┌─────────────────────────────────────┐
│   Mobile App (React PWA)            │
│   [Tool Selector UI]                │
└──────────────┬──────────────────────┘
               │ WebRTC (P2P)
┌──────────────▼──────────────────────┐
│   Universal Agent (Node.js)         │
│   ┌─────────────────────────────┐   │
│   │   Command Router            │   │
│   │   - Routes to active tool   │   │
│   └─────────────────────────────┘   │
│   ┌─────────────────────────────┐   │
│   │   Adapters                  │   │
│   │   ├─ Claude Code CLI        │   │
│   │   ├─ Gemini CLI             │   │
│   │   └─ Cursor MCP             │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ on your computer.
- At least one AI tool installed (Claude Code, Gemini CLI, or Cursor).

### Installation

1.  **Install the Universal Agent:**
    ```bash
    npx mobile-coder-mcp init
    ```

2.  **Open the Web App:**
    Visit [mobilecodermcp.com](https://mobilecodermcp.com) (or your local deployment) on your phone.

3.  **Connect:**
    Scan the QR code displayed in your terminal.

4.  **Start Coding:**
    Select your tool (e.g., "Claude Code") and start typing commands!

---

## 📦 Supported Tools

| Tool | Status | Features |
|------|--------|----------|
| **Claude Code** | ✅ Ready | Full CLI control, streaming responses |
| **Gemini CLI** | ✅ Ready | Web grounding, multimodal support |
| **Cursor** | ✅ Ready | MCP integration, direct file editing |
| **Windsurf** | 🚧 Coming Soon | - |
| **Codex CLI** | 🚧 Coming Soon | - |

---

## 💻 Development

### Project Structure
```
mobilecoder-mcp/
├── mcp-server/          # The Universal Desktop Agent
│   ├── src/
│   │   ├── adapters/    # Tool-specific adapters (Claude, Gemini, etc.)
│   │   ├── agent.ts     # Main command router
│   │   └── webrtc.ts    # P2P networking
├── web/                 # The Mobile OS (React PWA)
│   ├── src/
│   │   ├── components/  # UI Components
│   │   └── store/       # State Management
└── workers/             # Signaling Server (Cloudflare)
```

### Running Locally

1.  **Web App:**
    ```bash
    cd web
    npm run dev
    ```

2.  **Universal Agent:**
    ```bash
    cd mcp-server
    npm run build
    npm start -- --code=TEST_CODE
    ```

---

## 📄 License

MIT License. Built by developers, for developers.
