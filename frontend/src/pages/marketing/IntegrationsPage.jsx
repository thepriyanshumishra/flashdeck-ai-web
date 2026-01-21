import MarketingLayout from "../../components/layout/MarketingLayout";
import { Link2, Github, Slack, Chrome, Layers, Box, Database, MessageSquare, Monitor, Share2 } from "lucide-react";

export default function IntegrationsPage() {
    const categories = [
        {
            title: "Data Sources",
            items: [
                { name: "Google Drive", icon: Share2, status: "Active", desc: "Import PDFs directly from your cloud." },
                { name: "Notion", icon: Layers, status: "Developing", desc: "Sync your Notion pages as decks." },
                { name: "GitHub", icon: Github, status: "Active", desc: "Sync markdown documentation files." }
            ]
        },
        {
            title: "Export & Tools",
            items: [
                { name: "Anki", icon: Box, status: "Active", desc: "One-click export to Anki flashcards." },
                { name: "Chrome", icon: Monitor, status: "Beta", desc: "Capture snippets from any website." },
                { name: "Obsidian", icon: Database, status: "Coming Soon", desc: "Connect to your local knowledge graph." }
            ]
        },
        {
            title: "Communication",
            items: [
                { name: "Slack", icon: MessageSquare, status: "Coming Soon", desc: "Daily quiz reminders in your Slack." }
            ]
        }
    ];

    return (
        <MarketingLayout
            title="Integrations"
            subtitle="FlashDeck AI lives where you work. Connect to your favorites."
        >
            <div className="space-y-24">
                {categories.map((cat, i) => (
                    <div key={i} className="space-y-8">
                        <h3 className="text-2xl font-bold text-white px-4 border-l-2 border-purple-500">{cat.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {cat.items.map((item, j) => (
                                <div key={j} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col group relative">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <item.icon size={28} className="text-gray-300" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${item.status === "Active" ? "bg-green-500/10 text-green-400" : item.status === "Beta" ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-gray-500"}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2">{item.name}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
                                        {item.desc}
                                    </p>
                                    <button className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors text-left flex items-center gap-2">
                                        {item.status === "Active" ? "Configure Now" : "Join Waitlist"}
                                        <Link2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Developer Section */}
            <div className="mt-32 p-12 lg:p-20 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Build your own integration.</h2>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto">Access our robust GraphQL API to build custom workflows or integrate FlashDeck into your own academic tools.</p>
                <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white hover:text-black transition-all">Read API Docs</button>
            </div>
        </MarketingLayout>
    );
}
