import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Star, Award } from 'lucide-react';
import { supabase, QuizResult, User } from '../lib/supabase';

interface LeaderboardEntry {
  user: User;
  totalQuizzes: number;
  averageScore: number;
  highestScore: number;
  subjects: Set<string>;
}

const LeaderboardView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all quiz results with user information
        const { data: results, error: resultsError } = await supabase
          .from('quiz_results')
          .select(`
            *,
            users (*)
          `)
          .order('created_at', { ascending: false });

        if (resultsError) throw resultsError;

        // Process results to create leaderboard entries
        const userMap = new Map<string, LeaderboardEntry>();

        results?.forEach((result: any) => {
          const userId = result.user_id;
          const user = result.users;

          if (!userMap.has(userId)) {
            userMap.set(userId, {
              user,
              totalQuizzes: 0,
              averageScore: 0,
              highestScore: 0,
              subjects: new Set()
            });
          }

          const entry = userMap.get(userId)!;
          entry.totalQuizzes++;
          entry.averageScore = ((entry.averageScore * (entry.totalQuizzes - 1)) + result.percentage) / entry.totalQuizzes;
          entry.highestScore = Math.max(entry.highestScore, result.percentage);
          entry.subjects.add(result.subject);
        });

        // Convert map to array and sort by average score
        const leaderboardArray = Array.from(userMap.values())
          .sort((a, b) => b.averageScore - a.averageScore);

        setLeaderboard(leaderboardArray);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center text-gray-300">
          <div className="animate-pulse">Loading leaderboard...</div>
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

  return (
    <div className="cyber-card p-6">
      <h2 className="text-xl font-bold matrix-text mb-6 flex items-center">
        <Trophy className="mr-2 h-6 w-6" /> Global Leaderboard
      </h2>

      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.user.id}
            className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 transition-all duration-300
              ${index === 0 ? 'border-yellow-500/50 bg-yellow-900/10' : ''}
              ${index === 1 ? 'border-gray-400/50 bg-gray-900/10' : ''}
              ${index === 2 ? 'border-amber-600/50 bg-amber-900/10' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{entry.user.username}</h3>
                  <p className="text-sm text-gray-400">
                    {entry.totalQuizzes} quiz{entry.totalQuizzes !== 1 ? 'zes' : ''} completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--matrix-color)]">
                  {Math.round(entry.averageScore)}%
                </div>
                <div className="text-sm text-gray-400">
                  Best: {entry.highestScore}%
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Average Score</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    entry.averageScore >= 70 ? 'bg-green-500' : 
                    entry.averageScore >= 40 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${entry.averageScore}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from(entry.subjects).map(subject => (
                <span 
                  key={subject}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--matrix-color)]/10 text-[var(--matrix-color)] border border-[var(--matrix-color)]/20"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardView;