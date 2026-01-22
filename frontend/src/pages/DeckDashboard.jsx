import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, memo } from 'react';
import { useDeck } from '../context/DeckContext';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, MessageSquare, Mic, PlayCircle, BookOpen, Brain,
    CreditCard, PieChart, Sparkles, Plus, Search, MoreHorizontal,
    MoreVertical, ThumbsUp, ThumbsDown, Copy, Video,
    Network, Presentation, Table, Lock, PanelRightClose, PanelRightOpen,
    PanelLeftClose, PanelLeftOpen, RotateCw, CheckCircle2, Clock, Trash2,
    ChevronDown, Settings, Share2, BarChart2, Maximize2, MicOff, Star, Bookmark,
    Edit3, Loader2, Wand2, Sun, Moon, Bell, User, LogOut, HelpCircle, Check, Pause
} from 'lucide-react';

// Define plugins outside component to prevent re-creation on every render
const REMARK_PLUGINS = [remarkMath, remarkGfm];
const REHYPE_PLUGINS = [rehypeKatex];

import { useAuth } from '../context/AuthContext';

import Navbar from '../components/layout/Navbar';
import ExpandableMindMap from '../components/ExpandableMindMap';
import ReportViewer from '../components/ReportViewer';
import SlideDeckViewer from '../components/SlideDeckViewer';
import DataTableView from '../components/DataTableView';
import FlashcardViewer from '../components/FlashcardViewer';
import QuizIntroView from '../components/QuizIntroView';
import SavedNotesModal from '../components/SavedNotesModal';
import FlowchartView from '../components/FlowchartView';
import GenerationSettingsModal from '../components/GenerationSettingsModal';
import { useTheme } from '../context/ThemeContext';
import ShareModal from '../components/ShareModal';
import SEO from '../components/common/SEO';

