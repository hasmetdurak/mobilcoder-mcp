import SimplePeer from 'simple-peer';

export interface WebRTCMessage {
  type: 'command' | 'result' | 'command_received' | 'error' | 'tools_list' | 'cli_output' | 'cli_command';
  text?: string;
  command?: string;
  tool?: string;
  tools?: any[];
  data?: any;
  timestamp?: number;
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

  constructor(code: string, signalingUrl: string = 'https://mcp-signal.workers.dev') {
    this.code = code;
    this.signalingUrl = signalingUrl;
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
            if (this.onMessageCallback) {
              this.onMessageCallback(message);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
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
        this.peer.send(JSON.stringify(message));
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

