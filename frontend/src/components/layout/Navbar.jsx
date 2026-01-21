import { Zap, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { signOut, auth } from '../../lib/firebase';

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    const getUserLabel = () => {
        if (!user) return null;
        if (user.isAnonymous) return "Guest User";
        return user.displayName || user.email || "User";
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
            <div className="mx-auto w-full max-w-7xl px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300">
                    <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                        <Zap size={20} className="text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white font-heading">FlashDeck AI</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link to="/features" className="hover:text-white transition-colors duration-300">Features</Link>
                    <Link to="/how-it-works" className="hover:text-white transition-colors duration-300">How it Works</Link>
                    <Link to="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link>
                    <Link to="/about" className="hover:text-white transition-colors duration-300">About Us</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hidden sm:flex">
                                <User size={14} className="text-gray-400" />
                                <span className="text-xs font-medium text-gray-300 max-w-[150px] truncate">
                                    {getUserLabel()}
                                </span>
                            </div>
                            <Button
                                onClick={handleLogout}
                                size="sm"
                                variant="outline"
                                className="border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-full px-4 transition-all duration-300"
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                            <Link to="/library">
                                <Button size="sm" className="bg-white text-black hover:bg-gray-200 border-none rounded-full px-5 transition-all duration-300">
                                    Dashboard
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300">
                                Sign In
                            </Link>
                            <Link to="/signup">
                                <Button size="sm" className="bg-white text-black hover:bg-gray-200 border-none rounded-full px-5 transition-all duration-300">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
