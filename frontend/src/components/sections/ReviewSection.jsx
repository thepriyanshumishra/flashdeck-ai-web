import { motion } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";

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
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl">
                {cards.map((card, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        onClick={() => setSelectedCard(card)}
                        className="group relative bg-[#202020] hover:bg-[#252525] border border-white/5 hover:border-primary/30 rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] hover:-translate-y-1 hover:shadow-2xl"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-mono text-gray-500 border border-white/5 px-2 py-1 rounded-full tracking-wider">CARD {idx + 1}</span>
                                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Sparkles size={12} className="text-gray-500 group-hover:text-primary" />
                                </div>
                            </div>
                            <h3 className="text-base font-medium text-gray-100 leading-snug mb-3">
                                {card.q}
                            </h3>
                        </div>
                        <div className="relative mt-4 pt-4 border-t border-white/5">
                            <p className="text-sm text-gray-400/90 leading-relaxed select-none">
                                {card.a}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
