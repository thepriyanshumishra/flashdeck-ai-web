import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, isSignInWithEmailLink, signInWithEmailLink } from "../lib/firebase";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function MagicLinkHandler() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [error, setError] = useState("");
    const activated = useRef(false);

    useEffect(() => {
        const handleMagicLink = async () => {
            if (activated.current) return;

            if (isSignInWithEmailLink(auth, window.location.href)) {
                activated.current = true;
                let email = window.localStorage.getItem('emailForSignIn');

                if (!email) {
                    email = window.prompt('Please provide your email for confirmation');
                }

                try {
                    await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');

                    // Artificial delay to make success feel more "earned" and engaged
                    setTimeout(() => {
                        setStatus("success");
                        // Take extra time to show the success message
                        setTimeout(() => navigate("/library"), 3000);
                    }, 1500);

                } catch (err) {
                    setStatus("error");
                    setError(err.message);
                    console.error("Magic link error:", err);
                }
            } else {
                setStatus("error");
                setError("Invalid or expired passwordless link.");
            }
        };

        handleMagicLink();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-[#121212] border border-white/10 p-10 rounded-3xl shadow-2xl text-center relative z-10 overflow-hidden"
            >
                {status === "verifying" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Authenticating Link</h2>
                        <p className="text-gray-400">Please wait while we secure your session...</p>
                    </motion.div>
                )}

                {status === "success" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                            className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
                        >
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Signed In Successfully!</h2>
                        <p className="text-gray-400">Welcome back. Preparing your dashboard...</p>
                    </motion.div>
                )}

                {status === "error" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Verification Failed</h2>
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full mt-4 text-white bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                        >
                            Back to Login
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
