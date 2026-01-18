import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DeckContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
    const [deckId, setDeckId] = useState(null);
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

    // Persist to localStorage
    useEffect(() => {
        if (deckName) {
            localStorage.setItem('last_deck_name', deckName);
            localStorage.setItem(`messages_${deckName}`, JSON.stringify(messages));
            localStorage.setItem(`cards_${deckName}`, JSON.stringify(cards));
            localStorage.setItem(`flowcharts_${deckName}`, JSON.stringify(flowcharts));
            localStorage.setItem(`cardsStatus_${deckName}`, cardsStatus);
            localStorage.setItem(`flowchartStatus_${deckName}`, flowchartStatus);
            localStorage.setItem(`quizStatus_${deckName}`, quizStatus);
            localStorage.setItem(`hasInitialChatRun_${deckName}`, hasInitialChatRun ? 'true' : 'false');
            localStorage.setItem(`quiz_${deckName}`, JSON.stringify(quiz));
            localStorage.setItem(`reviewCards_${deckName}`, JSON.stringify(reviewCards));
        }
        if (generatedContent) {
            localStorage.setItem('last_generated_content', generatedContent);
        }
    }, [messages, cards, flowcharts, cardsStatus, flowchartStatus, hasInitialChatRun, deckName, generatedContent, quiz, quizStatus, reviewCards]);

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
                    context: generatedContent,
                    deck_id: deckName
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
                setIsChatLoading(false);
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = aiMsgContent;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
            setIsThinking(false);
        }
    }, [messages, generatedContent, deckName]);

    const triggerGeneration = useCallback(async (type, extraData = null, force = false) => {
        if (!generatedContent || !deckName) {
            console.warn(`Cannot trigger ${type}: missing content or deckName`);
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
                    body: JSON.stringify({ text: generatedContent, deck_name: deckName })
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
                    body: JSON.stringify({ text: generatedContent, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setFlowcharts([data.flowchart]); // Keep consistent with existing array logic
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
                    body: JSON.stringify({ text: generatedContent, deck_name: deckName })
                });
                const data = await res.json();
                if (data.status === 'success' && data.quiz && data.quiz.length > 0) {
                    setQuiz(data.quiz);
                    setQuizStatus('completed');
                } else {
                    console.warn("Quiz generation returned empty or failed");
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
                    body: JSON.stringify({ text: generatedContent, missed_questions: extraData })
                });
                const data = await res.json();
                if (data.status === 'success' && data.review_cards) {
                    setReviewCards(prev => [...data.review_cards]); // For now replace, or append? The user said "teaching the things we did answer wrong"
                }
            } catch (err) {
                console.error("Review card gen failed:", err);
            }
        }
    }, [generatedContent, deckName, cardsStatus, flowchartStatus, quizStatus]);

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
        localStorage.clear();
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
    }

    const resetQuiz = () => {
        setQuiz([]);
        setQuizStatus('idle');
        setReviewCards([]);
        if (deckName) {
            localStorage.removeItem(`quiz_${deckName}`);
            localStorage.removeItem(`quizStatus_${deckName}`);
            localStorage.removeItem(`reviewCards_${deckName}`);
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
