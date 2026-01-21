import MarketingLayout from "../../components/layout/MarketingLayout";
import { Mail, MessageSquare, Twitter, Github } from "lucide-react";
import Button from "../../components/ui/Button";

export default function ContactPage() {
    return (
        <MarketingLayout
            title="Get in touch"
            subtitle="Have questions or feedback? We'd love to hear from you."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">We're here to help.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Whether you're experiencing technical issues, have a feature request, or just want to say hi, our team is always listening.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Email Us</h4>
                                <p className="text-gray-500">support@flashdeck.ai</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                                <Twitter size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">X (Twitter)</h4>
                                <p className="text-gray-500">@FlashDeckAI</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Name</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Message</label>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 min-h-[150px]" placeholder="How can we help?"></textarea>
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg">Send Message</Button>
                    </form>
                </div>
            </div>
        </MarketingLayout>
    );
}
