import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { signOut } from '../../lib/auth';
import { ArrowLeft, LogOut, Moon, Sun, Bell, BellOff, Wifi, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, connectionCode, theme, notifications, setUser, setTheme, setNotifications, setConnectionCode } = useStore();
  const [copied, setCopied] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleCopyCode = () => {
    if (connectionCode) {
      navigator.clipboard.writeText(connectionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetConnection = () => {
    if (confirm('Are you sure you want to reset the connection? You will need to pair again.')) {
      setConnectionCode(null);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Connection */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Connection</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Connection Code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-900 p-3 rounded-lg border border-gray-700 font-mono">
                  {connectionCode || 'Not set'}
                </div>
                {connectionCode && (
                  <button
                    onClick={handleCopyCode}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={handleResetConnection}
              className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 font-semibold py-3 px-4 rounded-lg border border-red-800 transition-colors flex items-center justify-center gap-2"
            >
              <Wifi className="w-5 h-5" />
              Reset MCP Connection
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-400">Toggle dark/light theme</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifications ? (
                  <Bell className="w-5 h-5 text-gray-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-400">Enable connection alerts</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Name</p>
              <p className="font-medium">{user?.displayName}</p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 font-semibold py-3 px-4 rounded-lg border border-red-800 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">Version 1.0.0</p>
            <p className="text-gray-400">
              MobileCoderMCP - Code from anywhere
            </p>
            <a
              href="https://github.com/hasmetdurak/mobilcoder-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline"
            >
              GitHub Repository
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

