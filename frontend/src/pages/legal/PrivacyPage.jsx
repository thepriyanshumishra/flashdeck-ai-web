import MarketingLayout from "../../components/layout/MarketingLayout";

export default function PrivacyPage() {
    return (
        <MarketingLayout
            title="Privacy Policy"
            subtitle="How we handle your data with care."
        >
            <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 md:p-16 space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Information Collection</h2>
                    <p className="text-gray-400 leading-relaxed">
                        FlashDeck AI collects information that you provide directly to us when you create an account, upload documents, and interact with our study tools. This includes your name, email address, and the content of your uploaded materials.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. Data Usage</h2>
                    <p className="text-gray-400 leading-relaxed">
                        The primary purpose of collecting your data is to provide and improve your learning experience. We use your uploaded documents solely to generate study aids (flashcards, quizzes, mind maps) for your personal use.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Information Sharing</h2>
                    <p className="text-gray-400 leading-relaxed">
                        We do not sell your personal information or uploaded documents to third parties. We only share data with service providers who help us operate our platform (e.g., cloud storage and AI providers) under strict confidentiality agreements.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">4. Your Security</h2>
                    <p className="text-gray-400 leading-relaxed">
                        We implement industry-standard security measures to protect your data. Your files are encrypted at rest and in transit.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/5 text-sm text-gray-500">
                    Last updated: January 21, 2026
                </div>
            </div>
        </MarketingLayout>
    );
}
