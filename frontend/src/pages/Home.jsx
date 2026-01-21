import HeroSection from '../components/sections/HeroSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import GroundedAI from '../components/sections/GroundedAI';
import UseCases from '../components/sections/UseCases';
import FaqSection from '../components/sections/FaqSection';
import FinalCta from '../components/sections/FinalCta';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <HeroSection />
                <GroundedAI />
                <FeaturesGrid />
                <UseCases />
                <FaqSection />
                <FinalCta />
            </main>
            <Footer />
        </div>
    );
}
