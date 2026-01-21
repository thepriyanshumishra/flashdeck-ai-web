import MarketingLayout from "../../components/layout/MarketingLayout";
import { Users, GraduationCap, Target, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <MarketingLayout
            title="Our Mission"
            subtitle="Empowering students to master any subject with the power of AI."
        >
            <div className="space-y-24">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Why we built FlashDeck AI</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            FlashDeck AI was born out of a simple observation: students are overwhelmed by information but starved for knowledge. Traditional study methods are slow, and generic AI often lacks the context of specific course materials.
                        </p>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            We set out to build a platform that doesn't just "chat" with your documents, but understands them as a study partner would—extracting define-able concepts, generating active recall tools, and visualizing complex relationships.
                        </p>
                    </div>
                    <div className="aspect-square rounded-[3rem] border border-white/10 overflow-hidden group">
                        <img
                            src="/mockups/ai_study_partner_about.png"
                            alt="AI Study Partner"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Users, title: "Student First", desc: "Every feature is designed to reduce cognitive load and improve retention." },
                        { icon: Target, title: "Precision AI", desc: "Our models are grounded in your sources to ensure academic accuracy." },
                        { icon: Heart, title: "Community Driven", desc: "We build based on feedback from students and researchers worldwide." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-purple-400">
                                <item.icon size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-white">{item.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </MarketingLayout>
    );
}