export default function DeckDashboard() {
    const { isDark, toggleTheme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Navbar State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [settings, setSettings] = useState({
        notifications: true,
        sound: false,
        autoSave: true,
        compactMode: false
    });

    const handleMenuClick = (menu, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);
    const [isStudioCollapsed, setIsStudioCollapsed] = useState(false);
    const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
    const [activeTool, setActiveTool] = useState("Chat");
    const [localInputValue, setLocalInputValue] = useState("");
    const [isSavedNotesModalOpen, setIsSavedNotesModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [thinkingStep, setThinkingStep] = useState(0);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sourcesSearchTerm, setSourcesSearchTerm] = useState('');

    // Settings Modal State
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [settingsTool, setSettingsTool] = useState(null);

    // Podcast & Overview State
    const [podcastMenuOpen, setPodcastMenuOpen] = useState(false);
    const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
    const podcastAudioRef = useRef(null);

    const [overviewMenuOpen, setOverviewMenuOpen] = useState(false);
    const [isOverviewPlaying, setIsOverviewPlaying] = useState(false);

    const overviewAudioRef = useRef(null);

    const handleGeneratePodcast = () => {
        triggerGeneration('podcast', { mode: podcastMode });
    };

    const togglePodcastPlay = () => {
        if (!podcastAudioRef.current || !podcastUrl) return;
        if (isPodcastPlaying) {
            podcastAudioRef.current.pause();
            setIsPodcastPlaying(false);
        } else {
            podcastAudioRef.current.play().catch(err => {
                console.error('Error playing podcast:', err);
                setIsPodcastPlaying(false);
            });
            setIsPodcastPlaying(true);
        }
    };

    const handleGenerateOverview = () => {
        triggerGeneration('overview', { mode: overviewMode });
    };

    const toggleOverviewPlay = () => {
        if (!overviewAudioRef.current || !overviewUrl) return;
        if (isOverviewPlaying) {
            overviewAudioRef.current.pause();
            setIsOverviewPlaying(false);
        } else {
            overviewAudioRef.current.play().catch(err => {
                console.error('Error playing overview:', err);
                setIsOverviewPlaying(false);
            });
            setIsOverviewPlaying(true);
        }
    };

    const handleOpenSettings = (toolName, e) => {
        e.stopPropagation();
        setSettingsTool(toolName);
        setSettingsModalOpen(true);
    };

    const handleGenerateWithSettings = (toolName, options) => {
        // Map tool name to triggerGeneration type
        const typeMap = {
            "Flashcards": "cards",
            "Quiz": "quiz",
            "Mind Map": "flowchart",
            "Slide Deck": "slides",
            "Reports": "report",
            "Data Table": "table"
        };

        const type = typeMap[toolName];
        if (type) {
            triggerGeneration(type, options);
        }
        setSettingsModalOpen(false);
    };

    const {
        files, setFiles, handleFilesAdded, handleRemoveFile,
        flowcharts,
        deckName,
        uploadFilesToDeck,
        cards, cardsStatus, flowchartStatus,
        triggerGeneration,
        messages,
        isChatLoading,
        isThinking,
        handleSendMessage,
        handleClearAll,
        quiz, quizStatus,
        report, reportStatus,
        slides, slidesStatus,
        table, tableStatus,
        guide, guideStatus, savedNotes, saveNote,
        podcastStatus, setPodcastStatus, podcastUrl, setPodcastUrl, podcastMode, setPodcastMode,
        overviewStatus, setOverviewStatus, overviewUrl, setOverviewUrl, overviewMode, setOverviewMode,
        generationSteps,
        deckId
    } = useDeck();

    const thinkingStatuses = [
        { text: "Reviewing the content...", icon: Search },
        { text: "Crafting a detailed explanation...", icon: Wand2 },
        { text: "Checking your uploads...", icon: BookOpen },
        { text: "Analyzing document structure...", icon: Table },
        { text: "Synthesizing key insights...", icon: Brain },
        { text: "Polishing the response...", icon: Sparkles }
    ];

    useEffect(() => {
        let interval;
        if (isThinking) {
            interval = setInterval(() => {
                setThinkingStep(prev => (prev + 1) % thinkingStatuses.length);
            }, 2500);
        } else {
            setThinkingStep(0);
        }
        return () => clearInterval(interval);
    }, [isThinking]);

    // Reload audio elements when URLs change
    useEffect(() => {
        if (podcastAudioRef.current && podcastUrl) {
            podcastAudioRef.current.load();
        } else if (!podcastUrl) {
            // Reset playing state when URL is cleared
            setIsPodcastPlaying(false);
        }
    }, [podcastUrl]);

    useEffect(() => {
        if (overviewAudioRef.current && overviewUrl) {
            overviewAudioRef.current.load();
        } else if (!overviewUrl) {
            // Reset playing state when URL is cleared
            setIsOverviewPlaying(false);
        }
    }, [overviewUrl]);

    const handleCreateNew = () => {
        handleClearAll();
        navigate('/library');
    };

    const handleGenerateAll = () => {
        // Fire all requests in parallel
        if (cardsStatus === 'idle') triggerGeneration('cards');
        if (flowchartStatus === 'idle') triggerGeneration('flowchart');
        if (quizStatus === 'idle') triggerGeneration('quiz');
        if (reportStatus === 'idle') triggerGeneration('report');
        if (slidesStatus === 'idle') triggerGeneration('slides');
        if (tableStatus === 'idle') triggerGeneration('table');
    };

    const handleAddSource = () => {
        fileInputRef.current?.click();
    };

    const onFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            try {
                handleSendMessage(`Processing ${newFiles.length} new source(s)...`);
                await uploadFilesToDeck(newFiles);
                // System acknowledgement (optional, or just let the chat imply it)
            } catch (error) {
                console.error("Failed to add sources", error);
                alert("Failed to upload sources. Please try again.");
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatLoading]);

    useEffect(() => {
        if (deckId && !messages.length && guideStatus === 'idle') {
            triggerGeneration('guide');
        }
    }, [deckId, messages.length, guideStatus, triggerGeneration]);

    const colorVariants = {
        indigo: {
            text: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            borderDark: 'hover:border-indigo-500/30',
            borderLight: 'hover:border-indigo-200',
            badge: 'bg-indigo-500',
            btnSolid: 'bg-indigo-500 hover:bg-indigo-600',
            btnLight: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
        },
        emerald: {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            borderDark: 'hover:border-emerald-500/30',
            borderLight: 'hover:border-emerald-200',
            badge: 'bg-emerald-500',
            btnSolid: 'bg-emerald-500 hover:bg-emerald-600',
            btnLight: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
        },
        pink: {
            text: 'text-pink-500',
            bg: 'bg-pink-500/10',
            borderDark: 'hover:border-pink-500/30',
            borderLight: 'hover:border-pink-200',
            badge: 'bg-pink-500',
            btnSolid: 'bg-pink-500 hover:bg-pink-600',
            btnLight: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20'
        },
        orange: {
            text: 'text-orange-500',
            bg: 'bg-orange-500/10',
            borderDark: 'hover:border-orange-500/30',
            borderLight: 'hover:border-orange-200',
            badge: 'bg-orange-500',
            btnSolid: 'bg-orange-500 hover:bg-orange-600',
            btnLight: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
        },
        purple: {
            text: 'text-purple-500',
            bg: 'bg-purple-500/10',
            borderDark: 'hover:border-purple-500/30',
            borderLight: 'hover:border-purple-200',
            badge: 'bg-purple-500',
            btnSolid: 'bg-purple-500 hover:bg-purple-600',
            btnLight: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
        },
        blue: {
            text: 'text-blue-500',
            bg: 'bg-blue-500/10',
            borderDark: 'hover:border-blue-500/30',
            borderLight: 'hover:border-blue-200',
            badge: 'bg-blue-500',
            btnSolid: 'bg-blue-500 hover:bg-blue-600',
            btnLight: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
        },
        rose: {
            text: 'text-rose-500',
            bg: 'bg-rose-500/10',
            borderDark: 'hover:border-rose-500/30',
            borderLight: 'hover:border-rose-200',
            badge: 'bg-rose-500',
            btnSolid: 'bg-rose-500 hover:bg-rose-600',
            btnLight: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
        },
        cyan: {
            text: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
            borderDark: 'hover:border-cyan-500/30',
            borderLight: 'hover:border-cyan-200',
            badge: 'bg-cyan-500',
            btnSolid: 'bg-cyan-500 hover:bg-cyan-600',
            btnLight: 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20'
        },
        amber: {
            text: 'text-amber-500',
            bg: 'bg-amber-500/10',
            borderDark: 'hover:border-amber-500/30',
            borderLight: 'hover:border-amber-200',
            badge: 'bg-amber-500',
            btnSolid: 'bg-amber-500 hover:bg-amber-600',
            btnLight: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
        },
        gray: {
            text: 'text-gray-500',
            bg: 'bg-gray-500/10',
            borderDark: 'hover:border-gray-500/30',
            borderLight: 'hover:border-gray-200',
            badge: 'bg-gray-500',
            btnSolid: 'bg-gray-500 hover:bg-gray-600',
            btnLight: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
        }
    };


    const studioTools = [
        {
            id: 'podcast',
            name: "Podcast",
            title: "Two-Host Conversation",
            description: "Generate an engaging dialogue between two AI hosts about your deck.",
            icon: Mic,
            color: "indigo",
            badge: "New",
            status: podcastStatus,
            active: true,
            isSpecial: true,
            mode: podcastMode,
            setMode: setPodcastMode,
            menuOpen: podcastMenuOpen,
            setMenuOpen: setPodcastMenuOpen,
            ref: podcastAudioRef,
            url: podcastUrl,
            isPlaying: isPodcastPlaying,
            togglePlay: togglePodcastPlay,
            onGenerate: handleGeneratePodcast,
            modes: ['default', 'brief', 'summarized']
        },
        {
            id: 'overview',
            name: "Audio Lesson",
            title: "Teacher Explanation",
            description: "A clear, lecture-style explanation of the concepts.",
            icon: BookOpen,
            color: "emerald",
            badge: "New",
            status: overviewStatus,
            active: true,
            isSpecial: true,
            mode: overviewMode,
            setMode: setOverviewMode,
            menuOpen: overviewMenuOpen,
            setMenuOpen: setOverviewMenuOpen,
            ref: overviewAudioRef,
            url: overviewUrl,
            isPlaying: isOverviewPlaying,
            togglePlay: toggleOverviewPlay,
            onGenerate: handleGenerateOverview,
            modes: ['default', 'brief', 'summarized']
        },
        {
            id: 'mindmap',
            name: "Mind Map",
            title: "Interactive Mind Map",
            description: "Visualize relationships with an interactive flowchart.",
            icon: Network,
            color: "pink",
            badge: null,
            status: flowchartStatus,
            active: true,
            onGenerate: () => triggerGeneration('flowchart'),
            onView: () => {
                setActiveTool('Mind Map');
                if (window.innerWidth < 768) setMobileTab('content');
            }
        },
        {
            id: 'flashcards',
            name: "Flashcards",
            title: "Study Flashcards",
            description: "Review key concepts with active recall cards.",
            icon: CreditCard,
            color: "orange",
            badge: null,
            status: cardsStatus,
            active: true,
            onGenerate: () => {
                if (cardsStatus !== 'generating') {
                    triggerGeneration('cards');
                    setActiveTool('Flashcards');
                    if (window.innerWidth < 768) setMobileTab('content');
                }
            },
            onView: () => {
                setActiveTool('Flashcards');
                if (window.innerWidth < 768) setMobileTab('content');
            }
        },
        {
            id: 'quiz',
            name: "Quiz",
            title: "Practice Quiz",
            description: "Test your knowledge with AI-generated questions.",
            icon: PieChart,
            color: "purple",
            badge: null,
            status: quizStatus,
            active: true,
            onGenerate: () => {
                if (quizStatus !== 'generating') {
                    triggerGeneration('quiz');
                    setActiveTool('Quiz');
                    if (window.innerWidth < 768) setMobileTab('content');
                }
            },
            onView: () => {
                setActiveTool('Quiz');
                if (window.innerWidth < 768) setMobileTab('content');
            }
        },
        {
            id: 'report',
            name: "Reports",
            title: "Deep Research",
            description: "Comprehensive analysis and academic report.",
            icon: FileText,
            color: "blue",
            badge: null,
            status: reportStatus,
            active: true,
            onGenerate: () => {
                if (reportStatus !== 'generating') triggerGeneration('report');
            },
            onView: () => {
                setActiveTool('Reports');
                if (window.innerWidth < 768) setMobileTab('content');
            }
        },
        {
            id: 'slides',
            name: "Slide Deck",
            title: "Presentation Slides",
            description: "Ready-to-use slides for your presentation.",
            icon: Presentation,
            color: "rose",
            badge: null,
            status: slidesStatus,
            active: true,
            onGenerate: () => {
                if (slidesStatus !== 'generating') triggerGeneration('slides');
            },
            onView: () => {
                setActiveTool('Slide Deck');
                if (window.innerWidth < 768) setMobileTab('content');
            }
        },
        {
            id: 'table',
            name: "Data Table",
            title: "Structured Data",
            description: "Extract and organize data points into tables.",
            icon: Table,
            color: "cyan",
            badge: null,
            status: tableStatus,
            active: true,
            onGenerate: () => {
                if (tableStatus !== 'generating') triggerGeneration('table');
            },
            onView: () => {
                setActiveTool('Data Table');
                if (window.innerWidth < 768) setMobileTab('content');
            }
        },
        {
            id: 'saved_notes',
            name: "Saved Notes",
            title: "Archive & Highlights",
            description: `Access your ${savedNotes.length} captured insights and highlights from chat.`,
            icon: Bookmark,
            color: "amber",
            badge: null,
            status: 'completed',
            active: true,
            onGenerate: () => setIsSavedNotesModalOpen(true),
            onView: () => setIsSavedNotesModalOpen(true),
        },
        {
            name: "Video Overview",
            title: "Video Overview",
            description: "Generate a video summary of your deck.",
            icon: Video,
            active: false,
            badge: "Soon",
            color: "gray"
        },
    ];


    const [mobileTab, setMobileTab] = useState('chat');

    // Voice Input State & Refs
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const chatInputRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setLocalInputValue(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className={`h-screen font-sans overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-gray-200' : 'bg-[#F8F9FA] text-[#202124]'}`}>
            {/* Header / Navbar */}
            <header className={`h-[72px] flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${isDark ? 'bg-[#0a0a0a]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>

                {/* Logo Section */}
                <div className="flex items-center gap-8 w-1/4">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/library')}>
                        <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isDark ? 'bg-white/10 border border-white/10' : 'bg-black/5 border border-black/5'}`}>
                            <Brain size={22} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                        </div>
                        <span className={`font-black text-xl tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
                            FlashDeck<span className="text-indigo-500">AI</span>
                        </span>
                    </div>
                </div>

                {/* Centered Search Bar */}
                <div className="flex-1 max-w-xl px-4 hidden md:block">
                    <div className={`relative group transition-all duration-300 transform ${isDark ? 'focus-within:bg-white/5' : ''}`}>
                        <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`}>
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search in deck..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${isDark
                                ? 'bg-[#1a1a1a] border border-white/10 focus:border-indigo-500/50 text-white placeholder-gray-600 focus:ring-indigo-500/20 hover:border-white/20'
                                : 'bg-gray-100 border-transparent focus:bg-white focus:border-indigo-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500/20 hover:bg-gray-50'
                                }`}
                        />
                        <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none`}>
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10 text-gray-500 border border-white/5' : 'bg-white text-gray-400 border border-gray-200 shadow-sm'}`}>
                                /
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-3 w-1/4">
                    <button
                        onClick={handleCreateNew}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${isDark
                            ? 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                            : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
                            }`}
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span className="hidden lg:inline">Create</span>
                    </button>

                    <div className={`hidden md:block h-6 w-px mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 border ${isDark
                                ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
                                : 'bg-black/5 border-black/5 text-indigo-600 hover:bg-black/10'
                                }`}
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? <Sun size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
                        </button>

                        {/* Settings Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => handleMenuClick('settings', e)}
                                className={`p-2.5 rounded-xl transition-all ${activeMenu === 'settings' ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black') : (isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600')}`}
                            >
                                <Settings size={20} />
                            </button>
                            {/* Shortened Settings Dropdown for simplicity */}
                            {activeMenu === 'settings' && (
                                <div className="absolute right-0 top-14 w-60 rounded-xl shadow-2xl border py-2 z-50 animate-in fade-in zoom-in-95 overflow-hidden bg-[#1a1a1a] border-white/10">
                                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Settings</div>
                                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 text-sm">Notifications</button>
                                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 text-sm">Appearance</button>
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => handleMenuClick('profile', e)}
                                className="pl-2 focus:outline-none"
                            >
                                <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-bold shadow-lg transition-transform hover:scale-105 ${isDark ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300' : 'border-white bg-indigo-100 text-indigo-600'}`}>
                                    {user?.email?.[0]?.toUpperCase() || "U"}
                                </div>
                            </button>
                            {activeMenu === 'profile' && (
                                <div className="absolute right-0 top-14 w-56 rounded-xl shadow-2xl border py-2 z-50 animate-in fade-in zoom-in-95 bg-[#1a1a1a] border-white/10">
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-sm font-bold text-white max-w-[200px] truncate">{user?.email}</p>
                                        <p className="text-xs text-gray-500">Free Plan</p>
                                    </div>
                                    <div className="p-1">
                                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
                                            <LogOut size={14} /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub-header for Deck Title & Actions */}
            <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center hidden sm:flex ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <BookOpen size={18} />
                    </div>
                    {/* Mobile Only Logo/Icon replacement since BookOpen is hidden on mobile */}
                    <div className={`md:hidden w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Brain size={18} />
                    </div>
                    <h1 className={`text-sm font-medium max-w-[200px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{deckName || "Untitled Deck"}</h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-3">
                    <button
                        onClick={handleCreateNew}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs border whitespace-nowrap ${isDark ? 'bg-white/5 text-gray-400 border-white/5 hover:text-white' : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900'
                            }`}
                    >
                        <Plus size={14} /> <span className="hidden sm:inline">Create deck</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-3">
                        <button className={`p-1.5 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}><BarChart2 size={18} /></button>
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className={`p-1.5 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <Share2 size={18} />
                        </button>
                        <button className={`p-1.5 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}><Settings size={18} /></button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-2 shadow-lg"></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT COLUMN: SOURCES */}
                <div className={`
                    ${mobileTab === 'sources' ? 'flex w-full absolute inset-0 z-30 md:static ' + (isDark ? 'bg-[#111]' : 'bg-[#F8F9FA]') : 'hidden md:flex'}
                    ${isSourcesCollapsed ? 'md:w-16' : 'md:w-[320px]'}
                    flex-shrink-0 flex-col border-r transition-all duration-300
                    ${isDark ? 'bg-[#111] border-white/10' : 'bg-[#F8F9FA] border-gray-200'}
                `}>
                    <div className={`${isSourcesCollapsed ? 'p-2' : 'p-4'} flex flex-col h-full transition-all duration-300`}>
                        {isSourcesCollapsed ? (
                            <div className="flex flex-col items-center gap-4 py-4 h-full">
                                <button
                                    onClick={() => setIsSourcesCollapsed(false)}
                                    className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                                    title="Expand Sources"
                                >
                                    <PanelLeftOpen size={20} />
                                </button>
                                <div className={`w-8 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                <button
                                    className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                                    title="Sources"
                                >
                                    <FileText size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-medium text-gray-400 px-2 animate-in fade-in duration-300">Sources</h2>
                                    <button
                                        onClick={() => setIsSourcesCollapsed(true)}
                                        className={`hidden md:block p-2 text-gray-500 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                        title="Collapse Sources"
                                    >
                                        <PanelLeftClose size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-20 md:pb-0">
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={onFileSelect}
                                        className="hidden"
                                        accept=".pdf,.txt"
                                    />
                                    <button
                                        onClick={handleAddSource}
                                        className={`w-full py-4 px-4 rounded-2xl border border-dashed transition-all flex items-center justify-center gap-2 group ${isDark
                                            ? 'border-white/10 text-gray-500 hover:text-white hover:border-white/20 bg-white/5'
                                            : 'border-indigo-200 text-indigo-400 hover:text-indigo-600 hover:border-indigo-300 bg-indigo-50/50'
                                            }`}
                                    >
                                        <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-bold">Add sources</span>
                                    </button>

                                    <div className={`border rounded-2xl p-4 transition-colors ${isDark ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-indigo-50/50 border-indigo-100'}`}>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <span className="text-indigo-400 font-bold">Try Deep Research</span> for an in-depth report and new sources!
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search your sources"
                                            value={sourcesSearchTerm}
                                            onChange={(e) => setSourcesSearchTerm(e.target.value)}
                                            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm transition-all focus:ring-2 outline-none ${isDark
                                                ? 'bg-white/5 border-white/5 text-white placeholder:text-gray-600 focus:ring-indigo-500/20'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-600/10'
                                                }`}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between px-2 mb-2">
                                            <span className={`text-[10px] uppercase tracking-widest font-black ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Files ({files.length})</span>
                                            <button className="text-[10px] text-indigo-400 hover:underline font-bold">Select all</button>
                                        </div>
                                        <div className="space-y-1">
                                            {files.filter(f => f.name.toLowerCase().includes(sourcesSearchTerm.toLowerCase())).map((file, idx) => (
                                                <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl transition-all group relative cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-indigo-50'
                                                    }`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                                                        <FileText size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-bold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{file.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveFile(idx)}
                                                        className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded bg-transparent border-gray-300 accent-indigo-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>


                {/* CENTER COLUMN: CONTENT (CHAT OR MIND MAP) */}
                <div className={`
                    ${mobileTab === 'chat' ? 'flex w-full' : 'hidden'}
                    md:flex flex-col overflow-hidden flex-1 transition-colors duration-300
                    ${isDark ? 'bg-[#0d0d0d]' : 'bg-white shadow-inner shadow-gray-200/50'}
                `}>
                    {/* Scrollable Chat Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:px-12 md:py-8 custom-scrollbar relative">
                        {activeTool === "Mind Map" && flowchartStatus === 'completed' ? (
                            <div className="h-full">
                                <ExpandableMindMap
                                    data={flowcharts[0]}
                                    onRegenerate={() => triggerGeneration('flowchart', {}, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Reports" && reportStatus === 'completed' ? (
                            <div className="h-full">
                                <ReportViewer
                                    markdown={report}
                                    onRegenerate={() => triggerGeneration('report', {}, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Slide Deck" && slidesStatus === 'completed' ? (
                            <div className="h-full">
                                <SlideDeckViewer
                                    data={slides}
                                    onRegenerate={() => triggerGeneration('slides', {}, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Data Table" && tableStatus === 'completed' ? (
                            <div className="h-full">
                                <DataTableView
                                    data={table}
                                    onRegenerate={() => triggerGeneration('table', {}, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Flashcards" && cardsStatus === 'completed' ? (
                            <div className="h-full">
                                <FlashcardViewer
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Quiz" && quizStatus === 'completed' ? (
                            <div className="h-full">
                                <QuizIntroView onClose={() => setActiveTool(null)} />
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full space-y-8 pb-32">
                                {/* Deck Guide - Always at the top */}
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-2 text-center">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                            <BookOpen size={12} className="text-indigo-400" />
                                            <span>{files.length || 1} sources analyzed</span>
                                        </div>
                                        <h1 className={`text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b pb-2 ${isDark ? 'from-white to-white/60' : 'from-gray-900 to-gray-600'}`}>
                                            {(guide && guide.title) || deckName || "Untitled Deck"}
                                        </h1>
                                    </div>

                                    <div className={`backdrop-blur-xl border rounded-3xl p-8 relative overflow-hidden group transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]/80 border-white/10' : 'bg-white/80 border-gray-200 shadow-xl shadow-indigo-500/5'}`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${guide
                                                    ? (isDark ? 'bg-indigo-500/20 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600')
                                                    : (isDark ? 'bg-white/5 border-white/5 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400') + ' animate-pulse'
                                                    }`}>
                                                    {guide ? <Sparkles size={20} /> : <RotateCw size={20} className="animate-spin" />}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <h3 className={`text-sm font-medium uppercase tracking-widest ${isDark ? 'text-gray-200' : 'text-gray-500'}`}>Deck Intel</h3>
                                                    {guide ? (
                                                        <div className={`prose max-w-none ${isDark ? 'prose-invert prose-p:text-gray-300' : 'prose-p:text-gray-900 font-medium'}`}>
                                                            {guide.summary}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className={`h-4 rounded w-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                                                            <div className={`h-4 rounded w-5/6 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                                                            <div className={`h-4 rounded w-4/6 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {guide && (
                                                <div className={`flex items-center gap-2 pt-4 border-t pl-14 animate-in fade-in duration-500 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                    <button
                                                        onClick={handleCreateNew}
                                                        className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                                                        title="Clear & New"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className={`w-px h-4 mx-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                                    <div className="flex items-center gap-1">
                                                        <button className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                                                            <ThumbsUp size={16} />
                                                        </button>
                                                        <button className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
                                                            <ThumbsDown size={16} />
                                                        </button>
                                                        <button className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} onClick={() => saveNote(guide.summary)}>
                                                            <Bookmark size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Initial Suggested Questions (Only shown if no messages yet) */}
                                    {!messages.length && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {guide && guide.questions && guide.questions.length > 0 ? (
                                                guide.questions.slice(0, 3).map((q, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSendMessage(q)}
                                                        className={`p-4 rounded-xl border text-left transition-all group flex flex-col justify-between h-auto min-h-[120px] animate-in fade-in slide-in-from-bottom-2 ${isDark
                                                            ? 'bg-[#1a1a1a] border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                                                            : 'bg-white border-gray-200 hover:border-indigo-600/30 hover:bg-indigo-50 shadow-sm shadow-gray-200/50'
                                                            }`}
                                                        style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                                                    >
                                                        <span className={`text-sm group-hover:text-indigo-600 transition-colors line-clamp-3 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{q}</span>
                                                        <div className={`mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${isDark ? 'text-gray-500 group-hover:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                                                            <MessageSquare size={12} />
                                                            <span>Ask this</span>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                [1, 2, 3].map((_, i) => (
                                                    <div key={i} className={`p-4 rounded-xl border h-[120px] animate-pulse flex flex-col justify-between ${isDark ? 'bg-[#1a1a1a]/40 border-white/5' : 'bg-gray-100 border-gray-200'
                                                        }`}>
                                                        <div className="space-y-2">
                                                            <div className={`h-3 rounded w-3/4 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                                                            <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                                                        </div>
                                                        <div className={`h-2 rounded w-1/4 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Chat Messages */}
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg, i) => (
                                        <MemoizedChatMessage
                                            key={`msg-${i}`}
                                            msg={msg}
                                            isDark={isDark}
                                            isLastMessage={i === messages.length - 1}
                                            isChatLoading={isChatLoading}
                                            handleSendMessage={handleSendMessage}
                                            saveNote={saveNote}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </AnimatePresence>

                                {isThinking && (
                                    <div className="flex justify-start pl-2">
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
                                                </div>
                                            </div>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={thinkingStep}
                                                    initial={{ opacity: 0, x: 5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -5 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex items-center gap-2 text-gray-500"
                                                >
                                                    {(() => {
                                                        const Icon = thinkingStatuses[thinkingStep].icon;
                                                        return <Icon size={14} className="text-indigo-400" />;
                                                    })()}
                                                    <span className="text-[13px] font-medium italic">
                                                        {thinkingStatuses[thinkingStep].text}
                                                    </span>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Chat Input Footer */}
                    < div className={`
                        px-4 md:px-12 py-6 border-t
                        ${isDark ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-gray-100'}
                    `}>
                        <div className="max-w-3xl mx-auto">
                            <div className={`
                                    relative flex items-end gap-2 p-2 rounded-[28px] border transition-all shadow-2xl
                                    ${isListening ? 'bg-[#1a1a1a] border-red-500/30' : (isDark ? 'bg-[#1a1a1a] border-white/5 focus-within:border-white/10' : 'bg-gray-50 border-gray-200 focus-within:border-indigo-600/20')}
                                `}>
                                <button
                                    onClick={toggleListening}
                                    className={`
                                            w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 mb-0.5
                                            ${isListening
                                            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}
                                        `}
                                >
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>

                                <div className="flex-1 flex flex-col min-w-0 ml-1 mb-2">
                                    <textarea
                                        ref={chatInputRef}
                                        value={localInputValue}
                                        onChange={(e) => {
                                            setLocalInputValue(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        placeholder="Ask a question about your sources..."
                                        className={`w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-1 custom-scrollbar ${isDark ? 'text-gray-200 placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400'}`}
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (!localInputValue.trim() || isChatLoading) return;
                                                handleSendMessage(localInputValue);
                                                setLocalInputValue("");
                                                if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
                                            }
                                        }}
                                        style={{ height: '24px' }}
                                    />
                                </div>

                                <button
                                    disabled={!localInputValue.trim() || isChatLoading}
                                    onClick={() => {
                                        handleSendMessage(localInputValue);
                                        setLocalInputValue("");
                                        if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
                                    }}
                                    className={`
                                            w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 mb-0.5
                                            ${localInputValue.trim() && !isChatLoading
                                            ? (isDark ? "bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-black" : "bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-xl shadow-black/20")
                                            : (isDark ? "bg-white/5 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")}
                                        `}
                                >
                                    {isChatLoading ? <RotateCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                </button>
                            </div>
                            <p className={`text-[10px] text-center mt-2 font-bold uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                FlashDeck AI can be inaccurate; please double check.
                            </p>
                        </div>
                    </div >
                </div >

                {/* RIGHT COLUMN: STUDIO */}
                {/* RIGHT COLUMN: STUDIO */}
                <div className={`
                        ${mobileTab === 'studio' ? 'flex w-full' : 'hidden'}
                        md:flex flex-col transition-all duration-300 border-l relative z-20
                        ${isStudioCollapsed ? 'md:w-16' : 'md:w-[360px]'}
                        ${isDark ? 'bg-[#111] border-white/10' : 'bg-white/50 border-gray-200 shadow-xl shadow-gray-200/50 backdrop-blur-xl'}
                    `}>
                    {isStudioCollapsed ? (
                        <div className="flex flex-col items-center gap-4 py-4 h-full p-2">
                            <button
                                onClick={() => setIsStudioCollapsed(false)}
                                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                                title="Expand Studio"
                            >
                                <PanelRightOpen size={20} />
                            </button>
                            <div className={`w-8 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

                            {/* Always show Studio icon at top */}
                            <button
                                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                                title="Studio"
                                onClick={() => setIsStudioCollapsed(false)}
                            >
                                <Wand2 size={20} />
                            </button>
                            {/* Dynamic Icons for Generated Content */}
                            <div className="flex flex-col gap-2 mt-2 overflow-y-auto custom-scrollbar w-full items-center">
                                {cardsStatus === 'completed' && (
                                    <button
                                        onClick={() => {
                                            setActiveTool('Flashcards');
                                            if (window.innerWidth < 768) setMobileTab('content');
                                        }}
                                        className={`p-2 rounded-lg transition-all ${activeTool === 'Flashcards'
                                            ? 'bg-orange-500/10 text-orange-500'
                                            : isDark ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-400 hover:text-orange-500'}`}
                                        title="Flashcards"
                                    >
                                        <CreditCard size={18} />
                                    </button>
                                )}
                                {flowchartStatus === 'completed' && (
                                    <button
                                        onClick={() => {
                                            setActiveTool('Mind Map');
                                            if (window.innerWidth < 768) setMobileTab('content');
                                        }}
                                        className={`p-2 rounded-lg transition-all ${activeTool === 'Mind Map'
                                            ? 'bg-indigo-500/10 text-indigo-500'
                                            : isDark ? 'hover:bg-white/5 text-gray-500 hover:text-indigo-400' : 'hover:bg-gray-100 text-gray-400 hover:text-indigo-500'}`}
                                        title="Mind Map"
                                    >
                                        <Network size={18} />
                                    </button>
                                )}
                                {quizStatus === 'completed' && (
                                    <button
                                        onClick={() => {
                                            setActiveTool('Quiz');
                                            if (window.innerWidth < 768) setMobileTab('content');
                                        }}
                                        className={`p-2 rounded-lg transition-all ${activeTool === 'Quiz'
                                            ? 'bg-purple-500/10 text-purple-500'
                                            : isDark ? 'hover:bg-white/5 text-gray-500 hover:text-purple-400' : 'hover:bg-gray-100 text-gray-400 hover:text-purple-500'}`}
                                        title="Quiz"
                                    >
                                        <PieChart size={18} />
                                    </button>
                                )}
                                {reportStatus === 'completed' && report && (
                                    <button
                                        onClick={() => {
                                            setActiveTool('Reports');
                                            if (window.innerWidth < 768) setMobileTab('content');
                                        }}
                                        className={`p-2 rounded-lg transition-all ${activeTool === 'Reports'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : isDark ? 'hover:bg-white/5 text-gray-500 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-500'}`}
                                        title="Reports"
                                    >
                                        <FileText size={18} />
                                    </button>
                                )}
                                {slidesStatus === 'completed' && slides && slides.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setActiveTool('Slide Deck');
                                            if (window.innerWidth < 768) setMobileTab('content');
                                        }}
                                        className={`p-2 rounded-lg transition-all ${activeTool === 'Slide Deck'
                                            ? 'bg-orange-500/10 text-orange-500'
                                            : isDark ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-400 hover:text-orange-500'}`}
                                        title="Slide Deck"
                                    >
                                        <Presentation size={18} />
                                    </button>
                                )}
                                {tableStatus === 'completed' && table && table.rows && table.columns && (
                                    <button
                                        onClick={() => {
                                            setActiveTool('Data Table');
                                            if (window.innerWidth < 768) setMobileTab('content');
                                        }}
                                        className={`p-2 rounded-lg transition-all ${activeTool === 'Data Table'
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : isDark ? 'hover:bg-white/5 text-gray-500 hover:text-emerald-400' : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-500'}`}
                                        title="Data Table"
                                    >
                                        <Table size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col transition-all duration-300">
                            <div className={`p-5 md:p-6 border-b flex justify-between items-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                <div>
                                    <h2 className={`font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Wand2 size={18} className="text-indigo-500" />
                                        Studio
                                    </h2>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>AI-powered creation tools</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>
                                        Beta
                                    </div>
                                    <button
                                        onClick={() => setIsStudioCollapsed(true)}
                                        className={`hidden md:block p-2 text-gray-500 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                        title="Collapse Studio"
                                    >
                                        <PanelRightClose size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6 space-y-6 pb-20 md:pb-0">
                                {/* Featured Tool */}
                                {/* Unified Tool List */}
                                {/* Unified Tool List */}
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    {studioTools.map((tool) => {
                                        const colors = colorVariants[tool.color] || colorVariants.gray;

                                        return (
                                            <div
                                                key={tool.name}
                                                className={`p-6 rounded-3xl relative overflow-hidden group transition-all ${!tool.active ? 'opacity-60 cursor-not-allowed' : ''
                                                    } ${isDark
                                                        ? `bg-[#1a1a1a] border border-white/5 ${colors.borderDark}`
                                                        : `bg-white border border-gray-100 ${colors.borderLight} shadow-sm`
                                                    }`}
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
                                                    <tool.icon size={80} className={isDark ? 'text-white/5' : 'text-gray-100'} />
                                                </div>

                                                <div className="relative z-10">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`flex items-center gap-2 ${colors.text}`}>
                                                            <div className={`p-2 rounded-lg ${colors.bg}`}>
                                                                <tool.icon size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-wide">{tool.name}</span>
                                                            {tool.badge && (
                                                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${colors.badge} text-white`}>
                                                                    {tool.badge}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Optional Settings/Menu for Special Tools */}
                                                        {tool.isSpecial && tool.active && tool.modes && (
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); tool.setMenuOpen(!tool.menuOpen); }}
                                                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                                                                >
                                                                    <MoreHorizontal size={16} />
                                                                </button>

                                                                {tool.menuOpen && (
                                                                    <div className="absolute right-0 top-8 w-40 rounded-xl shadow-xl border py-1 z-50 animate-in fade-in zoom-in-95 overflow-hidden bg-[#1a1a1a] border-white/10">
                                                                        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Length / Tone</div>
                                                                        {tool.modes.map(m => (
                                                                            <button
                                                                                key={m}
                                                                                onClick={() => { tool.setMode(m); tool.setMenuOpen(false); }}
                                                                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${tool.mode === m ? `${colors.text} ${colors.bg}` : 'text-gray-300 hover:bg-white/5'}`}
                                                                            >
                                                                                <span className="capitalize">{m}</span>
                                                                                {tool.mode === m && <CheckCircle2 size={12} />}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <h3 className={`font-bold text-lg leading-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {tool.title}
                                                    </h3>
                                                    <p className={`text-xs mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {tool.description}
                                                        {tool.mode && tool.mode !== 'default' && (
                                                            <span className={`${colors.text} block mt-1`}>• Mode: {tool.mode}</span>
                                                        )}
                                                    </p>

                                                    {/* Hidden Audio for Special Tools */}
                                                    {tool.isSpecial && tool.url && (
                                                        <audio ref={tool.ref} src={tool.url} onEnded={() => tool.togglePlay()} />
                                                    )}

                                                    {/* Action Button */}
                                                    {tool.active ? (
                                                        <button
                                                            onClick={
                                                                tool.isSpecial
                                                                    ? (tool.status === 'completed' && tool.url ? tool.togglePlay : tool.onGenerate)
                                                                    : (tool.status === 'completed' ? tool.onView : tool.onGenerate)
                                                            }
                                                            disabled={tool.status === 'generating'}
                                                            className={`w-full py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${tool.status === 'completed'
                                                                ? (tool.isPlaying
                                                                    ? `${colors.btnSolid}`
                                                                    : `${colors.btnLight}`)
                                                                : (isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800')
                                                                }`}
                                                        >
                                                            {tool.status === 'generating' ? (
                                                                <>
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                    {generationSteps[tool.id] || 'Generating...'}
                                                                </>
                                                            ) : tool.status === 'completed' ? (
                                                                tool.isSpecial
                                                                    ? (tool.url
                                                                        ? (tool.isPlaying ? <><Pause size={14} /> Pause</> : <><PlayCircle size={14} /> Play</>)
                                                                        : <><MoreVertical size={14} /> Generate</>
                                                                    )
                                                                    : <><Maximize2 size={14} /> View Result</>
                                                            ) : (
                                                                <><MoreVertical size={14} /> Generate</>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button disabled className={`w-full py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                                                            Coming Soon
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                            </div>
                        </div>

                    )}
                </div>

            </div >

            {/* Mobile Bottom Navigation Bar */}
            < div className={`md:hidden h-16 border-t flex items-center justify-around z-50 px-2 safe-area-bottom ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
                <button
                    onClick={() => setMobileTab('sources')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${mobileTab === 'sources' ? 'text-indigo-400 bg-indigo-500/10' : `${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}`}
                >
                    <FileText size={20} />
                    <span className="text-[10px] font-medium">Sources</span>
                </button>
                <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${mobileTab === 'chat' ? 'text-indigo-400 bg-indigo-500/10' : `${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}`}
                >
                    <MessageSquare size={20} />
                    <span className="text-[10px] font-medium">Chat</span>
                </button>
                <button
                    onClick={() => setMobileTab('studio')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${mobileTab === 'studio' ? 'text-indigo-400 bg-indigo-500/10' : `${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}`}
                >
                    <Sparkles size={20} />
                    <span className="text-[10px] font-medium">Studio</span>
                </button>
            </div >
            <SavedNotesModal
                isOpen={isSavedNotesModalOpen}
                onClose={() => setIsSavedNotesModalOpen(false)}
                notes={savedNotes}
            />
            {
                settingsModalOpen && (
                    <GenerationSettingsModal
                        toolName={settingsTool}
                        onClose={() => setSettingsModalOpen(false)}
                        onGenerate={handleGenerateWithSettings}
                    />
                )
            }
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                deckName={deckName}
                isDark={isDark}
            />
        </div >
    );
}

const MemoizedChatMessage = memo(({ msg, isDark, isLastMessage, isChatLoading, handleSendMessage, saveNote }) => {
    // Local parsing logic for suggestions in assistant messages
    let cleanContent = msg.content;
    let suggestions = [];

    // Capture EVERYTHING from [SUGGESTIONS] to the end of the brackets, non-greedily
    const suggestionMatch = msg.content.match(/\[SUGGESTIONS\]:?\s*(\[[\s\S]*?\])/i);

    if (suggestionMatch) {
        try {
            let jsonStr = suggestionMatch[1]
                .trim()
                .replace(/,\s*\]$/, ']'); // Fix trailing comma

            suggestions = JSON.parse(jsonStr);

            // Clean content should remove the entire [SUGGESTIONS] block
            cleanContent = msg.content.replace(/\[SUGGESTIONS\]:?\s*\[[\s\S]*?\]/i, '').trim();
        } catch (e) {
            console.error("Failed to parse suggestions", e, suggestionMatch[1]);
            // Fallback: try to extract strings with regex if JSON parse fails
            const stringMatch = suggestionMatch[1].match(/"([^"]+)"/g);
            if (stringMatch) {
                suggestions = stringMatch.map(s => s.replace(/"/g, ''));
                cleanContent = msg.content.replace(/\[SUGGESTIONS\]:?\s*\[[\s\S]*?\]/i, '').trim();
            }
        }
    }

    // Determine if this message is actively streaming (assistant + last message + loading)
    const isStreaming = msg.role === 'assistant' && isLastMessage && isChatLoading;

    // Typing Effect State
    // If it's a new streaming message, start empty. Otherwise, show full content.
    // We use a ref to track if we've already started showing this message to avoid reset on re-renders
    const [displayedContent, setDisplayedContent] = useState(() => {
        if (isStreaming && msg.content.length < 50) return ''; // Only start typing if it sets fresh
        return cleanContent;
    });

    // Handle typing animation
    useEffect(() => {
        if (!isStreaming) {
            // Check if we need to catch up immediately when streaming stops
            if (displayedContent !== cleanContent) {
                setDisplayedContent(cleanContent);
            }
            return;
        }

        // If displayed content is definitely lagging behind clean content, type it out
        if (displayedContent.length < cleanContent.length) {
            // Typing speed: 50ms per character (User requested 5x slower)
            // 50ms ~ 20 chars/sec
            const timeout = setTimeout(() => {
                setDisplayedContent(cleanContent.slice(0, displayedContent.length + 1));
            }, 50);
            return () => clearTimeout(timeout);
        } else if (displayedContent.length > cleanContent.length) {
            // Handle case where content might shrink (rare, but good for stability)
            setDisplayedContent(cleanContent);
        }
    }, [cleanContent, displayedContent, isStreaming]);

    // Safety fallback: if the difference is too massive (e.g. pasted text), jump ahead
    useEffect(() => {
        // Increased buffer to 150 to allow for slower typing without constant jumping
        if (isStreaming && cleanContent.length - displayedContent.length > 150) {
            setDisplayedContent(cleanContent.slice(0, cleanContent.length - 5));
        }
    }, [cleanContent, displayedContent, isStreaming]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4"
        >
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[95%] md:max-w-[90%] rounded-3xl p-4 md:p-5 transition-all ${msg.role === 'user'
                    ? (isDark ? 'bg-indigo-600/10 text-white border border-indigo-500/20 shadow-lg shadow-black/20' : 'bg-[#FDF2F0] text-[#432C2C] border border-orange-200/50 shadow-sm shadow-orange-100/20')
                    : (isDark ? 'bg-transparent text-gray-300 chat-markdown' : 'bg-transparent text-gray-800 chat-markdown-light')
                    } ${isStreaming ? 'typing-cursor' : ''}`}> {/* Add typing-cursor class here */}
                    <ReactMarkdown
                        remarkPlugins={REMARK_PLUGINS}
                        rehypePlugins={REHYPE_PLUGINS}
                        components={{
                            strong: ({ node, ...props }) => <strong className={`font-bold ${isDark ? 'text-white/95' : 'text-gray-950'}`} {...props} />,
                            em: ({ node, ...props }) => <em className={`italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`} {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className={`border-l-2 pl-4 my-4 italic py-1 ${isDark ? 'border-indigo-500/50 text-gray-400 bg-indigo-500/5' : 'border-indigo-600/50 text-gray-700 bg-indigo-50'}`} {...props} />,
                            p: ({ node, ...props }) => <div className={`mb-4 last:mb-0 leading-relaxed text-[14px] md:text-[15px] ${isDark ? 'text-gray-300/90' : 'text-gray-900 font-medium'}`} {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                            li: ({ node, ...props }) => <li className={`text-[14px] md:text-[15px] ${isDark ? '' : 'text-gray-900'}`} {...props} />,
                            h1: ({ node, ...props }) => <h1 className={`text-xl md:text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                            h2: ({ node, ...props }) => <h2 className={`text-lg md:text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                            h3: ({ node, ...props }) => <h3 className={`text-base md:text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                            table: ({ node, ...props }) => (
                                <div className={`my-6 overflow-x-auto rounded-2xl border ${isDark ? 'border-white/10 bg-[#121212]' : 'border-gray-200 bg-gray-50'}`}>
                                    <table className="w-full text-left border-collapse text-sm" {...props} />
                                </div>
                            ),
                            thead: ({ node, ...props }) => <thead className={`${isDark ? 'bg-white/5 text-gray-200' : 'bg-gray-200 text-gray-900'} font-semibold`} {...props} />,
                            th: ({ node, ...props }) => <th className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-300'}`} {...props} />,
                            td: ({ node, ...props }) => <td className={`p-4 border-b ${isDark ? 'border-white/5 text-gray-400' : 'border-gray-200 text-gray-800'}`} {...props} />,
                            tr: ({ node, ...props }) => <tr className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`} {...props} />,
                            pre: ({ node, ...props }) => <pre className={`font-mono ${isDark ? 'text-gray-300 bg-[#121212] border-white/5' : 'text-gray-800 bg-gray-100 border-gray-200'} whitespace-pre-wrap p-4 rounded-2xl border my-4 overflow-x-auto custom-scrollbar`} {...props} />,
                            code: ({ node, inline, ...props }) => (
                                inline
                                    ? <span className={`font-mono ${isDark ? 'text-indigo-300 bg-indigo-500/10' : 'text-indigo-700 bg-indigo-100'} px-1.5 py-0.5 rounded text-xs`} {...props} />
                                    : <code className="block w-full" {...props} />
                            )
                        }}
                    >
                        {isStreaming ? displayedContent : cleanContent}
                    </ReactMarkdown>

                    {/* AIMessage Actions */}
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                            <button
                                onClick={() => navigator.clipboard.writeText(cleanContent)}
                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Copy"
                            >
                                <Copy size={14} />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Helpful">
                                <ThumbsUp size={14} />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Not Helpful">
                                <ThumbsDown size={14} />
                            </button>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <button
                                onClick={() => saveNote(cleanContent)}
                                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-gray-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            >
                                <Bookmark size={12} />
                                <span>Save to Note</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dynamic Suggestions for Assistant Messages */}
            {msg.role === 'assistant' && isLastMessage && !isChatLoading && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 pl-2">
                    {suggestions.map((q, j) => (
                        <button
                            key={j}
                            onClick={() => handleSendMessage(q)}
                            className={`px-4 py-2 rounded-full border text-xs transition-all flex items-center gap-2 ${isDark
                                ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5'
                                : 'bg-gray-100/50 border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50'
                                }`}
                        >
                            <MessageSquare size={12} className="text-indigo-400" />
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
});
