import { motion } from "framer-motion";
import { BookOpen, BrainCircuit, Share2, Sparkles, Zap, Clock } from "lucide-react";

const features = [
    {
        icon: BrainCircuit,
        title: "AI-Powered Synthesis",
        description: "Our advanced models digest your complex lectures into bite-sized, digestible concepts instantly.",
        color: "text-purple-400"
    },
    {
        icon: Clock,
        title: "Spaced Repetition",
        description: "Optimized review intervals ensure you never forget what you've learned. Study smarter, not harder.",
        color: "text-blue-400"
    },
    {
        icon: Sparkles,
        title: "Instant Verification",
        description: "Every generated flashcard links back to the exact source paragraph for reliable fact-checking.",
        color: "text-yellow-400"
    }
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Supercharge Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Study Experience
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        FlashDeck AI combines cutting-edge LLMs with proven cognitive science to help you master any subject in record time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors group cursor-default"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                                <feature.icon size={24} className="currentColor" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
