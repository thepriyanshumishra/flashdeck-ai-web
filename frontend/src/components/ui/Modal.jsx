import { motion, AnimatePresence } from "framer-motion";
import { X, Brain } from "lucide-react";

export default function Modal({ isOpen, onClose, children, title }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#202020]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Brain size={16} className="text-primary" />
                                </div>
                                <span className="text-sm font-medium text-gray-300">{title}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-0">
                            {children}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 bg-[#111] border-t border-white/5 flex justify-between items-center text-xs text-gray-600 font-mono">
                            <span>Space Recall</span>
                            <span>Press ESC to close</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
