import React, { useState, useEffect } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface FileNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileNode[];
    isOpen?: boolean;
}

interface FileExplorerProps {
    onListDirectory: (path: string) => Promise<any[]>;
    onReadFile: (path: string) => Promise<string>;
    onSelectFile: (path: string, content: string) => void;
}

export default function FileExplorer({ onListDirectory, onReadFile, onSelectFile }: FileExplorerProps) {
    const [rootFiles, setRootFiles] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadDirectory('.');
    }, []);

    const loadDirectory = async (path: string, parentNode?: FileNode) => {
        setLoading(true);
        try {
            const files = await onListDirectory(path);
            const nodes: FileNode[] = files.map((f: any) => ({
                name: f.name,
                path: f.path,
                isDirectory: f.isDirectory,
                children: []
            })).sort((a, b) => {
                // Directories first
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });

            if (path === '.') {
                setRootFiles(nodes);
            } else {
                // Update specific node in tree - simplified for now: just update root or assume we handle level by level
                // For a proper tree, we need deep update. 
                // Let's implement a recursive update function
                setRootFiles(prev => updateTree(prev, path, nodes));
            }
        } catch (error) {
            console.error('Failed to load directory:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTree = (nodes: FileNode[], targetPath: string, newChildren: FileNode[]): FileNode[] => {
        return nodes.map(node => {
            if (node.path === targetPath) {
                return { ...node, children: newChildren, isOpen: true };
            }
            if (node.children) {
                return { ...node, children: updateTree(node.children, targetPath, newChildren) };
            }
            return node;
        });
    };

    const toggleFolder = async (node: FileNode) => {
        if (expandedPaths.has(node.path)) {
            // Collapse
            const newExpanded = new Set(expandedPaths);
            newExpanded.delete(node.path);
            setExpandedPaths(newExpanded);
        } else {
            // Expand
            const newExpanded = new Set(expandedPaths);
            newExpanded.add(node.path);
            setExpandedPaths(newExpanded);
            if (!node.children || node.children.length === 0) {
                await loadDirectory(node.path, node);
            }
        }
    };

    const handleFileClick = async (node: FileNode) => {
        try {
            const content = await onReadFile(node.path);
            onSelectFile(node.path, content);
        } catch (e) {
            console.error('Failed to read file', e);
        }
    };

    const renderTree = (nodes: FileNode[], level = 0) => {
        return nodes.map(node => {
            const isExpanded = expandedPaths.has(node.path);

            return (
                <div key={node.path} style={{ paddingLeft: level * 12 }}>
                    <div
                        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${node.isDirectory ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10'}`}
                    >
                        <div
                            className="flex-1 flex items-center gap-2 min-w-0"
                            onClick={() => node.isDirectory ? toggleFolder(node) : handleFileClick(node)}
                        >
                            {node.isDirectory && (
                                <span className="text-gray-500">
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                            )}
                            {!node.isDirectory && <span className="w-3.5" />} {/* Spacer */}

                            {node.isDirectory ? <Folder size={16} className="text-blue-400" /> : <FileCode size={16} />}
                            <span className="text-sm truncate">{node.name}</span>
                        </div>

                        {!node.isDirectory && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileClick(node);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-500/20 rounded text-blue-400"
                                title="Add to Context"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>

                    {node.isDirectory && isExpanded && node.children && (
                        <div className="border-l border-gray-800 ml-3.5">
                            {renderTree(node.children, 0)}
                            {/* We reset level because we use margin-left via container but passing simple recursive struct is safer visually if we just use padding. Let's stick to standard recursive rendering. */}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-20">
            <div className="px-4 py-2 border-b border-gray-800/50 mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Files</h3>
            </div>
            <div className="px-2">
                {loading && rootFiles.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
                ) : (
                    renderTree(rootFiles)
                )}
            </div>
        </div>
    );
}
