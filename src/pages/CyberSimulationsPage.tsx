import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Terminal, FileWarning, Brain, Server, Database, HardDrive, Zap, Globe, Lock, Fingerprint, ChevronRight, Code, Network } from 'lucide-react';
import VulnerabilityScannerGame from '../components/VulnerabilityScannerGame';
import NetworkTrafficAnalyzer from '../components/NetworkTrafficAnalyzer';

const CyberSimulationsPage: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<string>('vulnerability-scanner');
  
  const simulations = [
    {
      id: 'vulnerability-scanner',
      name: 'Vulnerability Scanner',
      description: 'Scan systems for security vulnerabilities and analyze findings.',
      difficulty: 'Beginner',
      icon: <Shield className="h-5 w-5" />,
      isNew: true
    },
    {
      id: 'network-analyzer',
      name: 'Network Traffic Analyzer',
      description: 'Analyze packet captures to identify malicious traffic patterns.',
      difficulty: 'Intermediate',
      icon: <Network className="h-5 w-5" />,
      isNew: true
    },
    {
      id: 'malware-analysis',
      name: 'Malware Behavior Analysis',
      description: 'Examine malware artifacts and behavior to identify malicious indicators.',
      difficulty: 'Advanced',
      icon: <FileWarning className="h-5 w-5" />,
      isNew: false,
      comingSoon: true
    },
    {
      id: 'incident-response',
      name: 'Incident Response Scenario',
      description: 'Step through an incident response procedure with realistic alerts.',
      difficulty: 'Intermediate',
      icon: <Terminal className="h-5 w-5" />,
      isNew: false,
      comingSoon: true
    }
  ];
  
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
                <Shield className="h-6 w-6 text-[var(--matrix-color)] mr-2" />
                <span className="matrix-text">Cyber</span> Simulations
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Simulation Selector */}
          <div className="lg:col-span-1 space-y-4">
            <div className="cyber-card p-4">
              <h2 className="text-lg font-bold text-white flex items-center mb-4">
                <Terminal className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Interactive Simulations
              </h2>
              <div className="space-y-2">
                {simulations.map((sim) => (
                  <div 
                    key={sim.id}
                    onClick={() => !sim.comingSoon && setActiveSimulation(sim.id)}
                    className={`p-3 rounded-md cursor-pointer border transition-colors relative ${
                      sim.comingSoon ? 'bg-gray-800 border-gray-700 opacity-60 cursor-not-allowed' :
                      activeSimulation === sim.id 
                        ? 'bg-[var(--matrix-color)]/10 border-[var(--matrix-color)]/40' 
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {sim.isNew && (
                      <div className="absolute -right-1 -top-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        NEW
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className="text-[var(--matrix-color)]">{sim.icon}</div>
                      <div className="ml-2">
                        <div className="font-medium">{sim.name}</div>
                        <div className="text-xs text-gray-400">{sim.difficulty}</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{sim.description}</p>
                    
                    {sim.comingSoon && (
                      <div className="mt-2 text-xs bg-gray-700 text-gray-300 rounded px-2 py-1 inline-block">
                        Coming Soon
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="cyber-card p-4 bg-[var(--matrix-color)]/5">
              <h3 className="font-bold text-[var(--matrix-color)] mb-2">Why Practice Matters</h3>
              <p className="text-sm text-gray-300 mb-3">
                Interactive simulations provide hands-on experience that strengthens your cybersecurity skills in a safe environment.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <ChevronRight className="h-4 w-4 text-[var(--matrix-color)] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Develop practical security analysis skills</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-4 w-4 text-[var(--matrix-color)] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Learn to identify real threats vs. false positives</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-4 w-4 text-[var(--matrix-color)] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Practice incident response procedures</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-4 w-4 text-[var(--matrix-color)] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Understand security tools and methodologies</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Simulation Content */}
          <div className="lg:col-span-3">
            <div className="cyber-card p-6">
              {activeSimulation === 'vulnerability-scanner' && (
                <VulnerabilityScannerGame />
              )}
              
              {activeSimulation === 'network-analyzer' && (
                <NetworkTrafficAnalyzer />
              )}
              
              {activeSimulation === 'malware-analysis' && (
                <div className="text-center py-12">
                  <FileWarning className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h2 className="text-xl font-bold text-white mb-2">Malware Behavior Analysis</h2>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    This simulation is currently in development. Check back soon to analyze malware behaviors and indicators.
                  </p>
                </div>
              )}
              
              {activeSimulation === 'incident-response' && (
                <div className="text-center py-12">
                  <Terminal className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h2 className="text-xl font-bold text-white mb-2">Incident Response Scenario</h2>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    This simulation is currently in development. Check back soon to practice incident response procedures.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CyberSimulationsPage;