import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
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
    Edit3, Loader2, Wand2
} from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import ExpandableMindMap from '../components/ExpandableMindMap';
import ReportViewer from '../components/ReportViewer';
import SlideDeckViewer from '../components/SlideDeckViewer';
import DataTableView from '../components/DataTableView';
import SavedNotesModal from '../components/SavedNotesModal';

export default function NotebookDashboard() {
    const navigate = useNavigate();
    const [isStudioCollapsed, setIsStudioCollapsed] = useState(false);
    const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
    const [activeTool, setActiveTool] = useState("Chat");
    const [localInputValue, setLocalInputValue] = useState("");
    const [isSavedNotesModalOpen, setIsSavedNotesModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [thinkingStep, setThinkingStep] = useState(0);

    const {
        files, setFiles, handleFilesAdded, handleRemoveFile,
        cards, setCards,
        flowcharts, setFlowcharts,
        deckName, setDeckName,
        generatedContent, setGeneratedContent,
        cardsStatus, flowchartStatus,
        triggerGeneration,
        messages, setMessages,
        isChatLoading, setIsChatLoading,
        isThinking, setIsThinking,
        handleSendMessage,
        hasInitialChatRun, setHasInitialChatRun,
        handleClearAll,
        quiz, quizStatus,
        report, reportStatus,
        slides, slidesStatus,
        table, tableStatus,
        guide, guideStatus, savedNotes, saveNote,
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

    const handleCreateNew = () => {
        handleClearAll();
        navigate('/');
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
            // In a real app, we would upload these and append their text to generatedContent
            // For now, let's just show a notification or chat message
            handleSendMessage(`I've added ${newFiles.length} more source(s). Please process them!`);
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

    const studioTools = [
        { name: "Audio Overview", icon: Mic, active: false, badge: null },
        { name: "Video Overview", icon: Video, active: false, badge: "Soon" },
        {
            name: "Mind Map", icon: Network, active: true, badge: null,
            onClick: () => {
                if (flowchartStatus !== 'generating') triggerGeneration('flowchart');
            }
        },
        {
            name: "Reports", icon: FileText, active: true, badge: null,
            onClick: () => {
                if (reportStatus !== 'generating') triggerGeneration('report');
            }
        },
        {
            name: "Flashcards", icon: CreditCard, active: true, badge: null,
            onClick: () => {
                if (cardsStatus !== 'generating') triggerGeneration('cards');
            }
        },
        {
            name: "Quiz", icon: PieChart, active: true, badge: null,
            onClick: () => {
                if (quizStatus !== 'generating') triggerGeneration('quiz');
            }
        },
        {
            name: "Slide Deck", icon: Presentation, active: true, badge: null,
            onClick: () => {
                if (slidesStatus !== 'generating') triggerGeneration('slides');
            }
        },
        {
            name: "Data Table", icon: Table, active: true, badge: null,
            onClick: () => {
                if (tableStatus !== 'generating') triggerGeneration('table');
            }
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

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                // setIsListening(false); 
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
        <div className="h-screen bg-background text-gray-200 font-sans overflow-hidden flex flex-col">
            <Navbar />

            {/* Sub-header for Notebook Title & Actions */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center hidden sm:flex">
                        <BookOpen size={18} className="text-indigo-400" />
                    </div>
                    {/* Mobile Only Logo/Icon replacement since BookOpen is hidden on mobile */}
                    <div className="md:hidden w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Brain size={18} className="text-indigo-400" />
                    </div>
                    <h1 className="text-sm font-medium text-white max-w-[200px] truncate">{deckName || "Untitled Notebook"}</h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-3">
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all text-xs border border-white/5 whitespace-nowrap"
                    >
                        <Plus size={14} /> <span className="hidden sm:inline">Create notebook</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-3">
                        <button className="p-1.5 text-gray-500 hover:text-white"><BarChart2 size={18} /></button>
                        <button className="p-1.5 text-gray-500 hover:text-white"><Share2 size={18} /></button>
                        <button className="p-1.5 text-gray-500 hover:text-white"><Settings size={18} /></button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-2"></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT COLUMN: SOURCES */}
                <div className={`
                    ${mobileTab === 'sources' ? 'flex w-full absolute inset-0 z-30 bg-[#0a0a0a] md:static' : 'hidden md:flex'}
                    ${isSourcesCollapsed ? 'md:w-14' : 'md:w-[320px] md:bg-transparent'}
                    flex-shrink-0 flex-col border-r border-white/5 transition-all duration-300
                `}>
                    <div className={`${isSourcesCollapsed ? 'p-2' : 'p-4'} flex flex-col h-full transition-all duration-300`}>
                        <div className={`flex items-center ${isSourcesCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                            {!isSourcesCollapsed && <h2 className="text-sm font-medium text-gray-400 px-2 animate-in fade-in duration-300">Sources</h2>}
                            {/* Hide collapse toggle on mobile since we use tabs */}
                            <button
                                onClick={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
                                className="hidden md:block p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                {isSourcesCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                            </button>
                        </div>

                        {!isSourcesCollapsed && (
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
                                    className="w-full py-4 px-4 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 bg-white/5 group"
                                >
                                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-sm">Add sources</span>
                                </button>

                                <div className="bg-[#1a1a1a]/50 border border-white/5 rounded-2xl p-4">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <span className="text-indigo-400 font-medium">Try Deep Research</span> for an in-depth report and new sources!
                                    </p>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search your sources"
                                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between px-2 mb-2">
                                        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Files ({files.length})</span>
                                        <button className="text-[10px] text-indigo-400 hover:underline">Select all</button>
                                    </div>
                                    <div className="space-y-1">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 group relative">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-300 truncate">{file.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(idx)}
                                                    className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded bg-transparent border-white/20 accent-indigo-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER COLUMN: CONTENT (CHAT OR MIND MAP) */}
                <div className={`
                    ${mobileTab === 'chat' ? 'flex w-full' : 'hidden'}
                    md:flex flex-col overflow-hidden bg-[#0d0d0d] flex-1
                `}>
                    <div className="flex-1 overflow-y-auto p-4 md:px-12 md:py-8 custom-scrollbar relative">
                        {activeTool === "Mind Map" && flowchartStatus === 'completed' ? (
                            <div className="h-full">
                                <ExpandableMindMap
                                    data={flowcharts[0]}
                                    onRegenerate={() => triggerGeneration('flowchart', null, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Reports" && reportStatus === 'completed' ? (
                            <div className="h-full">
                                <ReportViewer
                                    markdown={report}
                                    onRegenerate={() => triggerGeneration('report', null, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Slide Deck" && slidesStatus === 'completed' ? (
                            <div className="h-full">
                                <SlideDeckViewer
                                    data={slides}
                                    onRegenerate={() => triggerGeneration('slides', null, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Data Table" && tableStatus === 'completed' ? (
                            <div className="h-full">
                                <DataTableView
                                    data={table}
                                    onRegenerate={() => triggerGeneration('table', null, true)}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full space-y-8 pb-32">
                                {/* Notebook Guide - Always at the top */}
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-2 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">
                                            <BookOpen size={12} className="text-indigo-400" />
                                            <span>{files.length || 1} sources analyzed</span>
                                        </div>
                                        <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
                                            {(guide && guide.title) || deckName || "Untitled Notebook"}
                                        </h1>
                                    </div>

                                    <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${guide ? 'bg-indigo-500/20 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-600 animate-pulse'}`}>
                                                    {guide ? <Sparkles size={20} /> : <RotateCw size={20} className="animate-spin" />}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <h3 className="text-sm font-medium text-gray-200 uppercase tracking-widest">Notebook Guide</h3>
                                                    {guide ? (
                                                        <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed max-w-none">
                                                            {guide.summary}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="h-4 bg-white/5 rounded w-full animate-pulse"></div>
                                                            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
                                                            <div className="h-4 bg-white/5 rounded w-4/6 animate-pulse"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {guide && (
                                                <div className="flex items-center gap-2 pt-4 border-t border-white/5 pl-14 animate-in fade-in duration-500">
                                                    <button
                                                        onClick={handleCreateNew}
                                                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                                        title="Clear & New"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="w-px h-4 bg-white/10 mx-2" />
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors">
                                                            <ThumbsUp size={16} />
                                                        </button>
                                                        <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                                                            <ThumbsDown size={16} />
                                                        </button>
                                                        <button className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors" onClick={() => saveNote(guide.summary)}>
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
                                                        className="p-4 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-left transition-all group flex flex-col justify-between h-auto min-h-[100px] animate-in fade-in slide-in-from-bottom-2"
                                                        style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                                                    >
                                                        <span className="text-sm text-gray-300 group-hover:text-white line-clamp-3">{q}</span>
                                                        <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 font-medium group-hover:text-indigo-400">
                                                            <MessageSquare size={12} />
                                                            <span>Ask this</span>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                [1, 2, 3].map((_, i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-[#1a1a1a]/40 border border-white/5 h-[120px] animate-pulse flex flex-col justify-between">
                                                        <div className="space-y-2">
                                                            <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                                        </div>
                                                        <div className="h-2 bg-white/5 rounded w-1/4"></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Chat Messages */}
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg, i) => {
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

                                        const isLastMessage = i === messages.length - 1;

                                        return (
                                            <motion.div
                                                key={`msg-${i}`}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className="space-y-4"
                                            >
                                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[95%] md:max-w-[90%] rounded-3xl p-4 md:p-5 ${msg.role === 'user'
                                                        ? 'bg-indigo-600/10 text-white border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.05)]'
                                                        : 'bg-transparent text-gray-300 chat-markdown'}`}>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkMath, remarkGfm]}
                                                            rehypePlugins={[rehypeKatex]}
                                                            components={{
                                                                strong: ({ node, ...props }) => <strong className="font-bold text-white/95" {...props} />,
                                                                em: ({ node, ...props }) => <em className="italic text-gray-400" {...props} />,
                                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-indigo-500/50 pl-4 my-4 italic text-gray-400 bg-indigo-500/5 py-1" {...props} />,
                                                                // Use div instead of p to avoid "pre inside p" hydration errors if the model outputs code blocks inside paragraphs
                                                                p: ({ node, ...props }) => <div className="mb-4 last:mb-0 leading-relaxed text-[14px] md:text-[15px] text-gray-300/90" {...props} />,
                                                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                                                li: ({ node, ...props }) => <li className="text-[14px] md:text-[15px]" {...props} />,
                                                                h1: ({ node, ...props }) => <h1 className="text-xl md:text-2xl font-bold mb-4 text-white" {...props} />,
                                                                h2: ({ node, ...props }) => <h2 className="text-lg md:text-xl font-bold mb-3 text-white" {...props} />,
                                                                h3: ({ node, ...props }) => <h3 className="text-base md:text-lg font-bold mb-3 text-white" {...props} />,
                                                                table: ({ node, ...props }) => (
                                                                    <div className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
                                                                        <table className="w-full text-left border-collapse text-sm" {...props} />
                                                                    </div>
                                                                ),
                                                                thead: ({ node, ...props }) => <thead className="bg-white/5 text-gray-200 font-semibold" {...props} />,
                                                                th: ({ node, ...props }) => <th className="p-4 border-b border-white/10" {...props} />,
                                                                td: ({ node, ...props }) => <td className="p-4 border-b border-white/5 text-gray-400" {...props} />,
                                                                tr: ({ node, ...props }) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                                                                pre: ({ node, ...props }) => <pre className="font-mono text-gray-300 whitespace-pre-wrap p-4 bg-[#121212] rounded-2xl border border-white/5 my-4 overflow-x-auto custom-scrollbar" {...props} />,
                                                                code: ({ node, inline, ...props }) => (
                                                                    inline
                                                                        ? <span className="font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs" {...props} />
                                                                        : <code className="block w-full" {...props} />
                                                                )
                                                            }}
                                                        >
                                                            {cleanContent}
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
                                                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center gap-2"
                                                            >
                                                                <MessageSquare size={12} className="text-indigo-400" />
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
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

                    {/* Floating Chat Input */}
                    <div className={`fixed bottom-[72px] md:bottom-6 left-0 right-0 px-4 z-40 transition-all duration-300 ${mobileTab === 'chat' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto'}`}>
                        <div className="max-w-3xl mx-auto w-full">
                            <div className={`
                                flex items-end gap-2 p-2 rounded-[32px] border transition-all duration-300 shadow-2xl
                                ${isListening ? 'bg-[#1a1a1a] border-red-500/30' : 'bg-[#1a1a1a]/80 backdrop-blur-xl border-white/10 hover:border-white/20'}
                            `}>
                                <button
                                    onClick={toggleListening}
                                    className={`
                                        w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                                        ${isListening
                                            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}
                                    `}
                                >
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>

                                <div className="flex-1 py-3">
                                    <textarea
                                        ref={chatInputRef}
                                        placeholder={isListening ? "Listening..." : "Ask anything..."}
                                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-gray-500 text-base resize-none max-h-32 py-0 custom-scrollbar leading-6"
                                        rows={1}
                                        value={localInputValue}
                                        onChange={(e) => {
                                            setLocalInputValue(e.target.value);
                                            // Auto-resize logic inside onChange as we check scrollHeight immediately
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey && localInputValue.trim() && !isChatLoading) {
                                                e.preventDefault();
                                                handleSendMessage(localInputValue);
                                                setLocalInputValue("");
                                                // Reset height after sending
                                                if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
                                            }
                                        }}
                                        style={{ height: '24px' }} // Initial height
                                    />
                                </div>

                                <button
                                    disabled={!localInputValue.trim() || isChatLoading}
                                    onClick={() => {
                                        handleSendMessage(localInputValue);
                                        setLocalInputValue("");
                                    }}
                                    className={`
                                        w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                                        ${localInputValue.trim() && !isChatLoading
                                            ? "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            : "bg-white/5 text-gray-600 cursor-not-allowed"}
                                    `}
                                >
                                    {isChatLoading ? <RotateCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 text-center mt-2 font-medium tracking-wide">
                                NotebookLM can be inaccurate; please double check.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: STUDIO */}
                <div className={`
                    ${mobileTab === 'studio' ? 'flex w-full absolute inset-0 z-30 bg-[#0a0a0a] md:static' : 'hidden md:flex'}
                    ${isStudioCollapsed ? 'md:w-14' : 'md:w-[400px] md:bg-transparent'}
                    flex-shrink-0 flex-col border-l border-white/5 transition-all duration-300
                `}>
                    <div className={`${isStudioCollapsed ? 'p-2' : 'p-4'} flex flex-col h-full transition-all duration-300`}>
                        <div className={`flex items-center ${isStudioCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                            {!isStudioCollapsed && <h2 className="text-sm font-medium text-gray-400 px-2 animate-in fade-in duration-300">Studio</h2>}
                            {/* Hide collapse toggle on mobile */}
                            <button
                                onClick={() => setIsStudioCollapsed(!isStudioCollapsed)}
                                className="hidden md:block p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                {isStudioCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
                            </button>
                        </div>

                        {!isStudioCollapsed && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-20 md:pb-0">
                                <div className="bg-indigo-600 rounded-2xl p-4 relative overflow-hidden flex-shrink-0 shadow-lg shadow-indigo-500/10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                                    <p className="text-white/80 text-xs mb-1">Create an Audio Overview in:</p>
                                    <h3 className="text-white font-medium text-sm mb-3">हिन्दी, বাংলা, ગુજરાતી, ಕನ್ನಡ, മലയാളം, मराठी, ਪੰਜਾਬੀ, தமிழ், తెలుగు</h3>
                                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl transition-all border border-white/10">
                                        Customize
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {studioTools.map((tool, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                tool.onClick && tool.onClick();
                                                // On mobile, just perform action, no need to collapse studio since it's a tab
                                            }}
                                            className={`p-4 rounded-2xl border border-white/5 flex flex-col gap-4 transition-all relative overflow-hidden group shadow-sm ${tool.active ? 'bg-[#151515] hover:bg-[#1a1a1a] cursor-pointer' : 'bg-[#0d0d0d] opacity-40 cursor-not-allowed'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tool.active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-gray-600'}`}>
                                                    <tool.icon size={16} />
                                                </div>
                                                {tool.active && <div className="p-1 rounded-full bg-white/5"><MoreHorizontal size={12} className="text-gray-600" /></div>}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-semibold ${tool.active ? 'text-gray-200' : 'text-gray-500'}`}>{tool.name}</span>
                                                {tool.badge && <span className="text-[10px] text-gray-600 font-medium">{tool.badge}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 mt-8">
                                    <h3 className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2">Generated Notes</h3>
                                    <div className="space-y-3">
                                        {cardsStatus === 'completed' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Study Flashcards</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">{cards.length} cards • Ready to review</p>
                                                </div>
                                                <button onClick={() => navigate('/notebook/flashcards')} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <PlayCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {flowchartStatus === 'completed' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                                    <Network size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Interactive Mind Map</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">Concept hierarchy generated</p>
                                                </div>
                                                <button onClick={() => {
                                                    setActiveTool("Mind Map");
                                                    setMobileTab('chat');
                                                }} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <Maximize2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {quizStatus === 'completed' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0">
                                                    <Brain size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Interactive Quiz</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">{quiz.length} questions • Ready to test</p>
                                                </div>
                                                <button onClick={() => navigate('/notebook/quiz')} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <PlayCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {reportStatus === 'completed' && report && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Deep Research Report</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">Comprehensive analysis ready</p>
                                                </div>
                                                <button onClick={() => {
                                                    setActiveTool("Reports");
                                                    setMobileTab('chat');
                                                }} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <Maximize2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {slidesStatus === 'completed' && slides && slides.length > 0 && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                                    <Presentation size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Slide Deck</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">{slides.length} slides • Ready to present</p>
                                                </div>
                                                <button onClick={() => {
                                                    setActiveTool("Slide Deck");
                                                    setMobileTab('chat');
                                                }} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <PlayCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {tableStatus === 'completed' && table && table.rows && table.columns && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                                                    <Table size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Data Table</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">Structured data extracted</p>
                                                </div>
                                                <button onClick={() => {
                                                    setActiveTool("Data Table");
                                                    setMobileTab('chat');
                                                }} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <Maximize2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {cardsStatus !== 'completed' && flowchartStatus !== 'completed' && quizStatus !== 'completed' &&
                                            reportStatus !== 'completed' && slidesStatus !== 'completed' && tableStatus !== 'completed' && (
                                                <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-gray-600">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">No notes yet</p>
                                                    <button
                                                        onClick={handleGenerateAll}
                                                        className="mt-3 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-medium rounded-lg transition-all border border-indigo-500/10"
                                                    >
                                                        ✨ Generate All
                                                    </button>
                                                </div>
                                            )}
                                    </div>
                                </div>



                                <div className="space-y-3 mt-8">
                                    <h3 className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2">Saved Notes</h3>
                                    <div
                                        onClick={() => setIsSavedNotesModalOpen(true)}
                                        className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-indigo-500/20 transition-all group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                                            <Bookmark size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-medium text-gray-200 mb-1">Explore Saved Notes</h4>
                                            <p className="text-[10px] text-gray-500 truncate">{savedNotes.length} notes captured from chat</p>
                                        </div>
                                        <button className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                            <Maximize2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 mb-4">Study Activity</h3>
                                    <div className="space-y-4 px-2">
                                        {cardsStatus === 'generating' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex flex-col gap-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-white/5 rounded w-24"></div>
                                                        <div className="h-2 bg-white/5 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {flowchartStatus === 'generating' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex flex-col gap-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-white/5 rounded w-24"></div>
                                                        <div className="h-2 bg-white/5 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {quizStatus === 'generating' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex flex-col gap-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-white/5 rounded w-24"></div>
                                                        <div className="h-2 bg-white/5 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {reportStatus === 'generating' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex flex-col gap-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-white/5 rounded w-32"></div>
                                                        <div className="h-2 bg-white/5 rounded w-20"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {slidesStatus === 'generating' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex flex-col gap-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-white/5 rounded w-24"></div>
                                                        <div className="h-2 bg-white/5 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {tableStatus === 'generating' && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex flex-col gap-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-white/5 rounded w-24"></div>
                                                        <div className="h-2 bg-white/5 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {cardsStatus === 'idle' && flowchartStatus === 'idle' && quizStatus === 'idle' &&
                                            reportStatus === 'idle' && slidesStatus === 'idle' && tableStatus === 'idle' && (
                                                <div className="flex items-center gap-3 opacity-30">
                                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                                                        <Clock size={14} />
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-500 italic">No background tasks</p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden h-16 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-around z-50 px-2 safe-area-bottom">
                <button
                    onClick={() => setMobileTab('sources')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${mobileTab === 'sources' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <FileText size={20} />
                    <span className="text-[10px] font-medium">Sources</span>
                </button>
                <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${mobileTab === 'chat' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <MessageSquare size={20} />
                    <span className="text-[10px] font-medium">Chat</span>
                </button>
                <button
                    onClick={() => setMobileTab('studio')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${mobileTab === 'studio' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Sparkles size={20} />
                    <span className="text-[10px] font-medium">Studio</span>
                </button>
            </div>
            <SavedNotesModal
                isOpen={isSavedNotesModalOpen}
                onClose={() => setIsSavedNotesModalOpen(false)}
                notes={savedNotes}
            />
        </div>
    );
}

