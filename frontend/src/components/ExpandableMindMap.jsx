import { useState, useEffect, useRef } from 'react';
import {
    ChevronRight, ChevronDown, Network,
    RefreshCw, AlertCircle, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExportMenu from './ExportMenu';
import html2canvas from 'html2canvas';

export default function ExpandableMindMap({ data, onClose, onRegenerate }) {
    const [nodes, setNodes] = useState([]);
    const [reconstructedMermaid, setReconstructedMermaid] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
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

        const generateMermaidFromNodes = (rootNodes) => {
            if (!rootNodes || rootNodes.length === 0) return '';

            // 1. Collect all unique nodes to ensure clean definitions
            // This 2-pass approach strictly follows Mermaid syntax requirements
            // preventing 'Syntax Conflict' by separating definitions from edges.
            const allNodes = new Map(); // id -> { safeId, safeLabel }
            const edges = []; // { from, to }
            const definedIds = new Set();
            let idCounter = 0;

            const processNode = (node) => {
                // Ensure unique processing per ID to avoid cycles/duplicates in definition
                if (!definedIds.has(node.id)) {
                    definedIds.add(node.id);

                    // Sanitize ID: Ensure simple alphanumeric ID for Mermaid
                    const safeId = `node_${idCounter++}`;

                    // Sanitize Label: Extensive cleaning for stability
                    let label = node.label || node.id;
                    if (typeof label !== 'string') label = String(label);

                    label = label
                        .replace(/"/g, "'")             // Quotes to single
                        .replace(/`/g, "'")             // Backticks
                        .replace(/[\[\]\(\)\{\}]/g, '') // Brackets (remove to be safe)
                        .replace(/<[^>]*>/g, '')        // HTML tags
                        .replace(/\n/g, ' ')            // Newlines
                        .replace(/\\/g, '/')            // Backslashes
                        .trim();

                    // Truncate quite aggressively to prevent overflow
                    if (label.length > 50) label = label.substring(0, 47) + '...';
                    if (!label) label = node.id;

                    allNodes.set(node.id, { safeId, safeLabel: label });
                }

                if (node.children) {
                    node.children.forEach(child => {
                        edges.push({ from: node.id, to: child.id });
                        processNode(child);
                    });
                }
            };

            rootNodes.forEach(processNode);

            // 2. Build Strict Mermaid String
            let mermaidStr = 'graph TD\n';

            // A. Definitions
            for (const [originalId, info] of allNodes.entries()) {
                mermaidStr += `    ${info.safeId}["${info.safeLabel}"]\n`;
            }

            // B. Connections (using only IDs)
            mermaidStr += '\n';
            for (const edge of edges) {
                const from = allNodes.get(edge.from);
                const to = allNodes.get(edge.to);
                if (from && to) {
                    mermaidStr += `    ${from.safeId} --> ${to.safeId}\n`;
                }
            }

            // Use slightly rounded rectangles and dark theme colors
            mermaidStr += '    classDef default fill:#1a1a1a,stroke:#6366f1,stroke-width:1px,color:#fff,rx:5px,ry:5px;\n';
            return mermaidStr;
        };

        const parsedNodes = parseMermaid(data);
        setNodes(parsedNodes);

        // RECONSTRUCT CLEAN MERMAID FROM THE PARSED TREE
        const cleanMermaid = generateMermaidFromNodes(parsedNodes);
        setReconstructedMermaid(cleanMermaid);

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

    const handleExport = (format) => {
        if (!containerRef.current) return;

        // If in tree mode, export the whole tree container
        // If in graph mode, we might want to target the SVG directly or the container
        const target = viewMode === 'graph'
            ? containerRef.current.querySelector('svg') || containerRef.current
            : containerRef.current;

        if (format === 'png') {
            html2canvas(target).then(canvas => {
                const a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                a.download = `mindmap-${Date.now()}.png`;
                a.click();
            });
        } else if (format === 'svg') {
            // Only works well if we have an actual SVG element
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement && viewMode === 'graph') {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mindmap-${Date.now()}.svg`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                // Fallback to png for tree view or if no svg found
                handleExport('png');
            }
        }
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
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mr-2 p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                            title="Back to Chat"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                        <Network size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Interactive Mind Map</h3>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">Explorable Structure</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Action Controls */}
                    <div className="flex items-center gap-1 bg-[#111] p-1.5 rounded-2xl border border-white/5">
                        <ExportMenu onExport={handleExport} type="mindmap" />
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-2 text-gray-500 hover:text-white rounded-lg transition-all"
                                title="Regenerate"
                            >
                                <RefreshCw size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
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
                <span className="text-[10px] text-gray-700 font-mono">Expand nodes to dive deep</span>
            </div>
        </div>
    );
}
