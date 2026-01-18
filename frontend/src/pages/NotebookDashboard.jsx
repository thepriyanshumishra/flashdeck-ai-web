import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDeck } from '../context/DeckContext';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
    FileText, MessageSquare, Mic, PlayCircle, BookOpen, Brain,
    CreditCard, PieChart, Sparkles, Plus, Search, MoreHorizontal,
    MoreVertical, ThumbsUp, ThumbsDown, Copy, Video,
    Network, Presentation, Table, Lock, PanelRightClose, PanelRightOpen,
    PanelLeftClose, PanelLeftOpen, RotateCw, CheckCircle2, Clock, Trash2,
    ChevronDown, Settings, Share2, BarChart2, Maximize2
} from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import MermaidEditor from '../components/MermaidEditor';
import ExpandableMindMap from '../components/ExpandableMindMap';

export default function NotebookDashboard() {
    const navigate = useNavigate();
    const [isStudioCollapsed, setIsStudioCollapsed] = useState(false);
    const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
    const [activeTool, setActiveTool] = useState("Chat");
    const [localInputValue, setLocalInputValue] = useState("");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const initialTriggeredRef = useRef(false);

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
        quiz, quizStatus
    } = useDeck();

    const handleCreateNew = () => {
        handleClearAll();
        navigate('/');
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
        if (generatedContent && !hasInitialChatRun && !initialTriggeredRef.current && messages.length === 0) {
            initialTriggeredRef.current = true;
            setHasInitialChatRun(true);
            handleSendMessage("Generate a Notebook Guide for these sources. Start with a clear title reflecting the content. Follow with a comprehensive summary of all documents in blockquote style. End with a horizontal line and 'Suggested Questions:' followed by 3 short questions to start the conversation.");
        }
    }, [generatedContent, hasInitialChatRun, messages.length, handleSendMessage, setHasInitialChatRun]);

    const studioTools = [
        { name: "Audio Overview", icon: Mic, active: false, badge: null },
        { name: "Video Overview", icon: Video, active: false, badge: "Soon" },
        {
            name: "Mind Map", icon: Network, active: true, badge: null,
            onClick: () => {
                setActiveTool("Mind Map");
                if (flowchartStatus === 'idle') triggerGeneration('flowchart');
            }
        },
        { name: "Reports", icon: FileText, active: false, badge: null },
        {
            name: "Flashcards", icon: CreditCard, active: true, badge: null,
            onClick: () => {
                // Now only triggers generation, stays on current view
                if (cardsStatus === 'idle') triggerGeneration('cards');
            }
        },
        {
            name: "Quiz", icon: PieChart, active: true, badge: null,
            onClick: () => {
                if (quizStatus === 'idle') triggerGeneration('quiz');
            }
        },
        { name: "Infographic", icon: PieChart, active: false, badge: null },
        { name: "Slide Deck", icon: Presentation, active: false, badge: null },
        { name: "Data Table", icon: Table, active: false, badge: null },
    ];

    return (
        <div className="h-screen bg-background text-gray-200 font-sans overflow-hidden flex flex-col">
            <Navbar />

            {/* Sub-header for Notebook Title & Actions */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <BookOpen size={18} className="text-indigo-400" />
                    </div>
                    <h1 className="text-sm font-medium text-white">{deckName || "Untitled Notebook"}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all text-xs border border-white/5"
                    >
                        <Plus size={14} /> Create notebook
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-white"><BarChart2 size={18} /></button>
                    <button className="p-1.5 text-gray-500 hover:text-white"><Share2 size={18} /></button>
                    <button className="p-1.5 text-gray-500 hover:text-white"><Settings size={18} /></button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-2"></div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT COLUMN: SOURCES */}
                <div className={`${isSourcesCollapsed ? 'w-14' : 'w-[320px]'} flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0a0a0a] transition-all duration-300 relative`}>
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            {!isSourcesCollapsed && <h2 className="text-sm font-medium text-gray-400 px-2">Sources</h2>}
                            <button
                                onClick={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
                                className={`p-2 text-gray-500 hover:text-white ${isSourcesCollapsed ? 'mx-auto' : ''}`}
                            >
                                {isSourcesCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                            </button>
                        </div>

                        {!isSourcesCollapsed && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
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
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-opacity"
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
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
                    <div className="flex-1 overflow-y-auto p-6 md:px-12 md:py-8 custom-scrollbar relative">
                        {activeTool === "Mind Map" && flowchartStatus === 'completed' ? (
                            <div className="h-full">
                                <ExpandableMindMap data={flowcharts[0]} />
                            </div>
                        ) : messages.length === 0 && !isChatLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center animate-float">
                                    <Brain className="text-indigo-400" size={40} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-semibold text-white mb-3">Your AI Study Buddy</h1>
                                    <p className="text-gray-500 leading-relaxed">Ask anything about your sources, or use the Studio tools to generate interactive learning materials.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">Summarize these docs</div>
                                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">Key takeaway points</div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full space-y-8 pb-32">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[90%] rounded-3xl p-5 ${msg.role === 'user'
                                            ? 'bg-indigo-600/10 text-white border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.05)]'
                                            : 'bg-transparent text-gray-300 chat-markdown'}`}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath, remarkGfm]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    strong: ({ ...props }) => <strong className="font-bold text-white/95" {...props} />,
                                                    em: ({ ...props }) => <em className="italic text-gray-400" {...props} />,
                                                    blockquote: ({ ...props }) => <blockquote className="border-l-2 border-indigo-500/50 pl-4 my-4 italic text-gray-400 bg-indigo-500/5 py-1" {...props} />,
                                                    p: ({ ...props }) => <p className="mb-4 last:mb-0 leading-relaxed text-[15px] text-gray-300/90" {...props} />,
                                                    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                                    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                                    li: ({ ...props }) => <li className="text-[15px]" {...props} />,
                                                    h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
                                                    h2: ({ ...props }) => <h2 className="text-xl font-bold mb-3 text-white" {...props} />,
                                                    h3: ({ ...props }) => <h3 className="text-lg font-bold mb-3 text-white" {...props} />,
                                                    table: ({ ...props }) => (
                                                        <div className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
                                                            <table className="w-full text-left border-collapse text-sm" {...props} />
                                                        </div>
                                                    ),
                                                    thead: ({ ...props }) => <thead className="bg-white/5 text-gray-200 font-semibold" {...props} />,
                                                    th: ({ ...props }) => <th className="p-4 border-b border-white/10" {...props} />,
                                                    td: ({ ...props }) => <td className="p-4 border-b border-white/5 text-gray-400" {...props} />,
                                                    tr: ({ ...props }) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                                                    code: ({ inline, ...props }) => (
                                                        inline
                                                            ? <span className="font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs" {...props} />
                                                            : <pre className="font-mono text-gray-300 whitespace-pre-wrap p-4 bg-[#121212] rounded-2xl border border-white/5 my-4" {...props} />
                                                    )
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                                {isThinking && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-3 text-indigo-400/80 bg-indigo-500/5 py-2 px-4 rounded-full border border-indigo-500/10">
                                            <RotateCw size={14} className="animate-spin" />
                                            <span className="text-xs font-medium tracking-wide italic">AI Tutor is deep thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center px-4">
                                    <input
                                        type="text"
                                        placeholder="Ask a question about your sources..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 py-3 text-sm"
                                        value={localInputValue}
                                        onChange={(e) => setLocalInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && localInputValue.trim() && !isChatLoading) {
                                                handleSendMessage(localInputValue);
                                                setLocalInputValue("");
                                            }
                                        }}
                                    />
                                    <div className="p-1 flex items-center gap-2">
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors"><Mic size={18} /></button>
                                        <button
                                            disabled={!localInputValue.trim() || isChatLoading}
                                            onClick={() => {
                                                handleSendMessage(localInputValue);
                                                setLocalInputValue("");
                                            }}
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${localInputValue.trim() && !isChatLoading
                                                ? "bg-white text-black hover:scale-105 active:scale-95 shadow-lg"
                                                : "bg-white/5 text-gray-600 cursor-not-allowed"
                                                }`}
                                        >
                                            <Sparkles size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-700 text-center mt-3 tracking-wider uppercase font-medium">NotebookLM can be inaccurate; please double check its responses.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: STUDIO */}
                <div className={`${isStudioCollapsed ? 'w-14' : 'w-[400px]'} flex-shrink-0 flex flex-col bg-[#0a0a0a] border-l border-white/5 transition-all duration-300`}>
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            {!isStudioCollapsed && <h2 className="text-sm font-medium text-gray-400 px-2">Studio</h2>}
                            <button
                                onClick={() => setIsStudioCollapsed(!isStudioCollapsed)}
                                className={`p-2 text-gray-500 hover:text-white ${isStudioCollapsed ? 'mx-auto' : ''}`}
                            >
                                {isStudioCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
                            </button>
                        </div>

                        {!isStudioCollapsed && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
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
                                            onClick={tool.onClick}
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
                                                <button onClick={() => navigate('/notebook/flashcards')} className="opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
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
                                                <button onClick={() => setActiveTool("Mind Map")} className="opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
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
                                                <button onClick={() => navigate('/notebook/quiz')} className="opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <PlayCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {cardsStatus !== 'completed' && flowchartStatus !== 'completed' && quizStatus !== 'completed' && (
                                            <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-gray-600">
                                                    <BookOpen size={24} />
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">No notes yet</p>
                                                <p className="text-[10px] text-gray-600 mt-1">Select a tool to generate</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 mb-4">Study Activity</h3>
                                    <div className="space-y-4 px-2">
                                        {cardsStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Generating Flashcards...</p>
                                                    <p className="text-[10px] text-gray-500">Processing concept associations</p>
                                                </div>
                                            </div>
                                        )}
                                        {flowchartStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Building Mind Map...</p>
                                                    <p className="text-[10px] text-gray-500">Mapping logical structures</p>
                                                </div>
                                            </div>
                                        )}
                                        {quizStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Creating Quiz...</p>
                                                    <p className="text-[10px] text-gray-500">Generating assessment</p>
                                                </div>
                                            </div>
                                        )}
                                        {cardsStatus === 'idle' && flowchartStatus === 'idle' && quizStatus === 'idle' && (
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
        </div>
    );
}
