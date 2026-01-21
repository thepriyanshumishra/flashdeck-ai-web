import { motion } from "framer-motion";
import { Sparkles, Play } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import BentoFeatures from "./BentoFeatures";

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-10 px-6 overflow-hidden max-w-7xl mx-auto">

            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="text-center relative z-10 max-w-4xl mx-auto space-y-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs md:text-sm font-medium text-purple-300 backdrop-blur-md mx-auto hover:bg-purple-500/20 transition-colors cursor-default"
                >
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span>100% Free During Beta</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1] md:leading-[1.1]"
                >
                    Turn Chaos Into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                        Structured Knowledge.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
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
                        className="rounded-full px-8 h-12 md:h-14 text-base md:text-lg bg-white text-black hover:bg-gray-200 border-none w-full sm:w-auto flex items-center gap-2"
                    >
                        <Sparkles size={18} />
                        Start Learning Free
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full px-8 h-12 md:h-14 text-base md:text-lg backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 text-white w-full sm:w-auto flex items-center gap-2"
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
