import { motion } from "framer-motion";
import { GraduationCap, Briefcase, PenTool, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function UseCases() {
    const { isDark } = useTheme();

    const cases = [
        {
            icon: GraduationCap,
            title: "For Students",
            description: "Crush your exams by turning lecture slides and textbook chapters into interactive study guides.",
            color: "bg-blue-500/10 text-blue-400",
            lightColor: "bg-blue-50 text-blue-600"
        },
        {
            icon: Search,
            title: "For Researchers",
            description: "Analyze complex papers, extract key findings, and organize cross-document insights effortlessly.",
            color: "bg-purple-500/10 text-purple-400",
            lightColor: "bg-purple-50 text-purple-600"
        },
        {
            icon: Briefcase,
            title: "For Professionals",
            description: "Stay ahead in your field by summarizing long reports and staying sharp on industry knowledge.",
            color: "bg-green-500/10 text-green-400",
            lightColor: "bg-green-50 text-green-600"
        },
        {
            icon: PenTool,
            title: "For Writers",
            description: "Synthesize background research and brainstorming notes into clear, structured outlines.",
            color: "bg-orange-500/10 text-orange-400",
            lightColor: "bg-orange-50 text-orange-600"
        }
    ];

    return (
        <section className={`py-24 max-w-7xl mx-auto px-6 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-white'}`}>
            <div className="text-center mb-16">
                <h2 className={`text-3xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Designed for every <br />
                    <span className={isDark ? 'text-gray-500' : 'text-indigo-400'}>learning style.</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cases.map((sc, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-8 rounded-[2rem] border transition-all group flex flex-col ${isDark
                                ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 shadow-black'
                                : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02]'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isDark ? sc.color : sc.lightColor
                            }`}>
                            <sc.icon size={28} />
                        </div>
                        <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{sc.title}</h4>
                        <p className={`leading-relaxed text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {sc.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

