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
    ChevronDown, Settings, Share2, BarChart2, Maximize2, MicOff
} from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import MermaidEditor from '../components/MermaidEditor';
import ExpandableMindMap from '../components/ExpandableMindMap';
import ReportViewer from '../components/ReportViewer';
import SlideDeckViewer from '../components/SlideDeckViewer';
import DataTableView from '../components/DataTableView';
import InfographicViewer from '../components/InfographicViewer';

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
        quiz, quizStatus,
        report, reportStatus,
        slides, slidesStatus,
        table, tableStatus,
        infographic, infographicStatus
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
            name: "Infographic", icon: PieChart, active: true, badge: null,
            onClick: () => {
                if (infographicStatus !== 'generating') triggerGeneration('infographic');
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
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-medium text-gray-400 px-2">Sources</h2>
                            {/* Hide collapse toggle on mobile since we use tabs */}
                            <button
                                onClick={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
                                className="hidden md:block p-2 text-gray-500 hover:text-white"
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
                                    onRegenerate={() => triggerGeneration('flowchart')}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Reports" && reportStatus === 'completed' ? (
                            <div className="h-full">
                                <ReportViewer
                                    markdown={report}
                                    onRegenerate={() => triggerGeneration('report')}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Slide Deck" && slidesStatus === 'completed' ? (
                            <div className="h-full">
                                <SlideDeckViewer
                                    data={slides}
                                    onRegenerate={() => triggerGeneration('slides')}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Data Table" && tableStatus === 'completed' ? (
                            <div className="h-full">
                                <DataTableView
                                    data={table}
                                    onRegenerate={() => triggerGeneration('table')}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : activeTool === "Infographic" && infographicStatus === 'completed' ? (
                            <div className="h-full">
                                <InfographicViewer
                                    code={infographic}
                                    onRegenerate={() => triggerGeneration('infographic')}
                                    onClose={() => setActiveTool(null)}
                                />
                            </div>
                        ) : messages.length === 0 && !isChatLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 px-4">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center animate-float">
                                    <Brain className="text-indigo-400" size={40} />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">Your AI Study Buddy</h1>
                                    <p className="text-gray-500 leading-relaxed text-sm md:text-base">Ask anything about your sources, or use the Studio tools to generate interactive learning materials.</p>
                                </div>
                                <div className="flex gap-4 flex-wrap justify-center">
                                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">Summarize these docs</div>
                                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">Key takeaway points</div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full space-y-6 md:space-y-8 pb-32">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[95%] md:max-w-[90%] rounded-3xl p-4 md:p-5 ${msg.role === 'user'
                                            ? 'bg-indigo-600/10 text-white border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.05)]'
                                            : 'bg-transparent text-gray-300 chat-markdown'}`}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath, remarkGfm]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    strong: ({ ...props }) => <strong className="font-bold text-white/95" {...props} />,
                                                    em: ({ ...props }) => <em className="italic text-gray-400" {...props} />,
                                                    blockquote: ({ ...props }) => <blockquote className="border-l-2 border-indigo-500/50 pl-4 my-4 italic text-gray-400 bg-indigo-500/5 py-1" {...props} />,
                                                    p: ({ ...props }) => <p className="mb-4 last:mb-0 leading-relaxed text-[14px] md:text-[15px] text-gray-300/90" {...props} />,
                                                    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                                    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                                    li: ({ ...props }) => <li className="text-[14px] md:text-[15px]" {...props} />,
                                                    h1: ({ ...props }) => <h1 className="text-xl md:text-2xl font-bold mb-4 text-white" {...props} />,
                                                    h2: ({ ...props }) => <h2 className="text-lg md:text-xl font-bold mb-3 text-white" {...props} />,
                                                    h3: ({ ...props }) => <h3 className="text-base md:text-lg font-bold mb-3 text-white" {...props} />,
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
                                                            : <pre className="font-mono text-gray-300 whitespace-pre-wrap p-4 bg-[#121212] rounded-2xl border border-white/5 my-4 overflow-x-auto" {...props} />
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
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-medium text-gray-400 px-2">Studio</h2>
                            {/* Hide collapse toggle on mobile */}
                            <button
                                onClick={() => setIsStudioCollapsed(!isStudioCollapsed)}
                                className="hidden md:block p-2 text-gray-500 hover:text-white"
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
                                        {infographicStatus === 'completed' && infographic && (
                                            <div className="p-4 rounded-2xl bg-[#151515] border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 flex-shrink-0">
                                                    <PieChart size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-200 mb-1">Infographic</h4>
                                                    <p className="text-[10px] text-gray-500 truncate">Visual data representation</p>
                                                </div>
                                                <button onClick={() => {
                                                    setActiveTool("Infographic");
                                                    setMobileTab('chat');
                                                }} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all">
                                                    <Maximize2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {cardsStatus !== 'completed' && flowchartStatus !== 'completed' && quizStatus !== 'completed' &&
                                            reportStatus !== 'completed' && slidesStatus !== 'completed' && tableStatus !== 'completed' && infographicStatus !== 'completed' && (
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
                                        {reportStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Researching Report...</p>
                                                    <p className="text-[10px] text-gray-500">Analyzing deep context</p>
                                                </div>
                                            </div>
                                        )}
                                        {slidesStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Designing Slides...</p>
                                                    <p className="text-[10px] text-gray-500">Structuring presentation</p>
                                                </div>
                                            </div>
                                        )}
                                        {tableStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Extracting Data...</p>
                                                    <p className="text-[10px] text-gray-500">Formatting table rows</p>
                                                </div>
                                            </div>
                                        )}
                                        {infographicStatus === 'generating' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                                                    <RotateCw className="animate-spin" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-300">Drawing Infographic...</p>
                                                    <p className="text-[10px] text-gray-500">Visualizing data points</p>
                                                </div>
                                            </div>
                                        )}

                                        {cardsStatus === 'idle' && flowchartStatus === 'idle' && quizStatus === 'idle' &&
                                            reportStatus === 'idle' && slidesStatus === 'idle' && tableStatus === 'idle' && infographicStatus === 'idle' && (
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
        </div>
    );
}
