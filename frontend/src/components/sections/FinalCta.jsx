import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function FinalCta() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <section className={`py-24 px-6 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gray-50'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20 ${isDark ? 'bg-purple-500' : 'bg-indigo-300'}`} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`max-w-4xl mx-auto rounded-[3rem] border p-12 md:p-20 text-center relative z-10 transition-all ${isDark
                        ? 'bg-gradient-to-b from-white/[0.08] to-transparent border-white/10 shadow-black'
                        : 'bg-white border-gray-100 shadow-2xl shadow-indigo-100'
                    }`}
            >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto transition-colors ${isDark ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                    <Sparkles size={32} />
                </div>
                <h2 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ready to master your <br /> material?
                </h2>
                <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Join thousands of students and researchers who are transforming their study workflow with FlashDeck AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => navigate('/signup')}
                        size="lg"
                        className={`rounded-full px-10 h-14 text-lg font-bold border-none w-full sm:w-auto shadow-xl transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        Get Started for Free
                    </Button>
                    <Button
                        onClick={() => navigate('/login')}
                        size="lg"
                        variant="outline"
                        className={`rounded-full px-10 h-14 text-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Sign In
                    </Button>
                </div>
                <p className={`mt-8 text-sm font-bold ${isDark ? 'text-gray-500' : 'text-indigo-400'}`}>
                    Limited time offer: All features are 100% free during our public beta.
                </p>
            </motion.div>
        </section>
    );
}

