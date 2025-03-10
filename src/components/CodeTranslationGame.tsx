import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { Code, BookOpen, ThumbsUp, MessageSquare, Plus, X, Check, AlertTriangle } from 'lucide-react';

interface CodeChallenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  code: string;
  is_python: boolean;
  created_at: string;
  users: {
    username: string;
  };
}

interface CodeTranslation {
  id: string;
  challenge_id: string;
  user_id: string;
  translation: string;
  votes: number;
  created_at: string;
  users: {
    username: string;
  };
}

const CodeTranslationGame: React.FC = () => {
  const { user } = useUser();
  const [challenges, setChallenges] = useState<CodeChallenge[]>([]);
  const [translations, setTranslations] = useState<{[key: string]: CodeTranslation[]}>({});
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTranslations, setShowTranslations] = useState<{[key: string]: boolean}>({});

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [isPython, setIsPython] = useState(true);
  const [translation, setTranslation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('code_challenges')
        .select(`
          *,
          users (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
      
      // Initialize translations viewing state
      const initialShowState = {};
      data?.forEach(challenge => {
        initialShowState[challenge.id] = false;
      });
      setShowTranslations(initialShowState);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslationsForChallenge = async (challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('code_translations')
        .select(`
          *,
          users (
            username
          )
        `)
        .eq('challenge_id', challengeId)
        .order('votes', { ascending: false });

      if (error) throw error;
      
      setTranslations(prev => ({
        ...prev,
        [challengeId]: data || []
      }));
      
      setShowTranslations(prev => ({
        ...prev,
        [challengeId]: true
      }));
    } catch (err) {
      console.error('Error fetching translations:', err);
    }
  };

  const toggleTranslations = (challengeId: string) => {
    if (showTranslations[challengeId]) {
      setShowTranslations(prev => ({
        ...prev,
        [challengeId]: false
      }));
    } else {
      fetchTranslationsForChallenge(challengeId);
    }
  };

  const validateChallenge = () => {
    setFormError('');
    
    if (!title.trim()) {
      setFormError('Title is required');
      return false;
    }
    
    if (code.length < 10) {
      setFormError('Code must be at least 10 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormError('You must be logged in to create a challenge');
      return;
    }
    
    if (!validateChallenge()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      
      const { data, error } = await supabase
        .from('code_challenges')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            code: code.trim(),
            is_python: isPython
          }
        ])
        .select();

      if (error) {
        console.error('Error details:', error);
        if (error.message.includes('code_length_check')) {
          setFormError('Code must be at least 10 characters long');
        } else {
          setFormError(`Error creating challenge: ${error.message}`);
        }
        return;
      }

      // Reset form and refresh challenges
      setTitle('');
      setDescription('');
      setCode('');
      setFormError('');
      setShowNewChallenge(false);
      fetchChallenges();
    } catch (err: any) {
      console.error('Error creating challenge:', err);
      setFormError(`Failed to create challenge: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const validateTranslation = () => {
    setFormError('');
    
    if (translation.length < 10) {
      setFormError('Translation must be at least 10 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmitTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormError('You must be logged in to submit a translation');
      return;
    }
    
    if (!selectedChallenge) {
      setFormError('No challenge selected');
      return;
    }
    
    if (!validateTranslation()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      
      const { error } = await supabase
        .from('code_translations')
        .insert([
          {
            challenge_id: selectedChallenge.id,
            user_id: user.id,
            translation: translation.trim()
          }
        ]);

      if (error) {
        console.error('Error details:', error);
        if (error.message.includes('translation_length_check')) {
          setFormError('Translation must be at least 10 characters long');
        } else {
          setFormError(`Error submitting translation: ${error.message}`);
        }
        return;
      }

      // Reset form and refresh
      setTranslation('');
      setSelectedChallenge(null);
      setFormError('');
      await fetchTranslationsForChallenge(selectedChallenge.id);
    } catch (err: any) {
      console.error('Error submitting translation:', err);
      setFormError(`Failed to submit translation: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (translationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('code_translations')
        .update({ votes: supabase.rpc('increment', { inc: 1 }) })
        .eq('id', translationId);

      if (error) throw error;
      
      // Refresh translations for the challenge
      for (const challengeId in translations) {
        const found = translations[challengeId].find(t => t.id === translationId);
        if (found) {
          await fetchTranslationsForChallenge(challengeId);
          break;
        }
      }
    } catch (err) {
      console.error('Error voting for translation:', err);
    }
  };

  const ExampleSection = () => (
    <div className="mb-8 cyber-card p-6">
      <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
        <BookOpen className="mr-2 h-6 w-6" /> Translation Examples
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-medium text-[var(--matrix-color)]">Python Code</h4>
          <pre className="bg-gray-900 p-4 rounded-md text-gray-100 text-sm">
{`def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`}
          </pre>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-[var(--matrix-color)]">Pseudocode</h4>
          <pre className="bg-gray-900 p-4 rounded-md text-gray-100 text-sm">
{`ALGORITHM BubbleSort(array)
    n ← length of array
    FOR i ← 0 to n-1
        FOR j ← 0 to n-i-2
            IF array[j] > array[j+1]
                SWAP array[j] and array[j+1]
    RETURN array`}
          </pre>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--matrix-color)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-300">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center text-red-400 p-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchChallenges();
            }}
            className="mt-4 cyber-button px-4 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Code Translation Game</h2>
        {user && (
          <button
            onClick={() => setShowNewChallenge(true)}
            className="cyber-button px-4 py-2 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Challenge
          </button>
        )}
      </div>

      {!user && (
        <div className="cyber-card p-6 mb-6 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-gray-300">Please log in to create challenges and submit translations.</p>
        </div>
      )}

      <ExampleSection />

      {showNewChallenge && (
        <div className="cyber-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-100">Create New Challenge</h3>
            <button
              onClick={() => {
                setShowNewChallenge(false);
                setFormError('');
              }}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-md p-3 mb-4 text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitChallenge} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Code Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isPython}
                    onChange={() => setIsPython(true)}
                    className="mr-2"
                  />
                  <span>Python</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isPython}
                    onChange={() => setIsPython(false)}
                    className="mr-2"
                  />
                  <span>Pseudocode</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Code <span className="text-xs text-gray-400">(min. 10 characters required)</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full p-2 bg-gray-700 border ${code.length < 10 && code.length > 0 ? 'border-red-500' : 'border-gray-600'} rounded-md text-white font-mono`}
                rows={6}
                required
              />
              {code.length < 10 && code.length > 0 && (
                <p className="text-red-400 text-xs mt-1">Code must be at least 10 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`cyber-button px-4 py-2 w-full flex items-center justify-center ${submitting ? 'opacity-70' : ''}`}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-gray-200 border-t-[var(--matrix-color)] rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Challenge
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {challenges.length === 0 ? (
          <div className="cyber-card p-6 text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No Challenges Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create a code translation challenge!</p>
            {user ? (
              <button
                onClick={() => setShowNewChallenge(true)}
                className="cyber-button px-6 py-2 flex items-center mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Challenge
              </button>
            ) : (
              <p className="text-sm text-gray-500">Please log in to create a challenge</p>
            )}
          </div>
        ) : (
          challenges.map((challenge) => (
            <div key={challenge.id} className="cyber-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{challenge.title}</h3>
                  <p className="text-sm text-gray-400">
                    by {challenge.users.username} • {new Date(challenge.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  challenge.is_python ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {challenge.is_python ? 'Python' : 'Pseudocode'}
                </span>
              </div>

              {challenge.description && (
                <p className="text-gray-300 mb-4">{challenge.description}</p>
              )}

              <pre className="bg-gray-900 p-4 rounded-md text-gray-100 text-sm mb-4 overflow-x-auto">
                {challenge.code}
              </pre>

              <div className="flex space-x-3">
                {user && challenge.id !== selectedChallenge?.id && (
                  <button
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setFormError('');
                    }}
                    className="cyber-button px-4 py-2 flex items-center flex-1"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Translation
                  </button>
                )}

                <button
                  onClick={() => toggleTranslations(challenge.id)}
                  className="cyber-button px-4 py-2 flex items-center"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {showTranslations[challenge.id] ? 'Hide Translations' : 'View Translations'}
                </button>
              </div>

              {selectedChallenge?.id === challenge.id && (
                <form onSubmit={handleSubmitTranslation} className="mt-4 space-y-4">
                  {formError && (
                    <div className="bg-red-900/30 border border-red-700/50 rounded-md p-3 text-red-400 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      {formError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Your Translation <span className="text-xs text-gray-400">(min. 10 characters required)</span>
                    </label>
                    <textarea
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                      className={`w-full p-2 bg-gray-700 border ${translation.length < 10 && translation.length > 0 ? 'border-red-500' : 'border-gray-600'} rounded-md text-white font-mono`}
                      rows={6}
                      placeholder={`Enter your ${challenge.is_python ? 'pseudocode' : 'Python'} translation here...`}
                      required
                    />
                    {translation.length < 10 && translation.length > 0 && (
                      <p className="text-red-400 text-xs mt-1">Translation must be at least 10 characters</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`cyber-button px-4 py-2 flex-1 flex items-center justify-center ${submitting ? 'opacity-70' : ''}`}
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-gray-200 border-t-[var(--matrix-color)] rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Submit Translation
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChallenge(null);
                        setFormError('');
                      }}
                      className="cyber-button px-4 py-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {showTranslations[challenge.id] && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium text-[var(--matrix-color)]">Translations</h4>
                  {translations[challenge.id]?.length > 0 ? (
                    translations[challenge.id].map((item) => (
                      <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-400">
                            by {item.users.username} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          <button 
                            onClick={() => handleVote(item.id)}
                            className="flex items-center text-sm text-gray-400 hover:text-[var(--matrix-color)]"
                            disabled={!user}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {item.votes || 0}
                          </button>
                        </div>
                        <pre className="bg-gray-900 p-3 rounded-md text-gray-100 text-sm overflow-x-auto">
                          {item.translation}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No translations yet. Be the first to submit one!</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CodeTranslationGame;