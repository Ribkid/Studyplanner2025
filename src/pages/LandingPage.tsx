import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, Code, Server, Database, Shield, ChevronRight, Newspaper, Terminal, AlertCircle, Activity, Cpu, Brain, Folder, Monitor, FileCode, UserCheck, Globe, Search, HardDrive, Clock, Lightbulb } from 'lucide-react';
import HackerNewsWidget from '../components/HackerNewsWidget';
import QuizModal from '../QuizModal';

const LandingPage: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  // Desktop icons definition
  const desktopIcons = [
    {
      title: "Study Planner",
      icon: <BookOpen />,
      path: "/planner",
      color: "cyan",
      description: "Track assignments and progress"
    },
    {
      title: "AI Assistant",
      icon: <Brain />,
      path: "/ai-chat",
      color: "purple",
      description: "Get help with concepts"
    },
    {
      title: "Security Tools",
      icon: <Server />,
      path: "/security-tools",
      color: "lime",
      description: "Analyze system security",
      isNew: true
    },
    {
      title: "Cyber Simulations",
      icon: <Terminal />,
      path: "/cyber-simulations",
      color: "amber",
      description: "Interactive security exercises",
      isNew: true
    },
    {
      title: "Phishing Trainer",
      icon: <AlertCircle />,
      path: "/phishing-simulator",
      color: "orange",
      description: "Learn to detect threats"
    },
    {
      title: "SOC Simulator",
      icon: <Activity />,
      path: "/soc-simulator",
      color: "red",
      description: "Practice security ops"
    },
    {
      title: "Python Projects",
      icon: <Terminal />,
      path: "/python-projects",
      color: "blue",
      description: "Coding challenges & games"
    },
    {
      title: "Password Policy",
      icon: <Shield />,
      path: "/password-policy",
      color: "green",
      description: "Build security policies"
    }
  ];

  const getIconBackground = (color: string) => {
    const colors = {
      blue: "from-blue-600/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/60",
      cyan: "from-cyan-600/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/60",
      green: "from-green-600/20 to-green-600/10 border-green-500/30 hover:border-green-500/60",
      red: "from-red-600/20 to-red-600/10 border-red-500/30 hover:border-red-500/60",
      orange: "from-orange-600/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/60",
      purple: "from-purple-600/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/60",
      pink: "from-pink-600/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/60",
      yellow: "from-yellow-600/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-500/60",
      lime: "from-lime-600/20 to-lime-600/10 border-lime-500/30 hover:border-lime-500/60",
      amber: "from-amber-600/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/60"
    };
    
    return colors[color as keyof typeof colors] || "from-[var(--matrix-color)]/20 to-[var(--matrix-color)]/5 border-[var(--matrix-color)]/30 hover:border-[var(--matrix-color)]/60";
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-400",
      cyan: "text-cyan-400",
      green: "text-green-400",
      red: "text-red-400",
      orange: "text-orange-400",
      purple: "text-purple-400",
      pink: "text-pink-400",
      yellow: "text-yellow-400",
      lime: "text-lime-400",
      amber: "text-amber-400"
    };
    
    return colors[color as keyof typeof colors] || "text-[var(--matrix-color)]";
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Desktop Background with Grid Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-[#0c0c0c] opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,255,65,0.12)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-90px)]">
        {/* Desktop Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {desktopIcons.map((icon, index) => (
            <Link 
              key={index}
              to={icon.path}
              className={`relative group flex flex-col items-center py-4 px-3 bg-gradient-to-b ${getIconBackground(icon.color)} border rounded-md shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]`}
            >
              {icon.isNew && (
                <div className="absolute -right-1 -top-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  NEW
                </div>
              )}
              <div className={`w-14 h-14 flex items-center justify-center mb-3 rounded-full bg-black/50 border border-gray-700 p-2 ${getIconColor(icon.color)}`}>
                {React.cloneElement(icon.icon, { size: 28 })}
              </div>
              <span className="text-white font-bold text-center text-sm mb-1">{icon.title}</span>
              <span className="text-gray-400 text-center text-xs">{icon.description}</span>
            </Link>
          ))}
        </div>
        
        {/* System Monitor and News Feed */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {/* System Monitor */}
          <div className="md:col-span-2 bg-black/60 border border-gray-800 rounded-md shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-bold text-[var(--matrix-color)]">SYSTEM MONITOR</h3>
              <Monitor className="h-4 w-4 text-[var(--matrix-color)]" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">CPU Usage</span>
                  <span className="text-xs text-[var(--matrix-color)]">32%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" style={{width: '32%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Memory</span>
                  <span className="text-xs text-[var(--matrix-color)]">1.8GB / 8GB</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" style={{width: '22%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Network Activity</span>
                  <span className="text-xs text-[var(--matrix-color)]">1.2MB/s</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" style={{width: '18%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Storage</span>
                  <span className="text-xs text-[var(--matrix-color)]">45GB / 256GB</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" style={{width: '17%'}}></div>
                </div>
              </div>
              
              <div className="p-2 bg-black rounded-md border border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <HardDrive className="h-3 w-3 text-[var(--matrix-color)] mr-1" />
                    <span className="text-xs text-gray-400">Security Status</span>
                  </div>
                  <span className="text-xs text-green-400">Protected</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tech News Widget */}
          <div className="md:col-span-5">
            <div className="h-full enhanced-news-feed">
              <HackerNewsWidget />
            </div>
          </div>
        </div>
        
        {/* Task Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-gray-800 px-4 py-2 flex items-center justify-between z-20">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-[var(--matrix-color)]/20 rounded-full mr-4 hover:bg-[var(--matrix-color)]/30 cursor-pointer">
              <Terminal className="h-4 w-4 text-[var(--matrix-color)]" />
            </div>
            
            <div className="flex items-center space-x-1">
              <Link to="/planner" className="p-1.5 rounded hover:bg-gray-800">
                <BookOpen className="h-5 w-5 text-cyan-400" />
              </Link>
              <Link to="/python-projects" className="p-1.5 rounded hover:bg-gray-800">
                <Terminal className="h-5 w-5 text-blue-400" />
              </Link>
              <Link to="/phishing-simulator" className="p-1.5 rounded hover:bg-gray-800">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </Link>
              <Link to="/ai-chat" className="p-1.5 rounded hover:bg-gray-800">
                <Brain className="h-5 w-5 text-purple-400" />
              </Link>
              <button 
                onClick={() => setShowQuiz(true)} 
                className="p-1.5 rounded hover:bg-gray-800 relative"
              >
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <div className="absolute -right-1 -top-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-400">
            <div className="px-2 py-1 border-r border-gray-700">
              <Clock className="h-3.5 w-3.5 inline mr-1.5" />
              {new Date().toLocaleTimeString()}
            </div>
            <div className="px-2 py-1">
              <div className="flex items-center">
                <UserCheck className="h-3.5 w-3.5 text-blue-400 mr-1.5" />
                <span className="text-blue-400">guest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quiz Modal */}
      <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
    </div>
  );
};

export default LandingPage;