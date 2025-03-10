import React, { useState, useEffect, useRef } from 'react';
import { Network, RefreshCw, Search, Filter, AlertTriangle, CheckCircle, X, ZoomIn, Flag, Download, Terminal, ExternalLink, Clock, Activity, Eye, ArrowRight, Shield, FileText } from 'lucide-react';

interface Packet {
  id: string;
  timestamp: string;
  sourceIP: string;
  sourcePort: number;
  destIP: string;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'FTP' | 'SSH' | 'SMTP' | 'ARP';
  flags?: string[];
  size: number;
  data: string;
  hexDump: string;
  isSuspicious: boolean;
  suspiciousReason?: string;
  isHandshake?: boolean;
  isDataTransfer?: boolean;
  isAuthentication?: boolean;
  isEncrypted?: boolean;
  ttl?: number;
  sequence?: number;
  acknowledgment?: number;
  windowSize?: number;
}

interface CaptureFile {
  id: string;
  name: string;
  date: string;
  description: string;
  packetsCount: number;
  duration: string;
  packets: Packet[];
}

// Color coding by protocol
const getProtocolColor = (protocol: string) => {
  switch (protocol) {
    case 'TCP': return 'text-blue-400 bg-blue-900/30 border-blue-700/50';
    case 'UDP': return 'text-purple-400 bg-purple-900/30 border-purple-700/50';
    case 'ICMP': return 'text-cyan-400 bg-cyan-900/30 border-cyan-700/50';
    case 'HTTP': return 'text-green-400 bg-green-900/30 border-green-700/50';
    case 'HTTPS': return 'text-[var(--matrix-color)] bg-[#1a2a1a]/50 border-[var(--matrix-color)]/30';
    case 'DNS': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50';
    case 'FTP': return 'text-orange-400 bg-orange-900/30 border-orange-700/50';
    case 'SSH': return 'text-lime-400 bg-lime-900/30 border-lime-700/50';
    case 'SMTP': return 'text-red-400 bg-red-900/30 border-red-700/50';
    case 'ARP': return 'text-gray-400 bg-gray-900/30 border-gray-700/50';
    default: return 'text-gray-400 bg-gray-900/30 border-gray-700/50';
  }
};

