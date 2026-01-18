import HeroSection from '../components/sections/HeroSection';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
            <HeroSection />
        </div>
    );
}
