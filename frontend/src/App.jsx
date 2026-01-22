import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DeckProvider } from './context/DeckContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import UploadPage from './pages/UploadPage';
import DeckDashboard from './pages/DeckDashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MagicLinkHandler from './pages/MagicLinkHandler';
import LibraryPage from './pages/LibraryPage';

// Marketing Pages
import FeaturesPage from './pages/marketing/FeaturesPage';
import HowItWorksPage from './pages/marketing/HowItWorksPage';
import PricingPage from './pages/marketing/PricingPage';
import AboutPage from './pages/marketing/AboutPage';
import ContactPage from './pages/marketing/ContactPage';
import DocsPage from './pages/marketing/DocsPage';

// Legal Pages
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import CookiePage from './pages/legal/CookiePage';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <DeckProvider>
              <Routes>
                {/* ... existing routes ... */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/magic-link" element={<MagicLinkHandler />} />

                {/* Marketing Routes */}
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/documentation" element={<DocsPage />} />
                <Route path="/library" element={
                  <ProtectedRoute>
                    <LibraryPage />
                  </ProtectedRoute>
                } />

                {/* Legal Routes */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiePage />} />

                {/* Protected Routes */}
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } />
                <Route path="/deck" element={
                  <ProtectedRoute>
                    <DeckDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/deck/flashcards" element={
                  <ProtectedRoute>
                    <FlashcardsPage />
                  </ProtectedRoute>
                } />
                <Route path="/deck/quiz" element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </DeckProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
