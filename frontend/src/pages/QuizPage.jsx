import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import { useTheme } from '../context/ThemeContext';
import { ChevronRight, RotateCcw, Brain, CheckCircle2, XCircle, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';

export default function QuizPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { quiz, triggerGeneration, quizStatus, reviewCards, deckName } = useDeck();

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
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Generating Your Quiz...</h2>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Our AI is analyzing your documents to create a custom test.</p>
                </div>
            </Layout>
        );
    }

    if (quiz.length === 0 && quizStatus !== 'generating') {
        return (
            <Layout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle size={48} className={isDark ? "text-gray-700 mb-6" : "text-gray-300 mb-6"} />
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8 max-w-md`}>You need to trigger the quiz generation from the Studio tools in your deck first.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={() => triggerGeneration('quiz', null, true)}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            Regenerate Quiz
                        </button>
                        <button
                            onClick={() => navigate('/deck')}
                            className={`px-8 py-3 rounded-2xl border transition-all flex items-center gap-2 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200'}`}
                        >
                            <ArrowLeft size={18} /> Back to Deck
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={`min-h-[80vh] pb-12 px-4 md:px-6 flex flex-col items-center`}>
                <div className="w-full max-w-3xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate('/deck')}
                            className={`p-2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
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
                                <h1 className={`text-4xl md:text-5xl font-black mb-4 font-heading tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenge Yourself.</h1>
                                <p className={`mb-10 max-w-md leading-relaxed text-base md:text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Assess your understanding with <span className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{quiz.length} questions</span> specifically generated from your material.
                                </p>
                                <button
                                    onClick={handleStart}
                                    className={`w-full md:w-auto px-12 py-4 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 group ${isDark ? 'bg-white text-black shadow-white/5' : 'bg-gray-900 text-white shadow-black/10'
                                        }`}
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
                                    <h2 className={`text-2xl md:text-4xl font-black leading-tight font-heading ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                                                    ${!showCorrection
                                                        ? (isDark ? 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5 bg-white/2 shadow-lg text-gray-300' : 'border-gray-200 hover:border-indigo-500/50 hover:bg-gray-50 bg-white shadow-sm text-gray-700')
                                                        : ''}
                                                    ${showRight ? 'border-green-500 bg-green-500/10 text-green-600' : ''}
                                                    ${showWrong ? 'border-red-500 bg-red-500/10 text-red-600' : ''}
                                                    ${showCorrection && !showRight && !showWrong ? 'border-transparent bg-transparent opacity-20' : ''}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${!showCorrection
                                                        ? (isDark ? 'border-white/10 bg-white/5 text-gray-500 group-hover:border-indigo-500/30 group-hover:text-indigo-400' : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-indigo-500/30 group-hover:text-indigo-600')
                                                        : (showRight ? 'border-green-500 bg-green-500 text-white' : (showWrong ? 'border-red-500 bg-red-500 text-white' : (isDark ? 'border-white/5 bg-white/5 text-gray-600' : 'border-gray-100 bg-gray-100 text-gray-400')))
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className={`text-base md:text-lg font-medium transition-colors
                                                        ${showRight ? (isDark ? 'text-green-100' : 'text-green-900') : showWrong ? (isDark ? 'text-red-100' : 'text-red-900') : (isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900')}
                                                    `}>{option}</span>
                                                </div>
                                                {showRight && <CheckCircle2 size={24} className="text-green-500 shrink-0" />}
                                                {showWrong && <XCircle size={24} className="text-red-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showCorrection && (
                                    <div className="animate-in fade-in slide-in-from-bottom duration-500 grid grid-cols-1 gap-6">
                                        <div className={`p-6 rounded-3xl relative overflow-hidden border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-indigo-50 border-indigo-100'}`}>
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                                            <h4 className={`text-xs md:text-sm font-black mb-3 uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Mastery Tip</h4>
                                            <p className={`leading-relaxed text-sm md:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleNext}
                                            className={`w-full py-5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-2xl ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black'
                                                }`}
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
                                <div className="relative mb-10">
                                    <div className={`w-44 h-44 rounded-full border-[6px] transition-all duration-1000 flex flex-col items-center justify-center relative z-10 shadow-2xl ${isDark ? 'bg-[#111] border-indigo-500/20 shadow-indigo-500/10' : 'bg-white border-indigo-100 shadow-indigo-100'
                                        }`}>
                                        <span className={`text-5xl font-black font-heading ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.round((score / quiz.length) * 100)}%</span>
                                        <span className={`text-[11px] font-bold uppercase tracking-[0.2em] mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Accuracy</span>
                                    </div>
                                    <div className={`absolute inset-x-0 inset-y-0 opacity-50 blur-3xl rounded-full scale-150 -z-10 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}></div>
                                </div>
                                <h2 className={`text-4xl font-black mb-3 font-heading tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Quiz Complete!</h2>
                                <p className={`mb-10 max-w-sm text-base font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    You got <span className={isDark ? 'text-white' : 'text-gray-900'}>{score} out of {quiz.length}</span> questions correct.
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
                                        className={`w-full px-8 py-4 font-bold rounded-2xl border transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200 shadow-sm'
                                            }`}
                                    >
                                        <RotateCcw size={18} />
                                        Retake Quiz
                                    </button>
                                </div>

                                <button
                                    onClick={() => navigate('/deck')}
                                    className={`w-full max-w-lg px-8 py-3 text-sm font-bold transition-all hover:translate-y-[-2px] ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    Return to Deck
                                </button>
                            </div>
                        )}

                        {viewState === 'review' && (
                            <div className="animate-in fade-in duration-500 flex flex-col flex-1">
                                <div className="flex flex-col mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className={isDark ? "text-indigo-400" : "text-indigo-600"} size={24} />
                                        <h2 className={`text-3xl font-black font-heading ${isDark ? 'text-white' : 'text-gray-900'}`}>Concept Reinforcement</h2>
                                    </div>
                                    <p className={`text-base md:text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                                            className={`p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group border transition-colors ${isDark ? 'bg-[#151515] border-white/5' : 'bg-white border-gray-100'
                                                }`}
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Brain size={100} className={isDark ? "text-white" : "text-black"} />
                                            </div>
                                            <div className="relative z-10 mb-6">
                                                <span className={`text-[10px] uppercase tracking-[0.2em] font-black mb-3 block ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>REINFORCE</span>
                                                <h3 className={`text-xl font-black font-heading leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.q}</h3>
                                            </div>
                                            <div className={`relative z-10 pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                                                <p className={`leading-relaxed font-handwriting text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {card.a}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/deck')}
                                    className={`w-full py-5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xl mb-8 ${isDark ? 'bg-white text-black hover:bg-gray-100 shadow-white/5' : 'bg-gray-900 text-white hover:bg-black shadow-black/10'
                                        }`}
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
