import MarketingLayout from "../../components/layout/MarketingLayout";
import { Search, HelpCircle, LifeBuoy, FileQuestion, Book, Shield, Zap } from "lucide-react";

export default function HelpCenterPage() {
    const categories = [
        {
            icon: HelpCircle,
            title: "Getting Started",
            articles: ["Creating your first notebook", "Uploading different file types", "Account verification", "Setting up your profile"],
            color: "text-purple-400"
        },
        {
            icon: LifeBuoy,
            title: "Troubleshooting",
            articles: ["PDF parsing errors", "Login issues", "Slow AI response times", "Mobile sync problems"],
            color: "text-blue-400"
        },
        {
            icon: Zap,
            title: "Features & Tools",
            articles: ["Using the Mind Map Editor", "Exporting flashcards to Anki", "Customizing Quiz difficulty", "AI Grounding explained"],
            color: "text-orange-400"
        },
        {
            icon: Shield,
            title: "Privacy & Security",
            articles: ["Data encryption standards", "Deleting your account data", "GDPR compliance", "Trusted service providers"],
            color: "text-green-400"
        },
        {
            icon: FileQuestion,
            title: "Billing & Plans",
            articles: ["Free Beta phase details", "Managing your Pro subscription", "Team plan administration", "Refund policy"],
            color: "text-pink-400"
        },
        {
            icon: Book,
            title: "Academic Integrity",
            articles: ["Using AI as a study partner", "AI in the classroom guide", "Citing sources with FlashDeck", "Best practices"],
            color: "text-yellow-400"
        }
    ];

    return (
        <MarketingLayout
            title="How can we help?"
            subtitle="Explore our comprehensive help articles or reach out to our team."
        >
            {/* Search Hub */}
            <div className="max-w-3xl mx-auto mb-24">
                <div className="relative group">
                    <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Search for answers, guides, or troubleshooting..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-white text-lg focus:outline-none focus:border-purple-500/50 transition-all font-medium relative z-10 backdrop-blur-xl"
                    />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-gray-500">
                    <span>Popular:</span>
                    <button className="hover:text-white transition-colors">Uploading PDFs</button>
                    <span>•</span>
                    <button className="hover:text-white transition-colors">Beta Access</button>
                    <span>•</span>
                    <button className="hover:text-white transition-colors">Mind Map</button>
                </div>
            </div>

            {/* Support Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                    <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group flex flex-col">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${cat.color}`}>
                            <cat.icon size={28} />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-6 underline decoration-white/5 underline-offset-8">{cat.title}</h4>
                        <ul className="space-y-4 flex-grow">
                            {cat.articles.map((article, j) => (
                                <li key={j}>
                                    <button className="text-gray-400 hover:text-white text-sm transition-colors text-left flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/10 mt-2 shrink-0" />
                                        {article}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-8 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                            View all articles <span>→</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Bottom Contact Section */}
            <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px]" />
                <h3 className="text-3xl font-bold text-white mb-4">Still need assistance?</h3>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto">If you couldn't find your answer, please reach out to our dedicated support team. We're available 24/7 during the Beta phase.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-10 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all">Submit a Ticket</button>
                    <button className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">Chat with us</button>
                </div>
            </div>
        </MarketingLayout>
    );
}
