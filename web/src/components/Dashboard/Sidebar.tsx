import React, { useState } from 'react';
import {
    Settings,
    Shield,
    GitPullRequest,
    Folder,
    Brain,
    LogOut,
    ChevronRight,
    Code2,
    ArrowLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import FileExplorer from './FileExplorer';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    onListDirectory?: (path: string) => Promise<any[]>;
    onReadFile?: (path: string) => Promise<string>;
    onSelectFile?: (path: string, content: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    projectName,
    onListDirectory,
    onReadFile,
    onSelectFile
}) => {
    const { user, signOut } = useStore();
    const [activeRule, setActiveRule] = useState(true);
    const [view, setView] = useState<'main' | 'files'>('main');

    const handleFileSelect = (path: string, content: string) => {
        if (onSelectFile) {
            onSelectFile(path, content);
            onClose(); // Close sidebar after selection
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#111111] z-50 transform transition-transform duration-300 ease-out border-r border-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* I. Header & Connection */}
                <div className="p-6 bg-[#181818] border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        {view === 'files' ? (
                            <button
                                onClick={() => setView('main')}
                                className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-300" />
                            </button>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                <Code2 size={20} className="text-blue-400" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h2 className="text-white font-bold text-lg truncate leading-tight">
                                {view === 'files' ? 'Files' : projectName}
                            </h2>
                            {view === 'main' && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                                    <span className="text-xs text-green-400 font-medium tracking-wide">ONLINE</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {view === 'main' ? (
                    <>
                        {/* II. Credit Status */}
                        <div className="px-6 py-6 border-b border-gray-800/50">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">AI Credits</span>
                                <span className="text-xs text-white font-bold">80% Used</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-red-500 w-[80%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse"></div>
                            </div>

                            <button className="mt-4 flex items-center gap-3 w-full py-2 text-gray-400 hover:text-white transition-colors group">
                                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span className="text-sm font-medium">Account & Settings</span>
                            </button>
                        </div>

                        {/* III. Project Command Center */}
                        <div className="px-4 py-6 space-y-1">
                            <div className="px-2 mb-2 text-xs text-gray-500 font-bold uppercase tracking-widest">Command Center</div>

                            <button
                                onClick={() => setView('files')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Folder size={20} className="text-blue-400" />
                                    <span className="font-medium">Project Files</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Shield size={20} className="text-green-400" />
                                        <div className="absolute inset-0 bg-green-400/20 blur-sm rounded-full animate-pulse"></div>
                                    </div>
                                    <span className="font-medium">Project Health</span>
                                </div>
                                <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20">92%</span>
                            </button>

                            <button
                                onClick={() => setActiveRule(!activeRule)}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Brain size={20} className={activeRule ? "text-cyan-400" : "text-gray-500"} />
                                    <span className="font-medium">AI Context Rules</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${activeRule ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-gray-600'}`}></div>
                            </button>
                        </div>

                        {/* IV. Workflow */}
                        <div className="px-4 py-2 border-t border-gray-800/50">
                            <div className="px-2 mt-4 mb-2 text-xs text-gray-500 font-bold uppercase tracking-widest">Workflow</div>

                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all group">
                                <div className="flex items-center gap-3">
                                    <GitPullRequest size={20} className="text-purple-400" />
                                    <span className="font-medium">Pull Requests</span>
                                </div>
                                <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30">2</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        {onListDirectory && onReadFile ? (
                            <FileExplorer
                                onListDirectory={onListDirectory}
                                onReadFile={onReadFile}
                                onSelectFile={(path, content) => {
                                    if (onSelectFile) onSelectFile(path, content);
                                }}
                            />
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Not connected to MCP.
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-800 bg-[#111111]">
                    <div className="flex items-center gap-3 mb-4">
                        <img src={user?.photoURL || ''} alt="User" className="w-10 h-10 rounded-full border-2 border-gray-700" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-red-400 font-medium hover:bg-gray-700 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

            </div>
        </>
    );
};

export default Sidebar;
