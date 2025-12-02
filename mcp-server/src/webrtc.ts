import SimplePeer from 'simple-peer';

export class WebRTCConnection {
  private peer: SimplePeer.Instance | null = null;
  private code: string;
  private signalingUrl: string;
  private onMessageCallback?: (message: any) => void;
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private isConnected: boolean = false;
  private pollingInterval?: NodeJS.Timeout;

  constructor(code: string, signalingUrl: string) {
    this.code = code;
    this.signalingUrl = signalingUrl;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Desktop acts as answerer (not initiator)
        this.peer = new SimplePeer({
          initiator: false,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('signal', async (signal) => {
          // Send answer to signaling server
          try {
            await fetch(`${this.signalingUrl}/answer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: this.code, signal })
            });
          } catch (error) {
            console.error('Failed to send answer:', error);
          }
        });

        this.peer.on('connect', () => {
          console.log('✅ Connected to mobile device!');
          this.isConnected = true;
          if (this.onConnectCallback) {
            this.onConnectCallback();
          }
          resolve();
        });

        this.peer.on('data', (data) => {
          try {
            const message = JSON.parse(data.toString());
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

        // Start polling for offer from mobile
        this.startPollingForOffer();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async startPollingForOffer(): Promise<void> {
    const poll = async () => {
      try {
        const response = await fetch(`${this.signalingUrl}/poll?code=${this.code}`);
        if (response.ok) {
          const data = await response.json() as { signal?: any };
          if (data.signal && this.peer) {
            // Received offer from mobile, signal the peer
            this.peer.signal(data.signal);
            // Stop polling once we got the offer
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
    this.pollingInterval = setInterval(poll, 2000);
    // Initial poll
    await poll();
  }

  send(message: any): void {
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

  onMessage(callback: (message: any) => void): void {
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

