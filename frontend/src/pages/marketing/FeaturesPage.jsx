import MarketingLayout from "../../components/layout/MarketingLayout";
import { BookOpen, Search, Zap, Layout } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: BookOpen,
            title: "Smart Synthesis",
            description: "Automatically summarize long documents and extract key concepts using state-of-the-art AI.",
            color: "text-blue-400"
        },
        {
            icon: Zap,
            title: "Flashcard Generation",
            description: "Convert any text into high-quality flashcards optimized for spaced repetition learning.",
            color: "text-purple-400"
        },
        {
            icon: Search,
            title: "Semantic Search",
            description: "Find exactly what you are looking for in your documents with AI-powered search.",
            color: "text-green-400"
        },
        {
            icon: Layout,
            title: "Mind Mapping",
            description: "Visualize the connections between different topics in your notebook with auto-generated mind maps.",
            color: "text-orange-400"
        }
    ];

    return (
        <MarketingLayout
            title="Everything you need to learn faster"
            subtitle="FlashDeck AI combines powerful AI with intuitive study tools."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((f, i) => (
                    <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                            <f.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                        <p className="text-gray-400 leading-relaxed">
                            {f.description}
                        </p>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}
