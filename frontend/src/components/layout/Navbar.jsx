import React, { useState, useEffect } from 'react';
import { Zap, User, LogOut, Menu, X, Sun, Moon, ChevronRight, Brain } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { signOut, auth } from '../../lib/firebase';

export default function Navbar() {
    const { user } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    const navLinks = [
        { name: 'Features', path: '/features' },
        { name: 'How it Works', path: '/how-it-works' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Documentation', path: '/documentation' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                ? (isDark ? 'bg-[#0A0A0A]/80 border-b border-white/5 py-3' : 'bg-white/80 border-b border-gray-200 py-3')
                : 'bg-transparent py-5'
                } backdrop-blur-xl`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isDark ? 'bg-white/10 border border-white/10' : 'bg-black/5 border border-black/5'}`}>
                        <Brain size={22} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    </div>
                    <span className={`font-black text-xl tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
                        FlashDeck<span className="text-indigo-500">AI</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${location.pathname === link.path
                                ? 'text-indigo-500'
                                : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black')
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90 border ${isDark
                            ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
                            : 'bg-black/5 border-black/5 text-indigo-600 hover:bg-black/10'
                            }`}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
                    </button>

                    {user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/library">
                                <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 border-none rounded-xl px-5 font-bold shadow-lg shadow-indigo-500/20">
                                    Library
                                </Button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`p-2.5 rounded-xl transition-all hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20`}
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/login" className={`text-sm font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                                Sign In
                            </Link>
                            <Link to="/signup">
                                <Button size="sm" className="bg-white text-black hover:bg-gray-200 border-none rounded-xl px-5 font-bold shadow-xl">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`p-2.5 md:hidden rounded-xl transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/5 text-black hover:bg-black/10'}`}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`md:hidden border-t overflow-hidden ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-gray-100'}`}
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-lg font-bold flex items-center justify-between group ${location.pathname === link.path
                                        ? 'text-indigo-500'
                                        : (isDark ? 'text-gray-400' : 'text-gray-600')
                                        }`}
                                >
                                    {link.name}
                                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </Link>
                            ))}
                            <hr className={isDark ? 'border-white/5' : 'border-gray-100'} />
                            {user ? (
                                <div className="flex flex-col gap-4">
                                    <Link to="/library">
                                        <Button className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold">
                                            Go to Library
                                        </Button>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link to="/login">
                                        <Button variant="outline" className="w-full rounded-xl py-4 font-bold border-white/10">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button className="w-full bg-white text-black rounded-xl py-4 font-bold">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

