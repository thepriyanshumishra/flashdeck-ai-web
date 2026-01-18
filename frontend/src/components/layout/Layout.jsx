import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-background text-gray-200 selection:bg-primary/30 font-sans">
            <Navbar />
            <main className="pt-24 pb-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
