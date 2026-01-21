import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import { Brain, ChevronRight, PlayCircle, Sparkles, ArrowLeft, RotateCw } from 'lucide-react';

export default function QuizIntroView({ onClose }) {
    const { quiz, deckName, deckId, triggerGeneration } = useDeck();
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/deck/quiz');
    };

    const handleRegenerate = () => {
        triggerGeneration('quiz', {}, true);
    };

    if (!quiz || quiz.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#0a0a0a] rounded-[32px] border border-white/5 opacity-50">
                <Brain size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-500">No quiz generated yet.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-dots opacity-[0.2] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/5 z-10">
                <div className="flex items-center gap-4">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Back to Chat"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 shadow-inner">
                        <Brain size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] block leading-none mb-1">Knowledge Check</span>
                        <h2 className="text-lg font-bold text-white font-heading tracking-tight">Quiz Assessment</h2>
                    </div>
                </div>
                <div>
                    <button
                        onClick={handleRegenerate}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5"
                        title="Regenerate Quiz"
                    >
                        <RotateCw size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-0">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 rotate-3">
                    <Sparkles size={48} className="text-indigo-400" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading tracking-tight">Ready to verify?</h1>
                <p className="text-gray-400 mb-10 max-w-md leading-relaxed text-base">
                    We've generated <span className="text-indigo-400 font-semibold">{quiz.length} questions</span> from "{deckName}" to test your understanding.
                </p>

                <button
                    onClick={handleStart}
                    className="px-12 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-3 group"
                >
                    Start Assessment
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
