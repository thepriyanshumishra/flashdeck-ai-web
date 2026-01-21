import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Grid, List, MoreVertical, Settings,
    LayoutGrid, User, BookOpen, Clock, FileText,
    Brain, Sparkles, Star, ChevronDown, Bell, HelpCircle,
    Trash2, LogOut, Moon, Sun, Shield, Check, Globe, X, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';

export default function LibraryPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('My decks');
    const [searchTerm, setSearchTerm] = useState('');
    const [featuredDecks, setFeaturedDecks] = useState([]);
    const { decks: userDecks, loadDeck, deleteDeck, saveDeckToList } = useDeck();
    const { user, logout } = useAuth();
    const [showDeleteMenu, setShowDeleteMenu] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // 'settings', 'apps', 'profile', 'sort'
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'az', 'za', 'sources'

    // Basic settings state
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('flashdeck_settings');
            return saved ? JSON.parse(saved) : {
                theme: 'dark',
                notifications: true,
                privacy: false,
                language: 'en'
            };
        } catch (e) {
            return { theme: 'dark', notifications: true, privacy: false, language: 'en' };
        }
    });

    const isDark = settings.theme === 'dark';

    useEffect(() => {
        localStorage.setItem('flashdeck_settings', JSON.stringify(settings));
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [settings, isDark]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        setActiveMenu(null);
        setShowProfileModal(true);
    };

    const handleHelpClick = () => {
        window.location.href = 'mailto:support@flashdeck.ai?subject=FlashDeck AI Support Request';
        setActiveMenu(null);
    };

    const sortOptions = {
        'recent': 'Most recent',
        'oldest': 'Oldest',
        'az': 'Name (A-Z)',
        'za': 'Name (Z-A)',
        'sources': 'Most sources'
    };

    const handleMenuClick = (menu, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Close menus on click outside
    useEffect(() => {
        const closeMenus = () => setActiveMenu(null);
        window.addEventListener('click', closeMenus);
        return () => window.removeEventListener('click', closeMenus);
    }, []);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        fetch(`${API_BASE}/decks/public`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setFeaturedDecks(data.decks);
                }
            })
            .catch(err => console.error("Failed to fetch featured decks:", err));
    }, []);

    const tabs = ["All", "My decks", "Featured decks"];

    const handleDeckClick = (deck) => {
        loadDeck(deck.name);
        navigate('/deck');
    };

    const handleFeaturedDeckClick = async (deck) => {
        // Fetch text for the featured deck
        try {
            const res = await fetch(`${API_BASE}/decks/${deck.id}/text`);
            const data = await res.json();

            if (data.status === 'success') {
                const exists = userDecks.find(d => d.id === deck.id);
                if (!exists) {
                    saveDeckToList({
                        ...deck,
                        name: deck.title,
                        icon: "✨",
                        color: "bg-indigo-50"
                    });
                }
                // Save ID and Content to localStorage so loadDeck finds them
                localStorage.setItem(`id_${deck.title}`, deck.id);
                localStorage.setItem(`content_${deck.title}`, data.text);

                loadDeck(deck.title);
                navigate('/deck');
            }
        } catch (err) {
            console.error("Failed to import featured deck:", err);
            alert("Could not load this featured deck. Please try again.");
        }
    };

    const handleDelete = (e, deck) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${deck.name}"?`)) {
            deleteDeck(deck);
            setShowDeleteMenu(null);
        }
    };

    const normalizedDecks = (userDecks || []).map(d => ({
        ...(d.metadata || {}),
        ...d,
        name: d.name || d.title || d.metadata?.name || "Untitled Deck"
    }));

    const sortedDecks = [...normalizedDecks].sort((a, b) => {
        if (sortBy === 'az') return a.name.localeCompare(b.name);
        if (sortBy === 'za') return b.name.localeCompare(a.name);
        if (sortBy === 'sources') return (b.sources || 0) - (a.sources || 0);

        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);

        // Handle invalid dates by treating them as 0
        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

        if (sortBy === 'oldest') return timeA - timeB;
        return timeB - timeA; // Default 'recent'
    });

    const filteredDecks = sortedDecks.filter(deck =>
        deck.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-gray-200' : 'bg-[#F8F9FA] text-[#202124]'}`}>
            {/* Header */}
            <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-50 border-b transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-black text-white'}`}>
                            <Brain size={20} />
                        </div>
                        <span className={`text-xl font-medium tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>FlashDeck AI</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Settings Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => handleMenuClick('settings', e)}
                            className={`p-2 rounded-full transition-colors ${activeMenu === 'settings' ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black') : (isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600')}`}
                        >
                            <Settings size={20} />
                        </button>
                        {activeMenu === 'settings' && (
                            <div className="absolute right-0 top-12 w-72 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuration</span>
                                    <span className="text-[10px] text-gray-600 bg-white/10 px-2 py-0.5 rounded-full">v2.1</span>
                                </div>

                                <div className="p-2 space-y-1">
                                    {/* Appearance Section */}
                                    <div className="px-3 py-2">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Appearance</p>
                                        <div className="bg-black/20 p-1 rounded-lg flex border border-white/5">
                                            <button
                                                onClick={() => handleSettingChange('theme', 'light')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${settings.theme === 'light' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Sun size={14} /> Light
                                            </button>
                                            <button
                                                onClick={() => handleSettingChange('theme', 'dark')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${settings.theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Moon size={14} /> Dark
                                            </button>
                                        </div>
                                    </div>

                                    {/* General Settings */}
                                    <div className="px-3 py-2">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">General</p>

                                        <button
                                            onClick={() => handleSettingChange('notifications', !settings.notifications)}
                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${settings.notifications ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                                                    <Bell size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">Notifications</p>
                                                    <p className="text-[10px] text-gray-500">Email updates & alerts</p>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.notifications ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${settings.notifications ? 'left-4.5' : 'left-0.5'}`} style={{ left: settings.notifications ? 'calc(100% - 14px)' : '2px' }} />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleSettingChange('language', settings.language === 'en' ? 'es' : 'en')}
                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all group mt-1"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                                                    <Globe size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">Language</p>
                                                    <p className="text-[10px] text-gray-500">Currently: {settings.language === 'en' ? 'English' : 'Spanish'}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">{settings.language.toUpperCase()}</span>
                                        </button>
                                    </div>

                                    {/* Privacy */}
                                    <div className="px-3 py-2 border-t border-white/5">
                                        <button
                                            onClick={() => handleSettingChange('privacy', !settings.privacy)}
                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${settings.privacy ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-gray-500'}`}>
                                                    <Shield size={14} />
                                                </div>
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Usage Data</span>
                                            </div>
                                            {settings.privacy && <Check size={14} className="text-indigo-400" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Apps Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => handleMenuClick('apps', e)}
                            className={`p-2 rounded-full transition-colors ${activeMenu === 'apps' ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black') : (isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600')}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        {activeMenu === 'apps' && (
                            <div className="absolute right-0 top-12 w-64 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in-95 duration-200 grid grid-cols-2 gap-2">
                                <div className="px-4 py-2 col-span-2 border-b border-white/10 mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">FlashDeck Apps</span>
                                </div>
                                <button onClick={() => navigate('/library')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all text-gray-300 hover:text-white">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Brain size={20} /></div>
                                    <span className="text-xs font-medium">Decks</span>
                                </button>
                                <button onClick={() => navigate('/upload')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all text-gray-300 hover:text-white">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Plus size={20} /></div>
                                    <span className="text-xs font-medium">New</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Menu */}
                    <div className="relative ml-2">
                        <div
                            onClick={(e) => handleMenuClick('profile', e)}
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all flex items-center justify-center text-xs font-bold text-white select-none"
                        >
                            {user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        {activeMenu === 'profile' && (
                            <div className="absolute right-0 top-12 w-56 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-white/10 mb-1">
                                    <p className="text-sm font-medium text-white truncate">{user?.displayName || "FlashDeck User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleProfileClick}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <User size={16} /> Profile
                                </button>
                                <button
                                    onClick={handleHelpClick}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <HelpCircle size={16} /> Help & Feedback
                                </button>
                                <div className="border-t border-white/10 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Dashboard Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? "bg-indigo-500/20 text-indigo-400" : (isDark ? "text-gray-500 hover:bg-white/5 hover:text-gray-300" : "text-gray-500 hover:bg-gray-100")}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:w-80">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-white' : 'text-gray-400 group-focus-within:text-black'}`} size={18} />
                            <input
                                type="text"
                                placeholder="Search your decks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all focus:ring-0 ${isDark ? 'bg-[#1a1a1a] border border-white/5 focus:border-indigo-500/50 text-white placeholder-gray-600' : 'bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 text-gray-900 placeholder-gray-500'}`}
                            />
                        </div>

                        <div className={`flex items-center rounded-lg p-1 border ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-gray-100 border-transparent'}`}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm") : "text-gray-500"}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm") : "text-gray-500"}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={(e) => handleMenuClick('sort', e)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isDark ? 'border-white/5 bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-white/5' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {sortOptions[sortBy]}
                                <ChevronDown size={14} className="text-gray-500" />
                            </button>
                            {activeMenu === 'sort' && (
                                <div className="absolute right-0 top-12 w-48 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {Object.entries(sortOptions).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setSortBy(key);
                                                setActiveMenu(null);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${sortBy === key ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/upload')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg ${isDark ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'}`}
                        >
                            <Plus size={18} />
                            Create new
                        </button>
                    </div>
                </div>

                {/* Featured Section */}
                {(activeTab === "All" || activeTab === "Featured decks") && (
                    <section className="mb-14">
                        <h2 className={`text-xl font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Featured decks</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto pb-4 no-scrollbar">
                            {featuredDecks.map((nb, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    onClick={() => handleFeaturedDeckClick(nb)}
                                    className={`relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group shadow-lg ${isDark ? 'shadow-black/50 border border-white/5' : 'shadow-black/5'}`}
                                >
                                    <img src={nb.image} alt={nb.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${nb.color}`} />

                                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                <Brain size={12} className="text-white" />
                                            </div>
                                            <span className="text-[10px] text-white/90 font-medium uppercase tracking-wider">{nb.category}</span>
                                        </div>
                                        <h3 className="text-white font-semibold text-lg leading-tight mb-3 group-hover:underline decoration-white/30">{nb.title}</h3>
                                        <div className="flex items-center justify-between text-[11px] text-white/70">
                                            <span>{nb.date} • {nb.sources} sources</span>
                                            <Star size={12} className="text-white/40" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div className="flex items-center justify-center p-8 bg-[#1a1a1a] rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group min-w-[120px]">
                                <span className="text-sm font-medium text-gray-500 group-hover:text-white flex items-center gap-2">
                                    See all <ChevronDown className="-rotate-90 text-gray-600 group-hover:text-white" size={16} />
                                </span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Recent Decks Section */}
                {(activeTab === "All" || activeTab === "My decks") && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent decks</h2>
                            {searchTerm && (
                                <span className="text-sm text-gray-500">
                                    Found {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                            : "flex flex-col gap-3"
                        }>
                            {/* New Deck Placeholder (Only in grid or if no search) */}
                            {viewMode === 'grid' && !searchTerm && (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => navigate('/upload')}
                                    className={`aspect-square border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group ${isDark ? 'bg-[#1a1a1a]/50 border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5' : 'bg-white border-gray-200 hover:border-black/20 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20' : 'bg-blue-50 text-blue-600 group-hover:scale-110'}`}>
                                        <Plus size={28} />
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-500 group-hover:text-indigo-300' : 'text-gray-500 group-hover:text-black'}`}>Create new deck</span>
                                </motion.div>
                            )}

                            {/* Recent Cards */}
                            <AnimatePresence mode="popLayout">
                                {filteredDecks.map((nb) => (
                                    viewMode === 'grid' ? (
                                        <motion.div
                                            key={nb.id || nb.name}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            onClick={() => handleDeckClick(nb)}
                                            className={`aspect-square ${nb.color?.includes('gradient') ? nb.color : (isDark ? 'bg-[#1a1a1a]' : 'bg-white')} rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer border transition-all shadow-lg relative group overflow-hidden ${isDark ? 'border-white/5 hover:border-indigo-500/30 shadow-black/20 hover:shadow-indigo-500/5' : 'border-transparent hover:border-gray-200 shadow-sm'}`}
                                        >
                                            {/* Fallback pattern if no gradient */}
                                            {!nb.color?.includes('gradient') && isDark && (
                                                <div className="absolute inset-0 bg-dots opacity-[0.2]" />
                                            )}

                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="text-3xl filter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">{nb.icon || "📔"}</div>
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowDeleteMenu(showDeleteMenu === nb.name ? null : nb.name);
                                                        }}
                                                        className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-gray-900'}`}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>

                                                    {showDeleteMenu === nb.name && (
                                                        <div className={`absolute right-0 top-10 w-40 rounded-xl shadow-2xl border py-1 z-10 overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                                                            <button
                                                                onClick={(e) => handleDelete(e, nb)}
                                                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete deck
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-4 relative z-10">
                                                <h3 className={`font-semibold leading-snug transition-colors line-clamp-2 ${isDark ? 'text-gray-100 group-hover:text-indigo-300' : 'text-[#202124] group-hover:underline'}`}>{nb.name || "Untitled deck"}</h3>
                                                <div className="flex flex-col gap-1">
                                                    <p className={`text-[11px] font-medium ${isDark ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-500'}`}>
                                                        {nb.date || "Just now"} • {nb.sources || 0} source{(nb.sources || 0) !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={nb.id || nb.name}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            onClick={() => handleDeckClick(nb)}
                                            className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/5 cursor-pointer transition-all group"
                                        >
                                            <div className={`w-12 h-12 rounded-xl ${nb.color?.includes('gradient') ? nb.color : 'bg-white/5'} flex items-center justify-center text-2xl`}>
                                                {nb.icon || "📔"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-200 truncate group-hover:text-indigo-300 transition-colors">{nb.name || "Untitled deck"}</h3>
                                                <p className="text-xs text-gray-500">{nb.sources || 0} sources • {nb.date || "Just now"}</p>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteMenu(showDeleteMenu === nb.name ? null : nb.name);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-white transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {showDeleteMenu === nb.name && (
                                                    <div className="absolute right-0 top-10 w-40 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 py-1 z-10 overflow-hidden">
                                                        <button
                                                            onClick={(e) => handleDelete(e, nb)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete deck
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>

                            {filteredDecks.length === 0 && searchTerm && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-600">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-gray-400">No decks found matching "{searchTerm}"</p>
                                    <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-400 hover:underline">Clear search</button>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {/* Profile Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className={`w-full max-w-[400px] rounded-[2rem] shadow-2xl overflow-hidden ${isDark ? 'bg-[#121212] border border-white/10' : 'bg-white border border-gray-100'}`}
                        >
                            {/* Header Banner - Mesh Gradient */}
                            <div className="relative h-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
                                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="absolute right-4 top-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/30 backdrop-blur-md transition-all z-10"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="px-8 pb-8 -mt-10 relative">
                                {/* Avatar */}
                                <div className="flex justify-center mb-4">
                                    <div className={`w-20 h-20 rounded-3xl border-4 flex items-center justify-center text-3xl font-bold bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-2xl transform transition-transform hover:scale-105 active:scale-95 cursor-default ${isDark ? 'border-[#121212]' : 'border-white'}`}>
                                        {user?.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {user?.displayName || "FlashDeck User"}
                                        </h2>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                                            Free
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {user?.email}
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-colors ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                                        <div className={`p-2 rounded-lg mb-2 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                            <BookOpen size={16} />
                                        </div>
                                        <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{userDecks.length}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-40 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Decks</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-colors ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                                        <div className={`p-2 rounded-lg mb-2 ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                            <Brain size={16} />
                                        </div>
                                        <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {userDecks.reduce((acc, curr) => acc + (curr.flashcards ? curr.flashcards.length : 0), 0)}
                                        </p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-40 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cards</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group shadow-lg ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black'}`}>
                                        <User size={16} className="transition-transform group-hover:scale-110" />
                                        Edit Profile
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>

                                <p className={`text-center mt-6 text-[10px] font-bold uppercase tracking-[0.2em] opacity-20 ${isDark ? 'text-white' : 'text-black'}`}>
                                    FlashDeck AI v2.1
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
