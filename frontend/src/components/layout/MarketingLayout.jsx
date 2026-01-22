import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function MarketingLayout({ children, title, subtitle }) {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {title && (
                        <div className="mb-16 text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-4xl md:text-6xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                                {title}
                            </motion.h1>
                            {subtitle && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                >
                                    {subtitle}
                                </motion.p>
                            )}
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

