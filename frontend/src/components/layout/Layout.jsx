import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "../../context/ThemeContext";

export default function Layout({ children }) {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen transition-colors duration-300 selection:bg-indigo-500/30 font-sans ${isDark ? 'bg-[#0a0a0a] text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
            <Navbar />
            <main className="pt-24 pb-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}

