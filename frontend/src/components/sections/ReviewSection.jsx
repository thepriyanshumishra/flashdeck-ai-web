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
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-xl">
                {cards.map((card, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        onClick={() => setSelectedCard(card)}
                        className="group relative bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles size={14} className="text-primary" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-bold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full tracking-wider uppercase">Card {idx + 1}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-100 leading-tight mb-3 font-heading group-hover:text-white transition-colors">
                                {card.q}
                            </h3>
                        </div>
                        <div className="relative mt-4 pt-4 border-t border-white/5">
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed line-clamp-3 transition-colors">
                                {card.a}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
