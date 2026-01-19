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
            data.forEach(s => {
                const slide = pres.addSlide();

                // Dark background
                slide.background = { color: '000000' };

                // Colors
                const titleColor = 'FFFFFF';
                const bodyColor = 'E5E5E5'; // Gray-300

                if (s.type === 'title') {
                    slide.addText(s.title, {
                        x: 0.5, y: 2, w: '90%', h: 1.5,
                        fontSize: 44, color: titleColor, bold: true, align: 'center', fontFace: 'Arial'
                    });
                    slide.addText(s.content || '', {
                        x: 1, y: 3.5, w: '80%', h: 2,
                        fontSize: 24, color: 'AAAAAA', align: 'center', fontFace: 'Arial'
                    });
                } else {
                    slide.addText(s.title, {
                        x: 0.5, y: 0.5, w: '90%', h: 1,
                        fontSize: 32, color: titleColor, bold: true, fontFace: 'Arial'
                    });

                    if (s.type === 'bullet' || Array.isArray(s.content)) {
                        const lines = Array.isArray(s.content) ? s.content : (s.content || "").split('\n');
                        const cleanLines = lines.filter(l => l && typeof l === 'string' && l.trim()).map(l => l.replace(/^- /, ''));

                        cleanLines.forEach((line, i) => {
                            slide.addText(line, {
                                x: 0.5, y: 1.8 + (i * 0.6), w: '90%', h: 0.5,
                                fontSize: 18, color: bodyColor, bullet: true, fontFace: 'Arial'
                            });
                        });
                    } else {
                        // Paragraph
                        slide.addText(s.content || '', {
                            x: 0.5, y: 1.8, w: '90%', h: 4,
                            fontSize: 18, color: bodyColor, fontFace: 'Arial'
                        });
                    }
                }
            });
            pres.writeFile({ fileName: 'flashdeck-presentation.pptx' });
        } else if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'presentation.json';
            a.click();
        }
    };

    return (
        <div className={`flex flex-col bg-[#0a0a0a] overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none' : 'h-full rounded-3xl border border-white/5'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 bg-[#0d0d0d] border-b border-white/5 ${isFullscreen ? 'fixed top-0 left-0 right-0 z-20 bg-[#0d0d0d]/90 backdrop-blur-md' : ''}`}>
                <div className="flex items-center gap-3">
                    {onClose && !isFullscreen && ( // Only show back button if present and not fullscreen
                        <button
                            onClick={onClose}
                            className="mr-2 p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                            title="Back to Chat"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <Presentation size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Presentation</span>
                        <span className="text-sm font-semibold text-white">Slide {currentSlide + 1} of {data.length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportMenu onExport={handleExport} type="slides" />

                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Regenerate"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                    >
                        <MonitorPlay size={14} />
                        {isFullscreen ? 'Exit' : 'Present'}
                    </button>
                </div>
            </div>

            {/* Slide Area */}
            <div className={`flex-1 relative flex items-center justify-center bg-[#111] p-8 md:p-12 overflow-hidden ${isFullscreen ? 'pt-24' : ''}`}>
                <div
                    key={currentSlide}
                    className="w-full max-w-4xl aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl p-8 md:p-12 flex flex-col relative overflow-hidden"
                >
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

                    {/* Scaleable Content Area */}
                    <div className="flex-1 w-full min-h-0 relative z-10 mb-8 flex flex-col justify-center">
                        <AutoScale>
                            {slide.type === 'title' ? (
                                <div className="text-center space-y-8 w-full">
                                    <h1 className="text-7xl md:text-8xl font-bold text-white tracking-tight leading-[1.1]">
                                        {slide.title || "Untitled Slide"}
                                    </h1>
                                    <p className="text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                                        {slide.content || ""}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-10 w-full">
                                    <h2 className="text-6xl font-bold text-white tracking-tight border-b border-white/10 pb-8 text-center md:text-left">
                                        {slide.title || "No Title"}
                                    </h2>
                                    <div className="text-3xl text-gray-300 leading-relaxed font-light">
                                        {(slide.type === 'bullet' || Array.isArray(slide.content)) ? (
                                            <ul className="space-y-6 list-disc pl-8">
                                                {(Array.isArray(slide.content) ? slide.content : (slide.content || "").split('\n'))
                                                    .filter(l => l && typeof l === 'string' && l.trim())
                                                    .map((line, i) => (
                                                        <li key={i}>{line.replace(/^- /, '')}</li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="whitespace-pre-line text-center md:text-left leading-loose">
                                                {typeof slide.content === 'string' ? slide.content : JSON.stringify(slide.content)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </AutoScale>
                    </div>

                    {/* Footer */}
                    <div className="flex-none flex justify-between items-end border-t border-white/5 pt-4">
                        <div className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                            FlashDeck AI
                        </div>
                        <div className="text-xs font-mono text-gray-600">
                            {currentSlide + 1} / {data.length}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 hover:bg-white/10 backdrop-blur-sm text-white/50 hover:text-white transition-all border border-white/5 hover:scale-110 z-30"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 hover:bg-white/10 backdrop-blur-sm text-white/50 hover:text-white transition-all border border-white/5 hover:scale-110 z-30"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
