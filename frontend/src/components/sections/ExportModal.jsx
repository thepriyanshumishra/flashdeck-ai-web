import { Download, FileText, Image as ImageIcon, X } from "lucide-react";
import Button from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportModal({ isOpen, onClose, downloadPDF, downloadImage, cards }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">Export Flashcards</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">

                        {/* Option 1: Anki */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Download size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">Anki Package (.apkg)</h4>
                                <p className="text-xs text-gray-500">Native support for Spaced Repetition</p>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-none">
                                Download
                            </Button>
                        </div>

                        {/* Option 2: PDF */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">Printable PDF</h4>
                                <p className="text-xs text-gray-500">High-fidelity vector format</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={downloadPDF}
                                disabled={cards.length === 0}
                                className="bg-white/10 hover:bg-white/20 text-white border-none"
                            >
                                Download
                            </Button>
                        </div>

                        {/* Option 3: Image */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <ImageIcon size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">Image Grid (PNG)</h4>
                                <p className="text-xs text-gray-500">Visual overview of your deck</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => downloadImage('png')}
                                disabled={cards.length === 0}
                                className="bg-white/10 hover:bg-white/20 text-white border-none"
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
