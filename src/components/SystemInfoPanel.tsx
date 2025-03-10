import React, { useState, useEffect } from 'react';
import { Globe, Cpu, HardDrive, Shield, Wifi, Server, Lock, Database, Network, Fingerprint, AlertTriangle, Eye, Monitor, Clock } from 'lucide-react';

interface SystemInfo {
  ip: string;
  vpnDetected: boolean;
  isp: string | null;
  browser: string;
  os: string;
  screenResolution: string;
  timeZone: string;
  language: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean | null;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  connectionType: string | null;
  connectionSpeed: string;
  memoryUsage: number;
  storageTotal: string;
  storageUsed: string;
  cpu: number;
  userAgent: string;
  webRTCEnabled: boolean;
  webGLSupport: boolean;
  highEntropyValues: {
    platform: string;
    userAgentData: any;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
  };
  vulnerabilities: string[];
}

const SystemInfoPanel: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsSection, setShowDetailsSection] = useState<string | null>(null);

  useEffect(() => {
    const gatherSystemInfo = async () => {
      try {
        // Get IP information
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Get ISP and location info
        const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const geoData = await geoResponse.json();
        
        // Get battery info
        let batteryLevel = null;
        let batteryCharging = null;
        if ('getBattery' in navigator) {
          try {
            // @ts-ignore - getBattery exists but TypeScript doesn't know about it
            const battery = await navigator.getBattery();
            batteryLevel = battery.level * 100;
            batteryCharging = battery.charging;
          } catch (error) {
            console.error('Battery API error:', error);
          }
        }

        // Get connection info
        let connectionType = null;
        if ('connection' in navigator && navigator.connection) {
          // @ts-ignore - connection exists but TypeScript doesn't know about it
          connectionType = navigator.connection.effectiveType;
        }
        
        // Check WebRTC
        const webRTCEnabled = !!(window.RTCPeerConnection || 
                                window.mozRTCPeerConnection || 
                                window.webkitRTCPeerConnection);
        
        // Check WebGL support
        let webGLSupport = false;
        try {
          const canvas = document.createElement('canvas');
          webGLSupport = !!(window.WebGLRenderingContext && 
                          (canvas.getContext('webgl') || 
                           canvas.getContext('experimental-webgl')));
        } catch (e) {
          webGLSupport = false;
        }
        
        // Simulated CPU and memory usage
        const randomCpuUsage = Math.floor(Math.random() * 30) + 10; // 10-40%
        const randomMemoryUsage = Math.floor(Math.random() * 40) + 20; // 20-60%
        
        // Get high entropy values
        const highEntropyValues = {
          platform: navigator.platform,
          userAgentData: null as any,
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: (navigator as any).deviceMemory
        };
        
        // Try to get User-Agent data if available
        if ('userAgentData' in navigator && (navigator as any).userAgentData) {
          try {
            highEntropyValues.userAgentData = await (navigator as any).userAgentData.getHighEntropyValues([
              "platform", "platformVersion", "architecture", "model", "uaFullVersion"
            ]);
          } catch (e) {
            console.error('User-Agent Client Hints API error:', e);
          }
        }
        
        // Detect potential security issues
        const vulnerabilities = [];
        if (!navigator.cookieEnabled) vulnerabilities.push("Cookies disabled may break functionality");
        if (webRTCEnabled && (geoData.org || '').toLowerCase().includes('vpn')) {
          vulnerabilities.push("WebRTC may leak real IP despite VPN");
        }
        
        // Detect browser
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        if (userAgent.indexOf('Firefox') > -1) {
          browser = 'Firefox';
        } else if (userAgent.indexOf('Chrome') > -1) {
          browser = 'Chrome';
        } else if (userAgent.indexOf('Safari') > -1) {
          browser = 'Safari';
        } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
          browser = 'Edge';
        } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
          browser = 'Opera';
        }

        // Detect OS
        let os = 'Unknown';
        if (userAgent.indexOf('Windows') > -1) {
          os = 'Windows';
        } else if (userAgent.indexOf('Mac') > -1) {
          os = 'macOS';
        } else if (userAgent.indexOf('Linux') > -1) {
          os = 'Linux';
        } else if (userAgent.indexOf('Android') > -1) {
          os = 'Android';
        } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
          os = 'iOS';
        }

        // Check if likely using a VPN (simple heuristic)
        const vpnDetected = 
          (geoData.org || '').toLowerCase().includes('vpn') ||
          (geoData.org || '').toLowerCase().includes('proxy') ||
          (geoData.org || '').toLowerCase().includes('tunnel');

        setSystemInfo({
          ip: ipData.ip,
          vpnDetected,
          isp: geoData.org,
          browser,
          os,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
          batteryLevel,
          batteryCharging,
          connectionType,
          connectionSpeed: connectionType ? `${connectionType} (estimated)` : 'Unknown',
          memoryUsage: randomMemoryUsage,
          storageTotal: '256GB',
          storageUsed: '45GB',
          cpu: randomCpuUsage,
          userAgent,
          webRTCEnabled,
          webGLSupport,
          highEntropyValues,
          vulnerabilities
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error gathering system information:', error);
        setLoading(false);
      }
    };

    gatherSystemInfo();
  }, []);

  const toggleDetailsSection = (section: string) => {
    if (showDetailsSection === section) {
      setShowDetailsSection(null);
    } else {
      setShowDetailsSection(section);
    }
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode, section: string) => (
    <button 
      onClick={() => toggleDetailsSection(section)}
      className="w-full flex items-center justify-between p-3 bg-[#1a1a1a] border border-gray-800 rounded-md mb-2 hover:bg-[#222] transition-colors"
    >
      <div className="flex items-center">
        <span className="text-[var(--matrix-color)] mr-2">{icon}</span>
        <span className="text-gray-300 font-mono">{title}</span>
      </div>
      <div className="text-[var(--matrix-color)]">
        {showDetailsSection === section ? '-' : '+'}
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="bg-black/80 border border-gray-800 rounded-md p-4 font-mono text-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[var(--matrix-color)] text-lg font-bold">System Information</h2>
          <Monitor className="h-5 w-5 text-[var(--matrix-color)]" />
        </div>
        <div className="text-gray-400">Gathering system data...</div>
        {/* ASCII style loading bar */}
        <div className="mt-3 text-[var(--matrix-color)] font-mono">
          [███████░░░░░░░░░░] 45%
        </div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className="bg-black/80 border border-gray-800 rounded-md p-4 font-mono text-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[var(--matrix-color)] text-lg font-bold">System Information</h2>
          <Monitor className="h-5 w-5 text-[var(--matrix-color)]" />
        </div>
        <div className="text-red-500">Error fetching system data</div>
      </div>
    );
  }

  return (
    <div className="bg-black/80 border border-gray-800 rounded-md p-4 font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[var(--matrix-color)] text-lg font-bold">System Information</h2>
        <Monitor className="h-5 w-5 text-[var(--matrix-color)]" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-r from-[#0a1f0a] to-[#0e2a0e] border border-[#1a3d1a] rounded-md p-3">
          <div className="flex items-center mb-2">
            <Globe className="h-4 w-4 text-[var(--matrix-color)] mr-2" />
            <span className="text-gray-300">Network</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">IP Address:</span>
              <span className="text-white">{systemInfo.ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VPN Detected:</span>
              <span className={systemInfo.vpnDetected ? "text-green-400" : "text-yellow-400"}>
                {systemInfo.vpnDetected ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ISP:</span>
              <span className="text-white">{systemInfo.isp || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0a1f0a] to-[#0e2a0e] border border-[#1a3d1a] rounded-md p-3">
          <div className="flex items-center mb-2">
            <Monitor className="h-4 w-4 text-[var(--matrix-color)] mr-2" />
            <span className="text-gray-300">System</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">OS:</span>
              <span className="text-white">{systemInfo.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Browser:</span>
              <span className="text-white">{systemInfo.browser}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CPU Usage:</span>
              <span className="text-white">{systemInfo.cpu}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      {renderSectionHeader("Network Information", <Globe className="h-4 w-4" />, "network")}
      {showDetailsSection === "network" && (
        <div className="bg-black/50 border border-gray-800 rounded-md p-3 mb-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">IP Address:</span>
                <span className="text-white">{systemInfo.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VPN Detected:</span>
                <span className={systemInfo.vpnDetected ? "text-green-400" : "text-yellow-400"}>
                  {systemInfo.vpnDetected ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ISP:</span>
                <span className="text-white">{systemInfo.isp || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connection:</span>
                <span className="text-white">{systemInfo.connectionType || 'Unknown'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Web RTC:</span>
                <span className={systemInfo.webRTCEnabled ? "text-yellow-400" : "text-green-400"}>
                  {systemInfo.webRTCEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Zone:</span>
                <span className="text-white">{systemInfo.timeZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Language:</span>
                <span className="text-white">{systemInfo.language}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderSectionHeader("System Information", <Cpu className="h-4 w-4" />, "system")}
      {showDetailsSection === "system" && (
        <div className="bg-black/50 border border-gray-800 rounded-md p-3 mb-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">OS:</span>
                <span className="text-white">{systemInfo.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Browser:</span>
                <span className="text-white">{systemInfo.browser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Screen:</span>
                <span className="text-white">{systemInfo.screenResolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">WebGL:</span>
                <span className="text-white">{systemInfo.webGLSupport ? "Supported" : "Not Supported"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Cores:</span>
                <span className="text-white">{systemInfo.highEntropyValues.hardwareConcurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Memory:</span>
                <span className="text-white">{systemInfo.highEntropyValues.deviceMemory || 'Unknown'} GB</span>
              </div>
              {systemInfo.batteryLevel !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Battery:</span>
                  <span className="text-white">
                    {Math.round(systemInfo.batteryLevel)}% 
                    {systemInfo.batteryCharging ? ' (Charging)' : ''}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Platform:</span>
                <span className="text-white">
                  {systemInfo.highEntropyValues.platform}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderSectionHeader("Privacy & Security", <Shield className="h-4 w-4" />, "privacy")}
      {showDetailsSection === "privacy" && (
        <div className="bg-black/50 border border-gray-800 rounded-md p-3 mb-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Cookies:</span>
                <span className={systemInfo.cookiesEnabled ? "text-yellow-400" : "text-green-400"}>
                  {systemInfo.cookiesEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Do Not Track:</span>
                <span className={systemInfo.doNotTrack ? "text-green-400" : "text-yellow-400"}>
                  {systemInfo.doNotTrack ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">WebRTC:</span>
                <span className={systemInfo.webRTCEnabled ? "text-yellow-400" : "text-green-400"}>
                  {systemInfo.webRTCEnabled ? "Enabled (potential IP leak)" : "Disabled"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">VPN Status:</span>
                <span className={systemInfo.vpnDetected ? "text-green-400" : "text-yellow-400"}>
                  {systemInfo.vpnDetected ? "Active" : "Not Detected"}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Vulnerabilities:</span>
                <span className="text-red-400 text-right">
                  {systemInfo.vulnerabilities.length === 0 
                    ? <span className="text-green-400">None detected</span> 
                    : systemInfo.vulnerabilities.join(", ")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 border-t border-gray-800 pt-3">
            <div className="text-[var(--matrix-color)] mb-2">Security Recommendations:</div>
            <ul className="list-disc pl-4 space-y-1">
              {!systemInfo.vpnDetected && (
                <li className="text-yellow-200">Consider using a VPN for enhanced privacy</li>
              )}
              {systemInfo.webRTCEnabled && systemInfo.vpnDetected && (
                <li className="text-yellow-200">WebRTC enabled - may leak real IP despite VPN</li>
              )}
              {!systemInfo.doNotTrack && (
                <li className="text-yellow-200">Enable 'Do Not Track' in browser settings</li>
              )}
              <li className="text-green-200">Keep your {systemInfo.os} and {systemInfo.browser} updated</li>
            </ul>
          </div>
        </div>
      )}

      {/* Resource Monitor */}
      <div className="mt-4">
        <div className="text-[var(--matrix-color)] mb-2">Resource Monitor</div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">CPU Usage</span>
              <span className="text-xs text-[var(--matrix-color)]">{systemInfo.cpu}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" 
                style={{width: `${systemInfo.cpu}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Memory</span>
              <span className="text-xs text-[var(--matrix-color)]">{systemInfo.memoryUsage}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" 
                style={{width: `${systemInfo.memoryUsage}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Storage</span>
              <span className="text-xs text-[var(--matrix-color)]">{systemInfo.storageUsed} / {systemInfo.storageTotal}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--matrix-color)] to-green-400 rounded-full" 
                style={{width: '17%'}}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoPanel;