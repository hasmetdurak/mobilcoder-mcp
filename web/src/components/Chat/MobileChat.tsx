import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { WebRTCClient } from '../../lib/webrtc';
import { queueManager } from '../../lib/queue';
import { Loader, Send, Menu, X, ChevronLeft, ChevronRight, Settings, FolderOpen, Mic, Camera, Image } from 'lucide-react';
import { 
  usePlatformDetection, 
  useTouchGestures, 
  useMobileViewport, 
  useMobileKeyboard,
  useBattery 
} from '../../hooks/useMobile';
import { sanitizeForDisplay, validateCommand, commandRateLimiter } from '../../lib/security';
import Header from './Header';
import SmartInput from './SmartInput';
import DiffViewer from './DiffViewer';
import ToolSelector, { ToolType } from './ToolSelector';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'mcp';
  timestamp: number;
}

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export default function MobileChat() {
  const navigate = useNavigate();
  const { messages, addMessage, isConnected, user, setConnected, connectionCode, contextFiles } = useStore();
  
  // Mobile hooks
  const platform = usePlatformDetection();
  const gestures = useTouchGestures(useRef<HTMLDivElement>(null));
  const viewport = useMobileViewport();
  const keyboard = useMobileKeyboard();
  const battery = useBattery();
  
  // State
  const [activeTool, setActiveTool] = useState<ToolType>('mcp');
  const [sending, setSending] = useState(false);
  const [diffData, setDiffData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [availableTools, setAvailableTools] = useState<string[]>(['mcp', 'cursor']);
  const [webrtc, setWebRTC] = useState<WebRTCClient | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('.');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileExplorerRef = useRef<HTMLDivElement>(null);

  // Derived state
  const isConnecting = !!connectionCode && !isConnected;
  const isLowEndDevice = platform.isLowEnd;
  const isHighEndDevice = platform.isHighEnd;
  const shouldOptimizeForPerformance = isLowEndDevice;

  // Initialize WebRTC
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

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
              tool: 'mcp',
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
          const tools = message.tools || [];
          const toolIds = tools.map((t: any) => t.id);
          if (!toolIds.includes('cursor')) toolIds.push('cursor');
          setAvailableTools(toolIds);
        } else if (message.type === 'result' || message.type === 'cli_output') {
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

      setWebRTC(client);

      if (!isConnected) {
        client.connect().catch(() => {
          setConnected(false);
        });
      }
    }
  }, [user, connectionCode, webrtc, isConnected, navigate, setConnected, addMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file operations
  const loadFiles = async (path: string) => {
    if (!webrtc) return;
    
    try {
      const result = await webrtc.callTool('list_directory', { path });
      setFiles(result || []);
      setCurrentPath(path);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const readFile = async (file: FileItem) => {
    if (!webrtc || file.isDirectory) return;
    
    try {
      const content = await webrtc.callTool('read_file', { path: file.path });
      setSelectedFile(file);
      // Add to context files
      useStore.getState().addContextFile({ path: file.path, content });
      setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;

    // Rate limiting
    if (!commandRateLimiter.isAllowed('user_command')) {
      addMessage({
        text: 'Rate limit exceeded. Please wait before sending another command.',
        sender: 'mcp',
      });
      return;
    }

    let command = sanitizeForDisplay(text.trim());
    
    // Command validation
    if (!validateCommand(command)) {
      addMessage({
        text: 'Command blocked for security reasons.',
        sender: 'mcp',
      });
      return;
    }
    
    setSending(true);
    addMessage({
      text: text.trim(),
      sender: 'user',
    });

    if (!isConnected || !webrtc) {
      await queueManager.addToQueue(command);
      addMessage({
        text: 'Connection lost. Command queued.',
        sender: 'mcp'
      });
      setSending(false);
      return;
    }

    try {
      if (activeTool === 'mcp') {
        webrtc.send({
          type: 'command',
          text: command,
          timestamp: Date.now(),
        });
      } else {
        webrtc.send({
          type: 'cli_command',
          command: activeTool === 'cursor' ? command : `${activeTool} "${command.replace(/"/g, '\\"')}"`,
          tool: activeTool,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to send command:', error);
      await queueManager.addToQueue(command);
      addMessage({
        text: 'Failed to send. Command queued.',
        sender: 'mcp',
      });
      setSending(false);
    }
  };

  // Mobile navigation
  const handleSwipeLeft = () => {
    if (gestures.swipeLeft && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleSwipeRight = () => {
    if (gestures.swipeRight && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  // Performance optimizations
  const renderOptimizedMessages = () => {
    if (shouldOptimizeForPerformance) {
      // Virtual scrolling for low-end devices
      return messages.slice(-50); // Limit message count
    }
    return messages;
  };

  const displayMessages = renderOptimizedMessages();

  if (!user && !isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white relative">
      {/* Safe Area Support */}
      <div className="safe-area-container">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-[#1e1e1e]/90 backdrop-blur-md border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="touch-target-comfortable p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-300">
                {isConnected ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Connected
                  </span>
                ) : isConnecting ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Offline
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setShowTools(!showTools)}
                className="touch-target p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tool Selector (Mobile) */}
        {showTools && (
          <div className="fixed top-16 left-4 right-4 z-40 bg-[#1e1e1e]/95 backdrop-blur-lg rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Tools</h3>
              <button
                onClick={() => setShowTools(false)}
                className="touch-target p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ToolSelector
              activeTool={activeTool}
              onSelect={setActiveTool}
              availableTools={availableTools}
              mobile={true}
            />
          </div>
        )}

        {/* Mobile Sidebar */}
        <div 
          ref={fileExplorerRef}
          className={`mobile-file-explorer ${sidebarOpen ? 'open' : ''}`}
          style={{ width: platform.isMobile ? '85%' : '70%' }}
        >
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Files</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="touch-target p-2 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Current path */}
            <div className="mb-4">
              <button
                onClick={() => loadFiles(currentPath === '.' ? '..' : '.')}
                className="touch-target w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded text-blue-400 text-sm"
              >
                📁 {currentPath === '.' ? 'Root' : currentPath}
              </button>
            </div>
            
            {/* File list */}
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => file.isDirectory ? loadFiles(file.path) : readFile(file)}
                  className={`mobile-file-item ${selectedFile?.path === file.path ? 'bg-blue-600/20' : ''}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">
                      {file.isDirectory ? '📁' : '📄'}
                    </span>
                    <span className="text-sm text-gray-300 truncate">
                      {file.name}
                    </span>
                  </div>
                  
                  {!file.isDirectory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        readFile(file);
                      }}
                      className="touch-target p-1 hover:bg-blue-600 rounded text-blue-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          className="mobile-messages"
          style={{ 
            paddingBottom: keyboard.isVisible ? `${keyboard.height + 120}px` : '120px',
            paddingTop: platform.hasNotch ? '44px' : '16px'
          }}
        >
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl mb-4 flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to code?</h2>
              <p className="text-sm text-gray-400 max-w-[200px]">Type a command or use a quick tag to get started.</p>
            </div>
          ) : (
            displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-[#252526] text-gray-100 border border-gray-700/50 rounded-bl-none'
                  }`}
                >
                  <p 
                    className="text-[15px] leading-relaxed whitespace-pre-wrap font-light"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeForDisplay(msg.text).replace(/\n/g, '<br />') 
                    }}
                  />
                  <p className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#252526] rounded-2xl rounded-bl-none px-4 py-3 border border-gray-700/50 flex items-center gap-3">
                <Loader className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-gray-400 font-medium">
                  {isLowEndDevice ? 'Processing...' : 'Thinking...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Mobile Input Area */}
        <div 
          className="mobile-input-container"
          style={{ 
            bottom: keyboard.isVisible ? `${keyboard.height + 60}px` : '60px' 
          }}
        >
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {contextFiles.length > 0 && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="touch-target flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 whitespace-nowrap"
              >
                <FolderOpen className="w-4 h-4" />
                Context ({contextFiles.length})
              </button>
            )}
            
            {/* Camera integration placeholder */}
            <button
              className="touch-target flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300"
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
            
            {/* File upload placeholder */}
            <button
              className="touch-target flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300"
            >
              <Image className="w-4 h-4" />
              Gallery
            </button>
          </div>

          {/* Input */}
          <SmartInput 
            onSend={handleSend} 
            isProcessing={sending}
            mobile={true}
            optimized={shouldOptimizeForPerformance}
          />
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
              webrtc?.send({ 
                type: 'command', 
                text: 'apply_changes', 
                timestamp: Date.now() 
              });
              setDiffData(null);
              addMessage({ 
                text: 'Changes applied successfully.', 
                sender: 'mcp' 
              });
            }}
            mobile={true}
          />
        )}

        {/* Battery Indicator */}
        {battery.supported && (
          <div className="fixed top-20 right-4 z-20">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  battery.level > 0.5 ? 'bg-green-400' : 
                  battery.level > 0.2 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-gray-300">
                  {Math.round(battery.level * 100)}%
                  {battery.charging && ' ⚡'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}