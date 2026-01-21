import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "How does the AI generate flashcards?",
            answer: "FlashDeck AI uses advanced LLMs to analyze your uploaded documents. It identifies core concepts, definitions, and relationships, then formats them into high-quality flashcards optimized for active recall."
        },
        {
            question: "Is my data secure?",
            answer: "Yes. Your documents are stored securely and used only for your personalized learning session. We do not use your private data to train our global models."
        },
        {
            question: "What file types are supported?",
            answer: "We support PDF, Word documents, text files, and even raw text copy-pastes. We are constantly adding support for more formats like YouTube links and audio files."
        },
        {
            question: "Can I use it for free?",
            answer: "Absolutely. Our 'Free' tier includes all core features like flashcard generation, mind maps, and quizzes. We offer premium tiers for heavy users who need larger document limits."
        }
    ];

    return (
        <section className="py-24 max-w-3xl mx-auto px-6 mb-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Frequently Asked <br /> <span className="text-gray-500">Questions.</span></h2>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={`rounded-2xl border transition-all duration-300 ${openIndex === i ? "bg-white/[0.05] border-white/20" : "bg-transparent border-white/5 hover:border-white/10"}`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                            className="w-full text-left p-6 flex items-center justify-between"
                        >
                            <span className="text-lg font-semibold text-white">{faq.question}</span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                {openIndex === i ? <Minus size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {openIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}
