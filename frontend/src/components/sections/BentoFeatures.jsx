import { motion } from "framer-motion";
import { Sparkles, Zap, Search, BrainCircuit } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function BentoFeatures() {
    const { isDark } = useTheme();

    return (
        <section className="mt-24 md:mt-32 max-w-7xl mx-auto px-6 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[auto] md:auto-rows-[300px]">

                {/* Big Card - AI Core */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className={`md:col-span-2 md:row-span-2 rounded-[2.5rem] border p-8 md:p-12 overflow-hidden relative group ${isDark
                            ? 'bg-gradient-to-b from-white/[0.08] to-transparent border-white/10'
                            : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
                        }`}
                >
                    <div className="relative z-10 h-full flex flex-col">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold mb-6 w-fit ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            }`}>
                            <Sparkles size={14} />
                            <span>AI-Native Learning</span>
                        </div>
                        <h3 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Built with Passion <br />
                            <span className={isDark ? 'text-gray-500 font-medium' : 'text-indigo-400 font-medium'}>for Students.</span>
                        </h3>
                        <p className={`text-lg max-w-sm leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            FlashDeck AI is designed by students, for students. We provide the tools you need to master complex subjects with ease and efficiency.
                        </p>

                        <div className="flex gap-4 mt-auto flex-wrap">
                            {['Quality Focused', 'Always Improving', 'Community Driven'].map((tag) => (
                                <span key={tag} className={`px-4 py-2 rounded-xl text-xs font-bold ${isDark ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Image Mockup */}
                    <div className={`absolute right-[-5%] bottom-[-5%] w-[60%] h-[70%] md:w-[65%] md:h-[80%] rounded-[3rem] border shadow-2xl overflow-hidden hidden md:block group-hover:translate-x-[-2%] group-hover:translate-y-[-2%] transition-transform duration-700 ${isDark ? 'border-white/10 bg-[#0A0A0A]' : 'border-gray-200 bg-white'
                        }`}>
                        <img
                            src="/mockups/ai_preview.png"
                            alt="AI Dashboard"
                            className="w-full h-full object-cover opacity-90"
                        />
                    </div>
                </motion.div>

                {/* Vertical Card - Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`md:col-span-1 md:row-span-2 rounded-[2.5rem] border p-8 flex flex-col items-center text-center overflow-hidden relative group ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
                        }`}
                >
                    <div className="relative z-10 w-full mb-8">
                        <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Mobile First.</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Study on the go with our fully responsive platform optimized for every device.
                        </p>
                    </div>

                    {/* Mobile Mockup */}
                    <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-700 flex items-center justify-center">
                        <div className={`absolute inset-0 blur-[80px] rounded-full opacity-50 ${isDark ? 'bg-blue-500/20' : 'bg-indigo-500/10'}`} />
                        <img
                            src="/mockups/mobile_preview.png"
                            alt="Mobile Version"
                            className={`max-w-[180px] md:max-w-full max-h-full object-contain relative z-10 rounded-[2rem] shadow-2xl ${isDark ? 'shadow-black' : 'shadow-gray-400/30'}`}
                        />
                    </div>
                </motion.div>

                {/* Wide Card - Search */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className={`md:col-span-3 md:row-span-1 rounded-[2.5rem] border p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative group ${isDark ? 'bg-gradient-to-r from-white/[0.05] to-transparent border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
                        }`}
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 relative z-10 w-full">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100'
                                }`}>
                                <Zap size={32} className="text-yellow-500 fill-yellow-500/20" />
                            </div>
                            <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Lightning <br /> Fast.</h3>
                        </div>

                        <div className="max-w-md">
                            <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Recall.</h3>
                            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Leverage scientifically proven methods to retain information longer and study smarter.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                    <Search size={14} /> Smart Search
                                </span>
                                <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-100'
                                    }`}>
                                    <Zap size={14} /> Instant Sync
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Abstract UI Elements */}
                    <div className="hidden lg:flex items-center gap-4 group-hover:translate-x-4 transition-transform duration-700">
                        <div className={`w-48 h-32 rounded-xl border p-4 space-y-2 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <div className={`h-4 w-3/4 rounded-md ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                            <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                            <div className={`h-2 w-5/6 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

