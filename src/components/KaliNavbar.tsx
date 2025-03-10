import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Shield, BookOpen, Brain, Code, Server, Database, Activity, ChevronDown, ChevronRight, AlertCircle, Settings, User, Wifi, Cpu, Power, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';

const KaliNavbar: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(12);
  const [memoryUsage, setMemoryUsage] = useState(2.4);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Update CPU and memory values every 5 seconds for a more dynamic display
    const statsTimer = setInterval(() => {
      // Random CPU usage between 5-25%
      setCpuUsage(Math.floor(Math.random() * 20) + 5);
      // Random memory usage between 1.8-3.2 GB
      setMemoryUsage(Math.round((Math.random() * 1.4 + 1.8) * 10) / 10);
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(statsTimer);
    };
  }, []);

  const toggleDropdown = (menu: string) => {
    if (activeDropdown === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
    }
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const menuItems = [
    {
      name: 'Applications',
      icon: <Terminal className="h-4 w-4" />,
      items: [
        { label: 'Study Planner', to: '/planner', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'AI Chat', to: '/ai-chat', icon: <Brain className="h-4 w-4" /> },
        { label: 'Python Projects', to: '/python-projects', icon: <Code className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Security Tools',
      icon: <Shield className="h-4 w-4" />,
      items: [
        { label: 'System Security', to: '/security-tools', icon: <Server className="h-4 w-4" />, isNew: true },
        { label: 'Cyber Simulations', to: '/cyber-simulations', icon: <Terminal className="h-4 w-4" />, isNew: true },
        { label: 'Phishing Simulator', to: '/phishing-simulator', icon: <AlertCircle className="h-4 w-4" /> },
        { label: 'SOC Simulator', to: '/soc-simulator', icon: <Activity className="h-4 w-4" /> },
        { label: 'Password Policy', to: '/password-policy', icon: <Shield className="h-4 w-4" /> },
      ]
    },
  ];

  return (
    <div className="font-mono text-sm sticky top-0 z-50">
      {/* Top Panel with System Stats */}
      <div className="bg-black text-white px-4 py-1 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-[var(--matrix-color)]" />
          <span className="text-[var(--matrix-color)] font-bold">RibsyAI CyberA</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-xs text-gray-400">
            <Cpu className="h-3 w-3 mr-1" />
            <span>CPU: {cpuUsage}%</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Database className="h-3 w-3 mr-1" />
            <span>MEM: {memoryUsage}GB</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Wifi className="h-3 w-3 mr-1 text-green-400" />
            <span>NET: Connected</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center text-xs">
            <Power className="h-3 w-3 mr-1 text-red-500" />
          </div>
        </div>
      </div>
      
      {/* Main Navigation Bar */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 text-white flex items-center">
        <Link to="/" className="px-3 py-2 hover:bg-gray-800 flex items-center" onClick={closeDropdowns}>
          <Terminal className="h-4 w-4 mr-1 text-[var(--matrix-color)]" />
          <span>Home</span>
        </Link>
        
        {menuItems.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              className={`px-3 py-2 hover:bg-gray-800 flex items-center ${activeDropdown === menu.name ? 'bg-gray-800' : ''}`}
              onClick={() => toggleDropdown(menu.name)}
            >
              {menu.icon}
              <span className="ml-1">{menu.name}</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            
            {activeDropdown === menu.name && (
              <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#2a2a2a] border border-gray-700 shadow-lg z-10">
                {menu.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="px-4 py-2 hover:bg-gray-700 flex items-center block"
                    onClick={closeDropdowns}
                  >
                    {item.icon}
                    <div className="flex items-center">
                      <span className="ml-2">{item.label}</span>
                      {item.isNew && (
                        <span className="ml-2 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Current Path Display */}
        <div className="ml-4 flex-1 px-3 py-2 text-green-400 bg-black/30">
          <code>~{location.pathname === '/' ? '' : location.pathname} $</code>
        </div>
        
        {/* User Section */}
        <div className="px-3 py-2 flex items-center">
          <User className="h-4 w-4 mr-1 text-blue-400" />
          <span className="text-blue-400">
            {user ? user.username : 'guest'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KaliNavbar;