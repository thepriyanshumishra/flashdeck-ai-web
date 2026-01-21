import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, Search, Zap, Layout, GraduationCap } from "lucide-react";

export default function BentoFeatures() {
    return (
        <section className="mt-24 md:mt-32 max-w-7xl mx-auto px-6 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">

                {/* Big Card - AI Core */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:col-span-2 md:row-span-2 rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 p-8 md:p-12 overflow-hidden relative group"
                >
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6 w-fit">
                            <Sparkles size={14} />
                            <span>AI-Native Learning</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                            Built with Passion <br />
                            <span className="text-gray-500 font-medium">for Students.</span>
                        </h3>
                        <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-auto">
                            FlashDeck AI is built with the love and dedication of our community. We are committed to providing the best possible learning experience for our users.
                        </p>

                        <div className="flex gap-4 mt-8 flex-wrap">
                            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">Quality Focused</span>
                            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">Always Improving</span>
                            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">Community Driven</span>
                        </div>
                    </div>

                    {/* Image Mockup */}
                    <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[70%] md:w-[65%] md:h-[80%] rounded-[3rem] border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden hidden md:block group-hover:translate-x-[-2%] group-hover:translate-y-[-2%] transition-transform duration-700">
                        <img
                            src="/mockups/ai_preview.png"
                            alt="AI Dashboard"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                </motion.div>

                {/* Vertical Card - Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:col-span-1 md:row-span-2 rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 flex flex-col items-center text-center overflow-hidden relative group"
                >
                    <div className="relative z-10 w-full">
                        <h3 className="text-2xl font-bold text-white mb-3">Responsive Design.</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            Our platform is fully responsive, ensuring a seamless experience on any device.
                        </p>
                    </div>

                    {/* Mobile Mockup */}
                    <div className="w-full h-full relative mt-4 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center p-2">
                        <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
                        <img
                            src="/mockups/mobile_preview.png"
                            alt="Mobile Version"
                            className="max-w-full max-h-full object-contain relative z-10 rounded-[2rem] shadow-xl shadow-black/50"
                        />
                    </div>
                </motion.div>

                {/* Wide Card - Search */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="md:col-span-3 md:row-span-1 rounded-[2.5rem] bg-gradient-to-r from-white/[0.05] to-transparent border border-white/10 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative group"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 relative z-10">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                                <Zap size={32} className="text-yellow-500 fill-yellow-500/20" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">Lightning <br /> Fast.</h3>
                        </div>

                        <div className="max-w-md">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Advanced Search.</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Find what you need quickly with our powerful search features and intelligent filtering.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20"><Search size={14} /> Smart Search</span>
                                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20"><Zap size={14} /> Auto-Updated</span>
                            </div>
                        </div>
                    </div>

                    {/* Abstract UI Elements */}
                    <div className="hidden lg:flex items-center gap-4 group-hover:translate-x-4 transition-transform duration-700">
                        <div className="w-48 h-32 rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
                            <div className="h-4 w-3/4 bg-white/10 rounded-md" />
                            <div className="h-2 w-full bg-white/5 rounded-full" />
                            <div className="h-2 w-5/6 bg-white/5 rounded-full" />
                            <div className="h-2 w-full bg-white/5 rounded-full" />
                        </div>
                        <div className="w-48 h-32 rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-2 translate-y-8">
                            <div className="h-4 w-1/2 bg-white/10 rounded-md" />
                            <div className="h-2 w-full bg-white/5 rounded-full" />
                            <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
