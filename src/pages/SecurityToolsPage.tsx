import React, { useState } from 'react';
import { Shield, Globe, Eye, Lock, AlertTriangle, Key, Terminal, Fingerprint, RefreshCw, ChevronDown, ChevronUp, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import SystemInfoPanel from '../components/SystemInfoPanel';

const SecurityToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system-info');
  const [passwordToCheck, setPasswordToCheck] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<null | {
    score: number;
    feedback: string[];
    time: string;
  }>(null);
  const [portScanTarget, setPortScanTarget] = useState('');
  const [portScanResults, setPortScanResults] = useState<null | {
    status: 'scanning' | 'complete' | 'error';
    message?: string;
    openPorts?: number[];
  }>(null);
  const [dnsLookupDomain, setDnsLookupDomain] = useState('');
  const [dnsResults, setDnsResults] = useState<null | {
    aRecords?: string[];
    mxRecords?: string[];
    txtRecords?: string[];
    nsRecords?: string[];
  }>(null);

  const checkPasswordStrength = () => {
    // Simulating password strength check
    if (!passwordToCheck) return;

    // Simple scoring algorithm
    let score = 0;
    const feedback = [];

    // Length check
    if (passwordToCheck.length < 8) {
      feedback.push("Password is too short (minimum 8 characters)");
    } else if (passwordToCheck.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Complexity checks
    if (/[A-Z]/.test(passwordToCheck)) score += 1;
    else feedback.push("Add uppercase letters");
    
    if (/[a-z]/.test(passwordToCheck)) score += 1;
    else feedback.push("Add lowercase letters");
    
    if (/[0-9]/.test(passwordToCheck)) score += 1;
    else feedback.push("Add numbers");
    
    if (/[^A-Za-z0-9]/.test(passwordToCheck)) score += 1;
    else feedback.push("Add special characters");

    // Check for common patterns
    if (/123|abc|qwerty|password|admin|letmein/i.test(passwordToCheck)) {
      score -= 1;
      feedback.push("Avoid common patterns and words");
    }

    // Calculate estimated time to crack 
    // (extremely simplified - just for illustration)
    let time = "unknown";
    if (score <= 1) time = "instantly";
    else if (score === 2) time = "a few seconds";
    else if (score === 3) time = "a few hours";
    else if (score === 4) time = "a few weeks";
    else if (score >= 5) time = "several years";

    setPasswordStrength({ score, feedback, time });
  };

  const simulatePortScan = () => {
    if (!portScanTarget) return;
    
    // Clear previous results and set scanning status
    setPortScanResults({ status: 'scanning' });
    
    // Simulate scanning delay
    setTimeout(() => {
      try {
        // Simulated scan results (random ports for demo purposes)
        const totalPorts = Math.floor(Math.random() * 5) + 1; // 1-5 open ports
        const openPorts = [];
        
        for (let i = 0; i < totalPorts; i++) {
          // Generate random common ports
          const commonPorts = [21, 22, 25, 53, 80, 443, 3306, 8080, 8443];
          const randomPort = commonPorts[Math.floor(Math.random() * commonPorts.length)];
          
          if (!openPorts.includes(randomPort)) {
            openPorts.push(randomPort);
          }
        }
        
        openPorts.sort((a, b) => a - b);
        
        setPortScanResults({
          status: 'complete',
          openPorts: openPorts
        });
      } catch (error) {
        setPortScanResults({
          status: 'error',
          message: 'An error occurred during the port scan'
        });
      }
    }, 2500);
  };

  const performDnsLookup = () => {
    if (!dnsLookupDomain) return;
    
    // Simulate DNS lookup (for demo)
    setTimeout(() => {
      try {
        // Generate simulated records
        const domain = dnsLookupDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        
        setDnsResults({
          aRecords: [`192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
          mxRecords: [`mail.${domain}`, `alt-mail.${domain}`],
          txtRecords: [
            `v=spf1 include:_spf.${domain} ip4:192.168.0.0/24 ~all`,
            `google-site-verification=abcdefghijklmnopqrstuvwxyz`
          ],
          nsRecords: [`ns1.${domain}`, `ns2.${domain}`]
        });
      } catch (error) {
        console.error("DNS lookup error:", error);
      }
    }, 1500);
  };

  const getScoreColor = (score: number) => {
    if (score <= 1) return "text-red-500";
    if (score <= 3) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="h-8 w-8 mr-3 text-[var(--matrix-color)]" />
            Security Tools
          </h1>
          <p className="mt-2 text-gray-400">Analyze your machine and test your security posture with these interactive tools</p>
        </div>

        {/* Tools Navigation */}
        <div className="bg-black/40 border border-gray-800 rounded-md p-1 mb-6 grid grid-cols-2 sm:grid-cols-4 font-mono text-sm">
          <button 
            onClick={() => setActiveTab('system-info')}
            className={`flex items-center justify-center py-3 px-4 rounded-md ${activeTab === 'system-info' ? 'bg-[#1a2a1a] text-[var(--matrix-color)]' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Globe className="h-4 w-4 mr-2" />
            System Info
          </button>
          <button 
            onClick={() => setActiveTab('password-checker')}
            className={`flex items-center justify-center py-3 px-4 rounded-md ${activeTab === 'password-checker' ? 'bg-[#1a2a1a] text-[var(--matrix-color)]' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Key className="h-4 w-4 mr-2" />
            Password Checker
          </button>
          <button 
            onClick={() => setActiveTab('port-scanner')}
            className={`flex items-center justify-center py-3 px-4 rounded-md ${activeTab === 'port-scanner' ? 'bg-[#1a2a1a] text-[var(--matrix-color)]' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Terminal className="h-4 w-4 mr-2" />
            Port Scanner
          </button>
          <button 
            onClick={() => setActiveTab('dns-lookup')}
            className={`flex items-center justify-center py-3 px-4 rounded-md ${activeTab === 'dns-lookup' ? 'bg-[#1a2a1a] text-[var(--matrix-color)]' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            DNS Lookup
          </button>
        </div>

        {/* Tool Content */}
        <div className="bg-black/40 border border-gray-800 rounded-md p-6">
          {activeTab === 'system-info' && (
            <SystemInfoPanel />
          )}

          {activeTab === 'password-checker' && (
            <div className="font-mono">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[var(--matrix-color)] text-lg font-bold">Password Strength Checker</h2>
                <Lock className="h-5 w-5 text-[var(--matrix-color)]" />
              </div>
              
              <div className="mb-6 bg-black/50 border border-gray-800 rounded-md p-4">
                <p className="text-gray-400 text-sm mb-4">
                  Check how strong your password is. All analysis is done locally in your browser - passwords are not sent over the network.
                </p>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-400 text-sm mb-2">Enter a password to check:</label>
                  <div className="flex">
                    <input
                      type="password"
                      id="password"
                      value={passwordToCheck}
                      onChange={(e) => setPasswordToCheck(e.target.value)}
                      className="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[var(--matrix-color)] focus:border-[var(--matrix-color)]"
                      placeholder="Enter password to analyze"
                    />
                    <button
                      onClick={checkPasswordStrength}
                      className="ml-2 bg-[#1a2a1a] text-[var(--matrix-color)] border border-[var(--matrix-color)]/50 rounded-md px-4 hover:bg-[#2a3a2a] transition-colors"
                    >
                      Check
                    </button>
                  </div>
                </div>

                {passwordStrength && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">Strength Score</span>
                        <span className={`text-sm font-bold ${getScoreColor(passwordStrength.score)}`}>
                          {passwordStrength.score}/6
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            passwordStrength.score <= 1 ? 'bg-red-500' : 
                            passwordStrength.score <= 3 ? 'bg-yellow-500' : 
                            'bg-gradient-to-r from-[var(--matrix-color)] to-green-400'
                          }`} 
                          style={{width: `${Math.max(5, Math.min(100, (passwordStrength.score / 6) * 100))}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-gray-400 mb-1">Estimated time to crack:</div>
                      <div className={`text-sm ${getScoreColor(passwordStrength.score)}`}>
                        {passwordStrength.time}
                      </div>
                    </div>
                    
                    {passwordStrength.feedback.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Recommendations:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="text-sm text-yellow-400">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {passwordStrength.score >= 4 && (
                      <div className="mt-3 text-green-400 text-sm">
                        Good job! This is a strong password.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-black/50 border border-gray-800 rounded-md p-4">
                <div className="flex items-center text-[var(--matrix-color)] mb-3">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <h3 className="font-bold">Password Best Practices</h3>
                </div>
                
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li className="text-gray-300">
                    Use a password manager to generate and store unique passwords
                  </li>
                  <li className="text-gray-300">
                    Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols
                  </li>
                  <li className="text-gray-300">
                    Avoid using personal information or common words
                  </li>
                  <li className="text-gray-300">
                    Use different passwords for different accounts
                  </li>
                  <li className="text-gray-300">
                    Enable two-factor authentication when available
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'port-scanner' && (
            <div className="font-mono">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[var(--matrix-color)] text-lg font-bold">Network Port Scanner</h2>
                <Terminal className="h-5 w-5 text-[var(--matrix-color)]" />
              </div>
              
              <div className="mb-6 bg-black/50 border border-gray-800 rounded-md p-4">
                <p className="text-gray-400 text-sm mb-4">
                  <span className="text-yellow-400">Note:</span> This is a simulated port scanner for educational purposes. In a real application, scanning would require permissions and proper network access.
                </p>

                <div className="mb-4">
                  <label htmlFor="target" className="block text-gray-400 text-sm mb-2">Target IP or hostname:</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="target"
                      value={portScanTarget}
                      onChange={(e) => setPortScanTarget(e.target.value)}
                      className="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[var(--matrix-color)] focus:border-[var(--matrix-color)]"
                      placeholder="e.g. 192.168.1.1 or example.com"
                    />
                    <button
                      onClick={simulatePortScan}
                      disabled={portScanResults?.status === 'scanning'}
                      className={`ml-2 bg-[#1a2a1a] text-[var(--matrix-color)] border border-[var(--matrix-color)]/50 rounded-md px-4 hover:bg-[#2a3a2a] transition-colors ${portScanResults?.status === 'scanning' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {portScanResults?.status === 'scanning' ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </span>
                      ) : (
                        <span>Scan</span>
                      )}
                    </button>
                  </div>
                </div>

                {portScanResults?.status === 'scanning' && (
                  <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded-md text-sm text-[var(--matrix-color)] font-mono">
                    <div>Starting port scan on {portScanTarget}...</div>
                    <div className="animate-pulse">Scanning common ports...</div>
                  </div>
                )}

                {portScanResults?.status === 'complete' && portScanResults.openPorts && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="mb-3 text-sm text-gray-400">
                      Scan completed for {portScanTarget}
                    </div>

                    {portScanResults.openPorts.length === 0 ? (
                      <div className="p-3 bg-gray-900 border border-gray-800 rounded-md text-sm">
                        <span className="text-green-400">No open ports found.</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-900 border border-gray-800 rounded-md text-sm">
                        <div className="text-[var(--matrix-color)] mb-2">Open ports:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {portScanResults.openPorts.map(port => {
                            let service = "";
                            if (port === 21) service = "FTP";
                            else if (port === 22) service = "SSH";
                            else if (port === 25) service = "SMTP";
                            else if (port === 53) service = "DNS";
                            else if (port === 80) service = "HTTP";
                            else if (port === 443) service = "HTTPS";
                            else if (port === 3306) service = "MySQL";
                            else if (port === 8080) service = "HTTP Alternate";
                            else if (port === 8443) service = "HTTPS Alternate";
                            
                            return (
                              <div key={port} className="flex justify-between p-2 border border-gray-800 rounded">
                                <span className="text-yellow-400">{port}</span>
                                <span className="text-gray-300">{service}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-3 text-yellow-400 text-sm">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          {portScanResults.openPorts.length} open ports could potentially be security risks if not properly secured.
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-400">
                      <p>A port scanner checks which network ports on a machine are "listening" (accepting connections). Open ports may indicate services that could be vulnerable to attack if not properly secured.</p>
                    </div>
                  </div>
                )}

                {portScanResults?.status === 'error' && (
                  <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded-md text-sm text-red-400">
                    Error: {portScanResults.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dns-lookup' && (
            <div className="font-mono">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[var(--matrix-color)] text-lg font-bold">DNS Lookup Tool</h2>
                <FileText className="h-5 w-5 text-[var(--matrix-color)]" />
              </div>
              
              <div className="mb-6 bg-black/50 border border-gray-800 rounded-md p-4">
                <p className="text-gray-400 text-sm mb-4">
                  Look up DNS records for a domain name. DNS (Domain Name System) records map domain names to IP addresses and other information.
                </p>

                <div className="mb-4">
                  <label htmlFor="domain" className="block text-gray-400 text-sm mb-2">Domain name:</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="domain"
                      value={dnsLookupDomain}
                      onChange={(e) => setDnsLookupDomain(e.target.value)}
                      className="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[var(--matrix-color)] focus:border-[var(--matrix-color)]"
                      placeholder="e.g. example.com"
                    />
                    <button
                      onClick={performDnsLookup}
                      className="ml-2 bg-[#1a2a1a] text-[var(--matrix-color)] border border-[var(--matrix-color)]/50 rounded-md px-4 hover:bg-[#2a3a2a] transition-colors"
                    >
                      Lookup
                    </button>
                  </div>
                </div>

                {dnsResults && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="mb-3 text-sm text-gray-400">
                      DNS Records for {dnsLookupDomain}:
                    </div>

                    <div className="space-y-4">
                      {dnsResults.aRecords && (
                        <div className="p-3 bg-gray-900 border border-gray-800 rounded-md">
                          <div className="text-[var(--matrix-color)] text-sm mb-2">A Records (IPv4 Addresses):</div>
                          <div className="space-y-1">
                            {dnsResults.aRecords.map((record, index) => (
                              <div key={index} className="text-white text-sm font-mono">{record}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dnsResults.mxRecords && (
                        <div className="p-3 bg-gray-900 border border-gray-800 rounded-md">
                          <div className="text-[var(--matrix-color)] text-sm mb-2">MX Records (Mail Servers):</div>
                          <div className="space-y-1">
                            {dnsResults.mxRecords.map((record, index) => (
                              <div key={index} className="text-white text-sm font-mono">{record}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dnsResults.nsRecords && (
                        <div className="p-3 bg-gray-900 border border-gray-800 rounded-md">
                          <div className="text-[var(--matrix-color)] text-sm mb-2">NS Records (Name Servers):</div>
                          <div className="space-y-1">
                            {dnsResults.nsRecords.map((record, index) => (
                              <div key={index} className="text-white text-sm font-mono">{record}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dnsResults.txtRecords && (
                        <div className="p-3 bg-gray-900 border border-gray-800 rounded-md">
                          <div className="text-[var(--matrix-color)] text-sm mb-2">TXT Records:</div>
                          <div className="space-y-1">
                            {dnsResults.txtRecords.map((record, index) => (
                              <div key={index} className="text-white text-sm font-mono break-all">{record}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-sm text-gray-400">
                      <p>DNS records provide information about how a domain is configured. They specify which servers handle email, which IP addresses the domain resolves to, and various other settings.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityToolsPage;