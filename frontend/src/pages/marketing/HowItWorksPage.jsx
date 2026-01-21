import MarketingLayout from "../../components/layout/MarketingLayout";
import { Upload, Cpu, GraduationCap, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Upload,
            title: "Upload Your Sources",
            description: "Drag and drop your PDFs, lecture notes, or slides. We support multiple file formats and even raw text.",
            color: "text-blue-400",
            image: "/mockups/upload_step_illustration.png"
        },
        {
            icon: Cpu,
            title: "AI Analysis",
            description: "Our advanced AI models digest your content, identifying key concepts, definitions, and relationships.",
            color: "text-purple-400",
            image: "/mockups/ai_analysis_step_illustration.png"
        },
        {
            icon: GraduationCap,
            title: "Master the Material",
            description: "Study with interactive flashcards, take quizzes, and explore visual mind maps personalized for you.",
            color: "text-green-400",
            image: "/mockups/mastery_step_illustration.png"
        }
    ];

    return (
        <MarketingLayout
            title="How it Works"
            subtitle="FlashDeck AI turns your study material into knowledge in three simple steps."
        >
            <div className="space-y-24">
                {steps.map((step, i) => (
                    <div key={i} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-16`}>
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto md:mx-0 ${step.color}`}>
                                <step.icon size={32} />
                            </div>
                            <h3 className="text-3xl font-bold text-white leading-tight">
                                <span className="text-gray-600 mr-4">0{i + 1}.</span>
                                {step.title}
                            </h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                        <div className="flex-1 w-full max-w-[300px] aspect-square bg-white/[0.02] rounded-[3rem] border border-white/10 overflow-hidden group mx-auto">
                            <img
                                src={step.image}
                                alt={step.title}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 blur-[0.5px] group-hover:blur-0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}
