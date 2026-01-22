import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Presentation, ChevronRight, ChevronLeft, Maximize2, MonitorPlay, RotateCw, X } from 'lucide-react';
import AutoScale from './AutoScale';
import ExportMenu from './ExportMenu';
import PptxGenJS from 'pptxgenjs';

export default function SlideDeckViewer({ data, onRegenerate, onClose }) {
    const { isDark } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Handle Esc key
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none' : 'h-full rounded-[32px] border shadow-2xl ${isDark ? "border-white/5" : "border-gray-200"}'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-8 py-5 backdrop-blur-md border-b ${isDark ? 'bg-[#0d0d0d]/80 border-white/5' : 'bg-white/80 border-gray-100'} ${isFullscreen ? 'fixed top-0 left-0 right-0 z-20' : ''}`}>
                <div className="flex items-center gap-4">
                    {onClose && !isFullscreen && (
                        <button
                            onClick={onClose}
                            className={`mr-2 p-2 rounded-xl transition-all transform hover:scale-110 ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        <Presentation size={20} />
                    </div>
                    <div>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] block leading-none mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Interactive Studio</span>
                        <span className={`text-sm font-bold font-heading tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Slide {currentSlide + 1} of {data.length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ExportMenu onExport={handleExport} type="slides" />

                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white border-white/5' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900 border-gray-200'}`}
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
            <div className={`flex-1 relative bg-[#070707] flex items-center justify-center p-4 md:p-8 ${isFullscreen ? 'pt-20' : ''}`}>
                {/* Fixed Aspect Ratio Container */}
                <div
                    className="relative shadow-[0_30px_90px_rgba(0,0,0,0.8)] rounded-2xl md:rounded-[40px] overflow-hidden border border-white/10 group transition-all duration-500"
                    style={{
                        width: '100%',
                        maxWidth: 'calc(min(100%, (100vh - 200px) * 16 / 9))',
                        aspectRatio: '16 / 9',
                    }}
                >
                    <div
                        key={currentSlide}
                        className="w-full h-full bg-[#0d0d0d] flex flex-col relative overflow-hidden p-[6%]"
                    >
                        {/* High-End Background Design */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#0a0a0a]" />
                        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* Decorative Patterns */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                        {/* Slide Content with AutoScale */}
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                            <AutoScale>
                                {slide.type === 'title' ? (
                                    <div className="w-full text-center py-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
                                            <Sparkles size={12} />
                                            Module Overview
                                        </div>
                                        <h1 className="text-8xl font-black text-white tracking-tighter leading-[1.1] mb-12 drop-shadow-2xl">
                                            {slide.title || "Untitled Slide"}
                                        </h1>
                                        <div className="w-32 h-1.5 bg-gradient-to-r from-orange-600 to-orange-400 mx-auto rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] mb-12" />
                                        <p className="text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-medium">
                                            {slide.content || ""}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col text-left py-4">
                                        <div className="flex items-center justify-between gap-8 mb-16 border-b border-white/10 pb-10">
                                            <h2 className="text-6xl font-black text-white tracking-tight leading-tight flex-1">
                                                {slide.title || "No Title"}
                                            </h2>
                                            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[12px] font-black text-orange-500 uppercase tracking-[0.2em] shadow-inner">
                                                Key Insight
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full">
                                            {(slide.type === 'bullet' || Array.isArray(slide.content)) ? (
                                                <div className="grid grid-cols-1 gap-y-10">
                                                    {(Array.isArray(slide.content) ? slide.content : (slide.content || "").split('\n'))
                                                        .filter(l => l && typeof l === 'string' && l.trim())
                                                        .map((line, i) => (
                                                            <div key={i} className="flex items-start gap-8 group/item">
                                                                <div className="w-4 h-4 rounded-full bg-orange-500 mt-4 shadow-[0_0_15px_rgba(249,115,22,0.5)] flex-shrink-0" />
                                                                <span className="text-[2.8rem] text-white/90 leading-[1.3] font-medium tracking-tight">
                                                                    {line.replace(/^- /, '')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white/[0.03] p-12 rounded-[40px] border border-white/5 shadow-2xl backdrop-blur-sm">
                                                    <p className="text-[2.6rem] text-gray-300 whitespace-pre-line leading-[1.5] font-medium">
                                                        {typeof slide.content === 'string' ? slide.content : JSON.stringify(slide.content)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </AutoScale>
                        </div>

                        {/* Slide Footer */}
                        <div className="relative z-10 flex items-center justify-between mt-auto pt-8 border-t border-white/10">
                            <div className="flex items-center gap-4 text-gray-500">
                                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">FlashDeck AI Pro</span>
                            </div>
                            <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[14px] font-black text-white/60 font-mono tracking-widest">
                                {String(currentSlide + 1).padStart(2, '0')} <span className="text-white/20 mx-1">/</span> {String(data.length).padStart(2, '0')}
                            </div>
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
