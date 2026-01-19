import React, { useRef } from 'react';
import MermaidEditor from './MermaidEditor';
import { Network, Plus, RotateCw, ChevronLeft } from 'lucide-react';
import ExportMenu from './ExportMenu';
import html2canvas from 'html2canvas';

export default function InfographicViewer({ code, onRegenerate, onClose }) {
    const containerRef = useRef(null);
    if (!code) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Network size={48} className="mb-4 opacity-20" />
                <Network size={48} className="mb-4 opacity-20" />
                <p>No infographic generated yet.</p>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="mt-4 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl transition-all"
                    >
                        Try generating again
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
                        <Network size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Visuals</span>
                        <span className="text-sm font-semibold text-white">Infographic</span>
                    </div>
                </div>
                {/* Save handled inside editor usually, but we can add external controls if needed */}
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
            <div className="flex-1 overflow-hidden p-6 bg-[#111]" ref={containerRef}>
                <MermaidEditor code={code} readOnly={true} />
            </div>
        </div>
    );

    function handleExport(format) {
        if (!containerRef.current) return;

        // Find the SVG inside the container (Mermaid renders generic svg)
        // If html2canvas is preferred for PNG:
        if (format === 'png') {
            html2canvas(containerRef.current).then(canvas => {
                const a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                a.download = `infographic-${Date.now()}.png`;
                a.click();
            });
        } else if (format === 'svg') {
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `infographic-${Date.now()}.svg`;
                a.click();
                URL.revokeObjectURL(url);
            }
        }
    }
}
