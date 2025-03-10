import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, AlertTriangle, Check, X, RefreshCw, ChevronRight, ChevronLeft, AlertCircle, Bookmark, Flag, Filter, Search, Eye, Info, FileText, Clock, User, ListFilter, CheckCircle, XCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { PhishingScenario, generatePhishingEmail } from '../services/deepseek-security-service';

const PhishingSimulatorPage: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [phishingEmails, setPhishingEmails] = useState<PhishingScenario[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<PhishingScenario | null>(null);
  const [userAnswer, setUserAnswer] = useState<'phishing' | 'legitimate' | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<{correct: number, total: number}>({ correct: 0, total: 0 });
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Initial load of phishing emails
  useEffect(() => {
    async function loadInitialEmails() {
      setLoading(true);
      try {
        // Generate 3 phishing emails of different difficulty levels
        const easy = await generatePhishingEmail({ difficulty: 'easy' });
        const medium = await generatePhishingEmail({ difficulty: 'medium' });
        const hard = await generatePhishingEmail({ difficulty: 'hard' });
        
        setPhishingEmails([easy, medium, hard]);
        setSelectedEmail(easy);
      } catch (error) {
        console.error('Error loading initial phishing emails:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialEmails();
  }, []);
  
  // Generate a new phishing email
  const generateNewEmail = async () => {
    setGenerating(true);
    try {
      const difficulty = difficultyFilter === 'all' ? 
        (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)] : 
        difficultyFilter;
      
      const newEmail = await generatePhishingEmail({ difficulty });
      setPhishingEmails(prev => [newEmail, ...prev]);
      setSelectedEmail(newEmail);
      setUserAnswer(null);
      setShowExplanation(false);
    } catch (error) {
      console.error('Error generating new phishing email:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  // Handle user selection (phishing or legitimate)
  const handleUserSelection = (selection: 'phishing' | 'legitimate') => {
    if (!selectedEmail || userAnswer) return;
    
    setUserAnswer(selection);
    
    // All emails in this simulator are phishing (for training purposes)
    const isCorrect = selection === 'phishing';
    
    // Update score
    setUserScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };
  
  // Filter emails based on difficulty and search query
  const filteredEmails = phishingEmails.filter(email => {
    // Filter by difficulty
    if (difficultyFilter !== 'all' && email.difficulty !== difficultyFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.content.toLowerCase().includes(query) ||
        email.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Determine if an email was received today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Navigate to previous/next email
  const navigateEmails = (direction: 'prev' | 'next') => {
    if (!selectedEmail || filteredEmails.length <= 1) return;
    
    const currentIndex = filteredEmails.findIndex(email => email.id === selectedEmail.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredEmails.length - 1;
    } else {
      newIndex = currentIndex < filteredEmails.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedEmail(filteredEmails[newIndex]);
    setUserAnswer(null);
    setShowExplanation(false);
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <header className="bg-gray-800 shadow-lg py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-gray-400 hover:text-gray-200 mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center">
                <AlertTriangle className="h-6 w-6 text-[var(--matrix-color)] mr-2" />
                <span className="matrix-text">Phishing</span> Simulator
              </h1>
            </div>
            {user && (
              <div className="text-sm text-gray-300">
                Logged in as <span className="text-[var(--matrix-color)] font-medium">{user.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="cyber-card p-4 mb-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center">
              <Shield className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
              Phishing Email Detection Training
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              This simulator presents AI-generated phishing emails to help you practice identifying phishing attempts. 
              All emails in this training environment are phishing emails with varying levels of sophistication. 
              Your task is to identify the red flags that indicate each email is a phishing attempt.
            </p>
            
            <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-[var(--matrix-color)]">Training Tips:</h3>
                  <ul className="text-sm text-gray-300 mt-1 space-y-1">
                    <li>• Always check the sender's email address, not just the display name</li>
                    <li>• Be suspicious of urgent calls to action or threats</li>
                    <li>• Hover over links to see their true destination before clicking</li>
                    <li>• Look for poor grammar, spelling errors, or unusual formatting</li>
                    <li>• Consider whether the email is asking for sensitive information</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
              <div className="flex items-center space-x-4 mb-3 md:mb-0">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-gray-400 mr-2" />
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as any)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded pl-9 pr-3 py-1 text-sm text-gray-300 w-[180px]"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 text-sm text-gray-400">
                  <span className="text-[var(--matrix-color)] font-medium">{userScore.correct}</span>/{userScore.total} correct
                </div>
                <button
                  onClick={generateNewEmail}
                  disabled={generating}
                  className="cyber-button px-3 py-1.5 text-sm flex items-center"
                >
                  {generating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-gray-200 border-t-[var(--matrix-color)] rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Phishing Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email List Panel */}
            <div className="cyber-card p-4 h-[calc(100vh-280px)] overflow-y-auto">
              <h3 className="font-medium text-gray-200 mb-3 flex items-center">
                <Mail className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Phishing Samples ({filteredEmails.length})
              </h3>
              
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="h-6 w-6 border-2 border-gray-200 border-t-[var(--matrix-color)] rounded-full animate-spin"></div>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No emails found.</p>
                  <button
                    onClick={generateNewEmail}
                    className="cyber-button px-3 py-1.5 text-sm mt-3"
                  >
                    Generate New Email
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email);
                        setUserAnswer(null);
                        setShowExplanation(false);
                      }}
                      className={`p-3 rounded border transition-colors cursor-pointer ${
                        selectedEmail?.id === email.id 
                          ? 'bg-[var(--matrix-color)]/10 border-[var(--matrix-color)]/30' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-200 text-sm truncate pr-2" title={email.subject}>
                          {email.subject}
                        </h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          email.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                          email.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {email.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs truncate" title={email.from}>
                        From: {email.from}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500 text-xs">
                          {isToday(email.timestamp) ? 'Today' : formatDate(email.timestamp)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {email.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Email Viewer Panel */}
            <div className="cyber-card p-4 col-span-2 h-[calc(100vh-280px)] overflow-y-auto">
              {selectedEmail ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <button 
                        onClick={() => navigateEmails('prev')}
                        disabled={filteredEmails.length <= 1}
                        className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous email"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => navigateEmails('next')}
                        disabled={filteredEmails.length <= 1}
                        className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next email"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Email Actions */}
                    <div className="flex space-x-1">
                      {!userAnswer ? (
                        <>
                          <button
                            onClick={() => handleUserSelection('legitimate')}
                            className="cyber-button px-3 py-1 text-sm flex items-center text-red-400 border-red-400/30"
                            title="Mark as legitimate"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Legitimate
                          </button>
                          <button
                            onClick={() => handleUserSelection('phishing')}
                            className="cyber-button px-3 py-1 text-sm flex items-center text-green-400 border-green-400/30"
                            title="Mark as phishing"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Phishing
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="cyber-button px-3 py-1 text-sm flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Email Header */}
                  <div className="bg-gray-800/70 border border-gray-700 rounded-t-lg p-3">
                    <div className="mb-2">
                      <h3 className="text-lg font-medium text-white">{selectedEmail.subject}</h3>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-400">
                          <span className="text-gray-500">From:</span> {selectedEmail.from}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-gray-500">To:</span> you@company.com
                        </p>
                      </div>
                      <div className="text-gray-500">
                        {formatDate(selectedEmail.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Email Body */}
                  <div className="bg-white text-gray-800 p-4 border-x border-gray-700 min-h-[300px]">
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.content.replace(/\n/g, '<br>') }} />
                  </div>
                  
                  {/* Email Footer */}
                  <div className="bg-gray-800/70 border border-gray-700 rounded-b-lg p-3 text-sm text-gray-400">
                    {userAnswer && (
                      <div className={`mb-3 p-3 rounded-lg ${
                        userAnswer === 'phishing' 
                          ? 'bg-green-900/30 border border-green-700/50' 
                          : 'bg-red-900/30 border border-red-700/50'
                      }`}>
                        {userAnswer === 'phishing' ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                            <div>
                              <p className="text-green-400 font-medium">Correct! This is a phishing email.</p>
                              <p className="text-gray-300 text-sm">You successfully identified this phishing attempt.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-400 mr-2" />
                            <div>
                              <p className="text-red-400 font-medium">Incorrect! This is a phishing email.</p>
                              <p className="text-gray-300 text-sm">This email contains several red flags indicating it's a phishing attempt.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {showExplanation && (
                      <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-[var(--matrix-color)] mb-2">Phishing Explanation:</h4>
                        <p className="text-gray-300 mb-3">{selectedEmail.explanation}</p>
                        
                        <h5 className="font-medium text-[var(--matrix-color)] mb-1">Red Flags:</h5>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          {selectedEmail.redFlags.map((flag, index) => (
                            <li key={index}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end items-center text-xs">
                      <div className="flex items-center mr-4">
                        <Flag className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>Category: {selectedEmail.category}</span>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>Difficulty: {selectedEmail.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Mail className="h-16 w-16 text-gray-700 mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No Email Selected</h3>
                  <p className="text-gray-500 max-w-md">
                    Select an email from the list to view its contents or generate a new phishing email to analyze.
                  </p>
                  {filteredEmails.length === 0 && !loading && (
                    <button
                      onClick={generateNewEmail}
                      className="cyber-button px-4 py-2 mt-4"
                    >
                      Generate New Email
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhishingSimulatorPage;