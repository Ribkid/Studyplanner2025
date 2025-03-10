import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { supabase, QuizResult } from '../lib/supabase';
import { Medal, Clock, BookOpen, Sigma } from 'lucide-react';

const QuizResultsView: React.FC = () => {
  const { user } = useUser();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load your quiz history');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const getSubjectName = (subject: string) => {
    const subjects: { [key: string]: string } = {
      'VU23223': 'Cyber Security Legislation & Ethics',
      'VU23213': 'Network Concepts & Protocols',
      'VU23217': 'Organizational Cyber Security',
      'ICTPRG434_435': 'Automation & Scripting',
      'Python': 'Python Programming'
    };
    return subjects[subject] || subject;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center text-gray-300">
          <div className="animate-pulse">Loading your quiz history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center text-gray-300">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-500" />
          <p>You haven't taken any quizzes yet.</p>
          <p className="text-sm mt-2">Complete a quiz to see your results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      <h2 className="text-xl font-bold matrix-text mb-4 flex items-center">
        <Medal className="mr-2 h-6 w-6" /> Your Quiz History
      </h2>
      
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white">{getSubjectName(result.subject)}</h3>
                <p className="text-gray-400 text-sm">
                  <Clock className="inline-block h-3.5 w-3.5 mr-1" />
                  {new Date(result.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(result.difficulty)}`}>
                {result.difficulty}
              </span>
            </div>
            
            <div className="mt-3 flex items-center">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Score</span>
                  <span className="text-sm text-white">{result.score}/{result.total_questions}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${result.percentage >= 70 ? 'bg-green-500' : result.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-lg font-bold text-white">{result.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultsView;