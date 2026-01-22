import MarketingLayout from "../../components/layout/MarketingLayout";
import { Upload, Cpu, GraduationCap } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import SEO from "../../components/common/SEO";

export default function HowItWorksPage() {
    const { isDark } = useTheme();

    const steps = [
        {
            icon: Upload,
            title: "Upload Your Sources",
            description: "Drag and drop your PDFs, lecture notes, or slides. We support multiple file formats and even raw text.",
            color: "text-blue-400",
            lightColor: "text-blue-600",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
        },
        {
            icon: Cpu,
            title: "AI Analysis",
            description: "Our advanced AI models digest your content, identifying key concepts, definitions, and relationships.",
            color: "text-purple-400",
            lightColor: "text-purple-600",
            image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800"
        },
        {
            icon: GraduationCap,
            title: "Master the Material",
            description: "Study with interactive flashcards, take quizzes, and explore visual mind maps personalized for you.",
            color: "text-green-400",
            lightColor: "text-green-600",
            image: "https://images.unsplash.com/photo-1635776062127-d379bfcbb9c8?auto=format&fit=crop&q=80&w=800"
        }
    ];

    return (
        <MarketingLayout
            title="How it Works"
            subtitle="FlashDeck AI turns your study material into knowledge in three simple steps."
        >
            <SEO
                title="How it Works - FlashDeck AI"
                description="Learn how FlashDeck AI uses advanced technology to transform your study materials into interactive learning tools in three simple steps."
            />
            <div className="space-y-24">
                {steps.map((step, i) => (
                    <div key={i} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-16`}>
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto md:mx-0 transition-colors ${isDark ? 'bg-white/5 ' + step.color : 'bg-gray-100 ' + step.lightColor
                                }`}>
                                <step.icon size={32} />
                            </div>
                            <h3 className={`text-3xl md:text-5xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <span className={`${isDark ? 'text-gray-800' : 'text-gray-200'} mr-4`}>0{i + 1}.</span>
                                {step.title}
                            </h3>
                            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {step.description}
                            </p>
                        </div>
                        <div className={`flex-1 w-full max-w-[400px] aspect-square rounded-[3rem] border overflow-hidden group mx-auto transition-all shadow-2xl ${isDark ? 'bg-white/[0.02] border-white/10 shadow-black' : 'bg-white border-gray-100 shadow-gray-200/50'
                            }`}>
                            <img
                                src={step.image}
                                alt={step.title}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700 blur-[0.5px] group-hover:blur-0 grayscale group-hover:grayscale-0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}

