import { motion } from "framer-motion";
import { Database, FileText, ShieldCheck, Quote } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function GroundedAI() {
    const { isDark } = useTheme();

    const features = [
        {
            icon: FileText,
            title: "Upload Your Sources",
            description: "Go beyond generic AI. Feed the system your specific textbooks, PDF lectures, or research papers.",
            color: "text-blue-400",
            lightColor: "text-blue-600"
        },
        {
            icon: ShieldCheck,
            title: "Fact-Checked Insights",
            description: "Every answer is cited back to your original documents, ensuring zero hallucinations.",
            color: "text-green-400",
            lightColor: "text-green-600"
        },
        {
            icon: Database,
            title: "Private & Personal",
            description: "Your data is only used to help you learn. We prioritize your privacy and intellectual property.",
            color: "text-purple-400",
            lightColor: "text-purple-600"
        }
    ];

    return (
        <section className={`py-24 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black/50' : 'bg-white'}`}>
            <div className={`absolute top-0 left-0 w-full h-px ${isDark ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-200 to-transparent'}`} />
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                            <Quote size={14} />
                            <span>Source-Grounded Thinking</span>
                        </div>
                        <h2 className={`text-4xl md:text-6xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            The AI that knows <br />
                            <span className={`text-transparent bg-clip-text ${isDark ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>Exactly</span> what you're studying.
                        </h2>
                        <p className={`text-lg leading-relaxed max-w-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Traditional AI is general, but FlashDeck AI is specialized. By grounding our models in your unique study materials, we eliminate errors and provide personalized insights tailored to your curriculum.
                        </p>

                        <div className="space-y-6 pt-4">
                            {features.map((f, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`mt-1 w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${isDark
                                            ? 'bg-white/5 border-white/10 group-hover:bg-white/10 ' + f.color
                                            : 'bg-gray-50 border-gray-100 group-hover:bg-gray-100 ' + f.lightColor
                                        }`}>
                                        <f.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h4>
                                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        {/* Abstract Source Visualization */}
                        <div className={`aspect-square relative rounded-[2.5rem] border p-8 overflow-hidden group shadow-2xl transition-all ${isDark ? 'bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 shadow-black' : 'bg-gradient-to-br from-gray-50 to-white border-gray-100'
                            }`}>
                            <div className={`absolute inset-0 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-30 ${isDark ? 'bg-blue-500' : 'bg-indigo-300'}`} />

                            {/* Floating Document Cards */}
                            <div className="grid grid-cols-2 gap-4 relative z-10 h-full">
                                <div className={`col-span-1 border p-4 rounded-2xl flex flex-col justify-between translate-y-8 blur-[0.5px] group-hover:translate-y-6 transition-transform duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'
                                    }`}>
                                    <div className={`h-2 w-1/2 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
                                    <div className="space-y-2">
                                        <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                        <div className={`h-1.5 w-3/4 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/20 self-end" />
                                </div>
                                <div className={`col-span-1 border p-4 rounded-2xl flex flex-col justify-between -translate-y-4 group-hover:-translate-y-6 transition-transform duration-700 ${isDark ? 'bg-white/[0.08] border-white/10' : 'bg-white border-gray-200 shadow-xl'
                                    }`}>
                                    <div className={`h-12 w-12 rounded-full mb-4 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`} />
                                    <div className="space-y-2">
                                        <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                        <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                    </div>
                                    <div className={`h-2 w-1/3 rounded-full mt-auto ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
                                </div>
                                <div className={`col-span-2 border p-6 rounded-2xl flex items-center justify-between group-hover:scale-105 transition-transform duration-700 ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-200 shadow-xl'
                                    }`}>
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                            <p className="font-black text-lg">AI</p>
                                        </div>
                                        <div>
                                            <div className={`h-3 w-32 rounded-full mb-2 ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
                                            <div className={`h-2 w-48 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                        </div>
                                    </div>
                                    <div className={`h-2 w-12 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-purple-500' : 'bg-indigo-300'}`} />
                        <div className={`absolute -top-6 -left-6 w-32 h-32 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-blue-500' : 'bg-cyan-300'}`} />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

