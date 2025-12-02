import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { WebRTCClient } from '../../lib/webrtc';
import { Menu, Code, Zap, Settings as SettingsIcon, LogOut, Wifi, WifiOff } from 'lucide-react';
import { signOut } from '../../lib/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, connectionCode, isConnected, setUser, setConnectionCode, setConnected, messages } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [webrtc, setWebrtc] = useState<WebRTCClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Generate connection code if not exists
    if (!connectionCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setConnectionCode(code);
    }

    // Initialize WebRTC connection
    if (connectionCode && !webrtc) {
      const signalingUrl = import.meta.env.VITE_SIGNALING_SERVER || 'https://mcp-signal.workers.dev';
      const client = new WebRTCClient(connectionCode, signalingUrl);
      
      client.onConnect(() => {
        setConnected(true);
        setConnectionStatus('connected');
      });

      client.onDisconnect(() => {
        setConnected(false);
        setConnectionStatus('disconnected');
      });

      setWebrtc(client);
      
      // Try to connect
      setConnectionStatus('connecting');
      client.connect().catch(() => {
        setConnectionStatus('disconnected');
      });
    }

    return () => {
      if (webrtc) {
        webrtc.disconnect();
      }
    };
  }, [user, connectionCode, webrtc, navigate, setUser, setConnectionCode, setConnected]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const recentCommands = messages.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{user?.displayName || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">Connected</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-yellow-400">Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400">Disconnected</span>
                </>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Connection Status Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center justify-between">
            <div>
              {connectionStatus === 'connected' ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-medium">Connected to Desktop</span>
                </div>
              ) : connectionStatus === 'connecting' ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400 font-medium">Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-red-400 font-medium">Not Connected</span>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-1">
                {connectionStatus === 'connected' 
                  ? 'Last seen: Just now' 
                  : 'Make sure your MCP server is running'}
              </p>
            </div>
            {connectionCode && (
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Connection Code</p>
                <p className="font-mono text-lg font-bold">{connectionCode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/chat')}
            disabled={!isConnected}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Code className="w-5 h-5" />
            Start Coding
          </button>
          
          <button
            onClick={() => {
              if (webrtc && !isConnected) {
                setConnectionStatus('connecting');
                webrtc.connect().catch(() => {
                  setConnectionStatus('disconnected');
                });
              }
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Reconnect MCP
          </button>
        </div>

        {/* Recent Commands */}
        {recentCommands.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Recent Commands</h2>
            <div className="space-y-2">
              {recentCommands.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-gray-900/50 p-3 rounded-lg border border-gray-700"
                >
                  <p className="text-sm text-gray-300">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Instructions (if not connected) */}
        {!isConnected && connectionStatus === 'disconnected' && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Setup Required</h3>
            <p className="text-gray-300 mb-4">
              To connect your phone to your desktop, run this command on your computer:
            </p>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <code className="text-sm text-primary-300 font-mono">
                npx mobile-coder-mcp init --code={connectionCode}
              </code>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              After running the command, come back here and tap "Reconnect MCP"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

