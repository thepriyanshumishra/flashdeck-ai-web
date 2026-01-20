import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Bookmark, Share2, Printer, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { saveAs } from 'file-saver';

export default function SavedNotesModal({ isOpen, onClose, notes }) {
    if (!isOpen) return null;

    const exportToTXT = () => {
        const content = notes.map(note => `--- Note (${new Date(note.date).toLocaleString()}) ---\n\n${note.content}\n\n`).join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `saved_notes_${Date.now()}.txt`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        let yOffset = 20;

        doc.setFontSize(22);
        doc.text('Saved Notes', 20, yOffset);
        yOffset += 15;

        notes.forEach((note, index) => {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            const dateStr = new Date(note.date).toLocaleString();
            doc.text(`Note ${index + 1} - ${dateStr}`, 20, yOffset);
            yOffset += 7;

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            const splitText = doc.splitTextToSize(note.content, 170);

            // Check if we need a new page
            if (yOffset + (splitText.length * 7) > 280) {
                doc.addPage();
                yOffset = 20;
            }

            doc.text(splitText, 20, yOffset);
            yOffset += (splitText.length * 7) + 15;

            if (yOffset > 280) {
                doc.addPage();
                yOffset = 20;
            }
        });

        doc.save(`saved_notes_${Date.now()}.pdf`);
    };

    const exportToPPT = () => {
        const pres = new pptxgen();

        notes.forEach((note, index) => {
            const slide = pres.addSlide();
            slide.background = { color: "1a1a1a" };

            slide.addText(`Saved Note ${index + 1}`, {
                x: 0.5, y: 0.5, w: "90%", h: 1,
                fontSize: 24, fontFace: "Arial", color: "6366f1", bold: true
            });

            slide.addText(new Date(note.date).toLocaleString(), {
                x: 0.5, y: 1.2, w: "90%", h: 0.5,
                fontSize: 12, fontFace: "Arial", color: "888888"
            });

            slide.addText(note.content, {
                x: 0.5, y: 2.0, w: "90%", h: 4.5,
                fontSize: 14, fontFace: "Arial", color: "ffffff",
                valign: "top"
            });
        });

        pres.writeFile({ fileName: `saved_notes_${Date.now()}.pptx` });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d0d0d] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a]/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                <Bookmark size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Your Saved Notes</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">{notes.length} insights captured</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Export Actions */}
                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                                <button
                                    onClick={exportToPDF}
                                    className="px-4 py-2 hover:bg-white/5 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                    title="Export to PDF"
                                >
                                    <FileText size={14} className="text-red-400" /> PDF
                                </button>
                                <button
                                    onClick={exportToTXT}
                                    className="px-4 py-2 hover:bg-white/5 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                    title="Export to TXT"
                                >
                                    <FileText size={14} className="text-blue-400" /> TXT
                                </button>
                                <button
                                    onClick={exportToPPT}
                                    className="px-4 py-2 hover:bg-white/5 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                    title="Export to PPT"
                                >
                                    <Share2 size={14} className="text-orange-400" /> PPT
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-all border border-white/5"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#0d0d0d]">
                        {notes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-30">
                                <Bookmark size={48} className="mb-4" />
                                <p className="text-lg font-medium text-white">No saved notes found</p>
                                <p className="text-sm mt-2">Save insights from your chat to see them here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.map((note, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={note.id}
                                        className="bg-[#151515] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all group relative"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono uppercase">
                                                <Clock size={10} />
                                                {new Date(note.date).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none">
                                            {note.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notes.length > 0 && (
                        <div className="p-6 border-t border-white/5 bg-[#0a0a0a]/50 flex items-center justify-between">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Memory Bank • AI-Native Notebook</p>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-white transition-colors uppercase tracking-widest font-bold"
                            >
                                <Printer size={12} /> Print All
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
