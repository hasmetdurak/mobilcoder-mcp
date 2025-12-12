import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, X, Zap, Keyboard, ChevronUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import TemplateCommands from './TemplateCommands';
import { Template } from '../../lib/templates';
import { useMobileKeyboard, useMobileViewport } from '../../hooks/useMobile';

interface SmartInputProps {
    onSend: (text: string) => void;
    isProcessing: boolean;
    mobile?: boolean;
    optimized?: boolean;
}

const QUICK_TAGS = [
    { label: 'Fix Bug', prompt: '[Fix Bug] ' },
    { label: 'Refactor', prompt: '[Refactor] ' },
    { label: 'Test', prompt: '[Test] ' },
    { label: 'Explain', prompt: '[Explain] ' },
];

const SmartInput: React.FC<SmartInputProps> = ({ onSend, isProcessing, mobile = false, optimized = false }) => {
    const { commandHistory } = useStore();
    const [text, setText] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showVoiceInput, setShowVoiceInput] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const keyboard = useMobileKeyboard();
    const viewport = useMobileViewport();

    // Auto-resize textarea with mobile optimizations
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const maxHeight = mobile ? (keyboard.isVisible ? 100 : 120) : 120;
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
            
            // Mobile-specific adjustments
            if (mobile) {
                textareaRef.current.style.fontSize = viewport.orientation === 'landscape' ? '14px' : '16px';
                textareaRef.current.style.padding = keyboard.isVisible ? '8px 12px' : '12px 16px';
            }
        }
    }, [text, keyboard.isVisible, mobile, viewport.orientation]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
        setIsExpanded(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        
        // Haptic feedback on mobile
        if (mobile && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        
        // Mobile keyboard shortcuts
        if (mobile && e.key === 'Escape') {
            setIsExpanded(false);
            setText('');
            if (textareaRef.current) {
                textareaRef.current.blur();
            }
        }
    };
    
    const handleVoiceInput = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setShowVoiceInput(true);
            // TODO: Implement voice recognition
        }
    };

    const addTag = (tagPrompt: string) => {
        setText((prev) => tagPrompt + prev);
        setIsExpanded(true);
        textareaRef.current?.focus();
    };

    const setCommand = (cmd: string) => {
        setText(cmd);
        setIsExpanded(true);
        textareaRef.current?.focus();
    };

    return (
        <>
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'pb-4' : 'pb-0'}`}>

                {/* Quick Tags & History (Visible when focused or empty) */}
                <div className={`flex gap-2 overflow-x-auto py-2 px-1 mb-2 no-scrollbar transition-opacity duration-200 ${isExpanded || !text ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden py-0 mb-0'}`}>
                    {/* History Chips */}
                    {commandHistory.slice(0, 5).map((cmd, i) => (
                        <button
                            key={`hist-${i}`}
                            onClick={() => setCommand(cmd)}
                            className="flex-shrink-0 px-3 py-1.5 bg-blue-900/30 border border-blue-700/50 rounded-full text-xs text-blue-300 font-medium hover:bg-blue-800/50 hover:text-blue-100 transition-colors active:scale-95 truncate max-w-[150px]"
                        >
                            {cmd}
                        </button>
                    ))}

                    {/* Divider if history exists */}
                    {commandHistory.length > 0 && <div className="w-px bg-gray-700 mx-1 flex-shrink-0" />}

                    {QUICK_TAGS.map((tag) => (
                        <button
                            key={tag.label}
                            onClick={() => addTag(tag.prompt)}
                            className="flex-shrink-0 px-3 py-1.5 bg-[#252526] border border-gray-700 rounded-full text-xs text-gray-300 font-medium hover:bg-gray-700 hover:text-white transition-colors active:scale-95"
                        >
                            {tag.label}
                        </button>
                    ))}

                    {/* Templates Button */}
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-500/30 rounded-full text-xs text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                        <Zap className="w-3 h-3" />
                        Templates
                    </button>
                </div>

                {/* Input Container */}
                <div className={`relative bg-[#252526] border transition-all duration-200 ${
                    isExpanded ? 'rounded-2xl border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' :
                    mobile ? 'rounded-2xl border-gray-700' : 'rounded-full border-gray-700'
                }`}>

                    <div className="flex items-end p-2">
                        {/* Text Area */}
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                if (!isExpanded && e.target.value.length > 0) setIsExpanded(true);
                            }}
                            onFocus={() => setIsExpanded(true)}
                            onBlur={() => !text && setIsExpanded(false)}
                            onKeyDown={handleKeyDown}
                            placeholder={isProcessing ? "AI is thinking..." : "Ask AI to code..."}
                            disabled={isProcessing}
                            rows={mobile ? (keyboard.isVisible ? 2 : 1) : 1}
                            className={`flex-1 bg-transparent text-white placeholder-gray-500 text-sm px-3 py-2.5 focus:outline-none resize-none ${
                                mobile ? 'max-h-[100px]' : 'max-h-[120px]'
                            } ${
                                optimized ? 'gpu-accelerated' : ''
                            }`}
                            autoCapitalize="off"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />

                        {/* Actions */}
                        <div className="flex items-center gap-1 pb-1 pr-1">
                            {text ? (
                                <button
                                    onClick={handleSend}
                                    disabled={isProcessing}
                                    className={`touch-target-comfortable p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-90 ${
                                        mobile ? 'text-sm' : ''
                                    }`}
                                >
                                    <Send size={mobile ? 16 : 18} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowTemplates(true)}
                                        className={`touch-target p-2 text-gray-400 hover:text-white transition-colors ${
                                            mobile ? 'text-sm' : ''
                                        }`}
                                        title="Quick Templates"
                                    >
                                        <Zap size={mobile ? 18 : 20} />
                                    </button>
                                    
                                    {/* Voice Input Button (Mobile) */}
                                    {mobile && (
                                        <button
                                            onClick={handleVoiceInput}
                                            className={`touch-target p-2 text-gray-400 hover:text-white transition-colors ${
                                                mobile ? 'text-sm' : ''
                                            }`}
                                            title="Voice Input"
                                        >
                                            <Mic size={mobile ? 18 : 20} />
                                        </button>
                                    )}
                                    
                                    {/* Keyboard Toggle (Mobile) */}
                                    {mobile && (
                                        <button
                                            onClick={() => {
                                                if (textareaRef.current) {
                                                    textareaRef.current.focus();
                                                }
                                            }}
                                            className={`touch-target p-2 text-gray-400 hover:text-white transition-colors ${
                                                mobile ? 'text-sm' : ''
                                            }`}
                                            title="Show Keyboard"
                                        >
                                            <Keyboard size={mobile ? 18 : 20} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Modal */}
            {showTemplates && (
                <TemplateCommands
                    onSelectTemplate={(template: Template) => {
                        onSend(template.prompt);
                        setText(template.prompt);
                        setShowTemplates(false);
                        
                        // Haptic feedback on mobile
                        if (mobile && 'vibrate' in navigator) {
                            navigator.vibrate(30);
                        }
                    }}
                    onClose={() => setShowTemplates(false)}
                    mobile={mobile}
                />
            )}
            
            {/* Voice Input Modal (Mobile) */}
            {showVoiceInput && mobile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Voice Input</h3>
                            <button
                                onClick={() => setShowVoiceInput(false)}
                                className="touch-target p-2 hover:bg-gray-700 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-center text-gray-400">
                            <Mic className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                            <p className="text-sm">Voice input coming soon...</p>
                            <p className="text-xs mt-2">Tap to close</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartInput;
