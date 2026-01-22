import { motion } from "framer-motion";
import { Sparkles, Play } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import BentoFeatures from "./BentoFeatures";

export default function HeroSection() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-10 px-6 overflow-hidden max-w-7xl mx-auto">

            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className={`absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen opacity-20 ${isDark ? 'bg-purple-500' : 'bg-indigo-300'}`} />
                <div className={`absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px] mix-blend-screen opacity-20 ${isDark ? 'bg-blue-500' : 'bg-cyan-300'}`} />
            </div>

            <div className="text-center relative z-10 max-w-4xl mx-auto space-y-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs md:text-sm font-medium backdrop-blur-md mx-auto transition-colors cursor-default ${isDark
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20'
                            : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100/80'
                        }`}
                >
                    <span className={`flex h-2 w-2 rounded-full animate-pulse ${isDark ? 'bg-purple-500' : 'bg-indigo-500'}`}></span>
                    <span>100% Free During Beta</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] md:leading-[1.1] ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                    Turn Chaos Into <br />
                    <span className={`text-transparent bg-clip-text ${isDark ? 'bg-gradient-to-r from-white via-white to-white/50' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                        Structured Knowledge.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                    Upload your raw lecture notes, PDFs, or slides. FlashDeck's AI instantly converts them into spaced-repetition flashcards, mind maps, and interactive quizzes.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Button
                        onClick={() => navigate('/upload')}
                        size="lg"
                        className={`rounded-full px-8 h-12 md:h-14 text-base md:text-lg font-bold border-none w-full sm:w-auto flex items-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                    >
                        <Sparkles size={18} />
                        Start Learning Free
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className={`rounded-full px-8 h-12 md:h-14 text-base md:text-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Play size={18} fill="currentColor" />
                        Watch Demo
                    </Button>
                </motion.div>
            </div>

            {/* Bento Grid Features */}
            <BentoFeatures />
        </section>
    );
}

