import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Check, FileCode, ChevronDown } from 'lucide-react';

interface DiffViewerProps {
    oldCode: string;
    newCode: string;
    fileName: string;
    summary?: string; // AI generated summary
    onClose: () => void;
    onApply: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode, fileName, summary, onClose, onApply }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>

            {/* Card Container */}
            <div
                className={`w-full max-w-lg bg-[#1e1e1e] rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {/* Drag Handle / Header */}
                <div className="flex flex-col items-center pt-3 pb-2 border-b border-gray-800 bg-[#252526] rounded-t-2xl cursor-grab active:cursor-grabbing" onClick={handleClose}>
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full mb-3"></div>
                    <div className="w-full px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileCode size={18} className="text-blue-400" />
                            <span className="font-medium text-gray-200 text-sm">{fileName}</span>
                        </div>
                        <button onClick={handleClose} className="p-1 text-gray-400 hover:text-white">
                            <ChevronDown size={20} />
                        </button>
                    </div>
                </div>

                {/* AI Summary */}
                {summary && (
                    <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
                        <p className="text-sm text-blue-200">✨ {summary}</p>
                    </div>
                )}

                {/* Diff Content */}
                <div className="flex-1 overflow-auto p-0">
                    <SyntaxHighlighter
                        language="typescript"
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1rem', fontSize: '13px', lineHeight: '1.5', background: 'transparent' }}
                        showLineNumbers={true}
                        wrapLines={true}
                        lineProps={(lineNumber) => {
                            // Simple heuristic for diff highlighting (real implementation would use a diff library)
                            // This is a placeholder for visual effect
                            return {};
                        }}
                    >
                        {newCode}
                    </SyntaxHighlighter>
                </div>

                {/* Fixed Action Buttons */}
                <div className="p-4 bg-[#252526] border-t border-gray-800 pb-8 safe-area-bottom">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3.5 px-4 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-colors active:scale-95 duration-150"
                        >
                            Reject
                        </button>
                        <button
                            onClick={onApply}
                            className="flex-[2] py-3.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-900/20 hover:from-green-500 hover:to-emerald-500 transition-all active:scale-95 duration-150 flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiffViewer;
