import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Link as LinkIcon, Users, Lock, Globe,
    ChevronDown, Check, Shield, Mail, Share2,
    Link2, UserPlus, Info, MoreHorizontal
} from 'lucide-react';

const ShareModal = ({ isOpen, onClose, deckName, isDark }) => {
    const [accessType, setAccessType] = useState('restricted');
    const [roleType, setRoleType] = useState('viewer');
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Share2 size={20} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Share "{deckName || "Deck"}"</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Invite Section */}
                        <div className="space-y-3">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Add people and groups
                            </label>
                            <div className="flex gap-2">
                                <div className={`flex-1 relative group`}>
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add emails or groups..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm transition-all border ${isDark
                                                ? 'bg-white/5 border-white/5 focus:border-indigo-500/50 text-white placeholder-gray-600'
                                                : 'bg-gray-50 border-gray-200 focus:border-indigo-600/30 text-gray-900 placeholder-gray-400'
                                            }`}
                                    />
                                </div>
                                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg active:scale-95">
                                    Invite
                                </button>
                            </div>
                        </div>

                        {/* People with access */}
                        <div className="space-y-3">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                People with access
                            </label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${isDark ? 'bg-indigo-500/20 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                                            PM
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Priyanshu Mishra (you)</p>
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>priyanshumishra@example.com</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Owner</span>
                                </div>
                            </div>
                        </div>

                        {/* General Access */}
                        <div className="space-y-3 pt-2">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                General Access
                            </label>
                            <div className="flex items-center justify-between p-4 rounded-2xl border transition-colors bg-white/5 border-white/5">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl mt-0.5 ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                                        {accessType === 'restricted' ? <Lock size={20} /> : <Globe size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setAccessType(accessType === 'restricted' ? 'anyone' : 'restricted')}
                                                className="text-sm font-bold hover:underline capitalize"
                                            >
                                                {accessType === 'restricted' ? 'Restricted' : 'Anyone with the link'}
                                            </button>
                                            <ChevronDown size={14} className="text-gray-500" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {accessType === 'restricted'
                                                ? 'Only people with access can open with the link'
                                                : 'Anyone on the internet with the link can view'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setRoleType(roleType === 'viewer' ? 'editor' : 'viewer')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {roleType}
                                    </button>
                                    <ChevronDown size={14} className="text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`p-6 border-t flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border ${copied
                                    ? (isDark ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                                    : (isDark ? 'bg-white/5 border-white/5 text-indigo-400 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-indigo-600 hover:bg-gray-100')
                                }`}
                        >
                            {copied ? <Check size={18} /> : <Link2 size={18} />}
                            {copied ? 'Link Copied!' : 'Copy Link'}
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-white text-black text-sm font-bold rounded-2xl transition-all shadow-xl shadow-black/20 hover:scale-105 active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ShareModal;
