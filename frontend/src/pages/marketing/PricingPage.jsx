import MarketingLayout from "../../components/layout/MarketingLayout";
import { Check } from "lucide-react";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";
import SEO from "../../components/common/SEO";

export default function PricingPage() {
    const { isDark } = useTheme();

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
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600'
                        }`}>
                        <span>🚀 FlashDeck AI is 100% Free during Beta</span>
                    </div>
                </div>
            }
        >
            <SEO
                title="Pricing - FlashDeck AI"
                description="Flexible pricing plans designed for every learning style. Join our public beta and master your material for free."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col ${plan.popular
                                ? (isDark ? "bg-white/[0.05] border-white/20 scale-105 shadow-2xl shadow-black" : "bg-white border-indigo-200 scale-105 shadow-2xl shadow-indigo-100")
                                : (isDark ? "bg-white/[0.02] border-white/10 hover:border-white/20" : "bg-white border-gray-100 hover:border-gray-200 shadow-xl shadow-gray-200/50")
                            }`}
                    >
                        {plan.popular && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block w-fit">
                                Most Popular
                            </span>
                        )}
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/month</span>
                        </div>
                        <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.description}</p>

                        <div className="space-y-4 mb-8 flex-grow">
                            {plan.features.map((f, j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
                                        }`}>
                                        <Check size={12} />
                                    </div>
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{f}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            className={`w-full rounded-2xl py-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.popular
                                    ? (isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200')
                                    : (isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100')
                                }`}
                        >
                            {plan.button}
                        </Button>
                    </div>
                ))}
            </div>
        </MarketingLayout>
    );
}
