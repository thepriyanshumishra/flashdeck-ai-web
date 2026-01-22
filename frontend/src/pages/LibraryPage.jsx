import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Grid,
    List,
    MoreVertical,
    Settings,
    LayoutGrid,
    User,
    BookOpen,
    Clock,
    FileText,
    Brain,
    Sparkles,
    Star,
    ChevronDown,
    Bell,
    HelpCircle,
    Trash2,
    LogOut,
    Moon,
    Sun,
    Shield,
    Check,
    Globe,
    X,
    Mail,
    Edit2,
    Lock,
    EyeOff,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useDeck } from "../context/DeckContext";
import { useTheme } from "../context/ThemeContext";
import SEO from "../components/common/SEO";

export default function LibraryPage() {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState("grid");
    const [activeTab, setActiveTab] = useState("My decks");
    const [searchTerm, setSearchTerm] = useState("");
    const {
        decks: userDecks,
        loadDeck,
        deleteDeck,
        updateDeck,
    } = useDeck();
    const { user, logout } = useAuth();
    const [showDeleteMenu, setShowDeleteMenu] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // 'settings', 'apps', 'profile', 'sort'
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [sortBy, setSortBy] = useState("recent"); // 'recent', 'oldest', 'az', 'za', 'sources'
    const [editingDeck, setEditingDeck] = useState(null);
    const [newTitle, setNewTitle] = useState("");

    // Basic settings state (excluding theme)
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem("flashdeck_settings_v2");
            return saved
                ? JSON.parse(saved)
                : {
                    notifications: true,
                    privacy: false,
                    language: "en",
                };
        } catch {
            return { notifications: true, privacy: false, language: "en" };
        }
    });

    useEffect(() => {
        localStorage.setItem("flashdeck_settings_v2", JSON.stringify(settings));
    }, [settings]);

    const handleSettingChange = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        setActiveMenu(null);
        setShowProfileModal(true);
    };

    const handleHelpClick = () => {
        window.location.href =
            "mailto:support@flashdeck.ai?subject=FlashDeck AI Support Request";
        setActiveMenu(null);
    };

    const sortOptions = {
        recent: "Most recent",
        oldest: "Oldest",
        az: "Name (A-Z)",
        za: "Name (Z-A)",
        sources: "Most sources",
    };

    const handleMenuClick = (menu, e) => {
        if (e) e.stopPropagation();
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Close menus on click outside
    useEffect(() => {
        const closeMenus = () => setActiveMenu(null);
        window.addEventListener("click", closeMenus);
        return () => window.removeEventListener("click", closeMenus);
    }, []);

    const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const tabs = ["All", "My decks", "Featured decks (Coming Soon)"];

    const handleDeckClick = (deck) => {
        loadDeck(deck.name);
        navigate("/deck");
    };


    const handleDelete = (e, deck) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${deck.name}"?`)) {
            deleteDeck(deck);
            setShowDeleteMenu(null);
        }
    };

    const handleEditTitle = (e, deck) => {
        e.stopPropagation();
        setEditingDeck(deck);
        setNewTitle(deck.name);
        setShowDeleteMenu(null);
    };

    const saveUpdatedTitle = async () => {
        if (!editingDeck || !newTitle.trim()) return;
        await updateDeck(editingDeck.id, { title: newTitle.trim() });
        setEditingDeck(null);
    };

    const handleVisibilityChange = async (e, deck, visibility) => {
        e.stopPropagation();
        await updateDeck(deck.id, { visibility });
        setShowDeleteMenu(null);
    };

    const normalizedDecks = (userDecks || []).map((d) => ({
        ...(d.metadata || {}),
        ...d,
        name: d.name || d.title || d.metadata?.name || "Untitled Deck",
    }));

    const sortedDecks = [...normalizedDecks].sort((a, b) => {
        if (sortBy === "az") return a.name.localeCompare(b.name);
        if (sortBy === "za") return b.name.localeCompare(a.name);
        if (sortBy === "sources") return (b.sources || 0) - (a.sources || 0);

        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);

        // Handle invalid dates by treating them as 0
        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

        if (sortBy === "oldest") return timeA - timeB;
        return timeB - timeA; // Default 'recent'
    });

    const filteredDecks = sortedDecks.filter((deck) =>
        deck.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <>
            <SEO
                title="Library - FlashDeck AI"
                description="Manage your study decks, explore featured content, and track your learning progress."
            />
            <div
                className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-[#0a0a0a] text-gray-200" : "bg-[#F8F9FA] text-[#202124]"}`}
            >
                {/* Floating Glass Navbar - Marketing Style Match */}
                <header
                    className={`h-[72px] flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${isDark ? "bg-[#0a0a0a]/80 border-white/5" : "bg-white/80 border-gray-200"}`}
                >
                    {/* Logo Section - Matched to Marketing Navbar */}
                    <div className="flex items-center gap-8 w-1/4">
                        <div
                            className="flex items-center gap-2 group cursor-pointer"
                            onClick={() => navigate("/")}
                        >
                            <div
                                className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isDark ? "bg-white/10 border border-white/10" : "bg-black/5 border border-black/5"}`}
                            >
                                <Brain
                                    size={22}
                                    className={isDark ? "text-indigo-400" : "text-indigo-600"}
                                />
                            </div>
                            <span
                                className={`font-black text-xl tracking-tighter transition-colors ${isDark ? "text-white" : "text-black"}`}
                            >
                                FlashDeck<span className="text-indigo-500">AI</span>
                            </span>
                        </div>
                    </div>

                    {/* Centered Search Bar */}
                    <div className="flex-1 max-w-xl px-4 hidden md:block">
                        <div
                            className={`relative group transition-all duration-300 transform ${isDark ? "focus-within:bg-white/5" : ""}`}
                        >
                            <div
                                className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${isDark ? "text-gray-500 group-focus-within:text-indigo-400" : "text-gray-400 group-focus-within:text-indigo-600"}`}
                            >
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search decks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${isDark
                                    ? "bg-[#1a1a1a] border border-white/10 focus:border-indigo-500/50 text-white placeholder-gray-600 focus:ring-indigo-500/20 hover:border-white/20"
                                    : "bg-gray-100 border-transparent focus:bg-white focus:border-indigo-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500/20 hover:bg-gray-50"
                                    }`}
                            />
                            <div
                                className={`absolute inset-y-0 right-3 flex items-center pointer-events-none`}
                            >
                                <div
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? "bg-white/10 text-gray-500 border border-white/5" : "bg-white text-gray-400 border border-gray-200 shadow-sm"}`}
                                >
                                    /
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Actions - Matched Styling */}
                    <div className="flex items-center justify-end gap-3 w-1/4">
                        <button
                            onClick={() => navigate("/upload")}
                            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${isDark
                                ? "bg-white text-black hover:bg-gray-200 shadow-white/5"
                                : "bg-black text-white hover:bg-gray-800 shadow-black/10"
                                }`}
                        >
                            <Plus size={16} strokeWidth={3} />
                            <span className="hidden lg:inline">Create</span>
                        </button>

                        <div
                            className={`hidden md:block h-6 w-px mx-1 ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                        />

                        <div className="flex items-center gap-2">
                            {/* Theme Toggle - Direct Access */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 border ${isDark
                                    ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                                    : "bg-black/5 border-black/5 text-indigo-600 hover:bg-black/10"
                                    }`}
                                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {isDark ? (
                                    <Sun size={18} fill="currentColor" />
                                ) : (
                                    <Moon size={18} fill="currentColor" />
                                )}
                            </button>
                            {/* Settings Menu */}
                            <div className="relative">
                                <button
                                    onClick={(e) => handleMenuClick("settings", e)}
                                    className={`p-2.5 rounded-xl transition-all ${activeMenu === "settings" ? (isDark ? "bg-white/10 text-white" : "bg-gray-100 text-black") : isDark ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-600"}`}
                                >
                                    <Settings size={20} />
                                </button>
                                {activeMenu === "settings" && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-14 w-72 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                                    >
                                        <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                Settings
                                            </span>
                                            <button
                                                onClick={() => setActiveMenu(null)}
                                                className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>

                                        <div className="p-2 space-y-1">
                                            {/* General Settings */}
                                            <div className="px-3 py-2">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">
                                                    General
                                                </p>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSettingChange(
                                                            "notifications",
                                                            !settings.notifications,
                                                        );
                                                    }}
                                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-1.5 rounded-md ${settings.notifications ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500"}`}
                                                        >
                                                            <Bell size={14} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                                                Notifications
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`w-8 h-4 rounded-full relative transition-colors ${settings.notifications ? "bg-emerald-500" : "bg-gray-700"}`}
                                                    >
                                                        <div
                                                            className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${settings.notifications ? "left-4.5" : "left-0.5"}`}
                                                            style={{
                                                                left: settings.notifications
                                                                    ? "calc(100% - 14px)"
                                                                    : "2px",
                                                            }}
                                                        />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Menu */}
                            <div className="relative">
                                <button
                                    onClick={(e) => handleMenuClick("profile", e)}
                                    className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${isDark ? "border-white/10 hover:border-white/30" : "border-gray-200 hover:border-indigo-500"} ${activeMenu === "profile" ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0a0a]" : ""}`}
                                >
                                    <div
                                        className={`w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-tr from-indigo-500 to-purple-600`}
                                    >
                                        {user?.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                </button>

                                {activeMenu === "profile" && (
                                    <div className="absolute right-0 top-14 w-60 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-4 border-b border-white/10 mb-1 bg-white/5">
                                            <p className="text-sm font-bold text-white truncate">
                                                {user?.displayName || "FlashDeck User"}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <div className="p-1">
                                            <button
                                                onClick={handleProfileClick}
                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all rounded-lg flex items-center gap-3"
                                            >
                                                <User size={16} /> Profile
                                            </button>
                                            <button
                                                onClick={handleHelpClick}
                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all rounded-lg flex items-center gap-3"
                                            >
                                                <HelpCircle size={16} /> Help & Feedback
                                            </button>
                                            <div className="border-t border-white/10 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all rounded-lg flex items-center gap-3"
                                            >
                                                <LogOut size={16} />
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1400px] mx-auto px-6 py-8">
                    {/* Dashboard Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? "bg-indigo-500/20 text-indigo-400" : isDark ? "text-gray-500 hover:bg-white/5 hover:text-gray-300" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className={`flex items-center rounded-lg p-1 border ${isDark ? "bg-[#1a1a1a] border-white/5" : "bg-gray-100 border-transparent"}`}
                            >
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm") : "text-gray-500"}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm") : "text-gray-500"}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            <div className="relative group">
                                <button
                                    onClick={(e) => handleMenuClick("sort", e)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isDark ? "border-white/5 bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-white/5" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                                >
                                    {sortOptions[sortBy]}
                                    <ChevronDown size={14} className="text-gray-500" />
                                </button>
                                {activeMenu === "sort" && (
                                    <div className="absolute right-0 top-12 w-48 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {Object.entries(sortOptions).map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSortBy(key);
                                                    setActiveMenu(null);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${sortBy === key ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Featured Decks Coming Soon State */}
                    {activeTab === "Featured decks (Coming Soon)" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex flex-col items-center justify-center py-32 rounded-3xl border-2 border-dashed text-center ${isDark
                                ? "bg-[#1a1a1a]/40 border-white/5"
                                : "bg-gray-50 border-gray-200"
                                }`}
                        >
                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                                    }`}
                            >
                                <Sparkles size={40} />
                            </div>
                            <h3
                                className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"
                                    }`}
                            >
                                Featured Decks Arriving Soon
                            </h3>
                            <p
                                className={`max-w-md ${isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                            >
                                We're curating a collection of high-quality decks from experts and the
                                community. Stay tuned for an amazing library of knowledge!
                            </p>
                            <button
                                onClick={() => setActiveTab("My decks")}
                                className={`mt-8 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isDark
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-black text-white hover:bg-gray-800"
                                    }`}
                            >
                                Back to My Decks
                            </button>
                        </motion.div>
                    )}

                    {/* Recent Decks Section */}
                    {(activeTab === "All" || activeTab === "My decks") && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2
                                    className={`text-xl font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                    Recent decks
                                </h2>
                                {searchTerm && (
                                    <span className="text-sm text-gray-500">
                                        Found {filteredDecks.length} deck
                                        {filteredDecks.length !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                            <div
                                className={
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                                        : "flex flex-col gap-3"
                                }
                            >
                                {/* New Deck Placeholder (Only in grid or if no search) */}
                                {viewMode === "grid" && !searchTerm && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => navigate("/upload")}
                                        className={`aspect-square border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group ${isDark ? "bg-[#1a1a1a]/50 border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5" : "bg-white border-gray-200 hover:border-black/20 hover:bg-gray-50"}`}
                                    >
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/5 text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20" : "bg-blue-50 text-blue-600 group-hover:scale-110"}`}
                                        >
                                            <Plus size={28} />
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${isDark ? "text-gray-500 group-hover:text-indigo-300" : "text-gray-500 group-hover:text-black"}`}
                                        >
                                            Create new deck
                                        </span>
                                    </motion.div>
                                )}

                                {/* Recent Cards */}
                                {filteredDecks.map((nb, i) => {
                                    const visibility = nb.visibility || "private";
                                    const visibilityIcons = {
                                        public: <Globe size={12} />,
                                        unlisted: <EyeOff size={12} />,
                                        private: <Lock size={12} />,
                                    };

                                    // Dark Mode Vibrant Gradients
                                    const vibrantGradients = [
                                        "from-indigo-600/40 to-purple-600/40",
                                        "from-emerald-600/40 to-teal-600/40",
                                        "from-rose-600/40 to-orange-600/40",
                                        "from-blue-600/40 to-cyan-600/40",
                                        "from-fuchsia-600/40 to-pink-600/40",
                                        "from-amber-600/40 to-orange-600/40",
                                        "from-violet-600/40 to-indigo-600/40",
                                        "from-cyan-600/40 to-blue-600/40",
                                    ];

                                    const gradientClass =
                                        vibrantGradients[i % vibrantGradients.length];

                                    return viewMode === "grid" ? (
                                        <motion.div
                                            key={nb.id || nb.name}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            whileHover={{ y: -6, scale: 1.02 }}
                                            onClick={() => handleDeckClick(nb)}
                                            className={`relative flex flex-col justify-between p-6 rounded-[2.5rem] cursor-pointer transition-all duration-300 group border ${isDark
                                                ? `bg-black/40 border-white/5 hover:border-white/20 shadow-2xl shadow-black/50`
                                                : `bg-white border-gray-100 hover:shadow-2xl shadow-indigo-500/5`
                                                }`}
                                        >
                                            {/* Clipped Background Effects */}
                                            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                                                {/* Background Gradient Layer */}
                                                <div
                                                    className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 opacity-20 group-hover:opacity-40 ${isDark ? gradientClass : "from-indigo-50 to-white"}`}
                                                />

                                                {/* Glow effect on hover */}
                                                <div
                                                    className={`absolute -inset-20 bg-gradient-to-tr ${isDark ? "from-white/5 to-transparent" : "from-indigo-500/5 to-transparent"} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                                                />
                                            </div>

                                            <div className="relative z-20 flex justify-between items-start mb-8">
                                                <div
                                                    className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}
                                                >
                                                    {nb.icon || "⚡️"}
                                                </div>

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowDeleteMenu(
                                                                showDeleteMenu === nb.name ? null : nb.name,
                                                            );
                                                        }}
                                                        className={`p-2 rounded-xl transition-all ${isDark
                                                            ? "hover:bg-white/10 text-gray-500 hover:text-white"
                                                            : "hover:bg-black/5 text-gray-400 hover:text-black"
                                                            }`}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {showDeleteMenu === nb.name && (
                                                        <div
                                                            className={`absolute right-0 top-12 w-52 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] border py-2.5 z-[100] overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? "bg-[#080808] border-white/20" : "bg-white border-gray-200 shadow-2xl"}`}
                                                        >
                                                            <button
                                                                onClick={(e) => handleEditTitle(e, nb)}
                                                                className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-3 transition-colors ${isDark ? "text-gray-300 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-black"}`}
                                                            >
                                                                <Edit2 size={14} /> Edit Title
                                                            </button>

                                                            <div
                                                                className={`my-1 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                                                            />

                                                            <p className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                                Visibility
                                                            </p>
                                                            <button
                                                                onClick={(e) =>
                                                                    handleVisibilityChange(e, nb, "public")
                                                                }
                                                                className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-3 transition-colors ${visibility === "public" ? "text-indigo-400 bg-indigo-500/10" : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}
                                                            >
                                                                <Globe size={14} /> Public
                                                            </button>
                                                            <button
                                                                onClick={(e) =>
                                                                    handleVisibilityChange(e, nb, "unlisted")
                                                                }
                                                                className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-3 transition-colors ${visibility === "unlisted" ? "text-indigo-400 bg-indigo-500/10" : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}
                                                            >
                                                                <EyeOff size={14} /> Unlisted
                                                            </button>
                                                            <button
                                                                onClick={(e) =>
                                                                    handleVisibilityChange(e, nb, "private")
                                                                }
                                                                className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-3 transition-colors ${visibility === "private" ? "text-indigo-400 bg-indigo-500/10" : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}
                                                            >
                                                                <Lock size={14} /> Private
                                                            </button>

                                                            <div
                                                                className={`my-1 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                                                            />

                                                            <button
                                                                onClick={(e) => handleDelete(e, nb)}
                                                                className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-3 transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                                                            >
                                                                <Trash2 size={14} /> Delete Deck
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div
                                                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${visibility === "public"
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : visibility === "unlisted"
                                                                ? "bg-amber-500/10 text-amber-400"
                                                                : "bg-white/5 text-gray-500"
                                                            }`}
                                                    >
                                                        {visibilityIcons[visibility]}
                                                        {visibility}
                                                    </div>
                                                </div>
                                                <h3
                                                    className={`text-xl font-black tracking-tight leading-tight mb-2 line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}
                                                >
                                                    {nb.name || "Untitled Deck"}
                                                </h3>
                                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                                                    <span
                                                        className={
                                                            isDark ? "text-gray-400" : "text-gray-500"
                                                        }
                                                    >
                                                        {nb.sources || 0} Sources
                                                    </span>
                                                    <div
                                                        className={`w-1 h-1 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                                                    />
                                                    <span
                                                        className={
                                                            isDark ? "text-gray-500" : "text-gray-400"
                                                        }
                                                    >
                                                        {nb.date || "Just now"}
                                                    </span>
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
                                            className={`flex items-center gap-5 p-4 rounded-3xl border transition-all cursor-pointer group ${isDark
                                                ? `bg-black/40 border-white/5 hover:border-white/20`
                                                : `bg-white border-gray-100 hover:shadow-xl`
                                                }`}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                                            >
                                                {nb.icon || "⚡️"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3
                                                        className={`font-black tracking-tight text-base truncate ${isDark ? "text-white" : "text-gray-900"}`}
                                                    >
                                                        {nb.name || "Untitled deck"}
                                                    </h3>
                                                    <div
                                                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${visibility === "public"
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : visibility === "unlisted"
                                                                ? "bg-amber-500/10 text-amber-400"
                                                                : "bg-white/5 text-gray-500"
                                                            }`}
                                                    >
                                                        {visibilityIcons[visibility]}
                                                        {visibility}
                                                    </div>
                                                </div>
                                                <p
                                                    className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                                >
                                                    {nb.sources || 0} sources • {nb.date || "Just now"}
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteMenu(
                                                            showDeleteMenu === nb.name ? null : nb.name,
                                                        );
                                                    }}
                                                    className={`p-2 rounded-xl transition-all ${isDark ? "text-gray-500 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-black hover:bg-gray-100"}`}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {showDeleteMenu === nb.name && (
                                                    <div
                                                        className={`absolute right-0 top-12 w-52 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] border py-2.5 z-[100] overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? "bg-[#080808] border-white/20" : "bg-white border-gray-200 shadow-2xl"}`}
                                                    >
                                                        <button
                                                            onClick={(e) => handleEditTitle(e, nb)}
                                                            className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-3 transition-colors ${isDark ? "text-gray-300 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-black"}`}
                                                        >
                                                            <Edit2 size={14} /> Edit Title
                                                        </button>

                                                        <div
                                                            className={`my-1 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                                                        />

                                                        <p className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                            Visibility
                                                        </p>
                                                        <button
                                                            onClick={(e) =>
                                                                handleVisibilityChange(e, nb, "public")
                                                            }
                                                            className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-3 transition-colors ${visibility === "public" ? "text-indigo-400 bg-indigo-500/10" : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}
                                                        >
                                                            <Globe size={14} /> Public
                                                        </button>
                                                        <button
                                                            onClick={(e) =>
                                                                handleVisibilityChange(e, nb, "unlisted")
                                                            }
                                                            className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-3 transition-colors ${visibility === "unlisted" ? "text-indigo-400 bg-indigo-500/10" : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}
                                                        >
                                                            <EyeOff size={14} /> Unlisted
                                                        </button>
                                                        <button
                                                            onClick={(e) =>
                                                                handleVisibilityChange(e, nb, "private")
                                                            }
                                                            className={`w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-3 transition-colors ${visibility === "private" ? "text-indigo-400 bg-indigo-500/10" : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}
                                                        >
                                                            <Lock size={14} /> Private
                                                        </button>

                                                        <div
                                                            className={`my-1 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                                                        />

                                                        <button
                                                            onClick={(e) => handleDelete(e, nb)}
                                                            className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-3 transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                                                        >
                                                            <Trash2 size={14} /> Delete Deck
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
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
                                className={`w-full max-w-[400px] rounded-[2rem] shadow-2xl overflow-hidden ${isDark ? "bg-[#121212] border border-white/10" : "bg-white border border-gray-100"}`}
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
                                        <div
                                            className={`w-20 h-20 rounded-3xl border-4 flex items-center justify-center text-3xl font-bold bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-2xl transform transition-transform hover:scale-105 active:scale-95 cursor-default ${isDark ? "border-[#121212]" : "border-white"}`}
                                        >
                                            {user?.email?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="text-center mb-8">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <h2
                                                className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
                                            >
                                                {user?.displayName || "FlashDeck User"}
                                            </h2>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}
                                            >
                                                Free
                                            </span>
                                        </div>
                                        <p
                                            className={`text-sm font-medium opacity-50 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                        >
                                            {user?.email}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        <div
                                            className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-colors ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100"}`}
                                        >
                                            <div
                                                className={`p-2 rounded-lg mb-2 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
                                            >
                                                <BookOpen size={16} />
                                            </div>
                                            <p
                                                className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}
                                            >
                                                {userDecks.length}
                                            </p>
                                            <p
                                                className={`text-[10px] font-bold uppercase tracking-wider opacity-40 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                            >
                                                Decks
                                            </p>
                                        </div>
                                        <div
                                            className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-colors ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100"}`}
                                        >
                                            <div
                                                className={`p-2 rounded-lg mb-2 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"}`}
                                            >
                                                <Brain size={16} />
                                            </div>
                                            <p
                                                className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}
                                            >
                                                {userDecks.reduce(
                                                    (acc, curr) =>
                                                        acc +
                                                        (curr.flashcards ? curr.flashcards.length : 0),
                                                    0,
                                                )}
                                            </p>
                                            <p
                                                className={`text-[10px] font-bold uppercase tracking-wider opacity-40 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                            >
                                                Cards
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <button
                                            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group shadow-lg ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-black"}`}
                                        >
                                            <User
                                                size={16}
                                                className="transition-transform group-hover:scale-110"
                                            />
                                            Edit Profile
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"}`}
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </div>

                                    <p
                                        className={`text-center mt-6 text-[10px] font-bold uppercase tracking-[0.2em] opacity-20 ${isDark ? "text-white" : "text-black"}`}
                                    >
                                        FlashDeck AI v2.1
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Title Modal */}
                <AnimatePresence>
                    {editingDeck && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl ${isDark ? "bg-[#1a1a1a] border border-white/10" : "bg-white border border-gray-200"}`}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className={`p-3 rounded-2xl ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
                                    >
                                        <Edit2 size={24} />
                                    </div>
                                    <h2
                                        className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
                                    >
                                        Edit Title
                                    </h2>
                                </div>

                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    autoFocus
                                    placeholder="Enter deck title..."
                                    className={`w-full px-5 py-4 rounded-2xl text-lg font-bold transition-all border outline-none mb-8 ${isDark ? "bg-white/5 border-white/10 focus:border-indigo-500/50 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 focus:border-indigo-600/30 text-gray-900 placeholder-gray-400"}`}
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditingDeck(null)}
                                        className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100"}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveUpdatedTitle}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
