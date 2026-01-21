import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import { ChevronRight, RotateCcw, Brain, CheckCircle2, XCircle, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';

export default function QuizPage() {
    const navigate = useNavigate();
    const { quiz, triggerGeneration, quizStatus, reviewCards, deckName, resetQuiz } = useDeck();

    const [viewState, setViewState] = useState('intro'); // intro, active, feedback, results, review
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]); // Array of { questionIndex, selectedOption, isCorrect }
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCorrection, setShowCorrection] = useState(false);

    const currentQuestion = quiz[currentIndex];

    const handleStart = () => {
        if (quiz.length > 0) {
            setViewState('active');
            setCurrentIndex(0);
            setUserAnswers([]);
        }
    };

    const handleOptionSelect = (option) => {
        if (showCorrection) return;

        const isCorrect = option === currentQuestion.answer;
        setUserAnswers(prev => [...prev, {
            questionIndex: currentIndex,
            selectedOption: option,
            isCorrect: isCorrect,
            question: currentQuestion.question,
            correctAnswer: currentQuestion.answer,
            explanation: currentQuestion.explanation
        }]);

        setShowCorrection(true);
    };

    const handleNext = () => {
        setShowCorrection(false);
        if (currentIndex < quiz.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setViewState('results');
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const missed = userAnswers.filter(a => !a.isCorrect);
        await triggerGeneration('review', missed);
        setIsAnalyzing(false);
        setViewState('review');
    };

    const score = userAnswers.filter(a => a.isCorrect).length;

    if (quizStatus === 'generating') {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Generating Your Quiz...</h2>
                    <p className="text-gray-400">Our AI is analyzing your documents to create a custom test.</p>
                </div>
            </Layout>
        );
    }

    if (quiz.length === 0 && quizStatus !== 'generating') {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
                    <AlertCircle size={48} className="text-gray-600 mb-6" />
                    <p className="text-gray-400 mb-8 text-center max-w-md">You need to trigger the quiz generation from the Studio tools in your notebook first.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={() => triggerGeneration('quiz', null, true)}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            Regenerate Quiz
                        </button>
                        <button
                            onClick={() => navigate('/notebook')}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={18} /> Back to Notebook
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen pb-12 px-4 md:px-6 bg-[#0a0a0a] flex flex-col items-center">
                <div className="w-full max-w-3xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate('/notebook')}
                            className="p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex flex-col items-center">
                            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Interactive Quiz
                            </h1>
                            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{deckName}</p>
                        </div>
                        <div className="w-10"></div> {/* Spacer */}
                    </div>

                    {/* Progress Bar */}
                    {viewState === 'active' && (
                        <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 md:mb-12 overflow-hidden border border-white/5 p-[1px]">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="min-h-[400px] flex flex-col">

                        {viewState === 'intro' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                                <div className="absolute inset-0 bg-dots opacity-[0.1] -z-10" />
                                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 rotate-3">
                                    <Brain size={48} className="text-indigo-400" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading tracking-tight">Challenge Yourself.</h1>
                                <p className="text-gray-400 mb-10 max-w-md leading-relaxed text-base md:text-lg">
                                    Assess your understanding with <span className="text-indigo-400 font-semibold">{quiz.length} questions</span> specifically generated from your data.
                                </p>
                                <button
                                    onClick={handleStart}
                                    className="w-full md:w-auto px-12 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-3 group"
                                >
                                    Start Assessment
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {viewState === 'active' && (
                            <div className="animate-in slide-in-from-right duration-500 flex flex-col flex-1">
                                <div className="mb-8 md:mb-12">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-500/20">Step {currentIndex + 1} of {quiz.length}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight font-heading">
                                        {currentQuestion.question}
                                    </h2>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = userAnswers.find(a => a.questionIndex === currentIndex)?.selectedOption === option;
                                        const isCorrect = option === currentQuestion.answer;
                                        const showWrong = showCorrection && isSelected && !isCorrect;
                                        const showRight = showCorrection && isCorrect;

                                        return (
                                            <button
                                                key={idx}
                                                disabled={showCorrection}
                                                onClick={() => handleOptionSelect(option)}
                                                className={`w-full p-5 md:p-6 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group relative overflow-hidden
                                                    ${!showCorrection ? 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5 bg-white/2 shadow-lg' : ''}
                                                    ${showRight ? 'border-green-500 bg-green-500/10 text-green-100' : ''}
                                                    ${showWrong ? 'border-red-500 bg-red-500/10 text-red-100' : ''}
                                                    ${showCorrection && !showRight && !showWrong ? 'border-white/5 bg-white/[0.01] opacity-40' : ''}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${!showCorrection ? 'border-white/10 bg-white/5 text-gray-400 group-hover:border-indigo-500/30 group-hover:text-indigo-400' : (showRight ? 'border-green-500/30 bg-green-500 text-white' : (showWrong ? 'border-red-500/30 bg-red-500 text-white' : 'border-white/5 bg-white/5 text-gray-600'))}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="text-base md:text-lg font-medium">{option}</span>
                                                </div>
                                                {showRight && <CheckCircle2 size={24} className="text-green-500 shrink-0" />}
                                                {showWrong && <XCircle size={24} className="text-red-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showCorrection && (
                                    <div className="animate-in fade-in slide-in-from-bottom duration-500 grid grid-cols-1 gap-6">
                                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                            <h4 className="text-xs md:text-sm font-bold text-indigo-400 mb-3 uppercase tracking-widest">Mastery Tip</h4>
                                            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group shadow-2xl"
                                        >
                                            {currentIndex === quiz.length - 1 ? "Complete Assessment" : "Continue to Next"}
                                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {viewState === 'results' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                                <div className="absolute inset-0 bg-dots opacity-[0.1] -z-10" />
                                <div className="relative mb-10 card-glow">
                                    <div className="w-40 h-40 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center relative z-10 bg-[#0d0d0d] shadow-2xl">
                                        <span className="text-4xl font-bold text-white font-heading">{Math.round((score / quiz.length) * 100)}%</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Accuracy</span>
                                    </div>
                                    <div className="absolute inset-x-0 inset-y-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 -z-10"></div>
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-2 font-heading tracking-tight">Quiz Complete!</h2>
                                <p className="text-gray-400 mb-10 max-w-sm text-sm md:text-base">
                                    You got {score} out of {quiz.length} questions correct.
                                    {score === quiz.length ? " Perfect score! You're a master of this material." : " Great effort! Let's review what you missed."}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-4">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <RotateCcw size={18} className="animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Targeted Review
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleStart}
                                        className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={18} />
                                        Retake Quiz
                                    </button>
                                </div>

                                <button
                                    onClick={() => navigate('/notebook')}
                                    className="w-full max-w-lg px-8 py-3 text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    Return to Notebook
                                </button>
                            </div>
                        )}

                        {viewState === 'review' && (
                            <div className="animate-in fade-in duration-500 flex flex-col flex-1">
                                <div className="flex flex-col mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="text-indigo-400" size={24} />
                                        <h2 className="text-3xl font-bold text-white font-heading">Concept Reinforcement</h2>
                                    </div>
                                    <p className="text-gray-400 text-base md:text-lg">
                                        We've distilled the core concepts where your accuracy was lower.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                                    {reviewCards.map((card, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-8 rounded-[2rem] bg-[#151515] border border-white/5 shadow-2xl relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                                <Brain size={100} />
                                            </div>
                                            <div className="relative z-10 mb-6">
                                                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black mb-3 block">REINFORCE</span>
                                                <h3 className="text-xl font-bold text-white font-heading leading-snug">{card.q}</h3>
                                            </div>
                                            <div className="relative z-10 pt-6 border-t border-white/5">
                                                <p className="text-gray-400 leading-relaxed font-handwriting text-xl">
                                                    {card.a}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/notebook')}
                                    className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-2xl mb-8"
                                >
                                    Mastery Complete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
