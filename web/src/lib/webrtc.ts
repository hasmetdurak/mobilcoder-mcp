import SimplePeer from 'simple-peer';
import { sanitizeCommand, sanitizeForDisplay, generateSecureToken, commandRateLimiter } from './security';

export interface WebRTCMessage {
  type: 'command' | 'result' | 'command_received' | 'error' | 'tools_list' | 'cli_output' | 'cli_command' | 'tool_call' | 'tool_result';
  text?: string;
  command?: string;
  tool?: string;
  tools?: any[];
  data?: any;
  timestamp?: number;
  id?: string;
  error?: string;
  sessionId?: string;
  checksum?: string;
}

// Message validation
function validateMessage(message: any): WebRTCMessage | null {
  if (!message || typeof message !== 'object') {
    return null;
  }
  
  const allowedTypes = ['command', 'result', 'command_received', 'error', 'tools_list', 'cli_output', 'cli_command', 'tool_call', 'tool_result'];
  if (!allowedTypes.includes(message.type)) {
    return null;
  }
  
  // Sanitize text content
  if (message.text) {
    message.text = sanitizeForDisplay(message.text);
  }
  
  if (message.command) {
    message.command = sanitizeCommand(message.command);
  }
  
  // Add session identifier
  if (!message.sessionId) {
    message.sessionId = generateSecureToken(16);
  }
  
  return message as WebRTCMessage;
}

// Create checksum for message integrity
function createChecksum(message: WebRTCMessage): string {
  const data = JSON.stringify({
    type: message.type,
    text: message.text,
    command: message.command,
    timestamp: message.timestamp
  });
  return btoa(data).slice(0, 16);
}

export class WebRTCClient {
  private peer: SimplePeer.Instance | null = null;
  private code: string;
  private signalingUrl: string;
  private onMessageCallback?: (message: WebRTCMessage) => void;
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private isConnected: boolean = false;
  private pollingInterval?: number;
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();

  constructor(code: string, signalingUrl: string = 'https://mcp-signal.workers.dev') {
    this.code = code;
    this.signalingUrl = signalingUrl;
  }

  async callTool(name: string, args: any = {}): Promise<any> {
    if (!this.isConnected || !this.peer) {
      throw new Error('Not connected');
    }

    // Rate limiting
    if (!commandRateLimiter.isAllowed('tool_call')) {
      throw new Error('Rate limit exceeded for tool calls');
    }

    const requestId = generateSecureToken(16);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timed out'));
        }
      }, 10000);

      const message: WebRTCMessage = {
        type: 'tool_call',
        tool: name,
        data: args,
        id: requestId,
        timestamp: Date.now(),
      };

      message.checksum = createChecksum(message);
      this.send(message);
    });
  }

  private handleIncomingMessage(message: WebRTCMessage) {
    // Validate message structure
    const validatedMessage = validateMessage(message);
    if (!validatedMessage) {
      console.warn('Invalid message received:', message);
      return;
    }

    // Verify message integrity if checksum is present
    if (validatedMessage.checksum) {
      const expectedChecksum = createChecksum(validatedMessage);
      if (validatedMessage.checksum !== expectedChecksum) {
        console.warn('Message checksum mismatch:', validatedMessage);
        return;
      }
    }

    // Check if it's a response to a request
    if (validatedMessage.type === 'tool_result' && validatedMessage.id && this.pendingRequests.has(validatedMessage.id)) {
      const { resolve, reject } = this.pendingRequests.get(validatedMessage.id)!;
      this.pendingRequests.delete(validatedMessage.id);

      if (validatedMessage.error) {
        reject(new Error(validatedMessage.error));
      } else {
        resolve(validatedMessage.data);
      }
      return; // Don't propagate to general listener
    }

    if (this.onMessageCallback) {
      this.onMessageCallback(validatedMessage);
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Mobile acts as initiator
        this.peer = new SimplePeer({
          initiator: true,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('signal', async (signal) => {
          // Send offer to signaling server
          try {
            await fetch(`${this.signalingUrl}/offer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: this.code, signal })
            });
          } catch (error) {
            console.error('Failed to send offer:', error);
          }
        });

        this.peer.on('connect', () => {
          console.log('✅ Connected to desktop!');
          this.isConnected = true;
          if (this.onConnectCallback) {
            this.onConnectCallback();
          }
          resolve();
        });

        this.peer.on('data', (data) => {
          try {
            const message = JSON.parse(data.toString()) as WebRTCMessage;
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
            // Don't crash on malformed messages
          }
        });

        this.peer.on('error', (error) => {
          console.error('WebRTC error:', error);
          this.isConnected = false;
          if (this.onDisconnectCallback) {
            this.onDisconnectCallback();
          }
          reject(error);
        });

        this.peer.on('close', () => {
          console.log('❌ Connection closed');
          this.isConnected = false;
          if (this.onDisconnectCallback) {
            this.onDisconnectCallback();
          }
        });

        // Start polling for answer from desktop
        this.startPollingForAnswer();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async startPollingForAnswer(): Promise<void> {
    const poll = async () => {
      try {
        const response = await fetch(`${this.signalingUrl}/answer?code=${this.code}`);
        if (response.ok) {
          const data = await response.json() as { signal?: any };
          if (data.signal && this.peer) {
            // Received answer from desktop, signal the peer
            this.peer.signal(data.signal);
            // Stop polling once we got the answer
            if (this.pollingInterval) {
              clearInterval(this.pollingInterval);
            }
          }
        }
      } catch (error) {
        // Silently handle polling errors
      }
    };

    // Poll every 2 seconds
    this.pollingInterval = window.setInterval(poll, 2000);
    // Initial poll
    await poll();
  }

  send(message: WebRTCMessage): void {
    if (this.peer && this.isConnected) {
      try {
        // Validate and sanitize message before sending
        const validatedMessage = validateMessage(message);
        if (!validatedMessage) {
          console.error('Invalid message rejected:', message);
          return;
        }

        // Add checksum for integrity
        validatedMessage.checksum = createChecksum(validatedMessage);
        
        this.peer.send(JSON.stringify(validatedMessage));
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
      console.warn('Cannot send message: not connected');
    }
  }

  onMessage(callback: (message: WebRTCMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  disconnect(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isConnected = false;
  }

  getConnected(): boolean {
    return this.isConnected;
  }
}
