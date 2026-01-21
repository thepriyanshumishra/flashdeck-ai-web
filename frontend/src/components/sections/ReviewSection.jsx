import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Repeat, Eye, EyeOff } from "lucide-react";

const Flashcard = ({ card, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="relative h-[320px] w-full perspective-1000 group cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, animationDirection: "normal" }}
                className="w-full h-full relative preserve-3d transition-all duration-500"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* --- FRONT (QUESTION) --- */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                    <div className="w-full h-full bg-[#111] rounded-2xl border border-white/10 p-8 flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-2xl hover:shadow-indigo-500/10">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full tracking-widest uppercase">
                                Card {index + 1}
                            </span>
                            <Sparkles size={16} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                        </div>

                        <div className="flex-1 flex items-center justify-center text-center my-4 overflow-y-auto custom-scrollbar w-full">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-100 font-lexend leading-snug">
                                {card.q}
                            </h3>
                        </div>

                        <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider border-t border-white/5 pt-4">
                            <span className="flex items-center gap-2">
                                <Repeat size={12} />
                                Flip to reveal
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Eye size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BACK (ANSWER) --- */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <div className="w-full h-full bg-[#0a0a0a] rounded-2xl border border-indigo-500/30 p-8 flex flex-col justify-between shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                        {/* Background Gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -z-10 pointer-events-none" />

                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full tracking-widest uppercase">
                                Answer
                            </span>
                        </div>

                        <div className="flex-1 flex items-center justify-center text-center overflow-y-auto custom-scrollbar">
                            <p className="text-lg text-gray-200 font-sans leading-relaxed">
                                {card.a}
                            </p>
                        </div>

                        <div className="flex items-center justify-center mt-6 pt-4 border-t border-white/5">
                            <span className="text-xs text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                                <EyeOff size={12} />
                                Tap to hide
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function ReviewSection({ cards, cardsRef, setSelectedCard }) {
    if (!cards || cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="text-sm">No cards yet.</p>
            </div>
        );
    }

    return (
        <div>
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                {cards.map((card, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                    >
                        <Flashcard card={card} index={idx} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
