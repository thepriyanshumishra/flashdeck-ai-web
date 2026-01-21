import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Grid, List, MoreVertical, Settings,
    LayoutGrid, User, BookOpen, Clock, FileText,
    Brain, Sparkles, Star, ChevronDown, Bell, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibraryPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('My notebooks');

    const featuredNotebooks = [
        {
            title: "Jane Austen: The Complete Works",
            category: "Arts & Culture",
            sources: 11,
            date: "Nov 11, 2025",
            image: "https://images.unsplash.com/photo-1544648151-1823ed3bd333?q=80&w=2000&auto=format&fit=crop",
            color: "from-amber-900/40 to-black/80"
        },
        {
            title: "William Shakespeare: The Complete Plays",
            category: "Arts & Culture",
            sources: 45,
            date: "Apr 28, 2025",
            image: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=2000&auto=format&fit=crop",
            color: "from-emerald-900/40 to-black/80"
        },
        {
            title: "Can your eyes explain your overall...",
            category: "Google Research",
            sources: 14,
            date: "Jul 3, 2025",
            image: "https://images.unsplash.com/photo-1516339901600-2e3a82dc50d6?q=80&w=2000&auto=format&fit=crop",
            color: "from-blue-900/40 to-black/80"
        }
    ];

    const notebooks = [
        { title: "JavaScript Fundamentals and...", sources: 1, date: "Nov 25, 2025", icon: "👨‍💻", color: "bg-blue-50" },
        { title: "Fundamentals of C Programming...", sources: 19, date: "Nov 22, 2025", icon: "💻", color: "bg-gray-50" },
        { title: "Electrodynamics, Superconductivity...", sources: 2, date: "Nov 19, 2025", icon: "⚛️", color: "bg-emerald-50" },
        { title: "Engineering Mathematics-I...", sources: 1, date: "Nov 17, 2025", icon: "📐", color: "bg-stone-50" },
        { title: "Web Development Syllabus: HTML, CS...", sources: 2, date: "Nov 14, 2025", icon: "📚", color: "bg-sky-50" },
        { title: "Cascading Style Sheets...", sources: 3, date: "Nov 14, 2025", icon: "🎨", color: "bg-yellow-50" },
        { title: "Untitled notebook", sources: 0, date: "Nov 5, 2025", icon: "📔", color: "bg-orange-50" },
        { title: "Computer Science and Engineering...", sources: 2, date: "Oct 8, 2025", icon: "🎓", color: "bg-purple-50" },
        { title: "A Syllabus of Human Values and Harmony", sources: 11, date: "Sep 25, 2025", icon: "🤝", color: "bg-green-50" }
    ];

    const tabs = ["All", "My notebooks", "Featured notebooks"];

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
                            <Brain size={20} />
                        </div>
                        <span className="text-xl font-medium tracking-tight">FlashDeck AI</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <Settings size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <LayoutGrid size={20} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-2 border-2 border-white shadow-sm cursor-pointer"></div>
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
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? "bg-[#E8F0FE] text-[#1967D2]" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all">
                                Most recent
                                <ChevronDown size={14} className="text-gray-500" />
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/upload')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                        >
                            <Plus size={18} />
                            Create new
                        </button>
                    </div>
                </div>

                {/* Featured Section */}
                {activeTab !== "My notebooks" && (
                    <section className="mb-14">
                        <h2 className="text-xl font-medium mb-6">Featured notebooks</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto pb-4 no-scrollbar">
                            {featuredNotebooks.map((nb, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                                >
                                    <img src={nb.image} alt={nb.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${nb.color}`} />

                                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded bg-black/20 backdrop-blur-md flex items-center justify-center">
                                                <Brain size={12} className="text-white" />
                                            </div>
                                            <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">{nb.category}</span>
                                        </div>
                                        <h3 className="text-white font-semibold text-lg leading-tight mb-3 group-hover:underline">{nb.title}</h3>
                                        <div className="flex items-center justify-between text-[11px] text-white/60">
                                            <span>{nb.date} • {nb.sources} sources</span>
                                            <Star size={12} className="text-white/40" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-100 transition-all cursor-pointer group min-w-[120px]">
                                <span className="text-sm font-medium text-gray-500 group-hover:text-black flex items-center gap-2">
                                    See all <ChevronDown className="-rotate-90" size={16} />
                                </span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Recent Notebooks Section */}
                <section>
                    <h2 className="text-xl font-medium mb-6">Recent notebooks</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {/* New Notebook Placeholder */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate('/upload')}
                            className="aspect-square bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-black/20 hover:bg-gray-50 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Plus size={28} />
                            </div>
                            <span className="text-sm font-medium text-gray-500 group-hover:text-black">Create new notebook</span>
                        </motion.div>

                        {/* Recent Cards */}
                        {notebooks.map((nb, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02, y: -4 }}
                                onClick={() => navigate('/notebook')}
                                className={`aspect-square ${nb.color} rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer border border-transparent hover:border-gray-200 transition-all shadow-sm relative group`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="text-3xl filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{nb.icon}</div>
                                    <button className="p-2 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-900 transition-all">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-[#202124] leading-snug group-hover:underline line-clamp-2">{nb.title}</h3>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] text-gray-500 font-medium">{nb.date} • {nb.sources} source{nb.sources !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
