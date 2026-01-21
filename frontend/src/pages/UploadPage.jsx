import { useNavigate } from 'react-router-dom';
import UploadSection from '../components/sections/UploadSection';
import { useDeck } from '../context/DeckContext';
import Layout from '../components/layout/Layout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function UploadPage() {
    const navigate = useNavigate();
    const {
        files,
        loading,
        uploadProgress,
        handleFilesAdded,
        handleRemoveFile,
        handleClearAll,
        setLoading,
        setCards,
        setFlowcharts,
        setDeckName,
        setDeckId,
        setGeneratedContent,
        setCardsStatus,
        setFlowchartStatus,
        setMessages,
        setHasInitialChatRun,
        // New resets
        setReport, setReportStatus,
        setSlides, setSlidesStatus,
        setTable, setTableStatus,
        setQuiz, setQuizStatus,
        setGuide, setGuideStatus,
        saveDeckToList
    } = useDeck();

    const onGenerateClick = async () => {
        if (files.length === 0) return;
        setLoading(true);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const response = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();

            // Initial upload only gives us naming and full text
            setDeckName(data.deck_name);
            if (data.full_text) setGeneratedContent(data.full_text);

            // RESET generations
            setCards([]);
            setFlowcharts([]);
            setCardsStatus('idle');
            setFlowchartStatus('idle');
            setMessages([]);
            setHasInitialChatRun(false);
            if (data.deck_id) setDeckId(data.deck_id);

            // Reset Studio Features
            setReport(""); setReportStatus('idle');
            setSlides([]); setSlidesStatus('idle');
            setTable([]); setTableStatus('idle');
            setQuiz([]); setQuizStatus('idle');
            setGuide(null); setGuideStatus('idle');

            // Save to list
            saveDeckToList({
                id: data.deck_id || Date.now().toString(),
                name: data.deck_name,
                sources: files.length,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                icon: ["📚", "💻", "🎨", "⚛️", "🧠", "🎓"][Math.floor(Math.random() * 6)],
                color: ["bg-blue-50", "bg-emerald-50", "bg-purple-50", "bg-orange-50", "bg-stone-50", "bg-sky-50"][Math.floor(Math.random() * 6)]
            });

            // Navigate to the Deck Dashboard
            navigate('/deck');

        } catch (error) {
            console.error(error);
            let detail = error.message;
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.detail) detail = errorData.detail;
            } catch (e) { /* fallback */ }
            alert(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="pt-20 min-h-screen flex items-center justify-center px-6 pb-20">
                <UploadSection
                    files={files}
                    loading={loading}
                    handleFilesAdded={handleFilesAdded}
                    handleRemoveFile={handleRemoveFile}
                    handleClearAll={handleClearAll}
                    handleGenerate={onGenerateClick}
                    uploadProgress={uploadProgress}
                    showGuide={false}
                />
            </div>
        </Layout>
    );
}
