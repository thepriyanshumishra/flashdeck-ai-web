import React, { useState } from 'react';
import { X, Sparkles, Sliders } from 'lucide-react';

export default function GenerationSettingsModal({ toolName, onClose, onGenerate }) {
    const [difficulty, setDifficulty] = useState('medium');
    const [count, setCount] = useState(10);
    const [instructions, setInstructions] = useState('');

    const handleSubmit = () => {
        onGenerate({ difficulty, count, instructions });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                                <Sliders size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white font-heading">Customize {toolName}</h3>
                                <p className="text-xs text-gray-500">Refine the AI generation</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Difficulty */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Difficulty Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all border ${difficulty === level
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Count */}
                        {toolName !== 'Mind Map' && toolName !== 'Reports' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-300">Item Count</label>
                                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{count}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    step="1"
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                />
                                <div className="flex justify-between text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                                    <span>Min (5)</span>
                                    <span>Max (20)</span>
                                </div>
                            </div>
                        )}

                        {/* Custom Instructions */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Custom Instructions</label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="E.g., Focus on specific topics, ignore dates, use bullet points..."
                                className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full mt-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                    >
                        <Sparkles size={18} />
                        Generate with AI
                    </button>
                </div>
            </div>
        </div>
    );
}
