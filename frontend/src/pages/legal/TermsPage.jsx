import MarketingLayout from "../../components/layout/MarketingLayout";

export default function TermsPage() {
    return (
        <MarketingLayout
            title="Terms of Service"
            subtitle="The rules of the platform."
        >
            <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 md:p-16 space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                    <p className="text-gray-400 leading-relaxed">
                        By accessing or using FlashDeck AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. User Conduct</h2>
                    <p className="text-gray-400 leading-relaxed">
                        You are responsible for all content you upload to the platform. You agree not to use the service for any illegal or unauthorized purpose.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/5 text-sm text-gray-500">
                    Last updated: January 21, 2026
                </div>
            </div>
        </MarketingLayout>
    );
}
