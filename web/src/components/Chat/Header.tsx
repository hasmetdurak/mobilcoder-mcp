import React from 'react';
import { Code2, Menu } from 'lucide-react';

interface HeaderProps {
    projectName: string;
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'relay';
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, connectionStatus, onMenuClick }) => {
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
            case 'connecting': return 'bg-yellow-500 animate-pulse';
            case 'relay': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
            default: return 'bg-red-500';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Online';
            case 'connecting': return 'Connecting...';
            case 'relay': return 'Relay (Secure)';
            default: return 'Offline';
        }
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
            <div className="bg-[#252526]/90 backdrop-blur-md border border-gray-700/50 rounded-full pl-2 pr-4 py-2 flex items-center justify-between shadow-xl">

                {/* Left: Menu & Project */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="w-9 h-9 rounded-full bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-95"
                    >
                        <Menu size={18} className="text-gray-300" />
                    </button>

                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none mb-0.5">Connected to</span>
                        <div className="flex items-center gap-1.5">
                            <Code2 size={14} className="text-blue-400" />
                            <span className="text-sm text-gray-100 font-semibold leading-none truncate max-w-[100px]">{projectName}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Status */}
                <div className="flex items-center gap-2 pl-3 border-l border-gray-700/50">
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:block">{getStatusText()}</span>
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}></div>
                </div>

            </div>
        </div>
    );
};

export default Header;
