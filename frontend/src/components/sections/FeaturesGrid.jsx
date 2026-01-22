import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, Clock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const features = [
    {
        icon: BrainCircuit,
        title: "AI-Powered Synthesis",
        description: "Our advanced models digest your complex lectures into bite-sized, digestible concepts instantly.",
        color: "text-purple-400",
        lightColor: "text-purple-600"
    },
    {
        icon: Clock,
        title: "Spaced Repetition",
        description: "Optimized review intervals ensure you never forget what you've learned. Study smarter, not harder.",
        color: "text-blue-400",
        lightColor: "text-blue-600"
    },
    {
        icon: Sparkles,
        title: "Instant Verification",
        description: "Every generated flashcard links back to the exact source paragraph for reliable fact-checking.",
        color: "text-yellow-400",
        lightColor: "text-yellow-600"
    }
];

export default function FeaturesGrid() {
    const { isDark } = useTheme();

    return (
        <section id="features" className={`py-24 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-5xl font-black mb-6 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Supercharge Your <br />
                        <span className={`text-transparent bg-clip-text ${isDark ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                            Study Experience
                        </span>
                    </h2>
                    <p className={`max-w-2xl mx-auto text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                            className={`p-8 rounded-[2rem] border transition-all group cursor-default shadow-sm ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                                    : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02]'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isDark ? 'bg-white/5 ' + feature.color : 'bg-gray-50 ' + feature.lightColor
                                }`}>
                                <feature.icon size={24} />
                            </div>
                            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {feature.title}
                            </h3>
                            <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

