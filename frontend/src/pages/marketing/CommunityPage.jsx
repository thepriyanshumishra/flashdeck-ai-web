import MarketingLayout from "../../components/layout/MarketingLayout";
import { MessageSquare, Users, Award, Shield, Heart, Zap, Coffee, Globe } from "lucide-react";

export default function CommunityPage() {
    const stats = [
        { label: "Active Learners", value: "24k+" },
        { label: "Decks Shared", value: "112k+" },
        { label: "Monthly Sessions", value: "850k" }
    ];

    const channels = [
        {
            icon: MessageSquare,
            title: "Discord Server",
            description: "Real-time discussions, study rooms, and direct access to the developers.",
            color: "text-blue-400",
            button: "Join Discord"
        },
        {
            icon: Users,
            title: "Study Cohorts",
            description: "Structured groups for medical, law, and engineering disciplines.",
            color: "text-purple-400",
            button: "Browse Cohorts"
        },
        {
            icon: Award,
            title: "Champion Program",
            description: "For elite users who contribute templates and mentor others.",
            color: "text-yellow-400",
            button: "Learn More"
        },
        {
            icon: Coffee,
            title: "Campus Meetups",
            description: "Find local FlashDeck AI user groups at your university.",
            color: "text-orange-400",
            button: "Find Local"
        }
    ];

    return (
        <MarketingLayout
            title="A community of lifelong learners"
            subtitle="Connect with peers, share resources, and study smarter together."
        >
            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 mb-24">
                {stats.map((s, i) => (
                    <div key={i} className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-white mb-2">{s.value}</div>
                        <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {channels.map((ch, i) => (
                    <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${ch.color}`}>
                            <ch.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">{ch.title}</h3>
                        <p className="text-gray-400 leading-relaxed mb-10">
                            {ch.description}
                        </p>
                        <button className={`px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-all`}>
                            {ch.button}
                        </button>
                    </div>
                ))}
            </div>

            {/* Featured Section */}
            <div className="mt-32 p-12 lg:p-20 rounded-[3rem] bg-gradient-to-b from-purple-500/10 to-transparent border border-white/10 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase">
                        <Heart size={12} fill="currentColor" />
                        <span>Contributor Choice</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">FlashDeck Marketplace</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">Discover expertly crafted flashcard decks and mind map templates shared by the community. Perfect for standardized tests and niche subjects.</p>
                    <button className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5">Explore Marketplace</button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 w-full h-full min-h-[300px]">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between aspect-square">
                            <div className="w-8 h-8 rounded-lg bg-white/10" />
                            <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-white/20 rounded-full" />
                                <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MarketingLayout>
    );
}
