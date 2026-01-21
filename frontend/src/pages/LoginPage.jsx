import { useState, useEffect } from "react";
import {
    auth,
    googleProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signInAnonymously,
    sendSignInLinkToEmail
} from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Send, Sparkles, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";

// Icons for social buttons
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function LoginPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState("password"); // password, magic
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(""); // google, guest
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            navigate("/library", { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setTimeout(() => navigate("/library", { replace: true }), 500);
        } catch (err) {
            setError("Invalid email or password");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setInfo("");

        const actionCodeSettings = {
            url: window.location.origin + '/magic-link',
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setInfo("Passwordless link sent! Check your inbox.");
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setSocialLoading("google");
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
            setTimeout(() => navigate("/library", { replace: true }), 1000);
        } catch (err) {
            setError("Failed to login with Google");
            console.error(err);
            setSocialLoading("");
        }
    };

    const handleGuestLogin = async () => {
        setSocialLoading("guest");
        setError("");
        try {
            await signInAnonymously(auth);
            setTimeout(() => navigate("/library", { replace: true }), 1000);
        } catch (err) {
            setError("Guest login failed. Please try again.");
            console.error(err);
            setSocialLoading("");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-[#121212] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 font-heading tracking-tight">FlashDeck AI</h2>
                    <p className="text-gray-400">Continue your learning journey</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#1A1A1A] p-1 rounded-xl mb-8 border border-white/5">
                    {["password", "magic"].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setView(t); setError(""); setInfo(""); }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-500 ${view === t ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-white"}`}
                        >
                            {t === "password" ? "Secure" : "Passwordless"}
                        </button>
                    ))}
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {info && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center"
                    >
                        {info}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {view === "password" && (
                        <motion.form
                            key="password"
                            initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-purple-500/20"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-purple-500/20"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button isLoading={loading} className="w-full bg-white text-black hover:bg-gray-200 rounded-xl py-3.5 font-semibold text-base mt-2 shadow-lg shadow-white/5 transition-all duration-300">
                                Sign In
                            </Button>
                        </motion.form>
                    )}

                    {view === "magic" && (
                        <motion.form
                            key="magic"
                            initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            onSubmit={handleMagicLink}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300 ml-1">Passwordless Login</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-3 top-3.5 text-purple-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-purple-500/20"
                                        placeholder="your-email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button isLoading={loading} className="w-full bg-purple-600 text-white hover:bg-purple-700 rounded-xl py-3.5 font-semibold text-base mt-2 shadow-lg shadow-purple-500/20">
                                Send Link <Send size={18} className="ml-2" />
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap uppercase tracking-widest">OR CONTINUE WITH</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 w-full bg-[#1A1A1A] hover:bg-[#222] border border-white/10 text-white py-3 rounded-xl transition-all duration-300 text-sm font-medium disabled:opacity-50"
                    >
                        {socialLoading === "google" ? <Loader2 className="animate-spin text-purple-500" size={18} /> : <GoogleIcon />}
                        <span>Google</span>
                    </button>
                    <button
                        onClick={handleGuestLogin}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-2 w-full bg-[#1A1A1A] hover:bg-[#222] border border-white/10 text-white py-3 rounded-xl transition-all duration-300 text-sm font-medium disabled:opacity-50"
                    >
                        {socialLoading === "guest" ? <Loader2 className="animate-spin text-gray-400" size={18} /> : <User size={18} className="text-gray-400" />}
                        <span>Guest</span>
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-white font-medium hover:underline decoration-purple-500/30 underline-offset-4 transition-all">
                        Create free account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
