import MarketingLayout from "../../components/layout/MarketingLayout";
import { BookOpen, Search, Zap, Layout } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import SEO from "../../components/common/SEO";

export default function FeaturesPage() {
    const { isDark } = useTheme();

    const features = [
        {
            icon: BookOpen,
            title: "Smart Synthesis",
            description: "Automatically summarize long documents and extract key concepts using state-of-the-art AI.",
            color: "text-blue-400",
            lightColor: "text-blue-600"
        },
        {
            icon: Zap,
            title: "Flashcard Generation",
            description: "Convert any text into high-quality flashcards optimized for spaced repetition learning.",
            color: "text-purple-400",
            lightColor: "text-purple-600"
        },
        {
            icon: Search,
            title: "Semantic Search",
            description: "Find exactly what you are looking for in your documents with AI-powered search.",
            color: "text-green-400",
            lightColor: "text-green-600"
        },
        {
            icon: Layout,
            title: "Mind Mapping",
            description: "Visualize the connections between different topics in your deck with auto-generated mind maps.",
            color: "text-orange-400",
            lightColor: "text-orange-600"
        }
    ];

    return (
        <MarketingLayout
            title="Everything you need to learn faster"
            subtitle="FlashDeck AI combines powerful AI with intuitive study tools."
        >
            <SEO
                title="Features - FlashDeck AI"
                description="Explore the powerful AI features of FlashDeck, including smart synthesis, flashcard generation, and mind mapping."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((f, i) => (
                    <div key={i} className={`p-10 rounded-[2.5rem] border transition-all group ${isDark
                            ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-gray-200/80 hover:scale-[1.01]'
                        }`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isDark ? 'bg-white/5 ' + f.color : 'bg-gray-50 ' + f.lightColor
                            }`}>
                            <f.icon size={28} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {f.description}
                        </p>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}

