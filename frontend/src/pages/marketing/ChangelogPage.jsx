import MarketingLayout from "../../components/layout/MarketingLayout";

export default function ChangelogPage() {
    const changes = [
        {
            version: "v2.1",
            date: "Jan 18, 2026",
            title: "Performance & Polish",
            items: [
                "Improved AI generation response times by 40%",
                "Refined animations for a more premium experience",
                "New 'Passwordless' login method for easier access",
                "Bug fixes in Mind Map rendering logic"
            ]
        },
        {
            version: "v2.0",
            date: "Jan 01, 2026",
            title: "The Bento Update",
            items: [
                "Complete redesign of the landing page",
                "Added Bento-style feature grids",
                "Launched high-fidelity mobile preview",
                "Introduced community discussion hubs"
            ]
        }
    ];

    return (
        <MarketingLayout
            title="Changelog"
            subtitle="Follow the progress as we build the future of learning."
        >
            <div className="max-w-3xl mx-auto space-y-12">
                {changes.map((change, i) => (
                    <div key={i} className="relative pl-12 border-l border-white/10 pb-12">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-purple-400 font-bold font-mono">{change.version}</span>
                                <span className="text-gray-600 text-sm">{change.date}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">{change.title}</h3>
                        </div>
                        <ul className="space-y-3">
                            {change.items.map((item, j) => (
                                <li key={j} className="text-gray-400 flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}