const NetworkTrafficAnalyzer: React.FC = () => {
  const [captureFiles, setCaptureFiles] = useState<CaptureFile[]>([
    {
      id: 'capture1',
      name: 'Example Network Capture',
      date: '2025-03-10 09:23:45',
      description: 'Typical web browsing and DNS lookups',
      packetsCount: 245,
      duration: '3m 42s',
      packets: []
    },
    {
      id: 'capture2',
      name: 'SSH Brute Force Attempt',
      date: '2025-03-09 14:11:27',
      description: 'Suspicious SSH connection attempts from multiple IPs',
      packetsCount: 178,
      duration: '1m 14s',
      packets: []
    },
    {
      id: 'capture3',
      name: 'C2 Communication Suspicious Traffic',
      date: '2025-03-08 22:47:12',
      description: 'Potential command & control server communication',
      packetsCount: 103,
      duration: '2m 36s',
      packets: []
    }
  ]);
  
  const [selectedCapture, setSelectedCapture] = useState<CaptureFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturingLive, setCapturingLive] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [detectedThreats, setDetectedThreats] = useState<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: string;
    packetIds: string[];
  }[]>([]);
  
  const packetsEndRef = useRef<HTMLDivElement>(null);
  
  // Helper to generate random IP addresses
  const generateRandomIP = (isPrivate = false) => {
    if (isPrivate) {
      // Generate private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
      const firstOctet = Math.random() < 0.4 ? 10 : Math.random() < 0.7 ? 172 : 192;
      const secondOctet = firstOctet === 172 ? Math.floor(Math.random() * 16) + 16 : 
                         firstOctet === 192 ? 168 : 
                         Math.floor(Math.random() * 256);
      const thirdOctet = Math.floor(Math.random() * 256);
      const fourthOctet = Math.floor(Math.random() * 256);
      return `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`;
    } else {
      // Generate public IP (excluding private ranges)
      while (true) {
        const firstOctet = Math.floor(Math.random() * 223) + 1; // Avoid 0 and 224-255 (multicast, reserved)
        if (firstOctet === 10) continue; // Avoid 10.x.x.x
        
        const secondOctet = Math.floor(Math.random() * 256);
        if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) continue; // Avoid 172.16-31.x.x
        if (firstOctet === 192 && secondOctet === 168) continue; // Avoid 192.168.x.x
        
        const thirdOctet = Math.floor(Math.random() * 256);
        const fourthOctet = Math.floor(Math.random() * 256);
        
        return `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`;
      }
    }
  };
  
  // Helper to generate random hexdump
  const generateHexDump = (size: number) => {
    const hexChars = '0123456789ABCDEF';
    let result = '';
    
    for (let i = 0; i < 4; i++) {
      let line = `0x${(i * 16).toString(16).padStart(4, '0')}: `;
      
      for (let j = 0; j < 16; j++) {
        if (j === 8) line += ' ';
        const hex1 = hexChars[Math.floor(Math.random() * 16)];
        const hex2 = hexChars[Math.floor(Math.random() * 16)];
        line += `${hex1}${hex2} `;
      }
      
      line += ' |';
      for (let j = 0; j < 16; j++) {
        // Generate a random ASCII character (printable range)
        const char = String.fromCharCode(Math.floor(Math.random() * 95) + 32);
        line += char;
      }
      line += '|\\n';
      
      result += line;
    }
    
    return result;
  };
  
  // Generate fake packets for a capture
  const generatePacketsForCapture = (captureId: string, suspicious = false) => {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'ICMP', 'FTP', 'SSH', 'SMTP', 'ARP'];
    const packets: Packet[] = [];
    
    // Find the selected capture file
    const captureFile = captureFiles.find(c => c.id === captureId);
    if (!captureFile) return [];
    
    const packetsCount = captureFile.packetsCount;
    const isSSHBruteForce = captureId === 'capture2';
    const isC2Traffic = captureId === 'capture3';
    
    // Common IPs and ports for the capture
    const localIP = '192.168.1.105';
    const mainRemoteIP = generateRandomIP();
    const serverPort = isSSHBruteForce ? 22 : isC2Traffic ? 8080 : 443;
    
    // Generate a timestamp base (now minus duration)
    const baseTime = new Date();
    const duration = parseInt(captureFile.duration.split('m')[0]) * 60 * 1000; // Convert to ms
    baseTime.setTime(baseTime.getTime() - duration);
    
    for (let i = 0; i < packetsCount; i++) {
      // Increment timestamp for each packet
      const packetTime = new Date(baseTime.getTime() + (i * (duration / packetsCount)));
      const timestamp = packetTime.toISOString().replace('T', ' ').substr(0, 19);
      
      // For SSH brute force, create multiple SSH login attempts
      const protocol = isSSHBruteForce ? 'SSH' : 
                      isC2Traffic ? (Math.random() < 0.7 ? 'HTTPS' : 'HTTP') : 
                      protocols[Math.floor(Math.random() * protocols.length)];
      
      let sourceIP, destIP, sourcePort, destPort, isSuspicious = false, suspiciousReason = '';
      
      // Generate different patterns based on capture type
      if (isSSHBruteForce) {
        // Generate packets that appear to be SSH brute force attempts
        sourceIP = i % 4 === 0 ? generateRandomIP() : sourceIP; // Change source IP occasionally
        destIP = localIP;
        sourcePort = 50000 + Math.floor(Math.random() * 15000);
        destPort = 22;
        
        if (i % 5 === 0) {
          isSuspicious = true;
          suspiciousReason = 'Multiple failed SSH authentication attempts from this IP';
        }
      } else if (isC2Traffic) {
        // Generate C2 (Command & Control) traffic patterns
        if (i % 2 === 0) {
          sourceIP = localIP;
          destIP = Math.random() < 0.3 ? generateRandomIP() : mainRemoteIP; // Sometimes contact different C2 servers
          sourcePort = 50000 + Math.floor(Math.random() * 15000);
          destPort = 8080 + Math.floor(Math.random() * 3000); // Random high ports
        } else {
          sourceIP = Math.random() < 0.3 ? generateRandomIP() : mainRemoteIP;
          destIP = localIP;
          sourcePort = 8080 + Math.floor(Math.random() * 3000);
          destPort = 50000 + Math.floor(Math.random() * 15000);
        }
        
        if (i % 8 < 3) {
          isSuspicious = true;
          suspiciousReason = 'Unusual beaconing pattern detected to suspicious IP';
        }
      } else {
        // Regular traffic
        if (Math.random() < 0.5) {
          sourceIP = localIP;
          destIP = Math.random() < 0.7 ? mainRemoteIP : generateRandomIP();
          sourcePort = 50000 + Math.floor(Math.random() * 15000);
          destPort = protocol === 'HTTP' ? 80 : protocol === 'HTTPS' ? 443 : 
                   protocol === 'DNS' ? 53 : protocol === 'FTP' ? 21 : 
                   protocol === 'SSH' ? 22 : protocol === 'SMTP' ? 25 : 
                   protocol === 'UDP' ? 53 : 8080;
        } else {
          sourceIP = Math.random() < 0.7 ? mainRemoteIP : generateRandomIP();
          destIP = localIP;
          sourcePort = protocol === 'HTTP' ? 80 : protocol === 'HTTPS' ? 443 : 
                     protocol === 'DNS' ? 53 : protocol === 'FTP' ? 21 : 
                     protocol === 'SSH' ? 22 : protocol === 'SMTP' ? 25 : 
                     protocol === 'UDP' ? 53 : 8080;
          destPort = 50000 + Math.floor(Math.random() * 15000);
        }
        
        // Add occasional suspicious packets
        if (Math.random() < 0.05) {
          isSuspicious = true;
          suspiciousReason = 'Unusual destination port for this protocol';
        }
      }
      
      // Packet size based on protocol and data transfer
      const size = protocol === 'DNS' ? 120 + Math.floor(Math.random() * 200) : 
                 protocol === 'ICMP' ? 84 + Math.floor(Math.random() * 100) : 
                 800 + Math.floor(Math.random() * 1200);
      
      // Determine if this is a special packet (handshake, etc.)
      const isHandshake = protocol === 'TCP' && i % 20 < 3;
      const isAuthentication = (protocol === 'SSH' || protocol === 'FTP' || protocol === 'SMTP') && i % 15 === 0;
      const isDataTransfer = i % 10 >= 5 && i % 10 <= 7;
      const isEncrypted = protocol === 'HTTPS' || protocol === 'SSH';
      
      // Generate TCP flags
      let flags: string[] = [];
      if (protocol === 'TCP') {
        if (isHandshake) {
          if (i % 20 === 0) flags = ['SYN'];
          else if (i % 20 === 1) flags = ['SYN', 'ACK'];
          else if (i % 20 === 2) flags = ['ACK'];
        } else if (i % 30 === 29) {
          flags = ['FIN', 'ACK'];
        } else {
          flags = ['ACK'];
          if (Math.random() < 0.2) flags.push('PSH');
        }
      }
      
      // Sample data based on protocol
      let data = '';
      if (protocol === 'HTTP') {
        if (sourcePort === 80) {
          data = 'HTTP/1.1 200 OK\\nContent-Type: text/html\\nContent-Length: 2048\\nServer: Apache/2.4.41\\n\\n<!DOCTYPE html><html>...';
        } else {
          data = 'GET /index.html HTTP/1.1\\nHost: example.com\\nUser-Agent: Mozilla/5.0\\nAccept: text/html\\n\\n';
        }
      } else if (protocol === 'HTTPS') {
        data = '[Encrypted TLS data]';
      } else if (protocol === 'DNS') {
        data = 'DNS Query: example.com Type A, Class IN';
        if (destPort !== 53) {
          data = 'DNS Response: example.com Type A, Class IN, TTL 300, Addr 93.184.216.34';
        }
      } else if (protocol === 'SSH') {
        data = '[Encrypted SSH data]';
        if (isAuthentication) {
          data = 'SSH Authentication Attempt';
        }
      } else if (protocol === 'FTP') {
        const ftpCommands = ['USER anonymous', 'PASS guest@example.com', 'PWD', 'CWD /pub', 'LIST', 'RETR file.txt'];
        data = ftpCommands[Math.floor(Math.random() * ftpCommands.length)];
      } else if (protocol === 'SMTP') {
        const smtpCommands = ['EHLO example.com', 'MAIL FROM:<user@example.com>', 'RCPT TO:<recipient@example.org>', 'DATA', 'QUIT'];
        data = smtpCommands[Math.floor(Math.random() * smtpCommands.length)];
      } else if (protocol === 'ARP') {
        data = 'Who has 192.168.1.1? Tell 192.168.1.105';
      } else {
        data = '[Binary data]';
      }
      
      // Generate packet object
      const packet: Packet = {
        id: `${captureId}-packet-${i}`,
        timestamp,
        sourceIP,
        sourcePort,
        destIP,
        destPort,
        protocol: protocol as any,
        flags: flags.length > 0 ? flags : undefined,
        size,
        data,
        hexDump: generateHexDump(size),
        isSuspicious,
        suspiciousReason: isSuspicious ? suspiciousReason : undefined,
        isHandshake,
        isAuthentication,
        isDataTransfer,
        isEncrypted,
        ttl: Math.floor(Math.random() * 64) + 1,
        sequence: Math.floor(Math.random() * 1000000000),
        acknowledgment: Math.floor(Math.random() * 1000000000),
        windowSize: Math.floor(Math.random() * 64000) + 1000
      };
      
      packets.push(packet);
    }
    
    return packets;
  };
  
  // Load a capture file
  const loadCapture = (captureId: string) => {
    setLoading(true);
    setCapturingLive(false);
    setSelectedPacket(null);
    
    // Find the selected capture
    const selected = captureFiles.find(c => c.id === captureId);
    
    setTimeout(() => {
      // Generate packets for this capture
      const generatedPackets = generatePacketsForCapture(captureId);
      
      // Update the capture with the generated packets
      if (selected) {
        setSelectedCapture({
          ...selected,
          packets: generatedPackets
        });
        setPackets(generatedPackets);
        
        // Generate some detected threats for this capture
        let threats = [];
        
        if (captureId === 'capture2') {
          threats.push({
            type: 'Brute Force Attack',
            severity: 'high',
            description: 'Multiple failed SSH login attempts from several IPs',
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            packetIds: generatedPackets
              .filter(p => p.isSuspicious && p.protocol === 'SSH')
              .slice(0, 5)
              .map(p => p.id)
          });
        } else if (captureId === 'capture3') {
          threats.push({
            type: 'C2 Communication',
            severity: 'critical',
            description: 'Periodic beaconing to known malicious IP addresses',
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            packetIds: generatedPackets
              .filter(p => p.isSuspicious)
              .slice(0, 8)
              .map(p => p.id)
          });
        } else {
          if (generatedPackets.some(p => p.isSuspicious)) {
            threats.push({
              type: 'Suspicious Traffic',
              severity: 'low',
              description: 'Unusual port usage detected in network traffic',
              timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
              packetIds: generatedPackets
                .filter(p => p.isSuspicious)
                .slice(0, 3)
                .map(p => p.id)
            });
          }
        }
        
        setDetectedThreats(threats);
      }
      
      setLoading(false);
    }, 1500);
  };
  
  // Start a live capture
  const startLiveCapture = () => {
    setLoading(true);
    setSelectedPacket(null);
    setDetectedThreats([]);
    
    // Create a new capture file for the live capture
    const liveCapture: CaptureFile = {
      id: 'live-capture',
      name: 'Live Network Capture',
      date: new Date().toISOString().replace('T', ' ').substr(0, 19),
      description: 'Real-time packet capture',
      packetsCount: 0,
      duration: '0s',
      packets: []
    };
    
    setTimeout(() => {
      setSelectedCapture(liveCapture);
      setPackets([]);
      setLoading(false);
      setCapturingLive(true);
    }, 1000);
  };
  
  // Filter packets based on current filters
  const getFilteredPackets = () => {
    return packets.filter(packet => {
      // Filter by protocol
      if (protocolFilter !== 'all' && packet.protocol !== protocolFilter) {
        return false;
      }
      
      // Filter suspicious only
      if (suspiciousOnly && !packet.isSuspicious) {
        return false;
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          packet.sourceIP.includes(query) ||
          packet.destIP.includes(query) ||
          packet.data.toLowerCase().includes(query) ||
          packet.protocol.toLowerCase().includes(query) ||
          (packet.suspiciousReason && packet.suspiciousReason.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  };
  
  // Scroll to the bottom of the packets list if auto-scroll is enabled
  useEffect(() => {
    if (autoScroll && packetsEndRef.current) {
      packetsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, autoScroll]);
  
  // Simulate live capturing adding packets periodically
  useEffect(() => {
    if (!capturingLive) return;
    
    const interval = setInterval(() => {
      // Generate a random packet and add it to the list
      const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'ICMP'] as const;
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const localIP = '192.168.1.105';
      
      const isOutgoing = Math.random() < 0.5;
      const sourceIP = isOutgoing ? localIP : generateRandomIP();
      const destIP = isOutgoing ? generateRandomIP() : localIP;
      
      const sourcePort = isOutgoing ? 
                       50000 + Math.floor(Math.random() * 15000) : 
                       protocol === 'HTTP' ? 80 : protocol === 'HTTPS' ? 443 : 
                       protocol === 'DNS' ? 53 : Math.floor(Math.random() * 1000) + 1;
                       
      const destPort = isOutgoing ? 
                     protocol === 'HTTP' ? 80 : protocol === 'HTTPS' ? 443 : 
                     protocol === 'DNS' ? 53 : Math.floor(Math.random() * 1000) + 1 : 
                     50000 + Math.floor(Math.random() * 15000);
      
      const isSuspicious = Math.random() < 0.03; // 3% chance of suspicious packet
      
      // Add the new packet
      const newPacket: Packet = {
        id: `live-packet-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
        sourceIP,
        sourcePort,
        destIP,
        destPort,
        protocol,
        size: 100 + Math.floor(Math.random() * 1000),
        flags: protocol === 'TCP' ? ['ACK'] : undefined,
        data: protocol === 'HTTP' ? 'GET /index.html HTTP/1.1' : 
             protocol === 'HTTPS' ? '[Encrypted TLS data]' : 
             protocol === 'DNS' ? 'DNS Query: example.com' : 
             '[Binary data]',
        hexDump: generateHexDump(200),
        isSuspicious,
        suspiciousReason: isSuspicious ? 'Unusual port or protocol usage' : undefined,
        isEncrypted: protocol === 'HTTPS',
        ttl: Math.floor(Math.random() * 64) + 1,
        sequence: Math.floor(Math.random() * 1000000000),
        acknowledgment: Math.floor(Math.random() * 1000000000),
        windowSize: Math.floor(Math.random() * 64000) + 1000
      };
      
      setPackets(prev => [...prev, newPacket]);
      
      // Occasionally generate a threat
      if (isSuspicious && Math.random() < 0.5) {
        setDetectedThreats(prev => [
          ...prev,
          {
            type: 'Anomalous Traffic',
            severity: 'medium',
            description: 'Unusual network activity detected',
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            packetIds: [newPacket.id]
          }
        ]);
      }
      
      // Update the selected capture file with the packet count
      if (selectedCapture) {
        setSelectedCapture(prev => {
          if (!prev) return null;
          return {
            ...prev,
            packetsCount: (prev.packetsCount || 0) + 1,
            duration: `${Math.floor((prev.packetsCount || 0) / 10)}s`
          };
        });
      }
    }, 800); // Add a new packet roughly every 800ms
    
    return () => clearInterval(interval);
  }, [capturingLive, selectedCapture]);
  
  // Get severity class for threat levels
  const getThreatSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-900/30 border-red-700/50';
      case 'high': return 'text-orange-500 bg-orange-900/30 border-orange-700/50';
      case 'medium': return 'text-yellow-500 bg-yellow-900/30 border-yellow-700/50';
      case 'low': return 'text-blue-400 bg-blue-900/30 border-blue-700/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-700/50';
    }
  };
  
  const availableProtocols = [...new Set(packets.map(p => p.protocol))].sort();
  const filteredPackets = getFilteredPackets();
  
  return (
    <div className="font-mono text-sm">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Network className="h-6 w-6 text-[var(--matrix-color)] mr-2" />
          <span>Network Traffic <span className="text-[var(--matrix-color)]">Analyzer</span></span>
        </h2>
        <div className="flex items-center">
          {capturingLive && (
            <div className="mr-4 flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1.5"></div>
              <span className="text-red-400">Live Capture</span>
            </div>
          )}
          <button 
            onClick={() => setAutoScroll(!autoScroll)} 
            className={`mr-3 px-3 py-1 text-xs flex items-center rounded-md ${
              autoScroll ? 'bg-[var(--matrix-color)]/20 border border-[var(--matrix-color)]/30 text-[var(--matrix-color)]' : 
                          'bg-gray-800 border border-gray-700 text-gray-400'
            }`}
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Auto-scroll {autoScroll ? 'On' : 'Off'}
          </button>
          <button
            onClick={startLiveCapture}
            disabled={loading}
            className={`cyber-button px-3 py-1 text-xs ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Start Live Capture
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Panel */}
        <div className="md:col-span-1 space-y-4">
          {/* Capture Files */}
          <div className="cyber-card p-4">
            <h3 className="font-bold text-white mb-3 flex items-center">
              <FileText className="h-5 w-5 text-[var(--matrix-color)] mr-1.5" />
              Capture Files
            </h3>
            
            <div className="space-y-2">
              {captureFiles.map((capture) => (
                <button
                  key={capture.id}
                  onClick={() => loadCapture(capture.id)}
                  disabled={loading || capturingLive}
                  className={`w-full p-3 rounded-md border text-left cursor-pointer transition-colors ${
                    selectedCapture?.id === capture.id 
                      ? 'bg-[var(--matrix-color)]/10 border-[var(--matrix-color)]/40' 
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  } ${(loading || capturingLive) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium">{capture.name}</div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">{capture.packetsCount} packets</span>
                    <span className="text-xs text-gray-400">{capture.duration}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{capture.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Filters */}
          {(packets.length > 0 || capturingLive) && (
            <div className="cyber-card p-4">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <Filter className="h-5 w-5 text-[var(--matrix-color)] mr-1.5" />
                Filters
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Protocol</label>
                  <select
                    value={protocolFilter}
                    onChange={(e) => setProtocolFilter(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
                  >
                    <option value="all">All Protocols</option>
                    {availableProtocols.map(protocol => (
                      <option key={protocol} value={protocol}>{protocol}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center text-gray-400 text-xs">
                    <input
                      type="checkbox"
                      checked={suspiciousOnly}
                      onChange={(e) => setSuspiciousOnly(e.target.checked)}
                      className="mr-1.5"
                    />
                    Show suspicious packets only
                  </label>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="IP, port, data content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 pl-8 text-sm text-white"
                    />
                    <Search className="h-4 w-4 text-gray-500 absolute left-2 top-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Statistics */}
          {packets.length > 0 && (
            <div className="cyber-card p-4">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <Activity className="h-5 w-5 text-[var(--matrix-color)] mr-1.5" />
                Traffic Statistics
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Packets:</span>
                  <span className="text-white">{packets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suspicious:</span>
                  <span className="text-white">{packets.filter(p => p.isSuspicious).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Encrypted:</span>
                  <span className="text-white">{packets.filter(p => p.isEncrypted).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TCP Handshakes:</span>
                  <span className="text-white">{packets.filter(p => p.isHandshake).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Authentication:</span>
                  <span className="text-white">{packets.filter(p => p.isAuthentication).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Transfers:</span>
                  <span className="text-white">{packets.filter(p => p.isDataTransfer).length}</span>
                </div>
                
                {/* Protocol distribution */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <span className="text-gray-400 text-xs">Protocol Distribution:</span>
                  <div className="mt-2 space-y-1">
                    {availableProtocols.map(protocol => {
                      const count = packets.filter(p => p.protocol === protocol).length;
                      const percentage = Math.round((count / packets.length) * 100);
                      return (
                        <div key={protocol} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className={getProtocolColor(protocol).split(' ')[0]}>{protocol}</span>
                            <span className="text-gray-400">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getProtocolColor(protocol).includes('text-[var(--matrix-color)]') ? 'bg-[var(--matrix-color)]' : getProtocolColor(protocol).split(' ')[0].replace('text-', 'bg-')}`} 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Panel */}
        <div className="md:col-span-3 space-y-4">
          {/* Packet List */}
          <div className="cyber-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center">
                <Terminal className="h-5 w-5 text-[var(--matrix-color)] mr-1.5" />
                Network Packets
              </h3>
              <div className="text-xs text-gray-400">
                {filteredPackets.length} of {packets.length} packets {searchQuery && 'matched'}
              </div>
            </div>
            
            {loading ? (
              <div className="bg-black/70 border border-gray-800 rounded-md flex items-center justify-center p-16">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-[var(--matrix-color)] mx-auto mb-3 animate-spin" />
                  <p className="text-gray-400">Loading packet capture...</p>
                </div>
              </div>
            ) : packets.length === 0 ? (
              <div className="bg-black/70 border border-gray-800 rounded-md flex items-center justify-center p-16">
                <div className="text-center">
                  <Network className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No packets loaded</p>
                  <p className="text-gray-500 text-xs mt-1">Select a capture file or start a live capture</p>
                </div>
              </div>
            ) : (
              <div className="bg-black/70 border border-gray-800 rounded-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-gray-400 text-xs grid grid-cols-12 gap-1 p-2 border-b border-gray-700">
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-2">Destination</div>
                  <div className="col-span-1">Protocol</div>
                  <div className="col-span-1">Length</div>
                  <div className="col-span-4">Info</div>
                </div>
                
                {/* Packet list */}
                <div className="overflow-y-auto max-h-[360px] font-mono">
                  {filteredPackets.map((packet) => (
                    <div 
                      key={packet.id}
                      onClick={() => setSelectedPacket(selectedPacket?.id === packet.id ? null : packet)}
                      className={`text-xs grid grid-cols-12 gap-1 p-2 cursor-pointer hover:bg-gray-800/40 border-b border-gray-800 ${
                        selectedPacket?.id === packet.id ? 'bg-gray-800/60' : packet.isSuspicious ? 'bg-red-900/10' : ''
                      }`}
                    >
                      <div className="col-span-2 text-gray-400">
                        {packet.timestamp.split(' ')[1]}
                      </div>
                      <div className="col-span-2 flex">
                        <span className="text-blue-400">{packet.sourceIP}</span>
                        <span className="text-gray-500 ml-1">:{packet.sourcePort}</span>
                      </div>
                      <div className="col-span-2 flex">
                        <span className="text-green-400">{packet.destIP}</span>
                        <span className="text-gray-500 ml-1">:{packet.destPort}</span>
                      </div>
                      <div className={`col-span-1 ${getProtocolColor(packet.protocol).split(' ')[0]}`}>
                        {packet.protocol}
                      </div>
                      <div className="col-span-1 text-gray-400">
                        {packet.size} bytes
                      </div>
                      <div className="col-span-4 text-gray-300 truncate flex items-center">
                        <span className="truncate">{packet.data}</span>
                        {packet.isSuspicious && <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-1 flex-shrink-0" />}
                        {packet.isHandshake && <ArrowRight className="h-3.5 w-3.5 text-blue-400 ml-1 flex-shrink-0" />}
                        {packet.isEncrypted && <Lock className="h-3.5 w-3.5 text-[var(--matrix-color)] ml-1 flex-shrink-0" />}
                      </div>
                    </div>
                  ))}
                  
                  {/* Auto-scroll anchor */}
                  <div ref={packetsEndRef} />
                </div>
              </div>
            )}
          </div>
          
          {/* Packet Details */}
          {selectedPacket && (
            <div className="cyber-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center">
                  <ZoomIn className="h-5 w-5 text-[var(--matrix-color)] mr-1.5" />
                  Packet Details
                </h3>
                <div className={`px-2 py-0.5 rounded-full text-xs uppercase ${getProtocolColor(selectedPacket.protocol)}`}>
                  {selectedPacket.protocol}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-blue-400">{selectedPacket.sourceIP}:{selectedPacket.sourcePort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Destination:</span>
                    <span className="text-green-400">{selectedPacket.destIP}:{selectedPacket.destPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Length:</span>
                    <span className="text-white">{selectedPacket.size} bytes</span>
                  </div>
                  {selectedPacket.flags && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Flags:</span>
                      <span className="text-white">{selectedPacket.flags.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{selectedPacket.timestamp}</span>
                  </div>
                  {selectedPacket.ttl !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">TTL:</span>
                      <span className="text-white">{selectedPacket.ttl}</span>
                    </div>
                  )}
                  {selectedPacket.sequence !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sequence:</span>
                      <span className="text-white">{selectedPacket.sequence}</span>
                    </div>
                  )}
                  {selectedPacket.windowSize !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Window Size:</span>
                      <span className="text-white">{selectedPacket.windowSize}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Packet Data</div>
                <div className="bg-black p-3 rounded-md border border-gray-800 overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono">{selectedPacket.data}</pre>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Hex Dump</div>
                <div className="bg-black p-3 rounded-md border border-gray-800 overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono">{selectedPacket.hexDump}</pre>
                </div>
              </div>
              
              {selectedPacket.isSuspicious && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-700/40 rounded-md">
                  <div className="flex items-center mb-1 text-red-400">
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    <span className="font-bold">Suspicious Activity Detected</span>
                  </div>
                  <p className="text-sm text-gray-300">{selectedPacket.suspiciousReason}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Detected Threats */}
          {detectedThreats.length > 0 && (
            <div className="cyber-card p-4">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <Shield className="h-5 w-5 text-[var(--matrix-color)] mr-1.5" />
                Detected Security Threats
              </h3>
              
              <div className="space-y-3">
                {detectedThreats.map((threat, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md border ${getThreatSeverityClass(threat.severity)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <AlertTriangle className={`h-5 w-5 mr-2 ${getThreatSeverityClass(threat.severity).split(' ')[0]}`} />
                        <div>
                          <div className="font-medium">{threat.type}</div>
                          <div className="text-xs text-gray-400">{threat.timestamp}</div>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs uppercase ${getThreatSeverityClass(threat.severity)}`}>
                        {threat.severity}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{threat.description}</p>
                    
                    <div className="mt-2 text-xs">
                      <div className="text-gray-400 mb-1">Related Packets:</div>
                      <div className="flex flex-wrap gap-1">
                        {threat.packetIds.map((packetId, idx) => {
                          const packet = packets.find(p => p.id === packetId);
                          return packet ? (
                            <button
                              key={idx}
                              onClick={() => setSelectedPacket(packet)}
                              className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded hover:border-gray-600"
                            >
                              {packet.sourceIP}:{packet.sourcePort} → {packet.destIP}:{packet.destPort}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkTrafficAnalyzer;