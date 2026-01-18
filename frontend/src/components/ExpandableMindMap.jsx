import { useState, useEffect, useRef } from 'react';
import {
    ChevronRight, ChevronDown, Network, ZoomIn, ZoomOut,
    Maximize2, Clock, RefreshCw, Layers, Layout,
    Maximize, Minimize, Minus, Plus, MousePointer2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MermaidEditor from './MermaidEditor';

export default function ExpandableMindMap({ data }) {
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'graph'
    const [nodes, setNodes] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // --- ROBUST MERMAID PARSER ---
    useEffect(() => {
        if (!data) return;

        const parseMermaid = (mermaidCode) => {
            if (typeof mermaidCode !== 'string') return [];

            // Clean up code
            const lines = mermaidCode
                .replace(/```mermaid/g, '')
                .replace(/```/g, '')
                .split('\n')
                .map(l => l.trim())
                .filter(l => l && !l.startsWith('graph') && !l.startsWith('flowchart') && !l.startsWith('subgraph') && !l.startsWith('%%'));

            const nodesMap = new Map();
            const hasParent = new Set();

            const getOrCreateNode = (id, label) => {
                let node = nodesMap.get(id);
                if (!node) {
                    node = { id, label: label || id, children: [] };
                    nodesMap.set(id, node);
                } else if (label && node.label === id) {
                    node.label = label;
                }
                return node;
            };

            lines.forEach(line => {
                const edgeRegex = /(\w+)(?:[\[\(\{\>](?:"?)(.*?)(?:"?)[\]\)\}\>])?\s*(?:-+|-->)\s*(\w+)(?:[\[\(\{\>](?:"?)(.*?)(?:"?)[\]\)\}\>])?/;
                const match = line.match(edgeRegex);

                if (match) {
                    const [_, pId, pLabel, cId, cLabel] = match;
                    const parent = getOrCreateNode(pId, pLabel);
                    const child = getOrCreateNode(cId, cLabel);

                    if (!parent.children.find(c => c.id === child.id)) {
                        parent.children.push(child);
                        hasParent.add(cId);
                    }
                } else {
                    const nodeRegex = /(\w+)[\[\(\{\>](?:"?)(.*?)(?:"?)[\]\)\}\>]/;
                    const nodeMatch = line.match(nodeRegex);
                    if (nodeMatch) {
                        getOrCreateNode(nodeMatch[1], nodeMatch[2]);
                    }
                }
            });

            let roots = Array.from(nodesMap.values()).filter(n => !hasParent.has(n.id));
            if (roots.length === 0 && nodesMap.size > 0) {
                roots = [Array.from(nodesMap.values()).sort((a, b) => b.children.length - a.children.length)[0]];
            }

            return roots;
        };

        const parsedNodes = parseMermaid(data);
        setNodes(parsedNodes);

        if (parsedNodes.length > 0) {
            const initialExpanded = new Set();
            parsedNodes.forEach(rn => initialExpanded.add(rn.id));
            setExpandedIds(initialExpanded);
        }
    }, [data]);

    // --- INTERACTIVE CONTROLS ---
    const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (viewMode === 'tree') return;
        if (e.target.closest('button') || e.target.closest('.node-box')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const toggleExpand = (id) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    const renderNode = (node, depth = 0) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} className="ml-8 relative">
                {depth > 0 && (
                    <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-white/5">
                        <div className="absolute top-6 left-0 w-4 h-[1px] bg-white/5"></div>
                    </div>
                )}

                <div className="flex items-center gap-3 py-2.5 group">
                    <div className="relative">
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpand(node.id)}
                                className={`
                                    w-5 h-5 rounded flex items-center justify-center 
                                    transition-all duration-300 z-10 relative
                                    ${isExpanded ? 'bg-indigo-500/20 text-indigo-400 rotate-90' : 'bg-white/5 text-gray-500 hover:text-white'}
                                `}
                            >
                                <ChevronRight size={12} />
                            </button>
                        )}
                        {!hasChildren && (
                            <div className="w-5 h-5 flex items-center justify-center relative z-10">
                                <div className="w-1 h-1 rounded-full bg-gray-800 group-hover:bg-indigo-500/50 transition-colors" />
                            </div>
                        )}
                    </div>

                    <motion.div
                        layout
                        onClick={() => hasChildren && toggleExpand(node.id)}
                        className={`
                            node-box px-4 py-2 rounded-xl border transition-all cursor-pointer min-w-[100px]
                            ${isExpanded
                                ? 'bg-[#1a1a1a] border-indigo-500/30 text-indigo-300 shadow-[0_4px_12px_rgba(99,102,241,0.1)]'
                                : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-200'
                            }
                        `}
                    >
                        <span className="text-xs font-medium tracking-tight leading-relaxed block max-w-[450px]">{node.label}</span>
                        {hasChildren && !isExpanded && (
                            <span className="ml-2 text-[10px] text-indigo-500/60 font-bold">
                                ({node.children.length})
                            </span>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            {node.children.map(child => renderNode(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
            {/* Header / Toolbar */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#080808] z-30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                        <Network size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Interactive Mind Map</h3>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">Explorable Structure</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-[#111] p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setViewMode('tree')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${viewMode === 'tree' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Layout size={14} /> Explorable
                    </button>
                    <button
                        onClick={() => setViewMode('graph')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${viewMode === 'graph' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Layers size={14} /> Full Graph
                    </button>
                    {viewMode === 'graph' && (
                        <>
                            <div className="w-[1px] h-4 bg-white/10 mx-1" />
                            <button onClick={handleZoomOut} className="p-2 text-gray-500 hover:text-white rounded-lg transition-all"><Minus size={16} /></button>
                            <button onClick={handleZoomIn} className="p-2 text-gray-500 hover:text-white rounded-lg transition-all"><Plus size={16} /></button>
                            <button onClick={handleReset} className="p-2 text-gray-500 hover:text-white rounded-lg transition-all" title="Reset"><RefreshCw size={14} /></button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div
                ref={containerRef}
                className={`flex-1 relative ${viewMode === 'tree' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden cursor-grab active:cursor-grabbing'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {viewMode === 'graph' ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <motion.div
                            style={{ scale, x: position.x, y: position.y }}
                            className="w-full h-full"
                        >
                            <MermaidEditor code={data} readOnly={true} />
                        </motion.div>
                    </div>
                ) : (
                    <div className="p-10 max-w-4xl mx-auto">
                        {nodes.length > 0 ? (
                            <div className="-ml-8">
                                {nodes.map(node => renderNode(node))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center opacity-30">
                                <AlertCircle className="mb-4" size={32} />
                                <p className="text-sm font-medium">Logical structure empty or invalid.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-[#080808] border-t border-white/5 flex items-center justify-between z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Active topic</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-800" />
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Sub-concept</span>
                    </div>
                </div>
                {viewMode === 'graph' && (
                    <div className="text-[10px] text-gray-700 font-mono flex items-center gap-2">
                        <MousePointer2 size={10} />
                        <span>Drag to pan • Scale: {Math.round(scale * 100)}%</span>
                    </div>
                )}
                {viewMode === 'tree' && (
                    <span className="text-[10px] text-gray-700 font-mono">Expand nodes to dive deep</span>
                )}
            </div>
        </div>
    );
}
