import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal, BookOpen, Check, Code, Lock, Trophy, Star, ArrowRight, AlertTriangle, Play, Save, RotateCcw, CheckCircle, Calendar, MessageSquare, MonitorPlay } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  code_template: string;
  test_code: string;
  order_number: number;
  points: number;
}

interface ProjectProgress {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  user_code: string;
  completed_at: string | null;
}

interface LeaderboardEntry {
  username: string;
  completed_projects: number;
  total_points: number;
}

const PythonProjectsPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectProgress, setProjectProgress] = useState<{[key: string]: ProjectProgress}>({});
  const [userCode, setUserCode] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'projects' | 'standalone'>('projects');

  // Python standalone games
  const standaloneGames = [
    {
      title: "Bagels",
      description: "A number guessing game where you must figure out a secret number based on clues.",
      icon: <Terminal />,
      path: "/bagels",
      difficulty: "beginner",
      color: "blue"
    },
    {
      title: "Birthday Paradox",
      description: "A simulation that demonstrates the surprising probability of shared birthdays in a group.",
      icon: <Calendar />,
      path: "/birthday-paradox",
      difficulty: "beginner",
      color: "green"
    },
    {
      title: "Bitmap Message",
      description: "Create text art by displaying a message over a bitmap pattern.",
      icon: <MessageSquare />,
      path: "/bitmap-message",
      difficulty: "beginner",
      color: "purple"
    },
    {
      title: "Bouncing DVD Logo",
      description: "A simulation of the classic bouncing DVD logo screen saver.",
      icon: <MonitorPlay />,
      path: "/bouncing-dvd-logo",
      difficulty: "beginner",
      color: "orange"
    }
  ];

  useEffect(() => {
    fetchProjects();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (user && projects.length > 0) {
      fetchUserProgress();
    }
  }, [user, projects]);

  useEffect(() => {
    // Update total completed projects and points when progress changes
    if (Object.keys(projectProgress).length > 0 && projects.length > 0) {
      let completed = 0;
      let points = 0;
      
      projects.forEach(project => {
        const progress = projectProgress[project.id];
        if (progress && progress.status === 'completed') {
          completed++;
          points += project.points;
        }
      });
      
      setCompletedCount(completed);
      setTotalPoints(points);
    }
  }, [projectProgress, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('python_projects')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(`Failed to load projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('python_project_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Convert array to object with project_id as key
      const progressMap = {};
      data?.forEach(item => {
        progressMap[item.project_id] = item;
      });
      
      setProjectProgress(progressMap);
      
      // Initialize projects that user hasn't started yet
      projects.forEach(project => {
        if (!progressMap[project.id]) {
          initializeProjectProgress(project.id);
        }
      });
    } catch (err: any) {
      console.error('Error fetching user progress:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // This is a complex query to get leaderboard data
      // In a real implementation, you might want to use stored procedures or views
      
      const { data, error } = await supabase
        .from('python_project_progress')
        .select(`
          user_id,
          status,
          python_projects (
            points
          ),
          users (
            username
          )
        `)
        .eq('status', 'completed');
      
      if (error) throw error;
      
      // Process the data to create leaderboard entries
      const userPoints = {};
      const userProjects = {};
      
      data?.forEach(entry => {
        const userId = entry.user_id;
        const username = entry.users.username;
        const points = entry.python_projects.points;
        
        if (!userPoints[userId]) {
          userPoints[userId] = 0;
          userProjects[userId] = 0;
        }
        
        userPoints[userId] += points;
        userProjects[userId] += 1;
      });
      
      // Convert to array and sort by points
      const leaderboardData = Object.keys(userPoints).map(userId => {
        return {
          username: data.find(e => e.user_id === userId)?.users.username || 'Unknown',
          completed_projects: userProjects[userId],
          total_points: userPoints[userId]
        };
      }).sort((a, b) => b.total_points - a.total_points);
      
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const initializeProjectProgress = async (projectId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('python_project_progress')
        .insert([
          {
            user_id: user.id,
            project_id: projectId,
            status: 'not_started',
            user_code: projects.find(p => p.id === projectId)?.code_template || ''
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Update local state
      if (data && data[0]) {
        setProjectProgress(prev => ({
          ...prev,
          [projectId]: data[0]
        }));
      }
    } catch (err: any) {
      console.error('Error initializing project progress:', err);
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    
    // Set user code from progress
    const progress = projectProgress[project.id];
    if (progress) {
      setUserCode(progress.user_code || project.code_template);
    } else {
      setUserCode(project.code_template);
    }
    
    // Reset test output and result
    setTestOutput('');
    setTestResult(null);
  };

  const saveProgress = async () => {
    if (!user || !selectedProject) return;
    
    try {
      setSaving(true);
      
      const progress = projectProgress[selectedProject.id];
      
      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('python_project_progress')
          .update({
            user_code: userCode,
            status: progress.status === 'completed' ? 'completed' : 'in_progress'
          })
          .eq('id', progress.id);
        
        if (error) throw error;
        
        // Update local state
        setProjectProgress(prev => ({
          ...prev,
          [selectedProject.id]: {
            ...prev[selectedProject.id],
            user_code: userCode,
            status: progress.status === 'completed' ? 'completed' : 'in_progress'
          }
        }));
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('python_project_progress')
          .insert([
            {
              user_id: user.id,
              project_id: selectedProject.id,
              status: 'in_progress',
              user_code: userCode
            }
          ])
          .select();
        
        if (error) throw error;
        
        // Update local state
        if (data && data[0]) {
          setProjectProgress(prev => ({
            ...prev,
            [selectedProject.id]: data[0]
          }));
        }
      }
    } catch (err: any) {
      console.error('Error saving progress:', err);
      setError(`Failed to save progress: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const runCode = () => {
    if (!selectedProject) return;
    
    setIsRunning(true);
    setTestOutput('');
    setTestResult(null);
    
    // In a real implementation, this would be executed on a server
    // For this demo, we'll simulate execution with a timeout
    setTimeout(() => {
      // Perform a simple validation
      try {
        // Simulate running the test code
        // This is just a simple check - in a real system, you'd use a secure sandbox
        if (userCode.includes('def getSecretNum') && userCode.includes('def getClues') && 
            userCode.includes('def main') && userCode.includes('if __name__')) {
          setTestOutput('Running tests...\n\nAll tests passed: True');
          setTestResult(true);
          
          // Mark as completed if not already
          markProjectCompleted();
        } else {
          setTestOutput('Running tests...\n\nTests failed: Functions not implemented correctly.');
          setTestResult(false);
        }
      } catch (err: any) {
        console.error('Error running code:', err);
        setTestOutput(`Error running code: ${err.message}`);
        setTestResult(false);
      } finally {
        setIsRunning(false);
      }
    }, 2000);
  };

  const markProjectCompleted = async () => {
    if (!user || !selectedProject) return;
    
    try {
      const progress = projectProgress[selectedProject.id];
      
      if (progress && progress.status !== 'completed') {
        // Update to completed
        const { error } = await supabase
          .from('python_project_progress')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', progress.id);
        
        if (error) throw error;
        
        // Update local state
        setProjectProgress(prev => ({
          ...prev,
          [selectedProject.id]: {
            ...prev[selectedProject.id],
            status: 'completed',
            completed_at: new Date().toISOString()
          }
        }));
        
        // Refresh leaderboard
        fetchLeaderboard();
      }
    } catch (err: any) {
      console.error('Error marking project completed:', err);
    }
  };

  const resetProject = async () => {
    if (!user || !selectedProject) return;
    
    try {
      const progress = projectProgress[selectedProject.id];
      
      if (progress) {
        // Reset code to template
        const { error } = await supabase
          .from('python_project_progress')
          .update({
            user_code: selectedProject.code_template,
            status: progress.status === 'completed' ? 'completed' : 'in_progress'
          })
          .eq('id', progress.id);
        
        if (error) throw error;
        
        // Update local state
        setProjectProgress(prev => ({
          ...prev,
          [selectedProject.id]: {
            ...prev[selectedProject.id],
            user_code: selectedProject.code_template
          }
        }));
        
        // Reset editor content
        setUserCode(selectedProject.code_template);
        
        // Reset test output and result
        setTestOutput('');
        setTestResult(null);
      }
    } catch (err: any) {
      console.error('Error resetting project:', err);
      setError(`Failed to reset project: ${err.message}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGameBgColor = (color: string) => {
    const colors = {
      blue: "bg-blue-600/20 border-blue-500/30 hover:border-blue-500/60",
      green: "bg-green-600/20 border-green-500/30 hover:border-green-500/60",
      purple: "bg-purple-600/20 border-purple-500/30 hover:border-purple-500/60",
      orange: "bg-orange-600/20 border-orange-500/30 hover:border-orange-500/60",
    };
    
    return colors[color as keyof typeof colors] || "bg-[var(--matrix-color)]/20 border-[var(--matrix-color)]/30 hover:border-[var(--matrix-color)]/60";
  };

  const getGameIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-400",
      green: "text-green-400",
      purple: "text-purple-400",
      orange: "text-orange-400",
    };
    
    return colors[color as keyof typeof colors] || "text-[var(--matrix-color)]";
  };

  const getStatusStyles = (projectId: string) => {
    const progress = projectProgress[projectId];
    
    if (!progress) {
      return {
        className: 'bg-gray-800 text-gray-300',
        icon: <Lock className="h-4 w-4" />,
        text: 'Not Started'
      };
    }
    
    switch (progress.status) {
      case 'completed':
        return {
          className: 'bg-green-900/30 text-green-400 border border-green-700/50',
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Completed'
        };
      case 'in_progress':
        return {
          className: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
          icon: <Code className="h-4 w-4" />,
          text: 'In Progress'
        };
      default:
        return {
          className: 'bg-gray-800 text-gray-300',
          icon: <ArrowRight className="h-4 w-4" />,
          text: 'Start'
        };
    }
  };

  const renderStandaloneGames = () => (
    <div className="cyber-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold matrix-text flex items-center">
          <Code className="h-6 w-6 mr-2" /> Python Standalone Games
        </h2>
        <div>
          <button
            onClick={() => setActiveTab('projects')}
            className="cyber-button px-4 py-2 text-sm"
          >
            <Terminal className="h-4 w-4 mr-2 inline" />
            Python Projects
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {standaloneGames.map((game, index) => (
          <Link 
            key={index}
            to={game.path}
            className={`p-4 rounded-md border transition-all shadow-lg hover:shadow-xl ${getGameBgColor(game.color)}`}
          >
            <div className={`w-12 h-12 flex items-center justify-center mb-3 rounded-full bg-black/50 border border-gray-700 p-2 ${getGameIconColor(game.color)}`}>
              {React.cloneElement(game.icon, { size: 24 })}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(game.difficulty)} mb-2`}>
              {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
            </span>
            <p className="text-gray-300 text-sm">{game.description}</p>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4">
        <h3 className="font-semibold text-white flex items-center mb-2">
          <Info className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
          About Python Games
        </h3>
        <p className="text-gray-300">
          These standalone Python programs provide interactive learning experiences to help you better 
          understand programming concepts. Each game includes detailed code explanations and opportunities 
          to experiment with the code to see how changes affect the program's behavior.
        </p>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="cyber-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold matrix-text flex items-center">
          <Trophy className="h-6 w-6 mr-2" /> Python Projects Leaderboard
        </h2>
        <button
          onClick={() => setShowLeaderboard(false)}
          className="cyber-button px-4 py-2 text-sm"
        >
          Back to Projects
        </button>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300">No entries on the leaderboard yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                index === 0 ? 'border-yellow-500/50 bg-yellow-900/10' : 
                index === 1 ? 'border-gray-400/50 bg-gray-900/10' :
                index === 2 ? 'border-amber-600/50 bg-amber-900/10' :
                'bg-gray-800/50 border border-gray-700'
              } transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {index === 0 ? (
                      <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    ) : index === 1 ? (
                      <Star className="h-6 w-6 text-gray-400 fill-gray-400" />
                    ) : index === 2 ? (
                      <Star className="h-6 w-6 text-amber-600 fill-amber-600" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-sm font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{entry.username}</h3>
                    <p className="text-sm text-gray-400">
                      {entry.completed_projects} project{entry.completed_projects !== 1 ? 's' : ''} completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[var(--matrix-color)]">
                    {entry.total_points} pts
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjectList = () => (
    <div className="cyber-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold matrix-text flex items-center">
          <Terminal className="h-6 w-6 mr-2" /> Python Projects
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('standalone')}
            className="cyber-button px-4 py-2 text-sm"
          >
            <Play className="h-4 w-4 mr-2 inline" />
            Python Games
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="cyber-button px-4 py-2 text-sm flex items-center"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </button>
        </div>
      </div>
      
      {user && (
        <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="font-semibold text-white flex items-center">
                <Trophy className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Your Progress
              </h3>
              <p className="text-gray-300 text-sm mt-1">Track your Python projects journey</p>
            </div>
            <div className="mt-3 md:mt-0 flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-[var(--matrix-color)]">{completedCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-300">{projects.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Points</p>
                <p className="text-2xl font-bold text-[var(--matrix-color)]">{totalPoints}</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-[var(--matrix-color)]"
                style={{ width: `${projects.length > 0 ? (completedCount / projects.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-md p-3 mb-4">
          <p className="text-red-400 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--matrix-color)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-300">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300">No projects available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const statusStyles = getStatusStyles(project.id);
            
            return (
              <div 
                key={project.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 transition-all duration-300 hover:border-[var(--matrix-color)]/50 cursor-pointer"
                onClick={() => selectProject(project)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <Terminal className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                      {project.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center ${statusStyles.className}`}>
                        {statusStyles.icon}
                        <span className="ml-1">{statusStyles.text}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--matrix-color)] font-bold">
                      {project.points} pts
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                  {project.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProjectEditor = () => {
    if (!selectedProject) return null;
    
    const progress = projectProgress[selectedProject.id] || { status: 'not_started', user_code: selectedProject.code_template };
    const isCompleted = progress.status === 'completed';
    
    return (
      <div className="cyber-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-gray-400 hover:text-gray-200 mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-xl font-bold text-white">{selectedProject.title}</span>
            <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(selectedProject.difficulty)}`}>
              {selectedProject.difficulty.charAt(0).toUpperCase() + selectedProject.difficulty.slice(1)}
            </span>
            {isCompleted && (
              <span className="ml-2 text-green-400 flex items-center text-sm">
                <Check className="h-4 w-4 mr-1" />
                Completed
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetProject}
              className="cyber-button px-3 py-1.5 text-sm flex items-center"
              title="Reset to template"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </button>
            <button
              onClick={saveProgress}
              disabled={saving}
              className="cyber-button px-3 py-1.5 text-sm flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="cyber-button px-3 py-1.5 text-sm flex items-center"
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
          <p className="text-gray-300">{selectedProject.description}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Your Code</h3>
            <div className="h-96 relative">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="h-full w-full bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--matrix-color)] focus:border-[var(--matrix-color)]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Test Output</h3>
            <div className="h-96 bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto">
              {testOutput ? (
                <div>
                  <pre>{testOutput}</pre>
                  {testResult !== null && (
                    <div className={`mt-4 p-3 rounded ${testResult ? 'bg-green-900/30 text-green-400 border border-green-700/50' : 'bg-red-900/30 text-red-400 border border-red-700/50'}`}>
                      {testResult ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <div>
                            <p className="font-bold">All tests passed!</p>
                            {!isCompleted && (
                              <p className="text-sm mt-1">Project marked as completed. You earned {selectedProject.points} points!</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <div>
                            <p className="font-bold">Tests failed</p>
                            <p className="text-sm mt-1">Check your implementation and try again.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Run your code to see the test output here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-4">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center">
          <Link to="/" className="text-gray-400 hover:text-gray-200 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center">
            <Terminal className="h-6 w-6 text-[var(--matrix-color)] mr-2" />
            <span className="matrix-text">Python</span> Projects
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {!user ? (
          <div className="cyber-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-gray-300 mb-6">Please log in to access the Python Projects feature.</p>
            <Link to="/" className="cyber-button px-6 py-2 inline-block">
              Return to Home
            </Link>
          </div>
        ) : showLeaderboard ? (
          renderLeaderboard()
        ) : selectedProject ? (
          renderProjectEditor()
        ) : activeTab === 'projects' ? (
          renderProjectList()
        ) : (
          renderStandaloneGames()
        )}
      </main>
    </div>
  );
};

export default PythonProjectsPage;