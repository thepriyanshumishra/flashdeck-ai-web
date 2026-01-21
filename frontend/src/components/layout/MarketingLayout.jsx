import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";

export default function MarketingLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {title && (
                        <div className="mb-16 text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                            >
                                {title}
                            </motion.h1>
                            {subtitle && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-gray-400 text-lg max-w-2xl mx-auto"
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
