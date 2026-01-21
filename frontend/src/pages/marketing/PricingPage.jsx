import MarketingLayout from "../../components/layout/MarketingLayout";
import { Check } from "lucide-react";
import Button from "../../components/ui/Button";

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "Perfect for students getting started.",
            features: ["5 Decks", "Basic AI Generation", "Community Support", "Mobile Web Access"],
            button: "Get Started",
            variant: "outline"
        },
        {
            name: "Pro",
            price: "$0",
            description: "Everything in Free, plus advanced tools.",
            features: ["Unlimited Decks", "Advanced AI Models", "Priority Support", "PDF Exports", "Custom Templates"],
            button: "Go Pro (Free for Beta)",
            variant: "solid",
            popular: true
        },
        {
            name: "Team",
            price: "$0",
            description: "Collaborative study groups.",
            features: ["Shared Decks", "Admin Dashboard", "Team Analytics", "API Access"],
            button: "Join as Beta Team",
            variant: "outline"
        }
    ];

    return (
        <MarketingLayout
            title="Pricing that scales with you"
            subtitle={
                <div className="space-y-4">
                    <p>FlashDeck AI is currently in its public testing phase.</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold">
                        <span>🚀 FlashDeck AI is 100% Free during Beta</span>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${plan.popular ? "bg-white/[0.05] border-white/20 scale-105 shadow-2xl shadow-purple-500/10" : "bg-white/[0.02] border-white/10 hover:border-white/20"}`}
                    >
                        {plan.popular && (
                            <span className="bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">
                                Most Popular
                            </span>
                        )}
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                            <span className="text-gray-500 text-sm">/month</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-8">{plan.description}</p>

                        <div className="space-y-4 mb-8">
                            {plan.features.map((f, j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-green-500" />
                                    </div>
                                    <span className="text-gray-300 text-sm">{f}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full rounded-2xl py-3"
                            variant={plan.variant === "solid" ? "primary" : "outline"}
                        >
                            {plan.button}
                        </Button>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}
