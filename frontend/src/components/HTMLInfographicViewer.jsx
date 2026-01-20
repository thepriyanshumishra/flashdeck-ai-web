import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, RotateCw, ChevronLeft } from 'lucide-react';
import ExportMenu from './ExportMenu';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
};

const accentColorMap = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
    red: 'text-red-400 bg-red-500/10',
};

function InfographicItem({ item, color, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div className={`${depth > 0 ? 'ml-6 mt-2' : ''}`}>
            <div className="flex items-start gap-3 group">
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1 p-1 hover:bg-white/5 rounded transition-colors"
                    >
                        {expanded ? (
                            <ChevronDown size={14} className="text-gray-500" />
                        ) : (
                            <ChevronRight size={14} className="text-gray-500" />
                        )}
                    </button>
                )}
                {!hasChildren && depth > 0 && (
                    <div className="mt-2 w-2 h-2 rounded-full bg-white/10" />
                )}

                <div className="flex-1">
                    <div className={`p-3 rounded-xl border border-white/10 bg-gradient-to-br ${colorMap[color] || colorMap.blue} backdrop-blur-sm hover:border-white/20 transition-all`}>
                        <div className="flex items-start gap-2">
                            {item.icon && (
                                <span className="text-xl flex-shrink-0">{item.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white mb-1">
                                    {item.label}
                                </h4>
                                {item.value && (
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {item.value}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {expanded && hasChildren && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                {item.children.map((child, idx) => (
                                    <InfographicItem
                                        key={idx}
                                        item={child}
                                        color={color}
                                        depth={depth + 1}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function HTMLInfographicViewer({ data, onRegenerate, onClose }) {
    const containerRef = useRef(null);

    // Parse JSON if it's a string
    const infographicData = typeof data === 'string'
        ? (() => {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error("Failed to parse infographic data:", e);
                return null;
            }
        })()
        : data;

    const handleExport = async (format) => {
        if (!containerRef.current) return;

        if (format === 'png') {
            try {
                const canvas = await html2canvas(containerRef.current, {
                    backgroundColor: '#0a0a0a',
                    scale: 2,
                });
                const link = document.createElement('a');
                link.download = `infographic-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (e) {
                console.error("Export failed:", e);
            }
        } else if (format === 'svg') {
            // For HTML content, PNG is more reliable than SVG
            // But we can offer it by rendering to canvas first
            handleExport('png');
        }
    };

    if (!infographicData || !infographicData.sections) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-4xl">📊</span>
                </div>
                <p className="mb-4">No infographic data available.</p>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="mt-4 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl transition-all"
                    >
                        Generate Infographic
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-white/5">
                <div className="flex items-center gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mr-2 p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                            title="Back to Chat"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                        <span className="text-lg">📊</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Visuals</span>
                        <span className="text-sm font-semibold text-white">Infographic</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportMenu onExport={handleExport} type="infographic" />
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Regenerate"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div ref={containerRef} className="max-w-5xl mx-auto space-y-8">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
                            {infographicData.title}
                        </h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
                    </div>

                    {/* Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {infographicData.sections.map((section, sectionIdx) => (
                            <motion.div
                                key={sectionIdx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: sectionIdx * 0.1 }}
                                className="space-y-4"
                            >
                                {/* Section Header */}
                                <div className={`px-4 py-2 rounded-xl ${accentColorMap[section.color] || accentColorMap.blue} border border-white/10 inline-block`}>
                                    <h3 className="text-sm font-bold uppercase tracking-wider">
                                        {section.category}
                                    </h3>
                                </div>

                                {/* Section Items */}
                                <div className="space-y-3">
                                    {section.items.map((item, itemIdx) => (
                                        <InfographicItem
                                            key={itemIdx}
                                            item={item}
                                            color={section.color}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
