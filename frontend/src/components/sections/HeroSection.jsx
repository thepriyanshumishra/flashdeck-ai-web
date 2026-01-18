import { motion } from "framer-motion";
import { Sparkles, FileText, Zap } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

function FloatingCard({ className, icon: Icon, title, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay },
                opacity: { duration: 0.8, delay: delay }
            }}
            className={`absolute hidden lg:flex items-center gap-3 p-4 rounded-2xl glass-panel ${className}`}
        >
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <Icon className="text-white/80" size={20} />
            </div>
            <div>
                <div className="h-2 w-16 bg-white/20 rounded-full mb-1.5" />
                <div className="h-2 w-10 bg-white/10 rounded-full" />
            </div>
        </motion.div>
    );
}

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 pb-40 px-6 overflow-hidden">

            {/* Background Elements */}
            <div className="absolute inset-0 aurora-bg -z-10 opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

            <div className="mx-auto max-w-5xl relative z-10 text-center">

                {/* Floating Decor Cards */}
                <FloatingCard
                    icon={FileText}
                    className="top-0 left-10 -rotate-6"
                    delay={0}
                />
                <FloatingCard
                    icon={Zap}
                    className="bottom-20 right-10 rotate-3"
                    delay={1.5}
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 backdrop-blur-md">
                        <Sparkles size={14} className="text-yellow-400" />
                        <span>AI-Powered Study Assistant</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[0.9]">
                        Turn Chaos <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
                            Into Knowledge.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Upload your messy lecture slides, sprawling PDFs, or raw notes.
                        We'll convert them into perfectly organized spaced-repetition flashcards in seconds.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button
                            onClick={() => navigate('/upload')}
                            size="lg"
                            className="rounded-full px-8 text-lg h-14 bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] border-none"
                        >
                            Start Learning Now
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14 backdrop-blur-md border-white/10 hover:bg-white/5">
                            About Us
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
