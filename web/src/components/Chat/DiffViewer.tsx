import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Check, FileCode, ChevronDown, Plus, Minus } from 'lucide-react';
import { generateDiff, DiffLine, getLineNumbers } from '../../lib/diff';

interface DiffViewerProps {
    oldCode: string;
    newCode: string;
    fileName: string;
    summary?: string;
    onClose: () => void;
    onApply: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode, fileName, summary, onClose, onApply }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [diff, setDiff] = useState<DiffLine[]>([]);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

    useEffect(() => {
        setIsVisible(true);
        // Generate diff when component mounts
        const diffResult = generateDiff(oldCode, newCode, fileName);
        setDiff(diffResult.lines);
    }, [oldCode, newCode, fileName]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const getLineClass = (line: DiffLine) => {
        switch (line.type) {
            case 'added':
                return 'bg-green-900/30 border-l-2 border-green-500';
            case 'removed':
                return 'bg-red-900/30 border-l-2 border-red-500';
            default:
                return 'border-l-2 border-transparent';
        }
    };

    const getLineNumberClass = (line: DiffLine) => {
        switch (line.type) {
            case 'added':
                return 'text-green-400 bg-green-900/20';
            case 'removed':
                return 'text-red-400 bg-red-900/20';
            default:
                return 'text-gray-500';
        }
    };

    const renderSplitView = () => {
        const lineNumbers = getLineNumbers(diff);
        
        return (
            <div className="flex flex-1 overflow-hidden">
                {/* Old Code */}
                <div className="flex-1 border-r border-gray-700">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300">Original</h3>
                    </div>
                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                        {diff.map((line, index) => (
                            <div key={`old-${index}`} className="flex">
                                {showLineNumbers && (
                                    <div className={`w-12 text-right pr-2 text-xs font-mono border-r border-gray-800 ${getLineNumberClass(line)}`}>
                                        {line.oldLineNumber || ''}
                                    </div>
                                )}
                                <div className={`flex-1 px-3 py-1 font-mono text-sm ${getLineClass(line)}`}>
                                    {line.type === 'removed' ? (
                                        <span className="text-red-300">{line.content}</span>
                                    ) : line.type === 'unchanged' ? (
                                        <span className="text-gray-300">{line.content}</span>
                                    ) : (
                                        <span className="text-gray-600">{' '}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Code */}
                <div className="flex-1">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300">Modified</h3>
                    </div>
                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                        {diff.map((line, index) => (
                            <div key={`new-${index}`} className="flex">
                                {showLineNumbers && (
                                    <div className={`w-12 text-right pr-2 text-xs font-mono border-r border-gray-800 ${getLineNumberClass(line)}`}>
                                        {line.newLineNumber || ''}
                                    </div>
                                )}
                                <div className={`flex-1 px-3 py-1 font-mono text-sm ${getLineClass(line)}`}>
                                    {line.type === 'added' ? (
                                        <span className="text-green-300">{line.content}</span>
                                    ) : line.type === 'unchanged' ? (
                                        <span className="text-gray-300">{line.content}</span>
                                    ) : (
                                        <span className="text-gray-600">{' '}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderUnifiedView = () => {
        return (
            <div className="flex-1 overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300">Unified Diff</h3>
                </div>
                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                    {diff.map((line, index) => (
                        <div key={`unified-${index}`} className="flex">
                            {showLineNumbers && (
                                <div className={`w-12 text-right pr-2 text-xs font-mono border-r border-gray-800 ${getLineNumberClass(line)}`}>
                                    {line.oldLineNumber || line.newLineNumber || ''}
                                </div>
                            )}
                            <div className="flex-1 flex items-center px-3 py-1 font-mono text-sm">
                                {line.type === 'removed' && (
                                    <>
                                        <Minus className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                                        <span className="text-red-300">{line.content}</span>
                                    </>
                                )}
                                {line.type === 'added' && (
                                    <>
                                        <Plus className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        <span className="text-green-300">{line.content}</span>
                                    </>
                                )}
                                {line.type === 'unchanged' && (
                                    <>
                                        <div className="w-4 mr-2" />
                                        <span className="text-gray-300">{line.content}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const additions = diff.filter(line => line.type === 'added').length;
    const deletions = diff.filter(line => line.type === 'removed').length;

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>

            {/* Card Container */}
            <div
                className={`w-full max-w-6xl bg-[#1e1e1e] rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
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

                {/* Summary Bar */}
                <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-green-400 font-medium">{additions}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Minus className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-red-400 font-medium">{deletions}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowLineNumbers(!showLineNumbers)}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                    showLineNumbers ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                            >
                                Line Numbers
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                    viewMode === 'split' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                            >
                                {viewMode === 'split' ? 'Split View' : 'Unified View'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                {summary && (
                    <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
                        <p className="text-sm text-blue-200">✨ {summary}</p>
                    </div>
                )}

                {/* Diff Content */}
                <div className="flex-1 overflow-hidden">
                    {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
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
