import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { WebRTCClient } from '../../lib/webrtc';
import { ArrowLeft, Send, Loader } from 'lucide-react';

export default function Chat() {
  const navigate = useNavigate();
  const { user, connectionCode, isConnected, addMessage, messages, setConnected } = useStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [webrtc, setWebrtc] = useState<WebRTCClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Initialize WebRTC if not already done
    if (connectionCode && !webrtc) {
      const signalingUrl = import.meta.env.VITE_SIGNALING_SERVER || 'https://mcp-signal.workers.dev';
      const client = new WebRTCClient(connectionCode, signalingUrl);
      
      client.onConnect(() => {
        setConnected(true);
      });

      client.onDisconnect(() => {
        setConnected(false);
      });

      client.onMessage((message) => {
        if (message.type === 'result') {
          addMessage({
            text: message.data || 'Command executed successfully',
            sender: 'mcp',
          });
        } else if (message.type === 'error') {
          addMessage({
            text: `Error: ${message.data || 'Something went wrong'}`,
            sender: 'mcp',
          });
        }
        setSending(false);
      });

      setWebrtc(client);
      
      if (!isConnected) {
        client.connect().catch(() => {
          setConnected(false);
        });
      }
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [user, connectionCode, webrtc, isConnected, navigate, setConnected, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !webrtc || !isConnected || sending) return;

    const command = input.trim();
    setInput('');
    setSending(true);

    // Add user message
    addMessage({
      text: command,
      sender: 'user',
    });

    // Send command via WebRTC
    try {
      webrtc.send({
        type: 'command',
        text: command,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to send command:', error);
      addMessage({
        text: 'Failed to send command. Please try again.',
        sender: 'mcp',
      });
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Chat</h1>
          <p className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-lg mb-2">Start coding!</p>
            <p className="text-sm">Type a command below to get started</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-400">Processing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 px-4 py-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a command..." : "Connecting..."}
            disabled={!isConnected || sending}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || sending || !input.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-400 mt-2">
            Not connected. Please check your MCP server.
          </p>
        )}
      </div>
    </div>
  );
}

