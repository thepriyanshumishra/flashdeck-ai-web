import MarketingLayout from "../../components/layout/MarketingLayout";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";

export default function BlogPage() {
    const posts = [
        {
            title: "The Science of Spaced Repetition",
            date: "Jan 20, 2026",
            author: "Dr. Elena Vance",
            category: "Academy",
            image: "https://images.unsplash.com/photo-1501503060800-5fa8b297c16a?w=800&auto=format&fit=crop",
            excerpt: "Spaced repetition is not just a study hack—it's high-performance memory engineering. Learn how our AI optimizes your review intervals.",
            readTime: "8 min"
        },
        {
            title: "How to Build a Second Brain with FlashDeck",
            date: "Jan 18, 2026",
            author: "Marcus Aurelius",
            category: "Productive",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop",
            excerpt: "Transform your disorganized PDFs and messy notes into a structured mental database. We show you the ultimate workflow setup.",
            readTime: "6 min"
        },
        {
            title: "Introducing Collaborative Notebooks",
            date: "Jan 12, 2026",
            author: "Product Team",
            category: "Update",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
            excerpt: "Study groups no longer need ten different apps. Work together on mind maps and quizzes in real-time with our latest v2.1 update.",
            readTime: "4 min"
        },
        {
            title: "AI Grounding: Why hallucinations happen and how we fixed them",
            date: "Jan 05, 2026",
            author: "Tech Core",
            category: "Tech",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
            excerpt: "General LLMs often guess. Our Source-Grounded Thinking ensures your AI partner only speaks the truth from your specific sources.",
            readTime: "12 min"
        }
    ];

    return (
        <MarketingLayout
            title="Latest Insights"
            subtitle="The intersection of AI, cognitive science, and student productivity."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {posts.map((post, i) => (
                    <article
                        key={i}
                        className="group relative flex flex-col md:flex-row gap-8 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                    >
                        {/* Image Container */}
                        <div className="w-full md:w-48 lg:w-64 h-48 rounded-3xl overflow-hidden shrink-0 relative">
                            <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                                    {post.category}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-between py-2 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                                    <span className="flex items-center gap-1.5"><Tag size={14} /> {post.readTime}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-purple-400 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                    {post.excerpt}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/20" />
                                    <span className="text-xs text-gray-400 font-medium">{post.author}</span>
                                </div>
                                <ArrowRight className="text-gray-500 group-hover:translate-x-1 group-hover:text-white transition-all" size={18} />
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Newsletter Section */}
            <div className="mt-32 p-12 lg:p-20 rounded-[3rem] bg-white/[0.02] border border-white/10 text-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stay ahead of the curve.</h2>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto">Get the best study strategies and product updates delivered straight to your inbox once a month.</p>
                <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="Email address"
                        className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <button className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all whitespace-nowrap">Subscribe</button>
                </form>
            </div>
        </MarketingLayout>
    );
}
