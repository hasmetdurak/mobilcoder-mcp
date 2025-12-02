# MobileCoderMCP User Guide

**Version 1.0** | Last Updated: December 2024

Welcome to MobileCoderMCP! This guide will help you set up and use MobileCoderMCP to code from anywhere using your mobile device.

---

## Table of Contents

1. [What is MobileCoderMCP?](#what-is-mobilecodermcp)
2. [Getting Started](#getting-started)
3. [Installation](#installation)
4. [First-Time Setup](#first-time-setup)
5. [Using the App](#using-the-app)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [FAQ](#faq)
9. [Support](#support)

---

## What is MobileCoderMCP?

MobileCoderMCP allows you to control your desktop coding environment (Cursor, Windsurf, VS Code) directly from your mobile phone. Send commands, review code changes, and manage your projects - all from your mobile device.

### Key Features

✨ **Mobile-First** - Code from your phone or tablet  
🔐 **Secure** - End-to-end encrypted P2P connection  
⚡ **Real-Time** - Instant command execution  
🆓 **Free to Start** - No credit card required  
🎯 **Native Integration** - Works with your favorite editors

### How It Works

```
Your Phone → WebRTC Connection → Your Computer → Cursor/Windsurf
```

MobileCoderMCP creates a direct, secure connection between your mobile device and your desktop computer using the Model Context Protocol (MCP). Your commands are sent directly to your editor, which processes them using its built-in AI.

---

## Getting Started

### Requirements

**On Your Computer:**

- macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- Node.js 18.0 or later
- One of the following editors:
  - Cursor v0.30+
  - Windsurf (latest version)
  - VS Code 1.80+ (with MCP-compatible extension)
  - Gravity IDE (latest version)

**On Your Mobile Device:**

- iOS 15+ or Android 8+
- Modern web browser (Chrome, Safari, Firefox)
- Stable internet connection

### What You'll Need

- 5 minutes of setup time
- Google account (for sign-in)
- Your computer and phone on any network

---

## Installation

### Step 1: Access the Web App

1. Open your mobile browser
2. Visit: **mobilecodermcp.com**
3. Bookmark the page for easy access

> 💡 **Tip:** Add to home screen for an app-like experience!

**iOS:** Tap Share → "Add to Home Screen"  
**Android:** Tap Menu (⋮) → "Add to Home Screen"

### Step 2: Sign In

1. Tap **"Sign in with Google"**
2. Select your Google account
3. Grant necessary permissions
4. You'll be redirected to the Dashboard

---

## First-Time Setup

### Step 3: Install MCP Server on Your Computer

The MCP Server is a small program that runs on your computer and connects your mobile device to your code editor.

**Installation Command:**

```bash
npx mobile-coder-mcp init
```

**What happens:**

1. Downloads and installs the MCP server
2. Generates a unique pairing code
3. Displays setup instructions
4. Auto-configures your editor (Cursor, Windsurf, VS Code, Gravity)

**Terminal Output:**

```
🚀 MobileCoderMCP Setup

✅ Server installed successfully!
✅ Configuration file created

Your pairing code: ABC-123-XYZ

📱 On your phone:

   1. Open MobileCoderMCP app
   2. Tap "Connect MCP"
   3. Enter code: ABC-123-XYZ

🖥️  On your computer:

   The MCP server will start automatically
   when you open Cursor/Windsurf/VS Code/Gravity.

Need help? Visit: docs.mobilecodermcp.com
```

### Step 4: Pair Your Mobile Device

**On your phone:**

1. Open the MobileCoderMCP app
2. Tap **"Connect MCP"** on the Dashboard
3. You'll see two options:

**Option A: Scan QR Code** (Easiest)
- Point your camera at the QR code shown in the terminal
- Tap to confirm pairing

**Option B: Enter Code Manually**
- Type the pairing code (e.g., ABC-123-XYZ)
- Tap **"Connect"**

**Connection Status:**

```
🔄 Connecting...
🟢 Connected to Desktop
✅ Ready to code!
```

### Step 5: Test Your Connection

1. On your phone, tap **"Start Coding"**
2. Type a simple command:

   ```
   Create a new file called hello.txt with "Hello World"
   ```

3. Tap Send (📤)
4. Watch the magic happen! ✨

**You should see:**

- ✅ "Command sent"
- 🤖 "Processing on desktop..."
- ✅ "File created successfully"

---

## Using the App

### Dashboard Screen

The Dashboard is your home base. Here you can:

```
┌─────────────────────────────┐
│  👤 Your Name         ☰     │
├─────────────────────────────┤
│  Connection Status          │
│  🟢 Connected to Desktop    │
│  Last seen: Just now        │
│                             │
│  ┌───────────────────────┐  │
│  │  🚀 Start Coding      │  │ ← Main action
│  └───────────────────────┘  │
│                             │
│  Recent Commands            │
│  • Fix navbar layout        │
│  • Add login form           │
│  • Update README            │
└─────────────────────────────┘
```

**Status Indicators:**

- 🟢 **Green:** Connected and ready
- 🟡 **Yellow:** Connecting...
- 🔴 **Red:** Disconnected
- ⚪ **Gray:** Desktop offline

### Chat Interface

This is where you send commands to your code editor.

**Interface Layout:**

```
┌─────────────────────────────┐
│  ← Dashboard      🟢        │ ← Back button + Status
├─────────────────────────────┤
│                             │
│  Your messages appear here  │
│  on the right side       → │
│                             │
│  ← MCP responses appear     │
│     on the left side        │
│                             │
├─────────────────────────────┤
│  Type a command...       📤 │ ← Input area
└─────────────────────────────┘
```

**Sending Commands:**

1. **Type naturally** - Use plain English

   ```
   "Add a dark mode toggle to the settings page"
   "Fix the bug in the login form validation"
   "Refactor the UserService class"
   ```

2. **Be specific** when needed

   ```
   "In src/App.jsx, add a new route for /about"
   "Update package.json to use React 18"
   ```

3. **Tap Send** (📤) or press Enter

**Command Examples:**

```
✅ Good Commands:
- "Add a contact form to the homepage"
- "Fix TypeScript errors in auth.ts"
- "Create a new component called UserCard"
- "Update the README with installation instructions"

❌ Avoid:
- Too vague: "Make it better"
- Too complex: "Rewrite entire application"
- Non-coding: "Send an email"
```

### Viewing Results

After sending a command, you'll see:

1. **Confirmation**

   ```
   ✅ Command sent
   ```

2. **Processing Status**

   ```
   🤖 Analyzing your project...
   🤖 Generating code changes...
   🤖 Applying changes...
   ```

3. **Result**

   ```
   ✅ Done! I've:

   • Created ContactForm.jsx
   • Updated App.jsx to import the form
   • Added form styles to styles.css
   

   [View Changes] [Undo]
   ```

**Action Buttons:**

- **View Changes:** See the code diff
- **Undo:** Revert the changes
- **Copy:** Copy command to clipboard

### Viewing Code Diffs

Tap **"View Changes"** to see what was modified:

```
┌─────────────────────────────┐
│  ContactForm.jsx       NEW  │
├─────────────────────────────┤
│  + import React from 'react'│
│  +                           │
│  + function ContactForm() {  │
│  +   return (                │
│  +     <form>...</form>      │
│  +   )                       │
│  + }                         │
│                             │
│  [Accept] [Reject] [Edit]   │
└─────────────────────────────┘
```

**Diff Legend:**

- `+` Green lines = Added code
- `-` Red lines = Removed code
- White lines = Unchanged

### Settings

Access settings from the menu (☰):

**Connection Settings:**

- View connection code
- Reconnect to desktop
- Reset pairing
- Connection history

**Preferences:**

- Dark/Light theme
- Notification settings
- Command history length
- Auto-reconnect

**Account:**

- Profile information
- Sign out
- Delete account

---

## Troubleshooting

### Connection Issues

**Problem: "Cannot connect to desktop"**

✅ **Solutions:**

1. Make sure your computer is on and connected to internet
2. Verify the MCP server is running:

   ```bash
   mobile-coder-mcp status
   ```

3. Check if your editor (Cursor/Windsurf/VS Code/Gravity) is open
4. Try restarting the MCP server:

   ```bash
   mobile-coder-mcp restart
   ```

**Problem: "Connection keeps dropping"**

✅ **Solutions:**

1. Check your internet connection on both devices
2. Disable VPN temporarily (if using)
3. Check firewall settings - allow Node.js/MCP server
4. Try switching networks (WiFi ↔ Mobile data)

**Problem: "Pairing code expired"**

✅ **Solution:**

Pairing codes expire after 5 minutes. Generate a new one:

```bash
mobile-coder-mcp generate-code
```

### Command Issues

**Problem: "Command failed"**

✅ **Check:**

1. Is your project folder open in the editor?
2. Does the file/folder you mentioned exist?
3. Are there syntax errors in your command?
4. Check the error message for specific details

**Problem: "No response from desktop"**

✅ **Solutions:**

1. Check connection status (should be 🟢)
2. Verify MCP server is running
3. Look for errors in terminal where MCP server runs
4. Try sending a simpler command first

**Problem: "Changes not appearing in editor"**

✅ **Solutions:**

1. Make sure you saved all files before sending command
2. Reload the editor window
3. Check if files are open in the editor
4. Look for permission issues (read-only files)

### Performance Issues

**Problem: "Commands are slow"**

✅ **Possible causes:**

1. Large project = longer analysis time (normal)
2. Slow internet connection
3. Computer under heavy load
4. Editor processing multiple tasks

✅ **Tips:**

- Be patient for large projects (30-60 seconds)
- Close unnecessary applications
- Upgrade internet connection
- Use more specific commands (faster processing)

**Problem: "App is laggy"**

✅ **Solutions:**

1. Close other browser tabs
2. Restart the app (close and reopen)
3. Clear browser cache
4. Try a different browser
5. Restart your phone

---

## Best Practices

### Writing Effective Commands

**1. Be Clear and Specific**

```
❌ "Add a button"
✅ "Add a submit button to the login form"
```

**2. Mention File Names When Needed**

```
❌ "Fix the error"
✅ "Fix the TypeScript error in src/utils/auth.ts"
```

**3. One Task at a Time**

```
❌ "Add login, signup, and password reset forms"
✅ "Add a login form with email and password fields"
```

**4. Provide Context**

```
❌ "Make it responsive"
✅ "Make the navigation bar responsive for mobile screens"
```

**5. Use Follow-up Commands**

```
First: "Create a UserCard component"
Then: "Add a profile picture to UserCard"
Then: "Add hover effects to UserCard"
```

### Security Best Practices

**🔐 Keep Your Connection Secure:**

1. **Never share your pairing code** publicly
2. **Use strong Google account password**
3. **Enable 2FA** on your Google account
4. **Don't pair on public computers**
5. **Disconnect when not in use** (optional)

**🖥️ Computer Security:**

1. **Lock your computer** when away
2. **Use a firewall** (but allow MCP server)
3. **Keep software updated**
4. **Monitor MCP server logs** for unusual activity

### Optimal Usage Tips

**📱 On Mobile:**

- Use in portrait mode for chat
- Rotate to landscape for viewing diffs
- Enable notifications for connection status
- Keep the app tab open for faster reconnection

**💻 On Desktop:**

- Keep editor open while coding from mobile
- Save work before sending major commands
- Review changes before accepting
- Use git commits after mobile changes

**⚡ For Best Performance:**

- Start with simple test commands
- Build up to complex tasks gradually
- Use specific file paths
- Keep projects organized

---

## FAQ

### General Questions

**Q: Is MobileCoderMCP really free?**  
A: Yes! We offer a free tier to get started. Premium features are available with paid plans.

**Q: What's included in the free tier?**  
A: Free tier includes: 20 commands/month, 1 project, community support. Perfect for trying out the app!

**Q: How much does the premium plan cost?**  
A: Hobby plan is $2.99/month (200 commands), Pro plan is $7.99/month (unlimited). See pricing page for details.

**Q: Do I need to keep the app open all the time?**  
A: No! Close it when not in use. The connection will automatically resume when you reopen.

**Q: Can I use multiple devices?**  
A: Currently, one mobile device per desktop. Multi-device support coming soon!

**Q: Does it work offline?**  
A: No, both your phone and computer need internet. Commands are queued if connection drops temporarily.

### Privacy & Security

**Q: Can you see my code?**  
A: No! The connection is direct (P2P) between your phone and computer. Nothing passes through our servers except initial pairing.

**Q: What data do you collect?**  
A: Only your email (from Google sign-in) and anonymous usage statistics (connection counts, no code).

**Q: Can someone else access my computer?**  
A: No! Only your paired device can send commands. Pairing codes expire quickly and are one-time use.

**Q: What if I lose my phone?**  
A: Sign in from a new device and reset the pairing. The old device will be automatically disconnected.

### Technical Questions

**Q: Which editors are supported?**  
A: Currently Cursor, Windsurf, VS Code (with MCP extensions), and Gravity IDE. More editors coming soon!

**Q: Do I need to keep my computer on?**  
A: Yes, your computer must be on and the MCP server running to receive commands.

**Q: What's the latency?**  
A: Typically 200-500ms depending on your internet connection and command complexity.

**Q: How much data does it use?**  
A: Very little! Average command uses ~5-20KB. Even with heavy use, expect <10MB/hour.

**Q: Can I use it on a tablet?**  
A: Yes! It works on any device with a modern web browser.

### Compatibility

**Q: Does it work with GitHub Copilot?**  
A: Yes! It works alongside any editor extensions.

**Q: Can I use it with remote SSH connections?**  
A: Yes, as long as the MCP server runs on the machine with the editor.

**Q: Does it work behind corporate firewalls?**  
A: Usually yes (uses outbound connections only), but some strict firewalls may block WebRTC. Contact your IT department if issues occur.

---

## Advanced Usage

### Command Patterns

**Creating Files:**

```
"Create a new component called Header.jsx"
"Add a new file config/database.js"
```

**Modifying Code:**

```
"Add error handling to the login function"
"Refactor UserService to use async/await"
"Add TypeScript types to auth.js"
```

**Fixing Issues:**

```
"Fix the CSS overflow issue in the sidebar"
"Resolve the 'undefined' error in line 42"
"Fix all ESLint warnings"
```

**Documentation:**

```
"Add JSDoc comments to all functions in utils.js"
"Update README with new installation steps"
"Add code comments explaining the algorithm"
```

### Keyboard Shortcuts (PWA)

When using as installed PWA:

- `Ctrl/Cmd + K` - Focus command input
- `Enter` - Send command
- `Esc` - Close modals
- `Ctrl/Cmd + R` - Refresh connection

### Working with Large Projects

**For Better Performance:**

1. **Open only relevant files** in editor
2. **Be specific** about file paths
3. **Break large tasks** into smaller commands
4. **Use folder context**: "In the components folder, create..."

### Integration with Git

**Recommended Workflow:**

1. Send command from mobile
2. Review changes on desktop (when possible)
3. Commit with descriptive message
4. Push to remote

**Git Commands via MCP:**

```
"Create a git commit with message: Add user authentication"
"Show git status"
"Create a new branch called feature/dark-mode"
```

---

## Support

### Getting Help

**📚 Documentation:**  
Visit: [docs.mobilecodermcp.com](https://docs.mobilecodermcp.com)

**💬 Community:**  
Join our Discord: [discord.gg/mobilecodermcp](https://discord.gg/mobilecodermcp)

**🐛 Report Bugs:**  
GitHub Issues: [github.com/mobilecodermcp/issues](https://github.com/mobilecodermcp/issues)

**📧 Email Support:**  
support@mobilecodermcp.com

**🐦 Twitter:**  
[@mobilecodermcp](https://twitter.com/mobilecodermcp)

### Response Times

- **Community (Discord):** Usually within hours
- **Email Support:** 24-48 hours
- **Bug Reports:** Reviewed within 1 week

### Feedback

We'd love to hear from you!

**📝 Feature Requests:**  
Vote on features: [feedback.mobilecodermcp.com](https://feedback.mobilecodermcp.com)

**⭐ Rate Us:**  
Leave a review on Product Hunt!

**🎁 Refer Friends:**  
Share with other developers and help us grow!

---

## Changelog

### Version 1.0.0 (December 2024)

- 🎉 Initial release
- ✅ Google Sign-In
- ✅ WebRTC P2P connection
- ✅ Cursor integration
- ✅ Windsurf integration
- ✅ VS Code integration
- ✅ Gravity IDE integration
- ✅ Chat interface
- ✅ Diff viewer
- ✅ Command history
- ✅ Free tier (20 commands/month)
- ✅ Premium plans available

### Coming Soon

- 🔜 Zed editor support
- 🔜 Voice commands
- 🔜 Offline command queue
- 🔜 Multi-device support
- 🔜 Team collaboration
- 🔜 Command templates
- 🔜 Mobile native apps (iOS/Android)

---

## Legal

### Terms of Service

By using MobileCoderMCP, you agree to our [Terms of Service](https://mobilecodermcp.com/terms).

### Privacy Policy

Read our [Privacy Policy](https://mobilecodermcp.com/privacy) to understand how we handle your data.

### License

MobileCoderMCP is proprietary software. The MCP server is open-source under MIT license.

---

## Quick Reference Card

### Setup Checklist

- [ ] Visit mobilecodermcp.com
- [ ] Sign in with Google
- [ ] Run `npx mobile-coder-mcp init` on computer
- [ ] Enter pairing code in mobile app
- [ ] Send test command
- [ ] Start coding!

### Common Commands

```
📁 Files:
- "Create [filename]"
- "Delete [filename]"
- "Rename [old] to [new]"

✏️ Code:
- "Add [feature] to [file]"
- "Fix [issue] in [file]"
- "Refactor [function]"

🐛 Debug:
- "Fix the error in [file]"
- "Add error handling"
- "Add console.log statements"

📝 Docs:
- "Add comments to [file]"
- "Update README"
- "Add JSDoc to [function]"
```

### Status Indicators

- 🟢 Connected
- 🟡 Connecting
- 🔴 Disconnected
- ⚪ Offline

### Need Help?

- Docs: docs.mobilecodermcp.com
- Discord: discord.gg/mobilecodermcp
- Email: support@mobilecodermcp.com

---

**Happy Coding from Anywhere! 🚀**

*MobileCoderMCP - Your Desktop, In Your Pocket*

---

*Last updated: December 2024*  
*Version: 1.0.0*  
*© 2024 MobileCoderMCP. All rights reserved.*

