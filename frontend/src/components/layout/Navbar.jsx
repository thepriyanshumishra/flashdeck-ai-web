import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center glass border-b-0 border-white/5">
            <div className="mx-auto w-full max-w-5xl px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                        <Zap size={18} className="text-primary" fill="currentColor" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">FlashDeck AI</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-500 border border-white/5 font-mono">BETA</span>
                </Link>
                <div className="text-xs text-gray-500 font-mono">v1.2</div>
            </div>
        </nav>
    );
}
