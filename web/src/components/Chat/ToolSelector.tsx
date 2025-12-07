import { useState } from 'react';
import { ChevronDown, Terminal, Code2, Sparkles } from 'lucide-react';

export type ToolType = 'mcp' | 'claude' | 'gemini' | 'qoder' | 'kiro' | 'aider' | 'cursor';

interface ToolSelectorProps {
    activeTool: ToolType;
    onSelect: (tool: ToolType) => void;
    availableTools?: string[];
}

export default function ToolSelector({ activeTool, onSelect, availableTools }: ToolSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const tools = [
        { id: 'mcp', name: 'Cursor (MCP)', icon: Code2, color: 'text-blue-400' },
        { id: 'claude', name: 'Claude Code', icon: Sparkles, color: 'text-orange-400' },
        { id: 'gemini', name: 'Gemini CLI', icon: Sparkles, color: 'text-purple-400' },
        { id: 'qoder', name: 'Qoder', icon: Sparkles, color: 'text-red-400' },
        { id: 'kiro', name: 'Kiro (AWS)', icon: Sparkles, color: 'text-yellow-400' },
        { id: 'aider', name: 'Aider', icon: Terminal, color: 'text-green-400' },
        { id: 'cursor', name: 'Terminal', icon: Terminal, color: 'text-gray-400' },
    ];

    // Filter tools if availableTools is provided
    const visibleTools = availableTools
        ? tools.filter(t => availableTools.includes(t.id))
        : tools;

    const activeToolData = tools.find(t => t.id === activeTool) || tools[0];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border border-gray-700/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
                <activeToolData.icon className={`w-4 h-4 ${activeToolData.color}`} />
                <span className="text-sm font-medium text-gray-200">{activeToolData.name}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#252526] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        {visibleTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => {
                                    onSelect(tool.id as ToolType);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left
                  ${activeTool === tool.id ? 'bg-gray-800/50' : ''}
                `}
                            >
                                <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                <span className="text-sm text-gray-200">{tool.name}</span>
                                {activeTool === tool.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
