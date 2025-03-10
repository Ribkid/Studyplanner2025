import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertCircle, Activity, Bell, Terminal, Database, Server, Clock, RefreshCw, Filter, ChevronDown, ChevronUp, Check, X, AlertTriangle, ChevronRight, Search, Info, Cpu, User, Lock, FileText } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { SOCAlert, generateSOCAlert } from '../services/deepseek-security-service';

const SOCSimulatorPage: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<SOCAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SOCAlert | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [userActions, setUserActions] = useState<Map<string, string[]>>(new Map());
  const [userRating, setUserRating] = useState<Map<string, 'correct' | 'partial' | 'incorrect'>>(new Map());
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userScore, setUserScore] = useState<{total: number, scores: Record<string, number>}>({
    total: 0,
    scores: {
      'correct': 0,
      'partial': 0,
      'incorrect': 0
    }
  });
  
  // Initial load of SOC alerts
  useEffect(() => {
    async function loadInitialAlerts() {
      setLoading(true);
      try {
        // Generate initial alerts of different severity levels
        const lowAlert = await generateSOCAlert({ severity: 'low' });
        const mediumAlert = await generateSOCAlert({ severity: 'medium' });
        const highAlert = await generateSOCAlert({ severity: 'high' });
        const criticalAlert = await generateSOCAlert({ severity: 'critical' });
        const falsePositiveAlert = await generateSOCAlert({ falsePositive: true });
        
        setAlerts([lowAlert, mediumAlert, highAlert, criticalAlert, falsePositiveAlert]);
        setSelectedAlert(criticalAlert); // Start with the critical alert
      } catch (error) {
        console.error('Error loading initial SOC alerts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialAlerts();
  }, []);
  
  // Generate a new SOC alert
  const generateNewAlert = async () => {
    setGenerating(true);
    try {
      const severity = severityFilter === 'all' ? 
        (['low', 'medium', 'high', 'critical'] as const)[Math.floor(Math.random() * 4)] : 
        severityFilter as 'low' | 'medium' | 'high' | 'critical';
      
      // 20% chance of generating a false positive
      const falsePositive = Math.random() < 0.2;
      
      const newAlert = await generateSOCAlert({ severity, falsePositive });
      setAlerts(prev => [newAlert, ...prev]);
      setSelectedAlert(newAlert);
      setShowExplanation(false);
    } catch (error) {
      console.error('Error generating new SOC alert:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  // Toggle alert expansion
  const toggleAlertExpansion = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };
  
  // Submit user actions for analysis
  const submitActions = (alertId: string, actions: string[]) => {
    if (!selectedAlert) return;
    
    // Store user actions
    setUserActions(prev => new Map(prev).set(alertId, actions));
    
    // Calculate rating based on matching recommended actions
    const recommendedActions = selectedAlert.recommendedActions;
    const matchedActions = actions.filter(action => 
      recommendedActions.some(rec => rec.toLowerCase().includes(action.toLowerCase()))
    );
    
    let rating: 'correct' | 'partial' | 'incorrect';
    
    // Rating logic:
    // - If alert is a false positive and user took minimal actions, that's correct
    // - If alert is real and user matched most recommendations, that's correct
    // - Otherwise, partial or incorrect based on percentage matched
    
    if (selectedAlert.falsePositive) {
      rating = actions.length <= 1 ? 'correct' : 'incorrect';
    } else {
      const matchPercentage = matchedActions.length / recommendedActions.length;
      if (matchPercentage >= 0.75) {
        rating = 'correct';
      } else if (matchPercentage >= 0.4) {
        rating = 'partial';
      } else {
        rating = 'incorrect';
      }
    }
    
    // Update user rating for this alert
    setUserRating(prev => new Map(prev).set(alertId, rating));
    
    // Update score
    setUserScore(prev => {
      const newScores = {...prev.scores};
      newScores[rating] = (newScores[rating] || 0) + 1;
      return {
        total: prev.total + 1,
        scores: newScores
      };
    });
    
    // Show explanation
    setShowExplanation(true);
  };
  
  // Filter alerts based on severity and search
  const filteredAlerts = alerts.filter(alert => {
    // Filter by severity
    if (severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.alertName.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.source.toLowerCase().includes(query) ||
        alert.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get severity color based on level
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-gray-900/30 text-gray-400 border border-gray-700/50';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      case 'high':
        return 'bg-orange-900/30 text-orange-400 border border-orange-700/50';
      case 'critical':
        return 'bg-red-900/30 text-red-400 border border-red-700/50';
      default:
        return 'bg-gray-900/30 text-gray-400 border border-gray-700/50';
    }
  };
  
  // Get rating feedback color
  const getRatingColor = (rating: 'correct' | 'partial' | 'incorrect') => {
    switch (rating) {
      case 'correct':
        return 'bg-green-900/30 text-green-400 border border-green-700/50';
      case 'partial':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      case 'incorrect':
        return 'bg-red-900/30 text-red-400 border border-red-700/50';
      default:
        return 'bg-gray-900/30 text-gray-400 border border-gray-700/50';
    }
  };
  
  // Alert Action Selection Component
  const AlertActions = ({ alert }: { alert: SOCAlert }) => {
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const hasSubmitted = userActions.has(alert.id);
    
    const possibleActions = [
      "Escalate to Tier 2 SOC analyst",
      "Create incident ticket",
      "Contact affected user",
      "Isolate affected system from network",
      "Reset user credentials",
      "Implement temporary firewall rule",
      "Collect forensic evidence",
      "Run malware scan",
      "Monitor for additional indicators",
      "Block suspicious IP addresses",
      "Disable affected user account",
      "Review recent system logs",
      "Update IDS/IPS signatures",
      "Verify with asset owner",
      "Document as false positive",
      "Close alert with no action"
    ];
    
    // Toggle action selection
    const toggleAction = (action: string) => {
      if (hasSubmitted) return;
      
      setSelectedActions(prev => 
        prev.includes(action) 
          ? prev.filter(a => a !== action) 
          : [...prev, action]
      );
    };
    
    return (
      <div className="mt-4">
        <h3 className="font-medium text-white mb-2 flex items-center">
          <Activity className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
          Response Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {possibleActions.map((action, index) => (
            <div 
              key={index}
              onClick={() => toggleAction(action)}
              className={`
                p-2 rounded-md border text-sm cursor-pointer transition-all
                ${selectedActions.includes(action) 
                  ? 'bg-[var(--matrix-color)]/20 border-[var(--matrix-color)]/40 text-[var(--matrix-color)]' 
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
                ${hasSubmitted ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              {selectedActions.includes(action) && <Check className="h-4 w-4 inline mr-1" />}
              {action}
            </div>
          ))}
        </div>
        
        {!hasSubmitted ? (
          <button
            onClick={() => submitActions(alert.id, selectedActions)}
            disabled={selectedActions.length === 0}
            className={`
              cyber-button px-4 py-2 w-full
              ${selectedActions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Submit Response
          </button>
        ) : (
          <div className={`p-3 rounded-md ${getRatingColor(userRating.get(alert.id) || 'incorrect')}`}>
            <div className="font-medium mb-1">
              {userRating.get(alert.id) === 'correct' && (
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Correct Response!
                </div>
              )}
              {userRating.get(alert.id) === 'partial' && (
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Partially Correct
                </div>
              )}
              {userRating.get(alert.id) === 'incorrect' && (
                <div className="flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  Incorrect Response
                </div>
              )}
            </div>
            
            <p className="text-sm">
              {alert.falsePositive 
                ? "This was a false positive alert. Minimal action was required."
                : "This alert required prompt action based on the severity and indicators."}
            </p>
            
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="mt-2 text-sm underline"
            >
              {showExplanation ? "Hide explanation" : "Show explanation"}
            </button>
          </div>
        )}
        
        {hasSubmitted && showExplanation && (
          <div className="mt-4 p-3 bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/30 rounded-md">
            <h4 className="font-medium text-[var(--matrix-color)] mb-2">Alert Explanation:</h4>
            <p className="text-sm text-gray-300 mb-3">{alert.explanation}</p>
            
            <h4 className="font-medium text-[var(--matrix-color)] mb-2">Recommended Actions:</h4>
            <ul className="space-y-1 mb-3">
              {alert.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
            
            <h4 className="font-medium text-[var(--matrix-color)] mb-2">Your Actions:</h4>
            <ul className="space-y-1">
              {userActions.get(alert.id)?.map((action, index) => (
                <li key={index} className="flex items-start text-sm">
                  {alert.recommendedActions.some(rec => rec.toLowerCase().includes(action.toLowerCase())) ? (
                    <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

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
                <span className="matrix-text">SOC</span> Simulator
              </h1>
            </div>
            {user && (
              <div className="text-sm text-gray-300">
                Logged in as <span className="text-[var(--matrix-color)] font-medium">{user.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SOC Dashboard Overview */}
          <div className="lg:col-span-1 space-y-4">
            {/* Dashboard Stats */}
            <div className="cyber-card p-4">
              <h2 className="text-lg font-bold text-white flex items-center mb-4">
                <Activity className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                SOC Dashboard
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 text-center">
                  <p className="text-xs text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-[var(--matrix-color)]">{alerts.length}</p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 text-center">
                  <p className="text-xs text-gray-400">Critical</p>
                  <p className="text-2xl font-bold text-red-400">
                    {alerts.filter(a => a.severity === 'critical').length}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 text-center">
                  <p className="text-xs text-gray-400">Your Score</p>
                  <p className="text-2xl font-bold text-[var(--matrix-color)]">
                    {userScore.total > 0 ? 
                      Math.round(((userScore.scores.correct || 0) * 100 + (userScore.scores.partial || 0) * 50) / (userScore.total * 100) * 100) : 
                      0}%
                  </p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 text-center">
                  <p className="text-xs text-gray-400">Response Time</p>
                  <p className="text-xl font-bold text-[var(--matrix-color)]">5m</p>
                </div>
              </div>
              
              <button 
                onClick={generateNewAlert}
                disabled={generating}
                className="cyber-button px-4 py-2 w-full mt-4 flex items-center justify-center"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Generate New Alert
                  </>
                )}
              </button>
            </div>
            
            {/* Filters and Search */}
            <div className="cyber-card p-4">
              <h3 className="font-medium text-white mb-3 flex items-center">
                <Filter className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Alert Filters
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-md p-2 text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-md p-2 pl-8 text-sm"
                    />
                    <Search className="h-4 w-4 text-gray-500 absolute left-2 top-2.5" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alert Summary */}
            <div className="cyber-card p-4">
              <h3 className="font-medium text-white mb-3 flex items-center">
                <Bell className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Alert Feed
              </h3>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--matrix-color)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-gray-400">Loading alerts...</p>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-700 rounded-md">
                    <Bell className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-500">No alerts found</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`
                        border rounded-md transition-all cursor-pointer 
                        ${selectedAlert?.id === alert.id ? 
                          'bg-[var(--matrix-color)]/10 border-[var(--matrix-color)]/30' : 
                          'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <div 
                        className="p-2"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowExplanation(!!userActions.get(alert.id));
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm text-gray-300 truncate max-w-[75%]">
                            {alert.alertName}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{alert.source}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {userRating.has(alert.id) && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              getRatingColor(userRating.get(alert.id) || 'incorrect')
                            }`}>
                              {userRating.get(alert.id)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className="px-2 py-1 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500 hover:bg-gray-700/50"
                        onClick={() => toggleAlertExpansion(alert.id)}
                      >
                        <span>{expandedAlerts.has(alert.id) ? 'Hide details' : 'Show details'}</span>
                        {expandedAlerts.has(alert.id) ? 
                          <ChevronUp className="h-3 w-3" /> : 
                          <ChevronDown className="h-3 w-3" />
                        }
                      </div>
                      
                      {expandedAlerts.has(alert.id) && (
                        <div className="px-2 py-2 border-t border-gray-700 text-xs text-gray-400">
                          <p className="mb-1">{alert.description}</p>
                          <div className="mt-2">
                            <span className="text-gray-500">Category:</span> {alert.category}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <button
                              onClick={() => {
                                setSelectedAlert(alert);
                                setShowExplanation(!!userActions.get(alert.id));
                              }}
                              className="text-[var(--matrix-color)] hover:underline"
                            >
                              Analyze Alert
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-700">
                <Link
                  to="/phishing-simulator"
                  className="cyber-button px-4 py-2 w-full flex items-center justify-center"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Phishing Simulator
                </Link>
              </div>
            </div>
          </div>
          
          {/* Alert Details and Analysis */}
          <div className="lg:col-span-3 space-y-4">
            {/* Alert Details */}
            {selectedAlert ? (
              <div className="cyber-card p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <Bell className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                    Alert Details
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 rounded-md mb-4">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-white text-lg mb-1">{selectedAlert.alertName}</h3>
                    <div className="flex flex-wrap items-center text-sm text-gray-400 gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(selectedAlert.timestamp)}
                      </div>
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-1 text-gray-500" />
                        {selectedAlert.source}
                      </div>
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-1 text-gray-500" />
                        {selectedAlert.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-white mb-2">Description</h4>
                    <p className="text-gray-300 mb-4">{selectedAlert.description}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Affected Assets</h4>
                        <ul className="space-y-1">
                          {selectedAlert.affectedAssets.map((asset, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <Server className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{asset}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-2">Indicators</h4>
                        <ul className="space-y-1">
                          {selectedAlert.indicators.map((indicator, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <AlertActions alert={selectedAlert} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="cyber-card p-6 text-center">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Alert Selected</h3>
                <p className="text-gray-400">
                  {filteredAlerts.length > 0 ? 
                    'Select an alert from the left panel to view details and respond.' : 
                    'No alerts available. Generate a new alert to begin.'}
                </p>
                
                {filteredAlerts.length === 0 && (
                  <button 
                    onClick={generateNewAlert}
                    disabled={generating}
                    className="mt-4 cyber-button px-4 py-2 flex items-center mx-auto"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        Generate Alert
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {/* SOC Analyst Skills & Resources */}
            <div className="cyber-card p-4">
              <h2 className="text-lg font-bold text-white flex items-center mb-4">
                <Shield className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                SOC Analyst Training Resources
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                  <h3 className="font-medium text-white mb-2 flex items-center">
                    <Cpu className="h-4 w-4 text-[var(--matrix-color)] mr-2" />
                    Technical Skills
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Log Analysis
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Network Traffic Analysis
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Malware Analysis
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Memory Forensics
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      SIEM Operations
                    </li>
                  </ul>
                  <div className="mt-2">
                    <a href="#" className="text-xs text-[var(--matrix-color)] hover:underline flex items-center">
                      View Technical Training <ChevronRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                  <h3 className="font-medium text-white mb-2 flex items-center">
                    <User className="h-4 w-4 text-[var(--matrix-color)] mr-2" />
                    Soft Skills
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Communication
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Critical Thinking
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Prioritization
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Incident Response
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-400 mr-1.5" />
                      Report Writing
                    </li>
                  </ul>
                  <div className="mt-2">
                    <a href="#" className="text-xs text-[var(--matrix-color)] hover:underline flex items-center">
                      View Soft Skills Training <ChevronRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                  <h3 className="font-medium text-white mb-2 flex items-center">
                    <Lock className="h-4 w-4 text-[var(--matrix-color)] mr-2" />
                    Analyst Resources
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center">
                      <FileText className="h-3 w-3 text-[var(--matrix-color)] mr-1.5" />
                      SOC Playbooks
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-3 w-3 text-[var(--matrix-color)] mr-1.5" />
                      Indicator Search
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-3 w-3 text-[var(--matrix-color)] mr-1.5" />
                      Threat Intelligence
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-3 w-3 text-[var(--matrix-color)] mr-1.5" />
                      Case Management
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-3 w-3 text-[var(--matrix-color)] mr-1.5" />
                      Incident Templates
                    </li>
                  </ul>
                  <div className="mt-2">
                    <a href="#" className="text-xs text-[var(--matrix-color)] hover:underline flex items-center">
                      Access Resources <ChevronRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/30 rounded-md">
                <h3 className="font-medium text-[var(--matrix-color)] mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  SOC Analyst Best Practices
                </h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Always prioritize alerts based on severity, but verify the accuracy of the alert before taking significant actions.</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Document all investigation steps and findings, even for false positives, to improve future alert tuning.</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Correlate multiple data sources to reduce false positives and build a complete picture of potential security incidents.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SOCSimulatorPage;