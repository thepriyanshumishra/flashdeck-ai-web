import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import GroundedAI from '../components/sections/GroundedAI';
import UseCases from '../components/sections/UseCases';
import FaqSection from '../components/sections/FaqSection';
import FinalCta from '../components/sections/FinalCta';
import SEO from '../components/common/SEO';

export default function Home() {
    const { user, loading } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/library', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
            <SEO
                title="FlashDeck AI - Master Any Subject with AI-Powered Study Tools"
                description="The ultimate AI-powered study tool. Create decks, flashcards, quizzes, and mind maps instantly from your documents using advanced AI."
                path="/"
            />
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

