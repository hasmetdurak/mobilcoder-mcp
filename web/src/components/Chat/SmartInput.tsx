import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, X } from 'lucide-react';

interface SmartInputProps {
    onSend: (text: string) => void;
    isProcessing: boolean;
}

const QUICK_TAGS = [
    { label: 'Fix Bug', prompt: '[Fix Bug] ' },
    { label: 'Refactor', prompt: '[Refactor] ' },
    { label: 'Test', prompt: '[Test] ' },
    { label: 'Explain', prompt: '[Explain] ' },
];

const SmartInput: React.FC<SmartInputProps> = ({ onSend, isProcessing }) => {
    const [text, setText] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [text]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
        setIsExpanded(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const addTag = (tagPrompt: string) => {
        setText((prev) => tagPrompt + prev);
        setIsExpanded(true);
        textareaRef.current?.focus();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'pb-4' : 'pb-0'}`}>

            {/* Quick Tags (Visible when focused or empty) */}
            <div className={`flex gap-2 overflow-x-auto py-2 px-1 mb-2 no-scrollbar transition-opacity duration-200 ${isExpanded || !text ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden py-0 mb-0'}`}>
                {QUICK_TAGS.map((tag) => (
                    <button
                        key={tag.label}
                        onClick={() => addTag(tag.prompt)}
                        className="flex-shrink-0 px-3 py-1.5 bg-[#252526] border border-gray-700 rounded-full text-xs text-gray-300 font-medium hover:bg-gray-700 hover:text-white transition-colors active:scale-95"
                    >
                        {tag.label}
                    </button>
                ))}
            </div>

            {/* Input Container */}
            <div className={`relative bg-[#252526] border transition-all duration-200 ${isExpanded ? 'rounded-2xl border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'rounded-full border-gray-700'}`}>

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
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm px-3 py-2.5 focus:outline-none resize-none max-h-[120px]"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-1 pb-1 pr-1">
                        {text ? (
                            <button
                                onClick={handleSend}
                                disabled={isProcessing}
                                className="p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-90"
                            >
                                <Send size={18} />
                            </button>
                        ) : (
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                <Mic size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartInput;
