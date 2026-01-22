import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const DeckContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        console.warn("LocalStorage quota exceeded. Clearing old data...");
        // Simple strategy: Clear everything if we're full.
        // In a real app we'd be more surgical.
        localStorage.clear();
        try {
          localStorage.setItem(key, value);
        } catch (innerE) {
          console.error("Failed to set item even after clear:", innerE);
        }
      }
    }
  },
  getItem: (key) => localStorage.getItem(key),
  removeItem: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

export function DeckProvider({ children }) {
  const { user } = useAuth();
  const initialDeckName = localStorage.getItem("last_deck_name") || "";
  const initialGeneratedContent =
    localStorage.getItem("last_generated_content") || "";

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deckName, setDeckName] = useState(initialDeckName);
  const [generatedContent, setGeneratedContent] = useState(
    initialGeneratedContent,
  );

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(`cards_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [flowcharts, setFlowcharts] = useState(() => {
    const saved = localStorage.getItem(`flowcharts_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [deckId, setDeckId] = useState(
    () => localStorage.getItem("last_deck_id") || null,
  );
  const [selectedCard, setSelectedCard] = useState(null);

  // Status tracking for lazy generation
  const [cardsStatus, setCardsStatus] = useState(
    () => localStorage.getItem(`cardsStatus_${initialDeckName}`) || "idle",
  );
  const [flowchartStatus, setFlowchartStatus] = useState(
    () => localStorage.getItem(`flowchartStatus_${initialDeckName}`) || "idle",
  );

  // Chat persistence
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`messages_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasInitialChatRun, setHasInitialChatRun] = useState(
    () =>
      localStorage.getItem(`hasInitialChatRun_${initialDeckName}`) === "true",
  );

  // Quiz and Review States
  const [quiz, setQuiz] = useState(() => {
    const saved = localStorage.getItem(`quiz_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [quizStatus, setQuizStatus] = useState(
    () => localStorage.getItem(`quizStatus_${initialDeckName}`) || "idle",
  );
  const [reviewCards, setReviewCards] = useState(() => {
    const saved = localStorage.getItem(`reviewCards_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });

  // New Studio Features State
  const [report, setReport] = useState(
    () => localStorage.getItem(`report_${initialDeckName}`) || "",
  );
  const [reportStatus, setReportStatus] = useState(
    () => localStorage.getItem(`reportStatus_${initialDeckName}`) || "idle",
  );

  const [slides, setSlides] = useState(() => {
    const saved = localStorage.getItem(`slides_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [slidesStatus, setSlidesStatus] = useState(
    () => localStorage.getItem(`slidesStatus_${initialDeckName}`) || "idle",
  );

  const [table, setTable] = useState(() => {
    const saved = localStorage.getItem(`table_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [tableStatus, setTableStatus] = useState(
    () => localStorage.getItem(`tableStatus_${initialDeckName}`) || "idle",
  );

  // Audio Features State
  const [podcastStatus, setPodcastStatus] = useState(
    () => localStorage.getItem(`podcastStatus_${initialDeckName}`) || "idle",
  );
  const [podcastUrl, setPodcastUrl] = useState(
    () => localStorage.getItem(`podcastUrl_${initialDeckName}`) || "",
  );
  const [podcastMode, setPodcastMode] = useState(
    () => localStorage.getItem(`podcastMode_${initialDeckName}`) || "default",
  );

  const [overviewStatus, setOverviewStatus] = useState(
    () => localStorage.getItem(`overviewStatus_${initialDeckName}`) || "idle",
  );
  const [overviewUrl, setOverviewUrl] = useState(
    () => localStorage.getItem(`overviewUrl_${initialDeckName}`) || "",
  );
  const [overviewMode, setOverviewMode] = useState(
    () => localStorage.getItem(`overviewMode_${initialDeckName}`) || "default",
  );

  // Guide and Saved Notes
  const [guide, setGuide] = useState(() => {
    const saved = localStorage.getItem(`guide_${initialDeckName}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [guideStatus, setGuideStatus] = useState(
    () => localStorage.getItem(`guideStatus_${initialDeckName}`) || "idle",
  );
  // List of all decks
  const [decks, setDecks] = useState([]);

  const [savedNotes, setSavedNotes] = useState(() => {
    const saved = localStorage.getItem(`savedNotes_${initialDeckName}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Generation step tracking for progress messages
  const [generationSteps, setGenerationSteps] = useState({});

  // Persist to localStorage
  useEffect(() => {
    if (deckName) {
      safeLocalStorage.setItem("last_deck_name", deckName);
      safeLocalStorage.setItem("user_decks", JSON.stringify(decks)); // Persist the list
      safeLocalStorage.setItem(
        `messages_${deckName}`,
        JSON.stringify(messages),
      );
      safeLocalStorage.setItem(`cards_${deckName}`, JSON.stringify(cards));
      safeLocalStorage.setItem(
        `flowcharts_${deckName}`,
        JSON.stringify(flowcharts),
      );
      safeLocalStorage.setItem(`cardsStatus_${deckName}`, cardsStatus);
      safeLocalStorage.setItem(`flowchartStatus_${deckName}`, flowchartStatus);
      safeLocalStorage.setItem(`quizStatus_${deckName}`, quizStatus);
      safeLocalStorage.setItem(
        `hasInitialChatRun_${deckName}`,
        hasInitialChatRun ? "true" : "false",
      );
      safeLocalStorage.setItem(`quiz_${deckName}`, JSON.stringify(quiz));
      safeLocalStorage.setItem(
        `reviewCards_${deckName}`,
        JSON.stringify(reviewCards),
      );

      // New Features Persistence
      safeLocalStorage.setItem(`report_${deckName}`, report);
      safeLocalStorage.setItem(`reportStatus_${deckName}`, reportStatus);
      safeLocalStorage.setItem(`slides_${deckName}`, JSON.stringify(slides));
      safeLocalStorage.setItem(`slidesStatus_${deckName}`, slidesStatus);
      safeLocalStorage.setItem(`table_${deckName}`, JSON.stringify(table));
      safeLocalStorage.setItem(`tableStatus_${deckName}`, tableStatus);
      if (deckId) safeLocalStorage.setItem(`id_${deckName}`, deckId); // Store ID per deck
      if (deckId) safeLocalStorage.setItem("last_deck_id", deckId);

      // Audio Features Persistence
      safeLocalStorage.setItem(`podcastStatus_${deckName}`, podcastStatus);
      safeLocalStorage.setItem(`podcastUrl_${deckName}`, podcastUrl);
      safeLocalStorage.setItem(`podcastMode_${deckName}`, podcastMode);
      safeLocalStorage.setItem(`overviewStatus_${deckName}`, overviewStatus);
      safeLocalStorage.setItem(`overviewUrl_${deckName}`, overviewUrl);
      safeLocalStorage.setItem(`overviewMode_${deckName}`, overviewMode);

      // Guide and Notes Persistence
      safeLocalStorage.setItem(`guide_${deckName}`, JSON.stringify(guide));
      safeLocalStorage.setItem(`guideStatus_${deckName}`, guideStatus);
      safeLocalStorage.setItem(
        `savedNotes_${deckName}`,
        JSON.stringify(savedNotes),
      );
      if (generatedContent) {
        safeLocalStorage.setItem(`content_${deckName}`, generatedContent);
      }
    }
    if (generatedContent) {
      safeLocalStorage.setItem("last_generated_content", generatedContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    messages,
    cards,
    flowcharts,
    cardsStatus,
    flowchartStatus,
    hasInitialChatRun,
    deckName,
    deckId,
    generatedContent,
    quiz,
    quizStatus,
    reviewCards,
    report,
    reportStatus,
    slides,
    slidesStatus,
    table,
    tableStatus,
    guide,
    guideStatus,
    savedNotes,
    podcastStatus,
    podcastUrl,
    podcastMode,
    overviewStatus,
    overviewUrl,
    overviewMode,
  ]); // Removed decks from dep array since we sync differently
  // Debounced Save to Supabase
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!deckId || !user) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      console.log("Auto-saving deck to Supabase...");

      const currentDeck = decks.find(d => d.id === deckId);
      const existingMetadata = currentDeck?.metadata || {};

      const payload = {
        metadata: {
          ...existingMetadata,
          name: deckName,
          cards,
          flowcharts,
          quiz,
          messages,
          generatedContent,
          // DO NOT save audio URLs - they should be session-only
          // podcastStatus, podcastUrl, podcastMode,
          // overviewStatus, overviewUrl, overviewMode,
          last_updated: new Date().toISOString()
        }
      };

      try {
        const { error } = await supabase.from("decks").update(payload).eq("id", deckId);
        if (error) console.error("Auto-save failed:", error);
      } catch (err) {
        console.error("Auto-save exception:", err);
      }

      // We need to be careful not to overwrite 'icon' and 'color' if they aren't in state.
      // A better approach is to update specific fields if the table structure supports it,
      // or rely on the fact that we loaded this data *from* Supabase (helper needed).
      // Since we don't have 'icon' in state, we might overwrite it with null if we replace the whole metadata.
      // SAFEGUARD: Only update if we have data.

      // Let's rely on updateDeck to merge if possible, or just update specific keys.
      // But Supabase 'update' on a JSONB column usually replaces the whole object unless using deep merge SQL function.
      // So we must fetch current metadata first? That's too expensive (read before write on every save).

      // ALTERNATIVE: Use a separate column? No backend access.
      // STRATEGY: Store content in a specific key "content" inside metadata, and try to preserve others?
      // Without 'icon' state, we risk losing it.
      // FIX: Add 'icon' and 'color' to DeckContext state so we have the full picture.
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [deckId, user, deckName, cards, flowcharts, quiz, messages, generatedContent]);

  // Sync Decks with Supabase
  useEffect(() => {
    if (!user) {
      setDecks([]);
      return;
    }

    const fetchDecks = async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.uid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching decks:", error);
      } else {
        setDecks(data || []);
      }
    };

    fetchDecks();
  }, [user]);

  const handleSendMessage = useCallback(
    async (text) => {
      if (!text.trim()) return;
      const userMsg = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsChatLoading(true);
      setIsThinking(true);

      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            message: text,
            deck_id: deckId,
          }),
        });
        if (!response.ok) throw new Error("Chat failed");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiMsgContent = "";
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          aiMsgContent += chunk;
          setIsThinking(false);
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = aiMsgContent;
            return newMessages;
          });
        }
        setIsChatLoading(false);
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsChatLoading(false);
        setIsThinking(false);
      }
    },
    [messages, deckId],
  );

  const updateGenerationStep = (toolType, step) => {
    setGenerationSteps(prev => ({ ...prev, [toolType]: step }));
  };

  const triggerGeneration = useCallback(
    async (type, options = {}, force = false) => {
      if (!deckId) {
        console.warn(`Cannot trigger ${type}: missing deckId`);
        return;
      }

      console.log(`Triggering generation: ${type} (force: ${force})`);

      if (type === "cards") {
        if (
          !force &&
          (cardsStatus === "generating" ||
            (cardsStatus === "completed" && cards.length > 0))
        )
          return;
        setCardsStatus("generating");
        updateGenerationStep("cards", "Analyzing content...");
        try {
          setTimeout(() => updateGenerationStep("cards", "Identifying key concepts..."), 1000);
          setTimeout(() => updateGenerationStep("cards", "Generating flashcards..."), 2500);

          const res = await fetch(`${API_BASE}/generate/cards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deck_id: deckId,
              deck_name: deckName,
              options,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }
          updateGenerationStep("cards", "Finalizing cards...");
          const data = await res.json();
          if (data.status === "success") {
            setCards(data.cards);
            setCardsStatus("completed");
            updateGenerationStep("cards", "");
          } else {
            setCardsStatus("idle");
            updateGenerationStep("cards", "");
          }
        } catch (err) {
          console.error("Card gen failed:", err);
          setCardsStatus("idle");
          updateGenerationStep("cards", "");
        }
      } else if (type === "flowchart") {
        if (
          !force &&
          (flowchartStatus === "generating" ||
            (flowchartStatus === "completed" && flowcharts.length > 0))
        )
          return;
        setFlowchartStatus("generating");
        updateGenerationStep("flowchart", "Analyzing relationships...");
        try {
          setTimeout(() => updateGenerationStep("flowchart", "Mapping connections..."), 1000);
          setTimeout(() => updateGenerationStep("flowchart", "Building mind map..."), 2500);

          const res = await fetch(`${API_BASE}/generate/flowchart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deck_id: deckId,
              deck_name: deckName,
              options,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }
          updateGenerationStep("flowchart", "Finalizing visualization...");
          const data = await res.json();
          if (data.status === "success") {
            setFlowcharts([data.flowchart]);
            setFlowchartStatus("completed");
            updateGenerationStep("flowchart", "");
          } else {
            setFlowchartStatus("idle");
            updateGenerationStep("flowchart", "");
          }
        } catch (err) {
          console.error("Flowchart gen failed:", err);
          setFlowchartStatus("idle");
          updateGenerationStep("flowchart", "");
        }
      } else if (type === "quiz") {
        if (
          !force &&
          (quizStatus === "generating" ||
            (quizStatus === "completed" && quiz.length > 0))
        )
          return;
        setQuizStatus("generating");
        updateGenerationStep("quiz", "Analyzing key topics...");
        try {
          setTimeout(() => updateGenerationStep("quiz", "Crafting questions..."), 1000);
          setTimeout(() => updateGenerationStep("quiz", "Generating answer options..."), 2500);

          const res = await fetch(`${API_BASE}/generate/quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deck_id: deckId,
              deck_name: deckName,
              options,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }
          updateGenerationStep("quiz", "Finalizing quiz...");
          const data = await res.json();
          if (data.status === "success" && data.quiz && data.quiz.length > 0) {
            setQuiz(data.quiz);
            setQuizStatus("completed");
            updateGenerationStep("quiz", "");
          } else {
            setQuizStatus("idle");
            updateGenerationStep("quiz", "");
          }
        } catch (err) {
          console.error("Quiz gen failed:", err);
          setQuizStatus("idle");
          updateGenerationStep("quiz", "");
        }
      } else if (type === "review") {
        const missedQuestions = options.missed_questions || [];
        try {
          const res = await fetch(`${API_BASE}/analyze/quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deck_id: deckId,
              missed_questions: missedQuestions,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }
          const data = await res.json();
          if (data.status === "success" && data.review_cards) {
            setReviewCards([...data.review_cards]);
          }
        } catch (err) {
          console.error("Review card gen failed:", err);
        }
      }

      // --- NEW FEATURES ---
      else if (type === "report") {
        if (
          !force &&
          (reportStatus === "generating" ||
            (reportStatus === "completed" && report))
        )
          return;
        setReportStatus("generating");
        updateGenerationStep("report", "Researching topics...");
        try {
          setTimeout(() => updateGenerationStep("report", "Analyzing sources..."), 1000);
          setTimeout(() => updateGenerationStep("report", "Writing report..."), 2500);

          const res = await fetch(`${API_BASE}/generate/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deck_id: deckId, deck_name: deckName }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "Report generation failed");
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          setReport(""); // Clear previous report

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setReport((prev) => prev + chunk);
          }

          setReportStatus("completed");
          updateGenerationStep("report", "");
        } catch (err) {
          console.error("Report gen failed:", err);
          setReportStatus("idle");
          updateGenerationStep("report", "");
        }
      } else if (type === "slides") {
        if (
          !force &&
          (slidesStatus === "generating" ||
            (slidesStatus === "completed" && slides.length > 0))
        )
          return;
        setSlidesStatus("generating");
        updateGenerationStep("slides", "Analyzing content structure...");
        try {
          setTimeout(() => updateGenerationStep("slides", "Designing slide layouts..."), 1000);
          setTimeout(() => updateGenerationStep("slides", "Creating presentation..."), 2500);

          const res = await fetch(`${API_BASE}/generate/slides`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deck_id: deckId, deck_name: deckName }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }
          updateGenerationStep("slides", "Finalizing slides...");
          const data = await res.json();
          if (data.status === "success") {
            setSlides(data.slides);
            setSlidesStatus("completed");
            updateGenerationStep("slides", "");
          } else {
            setSlidesStatus("idle");
            updateGenerationStep("slides", "");
          }
        } catch (err) {
          console.error("Slides gen failed:", err);
          setSlidesStatus("idle");
          updateGenerationStep("slides", "");
        }
      } else if (type === "table") {
        if (
          !force &&
          (tableStatus === "generating" ||
            (tableStatus === "completed" && table.length > 0))
        )
          return;
        setTableStatus("generating");
        updateGenerationStep("table", "Extracting data points...");
        try {
          setTimeout(() => updateGenerationStep("table", "Organizing information..."), 1000);
          setTimeout(() => updateGenerationStep("table", "Structuring table..."), 2500);

          const res = await fetch(`${API_BASE}/generate/table`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deck_id: deckId, deck_name: deckName }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }
          updateGenerationStep("table", "Finalizing table...");
          const data = await res.json();
          if (data.status === "success") {
            setTable(data.table);
            setTableStatus("completed");
            updateGenerationStep("table", "");
          } else {
            setTableStatus("idle");
            updateGenerationStep("table", "");
          }
        } catch (err) {
          console.error("Table gen failed:", err);
          setTableStatus("idle");
          updateGenerationStep("table", "");
        }
      } else if (type === "guide") {
        if (
          !force &&
          (guideStatus === "generating" ||
            (guideStatus === "completed" && guide))
        )
          return;
        setGuideStatus("generating");
        updateGenerationStep("guide", "Analyzing content...");
        try {
          setTimeout(() => updateGenerationStep("guide", "Generating study guide..."), 1000);
          setTimeout(() => updateGenerationStep("guide", "Creating insights..."), 2500);

          const res = await fetch(`${API_BASE}/generate/guide`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deck_id: deckId, deck_name: deckName }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP Error: ${res.status}`);
          }
          updateGenerationStep("guide", "Finalizing guide...");
          const data = await res.json();
          if (data.status === "success") {
            setGuide(data.guide);
            setGuideStatus("completed");
            setHasInitialChatRun(true);
            updateGenerationStep("guide", "");
          } else {
            setGuideStatus("idle");
            updateGenerationStep("guide", "");
          }
        } catch (err) {
          console.error("Guide gen failed:", err);
          setGuideStatus("idle");
          updateGenerationStep("guide", "");
        }
      } else if (type === "podcast") {
        if (!force && (podcastStatus === "generating" || (podcastStatus === "completed" && podcastUrl))) return;
        setPodcastStatus("generating");
        updateGenerationStep("podcast", "Generating script...");
        try {
          setTimeout(() => updateGenerationStep("podcast", "Creating dialogue..."), 2000);
          setTimeout(() => updateGenerationStep("podcast", "Synthesizing voices..."), 4000);
          setTimeout(() => updateGenerationStep("podcast", "Mixing audio..."), 6000);

          const res = await fetch(`${API_BASE}/generate/audio/podcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deck_id: deckId,
              deck_name: deckName,
              options: options || { mode: "default" },
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }

          updateGenerationStep("podcast", "Finalizing podcast...");
          const data = await res.json();
          console.log("Podcast response data:", data);
          if (data.status === "success") {
            console.log("Setting podcast URL:", data.audio_url);
            // Prepend API_BASE to make it an absolute URL
            const fullUrl = `${API_BASE}${data.audio_url}`;
            console.log("Full podcast URL:", fullUrl);
            setPodcastUrl(fullUrl);
            setPodcastStatus("completed");
            updateGenerationStep("podcast", "");
          } else {
            setPodcastStatus("idle");
            updateGenerationStep("podcast", "");
          }
        } catch (err) {
          console.error("Podcast gen failed:", err);
          setPodcastStatus("idle");
          updateGenerationStep("podcast", "");
        }
      } else if (type === "overview") {
        if (!force && (overviewStatus === "generating" || (overviewStatus === "completed" && overviewUrl))) return;
        setOverviewStatus("generating");
        updateGenerationStep("overview", "Preparing lesson script...");
        try {
          setTimeout(() => updateGenerationStep("overview", "Structuring explanation..."), 2000);
          setTimeout(() => updateGenerationStep("overview", "Synthesizing audio..."), 4000);
          setTimeout(() => updateGenerationStep("overview", "Processing voice..."), 6000);

          const res = await fetch(`${API_BASE}/generate/audio/overview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deck_id: deckId,
              deck_name: deckName,
              options: options || { mode: "default" },
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${res.status}`);
          }

          updateGenerationStep("overview", "Finalizing lesson...");
          const data = await res.json();
          console.log("Overview response data:", data);
          if (data.status === "success") {
            console.log("Setting overview URL:", data.audio_url);
            // Prepend API_BASE to make it an absolute URL
            const fullUrl = `${API_BASE}${data.audio_url}`;
            console.log("Full overview URL:", fullUrl);
            setOverviewUrl(fullUrl);
            setOverviewStatus("completed");
            updateGenerationStep("overview", "");
          } else {
            setOverviewStatus("idle");
            updateGenerationStep("overview", "");
          }
        } catch (err) {
          console.error("Overview gen failed:", err);
          setOverviewStatus("idle");
          updateGenerationStep("overview", "");
          // Optionally you could set a global error state here to show a toast
        }
      }
    },
    [
      deckId,
      generatedContent,
      deckName,
      cardsStatus,
      flowchartStatus,
      quizStatus,
      reportStatus,
      slidesStatus,
      tableStatus,
      guideStatus,
      guide,
      cards.length,
      flowcharts.length,
      quiz.length,
      report,
      slides.length,
      table.length,
      table.length,
      podcastStatus,
      podcastUrl,
      overviewStatus,
      overviewUrl,
    ],
  );

  const uploadFilesToDeck = async (newFiles) => {
    if (!deckId || newFiles.length === 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      newFiles.forEach((file) => formData.append("files", file));
      formData.append("deck_id", deckId); // Append to existing deck

      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const data = await response.json();

      // Update content with new text
      if (data.full_text) {
        setGeneratedContent(prev => prev + "\n" + data.full_text);

        // Optimistically update deck source count in list
        setDecks(prev => prev.map(d =>
          d.id === deckId
            ? { ...d, sources: (d.sources || 0) + newFiles.length }
            : d
        ));
      }

      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveNote = (content) => {
    const newNote = {
      id: Date.now(),
      content,
      date: new Date().toISOString(),
    };
    setSavedNotes((prev) => [newNote, ...prev]);
  };

  const handleFilesAdded = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
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
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClearAll = () => {
    // Only clear session-related keys
    const keysToRemove = [
      "last_deck_name",
      "last_deck_id",
      "last_generated_content",
      "current_deck_id",
    ];
    keysToRemove.forEach((k) => safeLocalStorage.removeItem(k));
    setFiles([]);
    setUploadProgress(0);
    setCards([]);
    setFlowcharts([]);
    setDeckName("New Deck"); // valuable default
    setGeneratedContent("");

    // Generate a fresh ID for the new session so uploads work immediately
    const newId = `deck_${Date.now()}`;
    setDeckId(newId);
    safeLocalStorage.setItem("last_deck_id", newId);

    setCardsStatus("idle");
    setFlowchartStatus("idle");
    setMessages([]);
    setIsChatLoading(false);
    setIsThinking(false);
    setHasInitialChatRun(false);
    setQuiz([]);
    setReviewCards([]);
    setQuizStatus("idle");

    // Clear New Features
    setReport("");
    setReportStatus("idle");
    setSlides([]);
    setSlidesStatus("idle");
    setTable([]);
    setTableStatus("idle");
    setGuide(null);
    setGuideStatus("idle");
    setSavedNotes([]);

    // Clear Audio Features
    setPodcastStatus("idle");
    setPodcastUrl("");
    setPodcastMode("default");

    setOverviewStatus("idle");
    setOverviewUrl("");
    setOverviewMode("default");

    // Clear generation steps
    setGenerationSteps({});
  };

  const resetQuiz = () => {
    setQuiz([]);
    setQuizStatus("idle");
    setReviewCards([]);
    if (deckName) {
      safeLocalStorage.removeItem(`quiz_${deckName}`);
      safeLocalStorage.removeItem(`quizStatus_${deckName}`);
      safeLocalStorage.removeItem(`reviewCards_${deckName}`);
    }
  };

  const saveDeckToList = async (newDeck) => {
    if (!user) return;

    // Optimistic UI Update
    setDecks((prev) => {
      const exists = prev.find((d) => d.id === newDeck.id);
      if (exists) {
        return prev.map((d) =>
          d.id === newDeck.id ? { ...d, ...newDeck } : d,
        );
      }
      return [newDeck, ...prev];
    });

    // Save to Supabase
    const deckPayload = {
      id: newDeck.id,
      user_id: user.uid,
      title: newDeck.name || newDeck.title,
      metadata: newDeck, // Store full JSON for now (color, icon, etc)
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("decks")
      .upsert(deckPayload, { onConflict: "id" });

    if (error) console.error("Supabase Save Error:", error);
  };

  const updateDeck = async (deckId, updates) => {
    if (!user) return;

    // Optimistic UI Update
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? {
            ...d,
            ...updates,
            title: updates.title || d.title,
            metadata: { ...(d.metadata || {}), ...updates },
          }
          : d,
      ),
    );

    // Prepare payload
    const payload = {
      id: deckId,
      ...(updates.title && { title: updates.title }),
      ...(updates.visibility && { visibility: updates.visibility }),
      metadata: updates, // Simplified for now, or merge with existing metadata
    };

    const { error } = await supabase
      .from("decks")
      .update(payload)
      .eq("id", deckId);

    if (error) {
      console.error("Supabase Update Error:", error);
      // In a real app, we might want to rollback the optimistic update here
    }
  };

  const loadDeck = (targetDeckName) => {
    if (!targetDeckName) return;
    setDeckName(targetDeckName);

    // Try to load from Supabase store (decks state) first
    // Note: decks might be empty on first load, but usually fetched by then.
    // If deckFromState has deep metadata, use it.
    const deckFromState = decks.find(d => (d.name || d.title) === targetDeckName);

    if (deckFromState && deckFromState.metadata && (deckFromState.metadata.cards || deckFromState.metadata.generatedContent)) {
      console.log("Loading deck from Supabase metadata...");
      const m = deckFromState.metadata;
      setDeckId(deckFromState.id);

      setGeneratedContent(m.generatedContent || "");
      setMessages(m.messages || []);
      setCards(m.cards || []);
      setFlowcharts(m.flowcharts || []);
      setQuiz(m.quiz || []);
      setGuide(m.guide || null);
      setSavedNotes(m.savedNotes || []);

      // Restore statuses if meaningful, else idle/completed based on content
      setCardsStatus(m.cards?.length ? "completed" : "idle");
      setFlowchartStatus(m.flowcharts?.length ? "completed" : "idle");
      setQuizStatus(m.quiz?.length ? "completed" : "idle");
      setGuideStatus(m.guide ? "completed" : "idle");

      setReportStatus(m.report ? "completed" : "idle");
      setReport(m.report || "");

      setSlidesStatus(m.slides?.length ? "completed" : "idle");
      setSlides(m.slides || []);

      setTableStatus(m.table?.length ? "completed" : "idle");
      setTable(m.table || []);

      setHasInitialChatRun(true);
      return; // Skip localStorage load
    }

    // Load all data from localStorage for this deck (Legacy/Offline Fallback)
    const id = localStorage.getItem(`id_${targetDeckName}`);
    const content = localStorage.getItem(`content_${targetDeckName}`);
    const msgs = localStorage.getItem(`messages_${targetDeckName}`);
    const crds = localStorage.getItem(`cards_${targetDeckName}`);
    const flows = localStorage.getItem(`flowcharts_${targetDeckName}`);
    const qz = localStorage.getItem(`quiz_${targetDeckName}`);
    const gd = localStorage.getItem(`guide_${targetDeckName}`);
    const sn = localStorage.getItem(`savedNotes_${targetDeckName}`);

    setDeckId(id);
    setGeneratedContent(content || "");
    setMessages(msgs ? JSON.parse(msgs) : []);
    setCards(crds ? JSON.parse(crds) : []);
    setFlowcharts(flows ? JSON.parse(flows) : []);
    setQuiz(qz ? JSON.parse(qz) : []);
    setGuide(gd ? JSON.parse(gd) : null);
    setSavedNotes(sn ? JSON.parse(sn) : []);

    setCardsStatus(
      localStorage.getItem(`cardsStatus_${targetDeckName}`) || "idle",
    );
    setFlowchartStatus(
      localStorage.getItem(`flowchartStatus_${targetDeckName}`) || "idle",
    );
    setQuizStatus(
      localStorage.getItem(`quizStatus_${targetDeckName}`) || "idle",
    );
    setGuideStatus(
      localStorage.getItem(`guideStatus_${targetDeckName}`) || "idle",
    );
    setReportStatus(
      localStorage.getItem(`reportStatus_${targetDeckName}`) || "idle",
    );
    setSlidesStatus(
      localStorage.getItem(`slidesStatus_${targetDeckName}`) || "idle",
    );
    setTableStatus(
      localStorage.getItem(`tableStatus_${targetDeckName}`) || "idle",
    );
    setHasInitialChatRun(
      localStorage.getItem(`hasInitialChatRun_${targetDeckName}`) === "true",
    );
  };

  const deleteDeck = async (deckToDelete) => {
    // Optimistic UI Update
    setDecks((prev) => prev.filter((d) => d.id !== deckToDelete.id));

    if (user) {
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckToDelete.id);
      if (error) console.error("Supabase Delete Error:", error);
    }

    // Also clear its data from localStorage (legacy/session cache)
    const name = deckToDelete.name || deckToDelete.title;
    if (!name) return;

    localStorage.removeItem(`messages_${name}`);
    localStorage.removeItem(`cards_${name}`);
    localStorage.removeItem(`flowcharts_${name}`);
    localStorage.removeItem(`cardsStatus_${name}`);
    localStorage.removeItem(`flowchartStatus_${name}`);
    localStorage.removeItem(`quizStatus_${name}`);
    localStorage.removeItem(`hasInitialChatRun_${name}`);
    localStorage.removeItem(`quiz_${name}`);
    localStorage.removeItem(`reviewCards_${name}`);
    localStorage.removeItem(`report_${name}`);
    localStorage.removeItem(`reportStatus_${name}`);
    localStorage.removeItem(`slides_${name}`);
    localStorage.removeItem(`slidesStatus_${name}`);
    localStorage.removeItem(`table_${name}`);
    localStorage.removeItem(`tableStatus_${name}`);
    localStorage.removeItem(`id_${name}`);
    localStorage.removeItem(`guide_${name}`);
    localStorage.removeItem(`guideStatus_${name}`);
    localStorage.removeItem(`savedNotes_${name}`);
    localStorage.removeItem(`content_${name}`);

    if (deckName === name) {
      handleClearAll();
    }
  };

  return (
    <DeckContext.Provider
      value={{
        files,
        setFiles,
        loading,
        setLoading,
        uploadProgress,
        setUploadProgress,
        cards,
        setCards,
        flowcharts,
        setFlowcharts,
        deckName,
        setDeckName,
        deckId,
        setDeckId,
        selectedCard,
        setSelectedCard,
        generatedContent,
        setGeneratedContent,
        uploadFilesToDeck,
        cardsStatus,
        setCardsStatus,
        flowchartStatus,
        setFlowchartStatus,
        messages,
        setMessages,
        isChatLoading,
        setIsChatLoading,
        isThinking,
        setIsThinking,
        hasInitialChatRun,
        setHasInitialChatRun,
        quiz,
        setQuiz,
        quizStatus,
        setQuizStatus,
        reviewCards,
        setReviewCards,

        // New Features Logic
        report,
        setReport,
        reportStatus,
        setReportStatus,
        slides,
        setSlides,
        slidesStatus,
        setSlidesStatus,
        table,
        setTable,
        tableStatus,
        setTableStatus,
        guide,
        setGuide,
        guideStatus,
        setGuideStatus,
        savedNotes,
        setSavedNotes,
        saveNote,

        podcastStatus,
        setPodcastStatus,
        podcastUrl,
        setPodcastUrl,
        podcastMode,
        setPodcastMode,
        overviewStatus,
        setOverviewStatus,
        overviewUrl,
        setOverviewUrl,
        overviewMode,
        setOverviewMode,

        generationSteps,

        decks,
        saveDeckToList,
        updateDeck,
        loadDeck,
        deleteDeck,

        handleSendMessage,
        triggerGeneration,
        handleFilesAdded,
        handleRemoveFile,
        handleClearAll,
        resetQuiz,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDeck() {
  return useContext(DeckContext);
}
