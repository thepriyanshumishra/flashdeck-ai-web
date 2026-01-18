import React, { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { Edit2, Eye, Download, Save, RefreshCw, ZoomIn, ZoomOut, Maximize2, AlertTriangle } from 'lucide-react'
import html2canvas from 'html2canvas'
import { motion } from 'framer-motion'

export default function MermaidEditor({ code, onSave, readOnly = false }) {
    const [isEditing, setIsEditing] = useState(false)
    const [currentCode, setCurrentCode] = useState(code)
    const [error, setError] = useState(null)
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const graphRef = useRef(null)

    useEffect(() => {
        setCurrentCode(code)
    }, [code])

    const renderDiagram = React.useCallback(async () => {
        if (!graphRef.current) return;

        try {
            // Clear previous content
            graphRef.current.innerHTML = '';

            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                // This helps prevent error injection into body
                suppressError: true,
                themeVariables: {
                    primaryColor: '#6366f1',
                    primaryTextColor: '#fff',
                    primaryBorderColor: '#6366f1',
                    lineColor: '#6366f1',
                    secondaryColor: '#1e1e1e',
                    tertiaryColor: '#1a1a1a',
                    mainBkg: '#0a0a0a',
                    nodeBorder: '#6366f1',
                    clusterBkg: '#111'
                }
            })

            const uniqueId = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
            const { svg } = await mermaid.render(uniqueId, currentCode);

            if (graphRef.current) {
                graphRef.current.innerHTML = svg;
                const svgElement = graphRef.current.querySelector('svg');
                if (svgElement) {
                    svgElement.style.maxWidth = 'none';
                    svgElement.style.height = 'auto';
                }
                setError(null);
            }
        } catch (e) {
            console.error("Mermaid Render Error:", e);
            setError("The generated structure contains syntax errors that Mermaid.js cannot render.");

            // Clean up any error divs mermaid might have injected into the body
            const errorDivs = document.querySelectorAll('div[id^="dmermaid"]');
            errorDivs.forEach(div => div.remove());
        }
    }, [currentCode]);

    useEffect(() => {
        if (!isEditing) {
            renderDiagram()
        }
    }, [isEditing, renderDiagram])

    const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.3));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (isEditing || e.target.closest('button')) return;
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

    const handleDownload = async (format) => {
        if (!graphRef.current) return;
        try {
            const canvas = await html2canvas(graphRef.current, {
                backgroundColor: '#0a0a0a',
                scale: 3
            });
            const link = document.createElement('a');
            link.download = `mindmap-${Date.now()}.${format}`;
            link.href = canvas.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`);
            link.click();
        } catch (e) {
            console.error("Export Failed", e)
            alert("Export failed: " + e.message)
        }
    }

    if (isEditing) {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Edit2 size={16} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mermaid Architect</span>
                    </div>
                    <button
                        onClick={() => {
                            setIsEditing(false)
                            if (onSave) onSave(currentCode)
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Save & Render
                    </button>
                </div>
                <textarea
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                    className="flex-1 w-full bg-[#0a0a0a] text-indigo-300 font-mono text-sm p-8 outline-none resize-none custom-scrollbar"
                    placeholder="Enter Mermaid code..."
                    spellCheck={false}
                />
            </div>
        )
    }

    return (
        <div className="relative flex flex-col h-full w-full bg-[#050505] rounded-3xl border border-white/5 overflow-hidden group">
            {/* Control HUD */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-1 shadow-2xl">
                    <button onClick={handleZoomIn} className="p-2.5 text-gray-500 hover:text-white transition-colors"><ZoomIn size={16} /></button>
                    <button onClick={handleZoomOut} className="p-2.5 text-gray-500 hover:text-white transition-colors"><ZoomOut size={16} /></button>
                    <button onClick={handleReset} className="p-2.5 text-gray-500 hover:text-white transition-colors" title="Reset View"><RefreshCw size={14} /></button>
                </div>
                {!readOnly && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
                <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
                    <button onClick={() => handleDownload('png')} className="px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-indigo-400">PNG</button>
                    <button onClick={() => handleDownload('jpeg')} className="px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-indigo-400">JPG</button>
                </div>
            </div>

            {/* Viewport */}
            <div
                className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {error ? (
                    <div className="max-w-md bg-red-500/5 border border-red-500/10 p-8 rounded-3xl text-center backdrop-blur-sm">
                        <AlertTriangle className="mx-auto text-red-500 mb-4" size={32} />
                        <h4 className="text-white font-bold mb-2">Syntax Conflict</h4>
                        <p className="text-red-400/80 text-xs mb-6 leading-relaxed">{error}</p>
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all">
                            Modify Structure
                        </button>
                    </div>
                ) : (
                    <motion.div
                        ref={graphRef}
                        style={{ scale, x: position.x, y: position.y }}
                        className="w-full h-full flex items-center justify-center p-20"
                    />
                )}
            </div>

            {/* HUD Legend */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
                <p className="text-[10px] text-gray-700 font-mono tracking-tight uppercase bg-black/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/5">
                    Drag to explore • Zoom to scale
                </p>
            </div>
        </div>
    )
}
