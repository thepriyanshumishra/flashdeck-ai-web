import MarketingLayout from "../../components/layout/MarketingLayout";

export default function CookiePage() {
    return (
        <MarketingLayout
            title="Cookie Policy"
            subtitle="How we use cookies to improve your experience."
        >
            <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 md:p-16 space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. What are cookies?</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Cookies are small text files stored on your device to help websites function better and provide a more personalized experience.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. How we use them</h2>
                    <p className="text-gray-400 leading-relaxed">
                        We use essential cookies for authentication and session management. We may also use analytical cookies to understand how users interact with our platform.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/5 text-sm text-gray-500">
                    Last updated: January 21, 2026
                </div>
            </div>
        </MarketingLayout>
    );
}
