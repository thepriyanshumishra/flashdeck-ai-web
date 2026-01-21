import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function FinalCta() {
    const navigate = useNavigate();

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 p-12 md:p-20 text-center relative z-10"
            >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 mx-auto">
                    <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Ready to master your <br /> material?
                </h2>
                <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of students and researchers who are transforming their study workflow with FlashDeck AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => navigate('/signup')}
                        size="lg"
                        className="rounded-full px-10 h-14 text-lg bg-white text-black hover:bg-gray-200 border-none w-full sm:w-auto"
                    >
                        Get Started for Free
                    </Button>
                    <Button
                        onClick={() => navigate('/login')}
                        size="lg"
                        variant="outline"
                        className="rounded-full px-10 h-14 text-lg backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 text-white w-full sm:w-auto"
                    >
                        Sign In
                    </Button>
                </div>
                <p className="mt-8 text-sm text-gray-500 font-medium">
                    Limited time offer: All features are 100% free during our public beta.
                </p>
            </motion.div>
        </section>
    );
}
