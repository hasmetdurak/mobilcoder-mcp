import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { WebRTCClient } from '../../lib/webrtc';
import { queueManager } from '../../lib/queue';
import { Loader } from 'lucide-react';
import Header from './Header';
import SmartInput from './SmartInput';
import DiffViewer from './DiffViewer';
import Sidebar from '../Dashboard/Sidebar';
import ToolSelector, { ToolType } from './ToolSelector';

export default function Chat() {
  const navigate = useNavigate();
  const { user, connectionCode, isConnected, addMessage, messages, setConnected } = useStore();
  const [sending, setSending] = useState(false);
  const [webrtc, setWebrtc] = useState<WebRTCClient | null>(null);
  const [diffData, setDiffData] = useState<{ oldCode: string; newCode: string; fileName: string; summary: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('mcp');
  const [availableTools, setAvailableTools] = useState<string[]>(['mcp', 'cursor']); // Default tools
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Initialize WebRTC if not already done
    if (connectionCode && !webrtc) {
      const signalingUrl = import.meta.env.VITE_SIGNALING_SERVER || 'https://mcp-signal.workers.dev';
      const client = new WebRTCClient(connectionCode, signalingUrl);

      client.onConnect(async () => {
        setConnected(true);
        // Process offline queue
        const queue = await queueManager.getQueue();
        if (queue.length > 0) {
          for (const item of queue) {
            client.send({
              type: 'command',
              text: item.text,
              tool: 'mcp', // Default to MCP for queued items for now
              timestamp: item.timestamp,
            });
            await queueManager.removeFromQueue(item.id);
          }
          addMessage({
            text: `Sent ${queue.length} queued commands.`,
            sender: 'mcp'
          });
        }
      });

      client.onDisconnect(() => {
        setConnected(false);
      });

      client.onMessage((message) => {
        if (message.type === 'tools_list') {
          // Update available tools based on what desktop detected
          const tools = message.tools || [];
          const toolIds = tools.map((t: any) => t.id);
          // Always keep 'cursor' (terminal) available
          if (!toolIds.includes('cursor')) toolIds.push('cursor');
          setAvailableTools(toolIds);

          addMessage({
            text: `Connected! Detected tools: ${tools.map((t: any) => t.name).join(', ')}`,
            sender: 'mcp'
          });
        } else if (message.type === 'result' || message.type === 'cli_output') {
          // Check if result contains diff data (mock check for now, real implementation depends on MCP response structure)
          if (message.data && typeof message.data === 'object' && message.data.diff) {
            setDiffData(message.data.diff);
          } else {
            addMessage({
              text: typeof message.data === 'string' ? message.data : JSON.stringify(message.data),
              sender: 'mcp',
            });
          }
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

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;

    const command = text.trim();
    setSending(true);

    // Add user message
    addMessage({
      text: command,
      sender: 'user',
    });

    if (!isConnected || !webrtc) {
      // Offline Mode: Queue command
      await queueManager.addToQueue(command);
      addMessage({
        text: 'Connection lost. Command queued.',
        sender: 'mcp'
      });
      setSending(false);
      return;
    }

    // Send command via WebRTC
    try {
      if (activeTool === 'mcp') {
        webrtc.send({
          type: 'command',
          text: command,
          timestamp: Date.now(),
        });
      } else {
        // Send to CLI adapter
        webrtc.send({
          type: 'cli_command',
          command: activeTool === 'cursor' ? command : `${activeTool} "${command}"`, // Wrap in quotes for Claude/Gemini
          tool: activeTool,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to send command:', error);
      // Fallback to queue
      await queueManager.addToQueue(command);
      addMessage({
        text: 'Failed to send. Command queued.',
        sender: 'mcp',
      });
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col relative overflow-hidden">

      {/* Background Gradient Mesh (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[100px]"></div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projectName="MobileCoder"
      />

      {/* Floating Header with Tool Selector */}
      <div className="fixed top-0 left-0 right-0 z-30 px-4 py-4 bg-[#1e1e1e]/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between">
        <Header
          projectName="MobileCoder"
          connectionStatus={isConnected ? 'connected' : 'connecting'}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <ToolSelector
          activeTool={activeTool}
          onSelect={setActiveTool}
          availableTools={availableTools}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32 space-y-6 z-10 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl mb-4 flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to code?</h2>
            <p className="text-sm text-gray-400 max-w-[200px]">Type a command or use a quick tag to get started.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-[#252526] text-gray-100 border border-gray-700/50 rounded-bl-none'
                }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-light">{msg.text}</p>
              <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-[#252526] rounded-2xl rounded-bl-none px-5 py-4 border border-gray-700/50 flex items-center gap-3">
              <Loader className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-gray-400 font-medium">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Smart Input Area */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e] to-transparent pt-10 pb-6 px-4 z-20">
        <SmartInput onSend={handleSend} isProcessing={sending} />
      </div>

      {/* Diff Viewer Modal */}
      {diffData && (
        <DiffViewer
          oldCode={diffData.oldCode}
          newCode={diffData.newCode}
          fileName={diffData.fileName}
          summary={diffData.summary}
          onClose={() => setDiffData(null)}
          onApply={() => {
            // Send apply command back to MCP
            webrtc?.send({ type: 'command', text: 'apply_changes', timestamp: Date.now() });
            setDiffData(null);
            addMessage({ text: 'Changes applied successfully.', sender: 'mcp' });
          }}
        />
      )}

    </div>
  );
}
