import React, { useState } from 'react';
import { Presentation, ChevronRight, ChevronLeft, Maximize2, MonitorPlay, RotateCw, X } from 'lucide-react';
import AutoScale from './AutoScale';
import ExportMenu from './ExportMenu';
import PptxGenJS from 'pptxgenjs';

export default function SlideDeckViewer({ data, onRegenerate, onClose }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!data || !data.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Presentation size={48} className="mb-4 opacity-20" />
                <p>No slides generated yet.</p>
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

    const nextSlide = () => setCurrentSlide(curr => (curr + 1) % data.length);
    const prevSlide = () => setCurrentSlide(curr => (curr - 1 + data.length) % data.length);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    // Handle Esc key
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const slide = data[currentSlide] || { title: "Error", content: "Slide data missing", type: "text" };

    const handleExport = (format) => {
        if (format === 'pptx') {
            const pres = new PptxGenJS();
            const brandColor = '6366f1';

            data.forEach((s, idx) => {
                const slide = pres.addSlide();
                slide.background = { color: '0d0d0d' };

                // Branded Footer Accent
                slide.addShape(pres.ShapeType.rect, {
                    x: 0, y: '98%', w: '100%', h: '2%', fill: { color: brandColor }
                });

                // Branding
                slide.addText("FlashDeck AI Pro", {
                    x: '80%', y: '92%', w: '18%', h: 0.3,
                    fontSize: 10, color: '666666', fontFace: 'Arial',
                    italic: true, align: 'right'
                });

                if (s.type === 'title') {
                    slide.addShape(pres.ShapeType.rect, {
                        x: '10%', y: '45%', w: '80%', h: 0.03, fill: { color: brandColor }
                    });
                    slide.addText(s.title, {
                        x: 0.5, y: 1.5, w: '90%', h: 2,
                        fontSize: 44, color: 'ffffff', bold: true, align: 'center', fontFace: 'Verdana'
                    });
                    slide.addText(s.content || '', {
                        x: 1, y: 3.5, w: '80%', h: 1.5,
                        fontSize: 22, color: '999999', align: 'center', fontFace: 'Arial'
                    });
                } else {
                    slide.addText(s.title, {
                        x: 0.5, y: 0.4, w: '90%', h: 0.8,
                        fontSize: 32, color: 'ffffff', bold: true, fontFace: 'Verdana'
                    });

                    const bodyColor = 'cccccc';
                    if (s.type === 'bullet' || Array.isArray(s.content)) {
                        const lines = Array.isArray(s.content) ? s.content : (s.content || "").split('\n');
                        const cleanLines = lines.filter(l => l && typeof l === 'string' && l.trim()).map(l => l.replace(/^- /, ''));

                        cleanLines.forEach((line, i) => {
                            slide.addText(line, {
                                x: 0.8, y: 1.6 + (i * 0.6), w: '85%', h: 0.5,
                                fontSize: 18, color: bodyColor, bullet: true, fontFace: 'Arial'
                            });
                        });
                    } else {
                        slide.addText(s.content || '', {
                            x: 0.8, y: 1.6, w: '85%', h: 4,
                            fontSize: 18, color: bodyColor, fontFace: 'Arial', valign: 'top'
                        });
                    }
                }
            });
            pres.writeFile({ fileName: `FlashDeck_Slides_${Date.now()}.pptx` });
        } else if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'presentation.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className={`flex flex-col bg-[#0a0a0a] overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none' : 'h-full rounded-[32px] border border-white/5 shadow-2xl'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-8 py-5 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/5 ${isFullscreen ? 'fixed top-0 left-0 right-0 z-20' : ''}`}>
                <div className="flex items-center gap-4">
                    {onClose && !isFullscreen && (
                        <button
                            onClick={onClose}
                            className="mr-2 p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all transform hover:scale-110"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
                        <Presentation size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block leading-none mb-1">Interactive Studio</span>
                        <span className="text-sm font-bold text-white font-heading tracking-tight">Slide {currentSlide + 1} of {data.length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ExportMenu onExport={handleExport} type="slides" />

                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5"
                            title="Regenerate"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-[11px] font-bold rounded-2xl transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2 uppercase tracking-wider"
                    >
                        <MonitorPlay size={14} />
                        {isFullscreen ? 'Exit Stage' : 'Present'}
                    </button>
                </div>
            </div>

            {/* Slide Area */}
            <div className={`flex-1 relative flex items-center justify-center bg-[#070707] p-6 md:p-12 overflow-hidden ${isFullscreen ? 'pt-24' : ''}`}>
                <div
                    key={currentSlide}
                    className="w-full max-w-5xl aspect-video bg-[#0d0d0d] bg-dots rounded-[40px] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 md:p-16 flex flex-col relative overflow-hidden group"
                >
                    {/* Premium Accents */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-orange-600/10 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-600/10 transition-all duration-1000" />

                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

                    {/* Scaleable Content Area */}
                    <div className="flex-1 w-full min-h-0 relative z-10 mb-8 flex flex-col justify-center text-center">
                        <AutoScale>
                            {slide.type === 'title' ? (
                                <div className="space-y-10 w-full">
                                    <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-4">
                                        Presentation Guide
                                    </div>
                                    <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-[1] font-heading">
                                        {slide.title || "Untitled Slide"}
                                    </h1>
                                    <div className="w-24 h-1 bg-orange-500 mx-auto my-8 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                                    <p className="text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
                                        {slide.content || ""}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-12 w-full text-left">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                                        <h2 className="text-6xl font-bold text-white tracking-tight font-heading leading-tight">
                                            {slide.title || "No Title"}
                                        </h2>
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:block">
                                            Insight Summary
                                        </div>
                                    </div>

                                    <div className="text-[2.6rem] text-indigo-100/90 leading-[1.3] font-handwriting tracking-wide">
                                        {(slide.type === 'bullet' || Array.isArray(slide.content)) ? (
                                            <ul className="space-y-8">
                                                {(Array.isArray(slide.content) ? slide.content : (slide.content || "").split('\n'))
                                                    .filter(l => l && typeof l === 'string' && l.trim())
                                                    .map((line, i) => (
                                                        <li key={i} className="flex items-start gap-6 group/item">
                                                            <span className="w-3 h-3 rounded-full bg-orange-500 mt-5 group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(249,115,22,0.5)] flex-shrink-0" />
                                                            <span className="flex-1">{line.replace(/^- /, '')}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="whitespace-pre-line leading-[1.6] bg-white/5 p-10 rounded-[32px] border border-white/5 shadow-inner">
                                                {typeof slide.content === 'string' ? slide.content : JSON.stringify(slide.content)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </AutoScale>
                    </div>

                    {/* Footer */}
                    <div className="flex-none flex justify-between items-end border-t border-white/5 pt-6 mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] font-heading">
                                FlashDeck AI Pro
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-gray-600 font-mono bg-white/5 px-3 py-1 rounded-lg">
                            {String(currentSlide + 1).padStart(2, '0')} / {String(data.length).padStart(2, '0')}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                    <button
                        onClick={prevSlide}
                        className="p-4 rounded-2xl bg-black/60 hover:bg-orange-500 text-white/50 hover:text-white transition-all border border-white/10 hover:scale-110 shadow-2xl backdrop-blur-md"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="px-6 py-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex gap-2">
                        {data.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-orange-500 w-6' : 'bg-gray-700 hover:bg-gray-500'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={nextSlide}
                        className="p-4 rounded-2xl bg-black/60 hover:bg-orange-500 text-white/50 hover:text-white transition-all border border-white/10 hover:scale-110 shadow-2xl backdrop-blur-md"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
