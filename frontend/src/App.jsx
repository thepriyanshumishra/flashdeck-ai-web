import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DeckProvider } from './context/DeckContext';
import Home from './pages/Home';
import UploadPage from './pages/UploadPage';
import NotebookDashboard from './pages/NotebookDashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import './App.css';

function App() {
  return (
    <Router>
      <DeckProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/notebook" element={<NotebookDashboard />} />
          <Route path="/notebook/flashcards" element={<FlashcardsPage />} />
          <Route path="/notebook/quiz" element={<QuizPage />} />
        </Routes>
      </DeckProvider>
    </Router>
  );
}

export default App;
