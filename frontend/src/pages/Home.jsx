import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import GroundedAI from '../components/sections/GroundedAI';
import UseCases from '../components/sections/UseCases';
import FaqSection from '../components/sections/FaqSection';
import FinalCta from '../components/sections/FinalCta';

export default function Home() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/library', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;
    }

    // Still return the marketing page while user is not logged in
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
