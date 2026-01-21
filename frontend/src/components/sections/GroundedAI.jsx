import { motion } from "framer-motion";
import { Database, FileText, Share2, ShieldCheck, Quote } from "lucide-react";

export default function GroundedAI() {
    const features = [
        {
            icon: FileText,
            title: "Upload Your Sources",
            description: "Go beyond generic AI. Feed the system your specific textbooks, PDF lectures, or research papers.",
            color: "text-blue-400"
        },
        {
            icon: ShieldCheck,
            title: "Fact-Checked Insights",
            description: "Every answer is cited back to your original documents, ensuring zero hallucinations.",
            color: "text-green-400"
        },
        {
            icon: Database,
            title: "Private & Personal",
            description: "Your data is only used to help you learn. We prioritize your privacy and intellectual property.",
            color: "text-purple-400"
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-black/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                            <Quote size={14} />
                            <span>Source-Grounded Thinking</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                            The AI that knows <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Exactly</span> what you're studying.
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                            Traditional AI is general, but FlashDeck AI is specialized. By grounding our models in your unique study materials, we eliminate errors and provide personalized insights tailored to your curriculum.
                        </p>

                        <div className="space-y-6 pt-4">
                            {features.map((f, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`mt-1 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors ${f.color}`}>
                                        <f.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">{f.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
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
                        <div className="aspect-square relative rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-8 overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                            {/* Floating Document Cards */}
                            <div className="grid grid-cols-2 gap-4 relative z-10 h-full">
                                <div className="col-span-1 bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between translate-y-8 blur-[0.5px] group-hover:translate-y-6 transition-transform duration-700">
                                    <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-white/5 rounded-full" />
                                        <div className="h-1.5 w-3/4 bg-white/5 rounded-full" />
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 self-end" />
                                </div>
                                <div className="col-span-1 bg-white/[0.08] border border-white/10 p-4 rounded-2xl flex flex-col justify-between -translate-y-4 group-hover:-translate-y-6 transition-transform duration-700">
                                    <div className="h-12 w-12 rounded-full bg-purple-500/20 mb-4" />
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-full bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                                    </div>
                                    <div className="h-2 w-1/3 bg-white/20 rounded-full mt-auto" />
                                </div>
                                <div className="col-span-2 bg-white/[0.02] border border-white/10 p-6 rounded-2xl flex items-center justify-between group-hover:scale-105 transition-transform duration-700">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <p className="text-green-400 font-bold text-lg">AI</p>
                                        </div>
                                        <div>
                                            <div className="h-3 w-32 bg-white/20 rounded-full mb-2" />
                                            <div className="h-2 w-48 bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="h-2 w-12 bg-white/10 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
