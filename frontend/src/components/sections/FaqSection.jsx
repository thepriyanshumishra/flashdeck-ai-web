import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function FaqSection() {
    const { isDark } = useTheme();
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
        <section className={`py-24 max-w-3xl mx-auto px-6 mb-24 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-white'}`}>
            <div className="text-center mb-16">
                <h2 className={`text-3xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Frequently Asked <br />
                    <span className={isDark ? 'text-gray-500' : 'text-indigo-400'}>Questions.</span>
                </h2>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={`rounded-[2rem] border transition-all duration-300 ${openIndex === i
                                ? (isDark ? "bg-white/[0.05] border-white/20" : "bg-gray-50 border-indigo-100")
                                : (isDark ? "bg-transparent border-white/5 hover:border-white/10" : "bg-white border-gray-100 hover:border-gray-200")
                            }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                            className="w-full text-left p-6 md:p-8 flex items-center justify-between group"
                        >
                            <span className={`text-lg font-bold transition-colors ${openIndex === i
                                    ? (isDark ? 'text-white' : 'text-indigo-600')
                                    : (isDark ? 'text-gray-300' : 'text-gray-700')
                                }`}>
                                {faq.question}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === i
                                    ? (isDark ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white')
                                    : (isDark ? 'bg-white/5 text-gray-400 group-hover:bg-white/10' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200')
                                }`}>
                                {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
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
                                    <div className={`px-8 pb-8 md:text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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

