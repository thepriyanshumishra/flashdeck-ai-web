import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DeckContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const safeLocalStorage = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn('LocalStorage quota exceeded. Clearing old data...');
                // Simple strategy: Clear everything if we're full. 
                // In a real app we'd be more surgical.
                localStorage.clear();
                try {
                    localStorage.setItem(key, value);
                } catch (innerE) {
                    console.error('Failed to set item even after clear:', innerE);
                }
            }
        }
    },
    getItem: (key) => localStorage.getItem(key),
    removeItem: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear()
};

export function DeckProvider({ children }) {
    const initialDeckName = localStorage.getItem('last_deck_name') || "";
    const initialGeneratedContent = localStorage.getItem('last_generated_content') || "";

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deckName, setDeckName] = useState(initialDeckName);
    const [generatedContent, setGeneratedContent] = useState(initialGeneratedContent);

    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem(`cards_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [flowcharts, setFlowcharts] = useState(() => {
        const saved = localStorage.getItem(`flowcharts_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [deckId, setDeckId] = useState(() => localStorage.getItem('last_deck_id') || null);
    const [selectedCard, setSelectedCard] = useState(null);

    // Status tracking for lazy generation
    const [cardsStatus, setCardsStatus] = useState(() => localStorage.getItem(`cardsStatus_${initialDeckName}`) || 'idle');
    const [flowchartStatus, setFlowchartStatus] = useState(() => localStorage.getItem(`flowchartStatus_${initialDeckName}`) || 'idle');

    // Chat persistence
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`messages_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [hasInitialChatRun, setHasInitialChatRun] = useState(() => localStorage.getItem(`hasInitialChatRun_${initialDeckName}`) === 'true');

    // Quiz and Review States
    const [quiz, setQuiz] = useState(() => {
        const saved = localStorage.getItem(`quiz_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [quizStatus, setQuizStatus] = useState(() => localStorage.getItem(`quizStatus_${initialDeckName}`) || 'idle');
    const [reviewCards, setReviewCards] = useState(() => {
        const saved = localStorage.getItem(`reviewCards_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });

    // New Studio Features State
    const [report, setReport] = useState(() => localStorage.getItem(`report_${initialDeckName}`) || "");
    const [reportStatus, setReportStatus] = useState(() => localStorage.getItem(`reportStatus_${initialDeckName}`) || 'idle');

    const [slides, setSlides] = useState(() => {
        const saved = localStorage.getItem(`slides_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [slidesStatus, setSlidesStatus] = useState(() => localStorage.getItem(`slidesStatus_${initialDeckName}`) || 'idle');

    const [table, setTable] = useState(() => {
        const saved = localStorage.getItem(`table_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [tableStatus, setTableStatus] = useState(() => localStorage.getItem(`tableStatus_${initialDeckName}`) || 'idle');

    // Guide and Saved Notes
    const [guide, setGuide] = useState(() => {
        const saved = localStorage.getItem(`guide_${initialDeckName}`);
        return saved ? JSON.parse(saved) : null;
    });
    const [guideStatus, setGuideStatus] = useState(() => localStorage.getItem(`guideStatus_${initialDeckName}`) || 'idle');
    const [savedNotes, setSavedNotes] = useState(() => {
        const saved = localStorage.getItem(`savedNotes_${initialDeckName}`);
        return saved ? JSON.parse(saved) : [];
    });


    // Persist to localStorage
    useEffect(() => {
        if (deckName) {
            safeLocalStorage.setItem('last_deck_name', deckName);
            safeLocalStorage.setItem(`messages_${deckName}`, JSON.stringify(messages));
            safeLocalStorage.setItem(`cards_${deckName}`, JSON.stringify(cards));
            safeLocalStorage.setItem(`flowcharts_${deckName}`, JSON.stringify(flowcharts));
            safeLocalStorage.setItem(`cardsStatus_${deckName}`, cardsStatus);
            safeLocalStorage.setItem(`flowchartStatus_${deckName}`, flowchartStatus);
            safeLocalStorage.setItem(`quizStatus_${deckName}`, quizStatus);
            safeLocalStorage.setItem(`hasInitialChatRun_${deckName}`, hasInitialChatRun ? 'true' : 'false');
            safeLocalStorage.setItem(`quiz_${deckName}`, JSON.stringify(quiz));
            safeLocalStorage.setItem(`reviewCards_${deckName}`, JSON.stringify(reviewCards));

            // New Features Persistence
            safeLocalStorage.setItem(`report_${deckName}`, report);
            safeLocalStorage.setItem(`reportStatus_${deckName}`, reportStatus);
            safeLocalStorage.setItem(`slides_${deckName}`, JSON.stringify(slides));
            safeLocalStorage.setItem(`slidesStatus_${deckName}`, slidesStatus);
            safeLocalStorage.setItem(`table_${deckName}`, JSON.stringify(table));
            safeLocalStorage.setItem(`tableStatus_${deckName}`, tableStatus);
            if (deckId) safeLocalStorage.setItem('last_deck_id', deckId);

            // Guide and Notes Persistence
            safeLocalStorage.setItem(`guide_${deckName}`, JSON.stringify(guide));
            safeLocalStorage.setItem(`guideStatus_${deckName}`, guideStatus);
            safeLocalStorage.setItem(`savedNotes_${deckName}`, JSON.stringify(savedNotes));
        }
        if (generatedContent) {
            safeLocalStorage.setItem('last_generated_content', generatedContent);
        }
    }, [messages, cards, flowcharts, cardsStatus, flowchartStatus, hasInitialChatRun, deckName, deckId, generatedContent, quiz, quizStatus, reviewCards, report, reportStatus, slides, slidesStatus, table, tableStatus, guide, guideStatus, savedNotes]);

    const handleSendMessage = useCallback(async (text) => {
        if (!text.trim()) return;
        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setIsChatLoading(true);
        setIsThinking(true);

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    message: text,
                    deck_id: deckId
                })
            });
            if (!response.ok) throw new Error("Chat failed");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMsgContent = "";
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiMsgContent += chunk;
                setIsThinking(false);
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = aiMsgContent;
                    return newMessages;
                });
            }
            setIsChatLoading(false);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
            setIsThinking(false);
        }
    }, [messages, generatedContent, deckName, deckId]);

    const triggerGeneration = useCallback(async (type, extraData = null, force = false) => {
        if (!deckId && !generatedContent) {
            console.warn(`Cannot trigger ${type}: missing deckId`);
            return;
        }

        console.log(`Triggering generation: ${type} (force: ${force})`);

        if (type === 'cards') {
            if (!force && (cardsStatus === 'generating' || (cardsStatus === 'completed' && cards.length > 0))) return;
            setCardsStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/cards`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setCards(data.cards);
                    setCardsStatus('completed');
                } else {
                    setCardsStatus('idle');
                }
            } catch (err) {
                console.error("Card gen failed:", err);
                setCardsStatus('idle');
            }
        } else if (type === 'flowchart') {
            if (!force && (flowchartStatus === 'generating' || (flowchartStatus === 'completed' && flowcharts.length > 0))) return;
            setFlowchartStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/flowchart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setFlowcharts([data.flowchart]);
                    setFlowchartStatus('completed');
                } else {
                    setFlowchartStatus('idle');
                }
            } catch (err) {
                console.error("Flowchart gen failed:", err);
                setFlowchartStatus('idle');
            }
        } else if (type === 'quiz') {
            if (!force && (quizStatus === 'generating' || (quizStatus === 'completed' && quiz.length > 0))) return;
            setQuizStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success' && data.quiz && data.quiz.length > 0) {
                    setQuiz(data.quiz);
                    setQuizStatus('completed');
                } else {
                    setQuizStatus('idle');
                }
            } catch (err) {
                console.error("Quiz gen failed:", err);
                setQuizStatus('idle');
            }
        } else if (type === 'review') {
            try {
                const res = await fetch(`${API_BASE}/analyze/quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, missed_questions: extraData })
                });
                const data = await res.json();
                if (data.status === 'success' && data.review_cards) {
                    setReviewCards(prev => [...data.review_cards]);
                }
            } catch (err) {
                console.error("Review card gen failed:", err);
            }
        }

        // --- NEW FEATURES ---
        else if (type === 'report') {
            if (!force && (reportStatus === 'generating' || (reportStatus === 'completed' && report))) return;
            setReportStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setReport(data.report);
                    setReportStatus('completed');
                } else {
                    setReportStatus('idle');
                }
            } catch (err) {
                console.error("Report gen failed:", err);
                setReportStatus('idle');
            }
        } else if (type === 'slides') {
            if (!force && (slidesStatus === 'generating' || (slidesStatus === 'completed' && slides.length > 0))) return;
            setSlidesStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/slides`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setSlides(data.slides);
                    setSlidesStatus('completed');
                } else {
                    setSlidesStatus('idle');
                }
            } catch (err) {
                console.error("Slides gen failed:", err);
                setSlidesStatus('idle');
            }
        } else if (type === 'table') {
            if (!force && (tableStatus === 'generating' || (tableStatus === 'completed' && table.length > 0))) return;
            setTableStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/table`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setTable(data.table);
                    setTableStatus('completed');
                } else {
                    setTableStatus('idle');
                }
            } catch (err) {
                console.error("Table gen failed:", err);
                setTableStatus('idle');
            }
        } else if (type === 'guide') {
            if (!force && (guideStatus === 'generating' || (guideStatus === 'completed' && guide))) return;
            setGuideStatus('generating');
            try {
                const res = await fetch(`${API_BASE}/generate/guide`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deck_id: deckId, deck_name: deckName })
                });
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setGuide(data.guide);
                    setGuideStatus('completed');
                    setHasInitialChatRun(true);
                } else {
                    setGuideStatus('idle');
                }
            } catch (err) {
                console.error("Guide gen failed:", err);
                setGuideStatus('idle');
            }
        }
    }, [deckId, generatedContent, deckName, cardsStatus, flowchartStatus, quizStatus, reportStatus, slidesStatus, tableStatus, guideStatus, guide]);

    const saveNote = (content) => {
        const newNote = {
            id: Date.now(),
            content,
            date: new Date().toISOString()
        };
        setSavedNotes(prev => [newNote, ...prev]);
    };

    const handleFilesAdded = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            setUploadProgress(0);

            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 100);
        }
    }

    const handleRemoveFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    }

    const handleClearAll = () => {
        safeLocalStorage.clear();
        setFiles([]);
        setUploadProgress(0);
        setCards([]);
        setFlowcharts([]);
        setDeckName("");
        setGeneratedContent("");
        setCardsStatus('idle');
        setFlowchartStatus('idle');
        setMessages([]);
        setIsChatLoading(false);
        setIsThinking(false);
        setHasInitialChatRun(false);
        setQuiz([]);
        setReviewCards([]);
        setQuizStatus('idle');

        // Clear New Features
        setReport("");
        setReportStatus('idle');
        setSlides([]);
        setSlidesStatus('idle');
        setTable([]);
        setTableStatus('idle');
    }

    const resetQuiz = () => {
        setQuiz([]);
        setQuizStatus('idle');
        setReviewCards([]);
        if (deckName) {
            safeLocalStorage.removeItem(`quiz_${deckName}`);
            safeLocalStorage.removeItem(`quizStatus_${deckName}`);
            safeLocalStorage.removeItem(`reviewCards_${deckName}`);
        }
    }

    return (
        <DeckContext.Provider value={{
            files, setFiles,
            loading, setLoading,
            uploadProgress, setUploadProgress,
            cards, setCards,
            flowcharts, setFlowcharts,
            deckName, setDeckName,
            deckId, setDeckId,
            selectedCard, setSelectedCard,
            generatedContent, setGeneratedContent,
            cardsStatus, setCardsStatus,
            flowchartStatus, setFlowchartStatus,
            messages, setMessages,
            isChatLoading, setIsChatLoading,
            isThinking, setIsThinking,
            hasInitialChatRun, setHasInitialChatRun,
            quiz, setQuiz,
            quizStatus, setQuizStatus,
            reviewCards, setReviewCards,

            // New Features Logic
            report, setReport,
            reportStatus, setReportStatus,
            slides, setSlides,
            slidesStatus, setSlidesStatus,
            table, setTable,
            tableStatus, setTableStatus,
            guide, setGuide,
            guideStatus, setGuideStatus,
            savedNotes, setSavedNotes,
            saveNote,

            handleSendMessage,
            triggerGeneration,
            handleFilesAdded,
            handleRemoveFile,
            handleClearAll,
            resetQuiz
        }}>
            {children}
        </DeckContext.Provider>
    );
}

export function useDeck() {
    return useContext(DeckContext);
}
