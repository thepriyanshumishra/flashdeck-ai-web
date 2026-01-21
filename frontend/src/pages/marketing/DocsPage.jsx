import MarketingLayout from "../../components/layout/MarketingLayout";
import { Book, Terminal, Code, Cpu, Shield, Zap, Search, Layers } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("introduction");

    const sections = {
        introduction: {
            title: "Introduction",
            content: "FlashDeck AI is an AI-native research and learning platform that turns your documents into structured knowledge. Whether you're a student preparing for exams or a researcher synthesizing complex papers, our tools help you master material in record time.",
            highlights: [
                { icon: Zap, title: "Instant Flashcards", text: "Turn any PDF into active recall cards." },
                { icon: Search, title: "Semantic Search", text: "Find concepts, not just keywords." }
            ]
        },
        "getting-started": {
            title: "Getting Started",
            content: "To get started, simply sign in and create your first deck. You can upload PDFs, Word documents, or even paste raw text from your lectures.",
            steps: [
                "Create a new Deck from the dashboard.",
                "Upload your study materials (PDF, DOCX, TXT).",
                "Wait for AI to process and synthesize your content.",
                "Start studying with flashcards, quizzes, or mind maps."
            ]
        },
        "ai-features": {
            title: "AI Features",
            content: "We use state-of-the-art Large Language Models (LLMs) to provide source-grounded insights. This means every answer the AI gives is directly linked back to your documents.",
            items: [
                "Source Grounding: No hallucinations—just facts from your notes.",
                "Automatic Synthesis: Long chapters turned into byte-sized summaries.",
                "Multi-modal Support: Support for diagrams and complex tables coming soon."
            ]
        },
        "privacy-security": {
            title: "Privacy & Security",
            content: "Your data is yours. We encrypt all uploads at rest and in transit.",
            details: "We do not use your private documents to train our global models. Your learning safe-space is entirely private."
        }
    };

    return (
        <MarketingLayout
            title="Documentation"
            subtitle="Understand every feature and master your workflow."
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-8">
                    <div className="space-y-1">
                        <h4 className="text-white font-bold mb-4 px-3 text-sm uppercase tracking-wider">Guides</h4>
                        {Object.keys(sections).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${activeSection === key ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"}`}
                            >
                                {sections[key].title}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 space-y-4">
                        <h5 className="text-white font-bold text-sm">Need help?</h5>
                        <p className="text-gray-400 text-xs leading-relaxed">Can't find what you're looking for? Our support team is here.</p>
                        <Link to="/contact" className="inline-block text-purple-400 text-xs font-bold hover:underline">Contact Support</Link>
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-12">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-16 min-h-[500px]">
                        <h2 className="text-4xl font-bold text-white mb-8">{sections[activeSection].title}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10">
                            {sections[activeSection].content}
                        </p>

                        {sections[activeSection].highlights && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                                {sections[activeSection].highlights.map((h, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                        <h.icon className="text-purple-400" size={24} />
                                        <h4 className="text-white font-bold">{h.title}</h4>
                                        <p className="text-gray-500 text-sm">{h.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sections[activeSection].steps && (
                            <div className="space-y-4 mt-8">
                                {sections[activeSection].steps.map((step, i) => (
                                    <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <span className="text-gray-300 font-medium">{step}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sections[activeSection].items && (
                            <div className="space-y-6 mt-8">
                                {sections[activeSection].items.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 shrink-0" />
                                        <p className="text-gray-400 leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sections[activeSection].details && (
                            <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 italic text-blue-300">
                                {sections[activeSection].details}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-8 text-sm">
                        <span className="text-gray-600">Updated Jan 21, 2026</span>
                        <div className="flex gap-4">
                            <button className="text-gray-400 hover:text-white transition-colors">Was this helpful?</button>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-all text-xs">Yes</button>
                                <button className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-all text-xs">No</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
