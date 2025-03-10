import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Calendar, Clock, FileText, Book, Code, CheckSquare, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, X, BookOpen, List, CheckCircle, Brain, Trophy, Lightbulb } from 'lucide-react';
import CyberSecurityAssignments from './CyberSecurityAssignments';
import StudyGuideModal from './StudyGuideModal';
import QuizModal from './QuizModal';
import { UserProvider } from './context/UserContext';
import UserProfile from './components/UserProfile';
import QuizResultsView from './components/QuizResultsView';
import LeaderboardView from './components/LeaderboardView';
import CodeTranslationGame from './components/CodeTranslationGame';
import LandingPage from './pages/LandingPage';
import AIChatPage from './pages/AIChatPage';
import PythonProjectsPage from './pages/PythonProjectsPage';
import BagelsGamePage from './pages/BagelsGamePage';
import BirthdayParadoxPage from './pages/BirthdayParadoxPage';
import BitmapMessagePage from './pages/BitmapMessagePage';
import BouncingDVDLogoPage from './pages/BouncingDVDLogoPage';
import PasswordPolicyPage from './pages/PasswordPolicyPage';
import PhishingSimulatorPage from './pages/PhishingSimulatorPage';
import SOCSimulatorPage from './pages/SOCSimulatorPage';
import SecurityToolsPage from './pages/SecurityToolsPage';
import CyberSimulationsPage from './pages/CyberSimulationsPage';
import KaliNavbar from './components/KaliNavbar';

function App() {
  const [showStudyGuide, setShowStudyGuide] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPythonQuiz, setShowPythonQuiz] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTranslationGame, setShowTranslationGame] = useState(false);

  const MainApp = () => (
    <div className="bg-gray-900 min-h-screen">
      <nav className="bg-black/70 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Book className="h-8 w-8 text-[var(--matrix-color)]" />
                <span className="ml-2 text-xl font-bold text-white">Study <span className="text-[var(--matrix-color)]">Planner</span></span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLeaderboard(true)}
                className="cyber-button flex items-center py-2 px-4"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboard
              </button>
              <button
                onClick={() => setShowQuizResults(true)}
                className="cyber-button flex items-center py-2 px-4"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                My Scores
              </button>
              <button
                onClick={() => setShowPythonQuiz(true)}
                className="cyber-button flex items-center py-2 px-4 cyber-button-glow"
              >
                <Code className="h-5 w-5 mr-2" />
                <span>Python Quiz</span>
              </button>
              <button
                onClick={() => setShowQuiz(true)}
                className="cyber-button flex items-center py-2 px-4"
              >
                <Brain className="h-5 w-5 mr-2" />
                Practice Quiz
              </button>
              <button
                onClick={() => setShowStudyGuide(true)}
                className="cyber-button flex items-center py-2 px-4"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Study Guides
              </button>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="bg-gray-900 py-6">
        {showQuizResults ? (
          <div className="max-w-4xl mx-auto py-4 px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your <span className="text-[var(--matrix-color)]">Quiz Results</span></h2>
              <button 
                onClick={() => setShowQuizResults(false)}
                className="cyber-button px-4 py-2 text-sm"
              >
                Back to Planner
              </button>
            </div>
            <div className="cyber-card p-5">
              <QuizResultsView />
            </div>
          </div>
        ) : showLeaderboard ? (
          <div className="max-w-4xl mx-auto py-4 px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Global <span className="text-[var(--matrix-color)]">Rankings</span></h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="cyber-button px-4 py-2 text-sm"
              >
                Back to Planner
              </button>
            </div>
            <div className="cyber-card p-5">
              <LeaderboardView />
            </div>
          </div>
        ) : showTranslationGame ? (
          <div className="max-w-5xl mx-auto py-4 px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Code <span className="text-[var(--matrix-color)]">Translation Game</span></h2>
              <button 
                onClick={() => setShowTranslationGame(false)}
                className="cyber-button px-4 py-2 text-sm"
              >
                Back to Planner
              </button>
            </div>
            <div className="cyber-card p-5">
              <CodeTranslationGame />
            </div>
          </div>
        ) : (
          <CyberSecurityAssignments setShowTranslationGame={setShowTranslationGame} />
        )}
      </main>

      <StudyGuideModal isOpen={showStudyGuide} onClose={() => setShowStudyGuide(false)} />
      <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
      <QuizModal isOpen={showPythonQuiz} onClose={() => setShowPythonQuiz(false)} initialSubject="Python" />
    </div>
  );

  return (
    <UserProvider>
      <Router>
        <KaliNavbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/planner" element={<MainApp />} />
          <Route path="/ai-chat" element={<AIChatPage />} />
          <Route path="/python-projects" element={<PythonProjectsPage />} />
          <Route path="/bagels" element={<BagelsGamePage />} />
          <Route path="/birthday-paradox" element={<BirthdayParadoxPage />} />
          <Route path="/bitmap-message" element={<BitmapMessagePage />} />
          <Route path="/bouncing-dvd-logo" element={<BouncingDVDLogoPage />} />
          <Route path="/password-policy" element={<PasswordPolicyPage />} />
          <Route path="/phishing-simulator" element={<PhishingSimulatorPage />} />
          <Route path="/soc-simulator" element={<SOCSimulatorPage />} />
          <Route path="/security-tools" element={<SecurityToolsPage />} />
          <Route path="/cyber-simulations" element={<CyberSimulationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;