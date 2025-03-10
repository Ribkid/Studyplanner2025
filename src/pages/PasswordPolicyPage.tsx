import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Sliders, Lock, FileText, Check, X, AlertTriangle, Info, Clock, Activity, Eye, UserCheck, RefreshCw, Download, Clipboard, LockKeyhole } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Password policy interface
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiration: number; // Days
  preventReuse: number; // Previous passwords that can't be reused
  enableMFA: boolean;
  lockoutThreshold: number; // Failed attempts
  passwordHistoryDays: number;
  customBannedWords: string[];
}

const PasswordPolicyPage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'builder' | 'generator' | 'comparison'>('builder');
  
  // Default password policy
  const [policy, setPolicy] = useState<PasswordPolicy>({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiration: 90,
    preventReuse: 12,
    enableMFA: false,
    lockoutThreshold: 5,
    passwordHistoryDays: 365,
    customBannedWords: []
  });
  
  // Generated example password
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordCopied, setPasswordCopied] = useState<boolean>(false);
  
  // Add custom banned word
  const [bannedWordInput, setBannedWordInput] = useState<string>('');

  // Calculate security score based on policy settings (0-100)
  const calculateSecurityScore = (): number => {
    let score = 0;
    
    // Length contributes up to 30 points
    score += Math.min(policy.minLength * 2, 30);
    
    // Character types contribute up to 20 points (5 each)
    if (policy.requireUppercase) score += 5;
    if (policy.requireLowercase) score += 5;
    if (policy.requireNumbers) score += 5;
    if (policy.requireSpecialChars) score += 5;
    
    // Password expiration and reuse contribute up to 15 points
    if (policy.passwordExpiration <= 60) score += 5;
    else if (policy.passwordExpiration <= 90) score += 3;
    else if (policy.passwordExpiration <= 180) score += 2;
    
    // Prevent reuse policy
    if (policy.preventReuse >= 10) score += 10;
    else if (policy.preventReuse >= 5) score += 7;
    else if (policy.preventReuse >= 2) score += 3;
    
    // MFA contributes 20 points
    if (policy.enableMFA) score += 20;
    
    // Account lockout contributes up to 10 points
    if (policy.lockoutThreshold <= 3) score += 10;
    else if (policy.lockoutThreshold <= 5) score += 7;
    else if (policy.lockoutThreshold <= 10) score += 5;
    
    // Password history retention
    if (policy.passwordHistoryDays >= 365) score += 5;
    
    // Custom banned words
    if (policy.customBannedWords.length > 0) score += Math.min(policy.customBannedWords.length, 5);
    
    return score;
  };
  
  // Calculate usability score based on policy settings (0-100)
  const calculateUsabilityScore = (): number => {
    let score = 100; // Start at 100 and subtract based on restrictions
    
    // Length penalty - longer passwords are harder to remember and type
    score -= Math.max(0, (policy.minLength - 8) * 2);
    
    // Character complexity penalties
    if (policy.requireUppercase) score -= 5;
    if (policy.requireLowercase) score -= 2;
    if (policy.requireNumbers) score -= 5;
    if (policy.requireSpecialChars) score -= 10;
    
    // Expiration penalties - frequent changes reduce usability
    if (policy.passwordExpiration < 30) score -= 20;
    else if (policy.passwordExpiration < 60) score -= 15;
    else if (policy.passwordExpiration < 90) score -= 10;
    else if (policy.passwordExpiration < 180) score -= 5;
    
    // Password history penalty
    score -= Math.min(15, policy.preventReuse);
    
    // MFA penalty - adds friction but is essential for security
    if (policy.enableMFA) score -= 10;
    
    // Lockout threshold penalty
    if (policy.lockoutThreshold < 3) score -= 10;
    else if (policy.lockoutThreshold < 5) score -= 5;
    
    // Custom banned words penalty
    score -= Math.min(10, policy.customBannedWords.length * 2);
    
    return Math.max(0, score);
  };
  
  // Calculate time to crack based on policy settings
  const calculateTimeToCrack = (): string => {
    // Base calculations assuming modern hardware (2023) can try roughly 10^12 passwords per second for offline attacks
    // For online attacks, we assume rate limiting to about 100 attempts per second
    
    let possibleChars = 0;
    if (policy.requireLowercase) possibleChars += 26;
    if (policy.requireUppercase) possibleChars += 26;
    if (policy.requireNumbers) possibleChars += 10;
    if (policy.requireSpecialChars) possibleChars += 33; // Common special characters
    
    // If no character types are selected, default to lowercase
    if (possibleChars === 0) possibleChars = 26;
    
    // Calculate total possible combinations: possibleChars^length
    const combinations = Math.pow(possibleChars, policy.minLength);
    
    // Calculate time in seconds for offline attack (worst case)
    const secondsToBreak = combinations / Math.pow(10, 12);
    
    // MFA effectively prevents offline attacks in many cases
    const mfaMultiplier = policy.enableMFA ? 1000 : 1;
    
    // Account lockout affects online attacks
    const lockoutMultiplier = Math.max(1, 20 / policy.lockoutThreshold);
    
    const totalSeconds = secondsToBreak * mfaMultiplier * lockoutMultiplier;
    
    // Convert to appropriate time unit
    if (totalSeconds < 1) {
      return "Instantly";
    } else if (totalSeconds < 60) {
      return `${Math.round(totalSeconds)} seconds`;
    } else if (totalSeconds < 3600) {
      return `${Math.round(totalSeconds / 60)} minutes`;
    } else if (totalSeconds < 86400) {
      return `${Math.round(totalSeconds / 3600)} hours`;
    } else if (totalSeconds < 31536000) {
      return `${Math.round(totalSeconds / 86400)} days`;
    } else if (totalSeconds < 315360000) { // 10 years
      return `${Math.round(totalSeconds / 31536000)} years`;
    } else if (totalSeconds < 31536000000) { // 1000 years
      return `${Math.round(totalSeconds / 31536000)} years`;
    } else {
      return "Millions of years";
    }
  };
  
  // Generate a random password based on the current policy
  const generatePassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_-+=<>?/[]{}|';
    
    let validChars = '';
    let password = '';
    
    // Build character set based on policy
    if (policy.requireLowercase) validChars += lowercaseChars;
    if (policy.requireUppercase) validChars += uppercaseChars;
    if (policy.requireNumbers) validChars += numberChars;
    if (policy.requireSpecialChars) validChars += specialChars;
    
    // If no character types are selected, default to lowercase
    if (validChars === '') validChars = lowercaseChars;
    
    // Generate random password of required length
    for (let i = 0; i < policy.minLength; i++) {
      const randomIndex = Math.floor(Math.random() * validChars.length);
      password += validChars[randomIndex];
    }
    
    // Ensure all required character types are present
    let hasLower = false;
    let hasUpper = false;
    let hasNumber = false;
    let hasSpecial = false;
    
    for (const char of password) {
      if (lowercaseChars.includes(char)) hasLower = true;
      else if (uppercaseChars.includes(char)) hasUpper = true;
      else if (numberChars.includes(char)) hasNumber = true;
      else if (specialChars.includes(char)) hasSpecial = true;
    }
    
    // If any required character type is missing, replace characters to include them
    if (policy.requireLowercase && !hasLower) {
      const randomIndex = Math.floor(Math.random() * password.length);
      const randomChar = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (policy.requireUppercase && !hasUpper) {
      const randomIndex = Math.floor(Math.random() * password.length);
      const randomChar = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (policy.requireNumbers && !hasNumber) {
      const randomIndex = Math.floor(Math.random() * password.length);
      const randomChar = numberChars[Math.floor(Math.random() * numberChars.length)];
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (policy.requireSpecialChars && !hasSpecial) {
      const randomIndex = Math.floor(Math.random() * password.length);
      const randomChar = specialChars[Math.floor(Math.random() * specialChars.length)];
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    // Check against banned words
    const containsBannedWord = policy.customBannedWords.some(word => 
      password.toLowerCase().includes(word.toLowerCase())
    );
    
    if (containsBannedWord) {
      // If contains banned word, recursively generate a new password
      return generatePassword();
    }
    
    setGeneratedPassword(password);
    setPasswordCopied(false);
  };
  
  // Copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    
    // Reset the copied state after 3 seconds
    setTimeout(() => {
      setPasswordCopied(false);
    }, 3000);
  };
  
  // Add a banned word to the policy
  const addBannedWord = () => {
    if (bannedWordInput.trim() === '') return;
    
    setPolicy(prev => ({
      ...prev,
      customBannedWords: [...prev.customBannedWords, bannedWordInput.trim()]
    }));
    
    setBannedWordInput('');
  };
  
  // Remove a banned word from the policy
  const removeBannedWord = (index: number) => {
    setPolicy(prev => ({
      ...prev,
      customBannedWords: prev.customBannedWords.filter((_, i) => i !== index)
    }));
  };
  
  // Calculate which framework recommendations the policy meets
  const evaluateFrameworks = () => {
    // NIST 800-63B compliance
    const nistCompliant = 
      policy.minLength >= 8 && 
      !policy.passwordExpiration && 
      policy.customBannedWords.length > 0;
    
    // CIS Critical Security Controls compliance
    const cisCompliant = 
      policy.minLength >= 14 && 
      policy.requireUppercase && 
      policy.requireLowercase && 
      policy.requireNumbers && 
      policy.requireSpecialChars && 
      policy.enableMFA;
    
    // PCI DSS compliance
    const pciCompliant = 
      policy.minLength >= 8 && 
      policy.requireUppercase && 
      policy.requireLowercase && 
      policy.requireNumbers && 
      policy.requireSpecialChars && 
      policy.passwordExpiration <= 90 && 
      policy.preventReuse >= 4;
    
    // SOC 2 compliance
    const soc2Compliant = 
      policy.minLength >= 8 && 
      policy.requireUppercase && 
      policy.requireLowercase && 
      policy.requireNumbers && 
      policy.lockoutThreshold <= 6;
    
    // HIPAA compliance (general interpretation)
    const hipaaCompliant = 
      policy.minLength >= 8 && 
      policy.requireUppercase && 
      policy.requireLowercase && 
      policy.requireNumbers && 
      policy.requireSpecialChars && 
      policy.enableMFA;
    
    return {
      nist: nistCompliant,
      cis: cisCompliant,
      pci: pciCompliant,
      soc2: soc2Compliant,
      hipaa: hipaaCompliant
    };
  };
  
  // Export the policy as a PDF or text
  const exportPolicy = () => {
    // Create policy text
    const securityScore = calculateSecurityScore();
    const usabilityScore = calculateUsabilityScore();
    const frameworks = evaluateFrameworks();
    
    let policyText = "ORGANIZATIONAL PASSWORD POLICY\n\n";
    policyText += "Generated with CyberStudy 2025 Password Policy Builder\n\n";
    policyText += "PASSWORD REQUIREMENTS:\n";
    policyText += `- Minimum Length: ${policy.minLength} characters\n`;
    policyText += `- Uppercase Letters: ${policy.requireUppercase ? 'Required' : 'Not required'}\n`;
    policyText += `- Lowercase Letters: ${policy.requireLowercase ? 'Required' : 'Not required'}\n`;
    policyText += `- Numbers: ${policy.requireNumbers ? 'Required' : 'Not required'}\n`;
    policyText += `- Special Characters: ${policy.requireSpecialChars ? 'Required' : 'Not required'}\n`;
    policyText += `- Password Expiration: ${policy.passwordExpiration > 0 ? `${policy.passwordExpiration} days` : 'Not required'}\n`;
    policyText += `- Previous Password Prevention: Cannot reuse last ${policy.preventReuse} passwords\n`;
    policyText += `- Multi-Factor Authentication: ${policy.enableMFA ? 'Required' : 'Not required'}\n`;
    policyText += `- Account Lockout: ${policy.lockoutThreshold} failed attempts\n`;
    policyText += `- Password History Retention: ${policy.passwordHistoryDays} days\n`;
    
    if (policy.customBannedWords.length > 0) {
      policyText += "- Banned Words/Phrases: " + policy.customBannedWords.join(", ") + "\n";
    }
    
    policyText += "\nPOLICY EVALUATION:\n";
    policyText += `- Security Score: ${securityScore}/100\n`;
    policyText += `- Usability Score: ${usabilityScore}/100\n`;
    policyText += `- Estimated Password Cracking Time: ${calculateTimeToCrack()}\n\n`;
    
    policyText += "COMPLIANCE WITH STANDARDS:\n";
    policyText += `- NIST 800-63B: ${frameworks.nist ? 'Compliant' : 'Not compliant'}\n`;
    policyText += `- CIS Critical Security Controls: ${frameworks.cis ? 'Compliant' : 'Not compliant'}\n`;
    policyText += `- PCI DSS: ${frameworks.pci ? 'Compliant' : 'Not compliant'}\n`;
    policyText += `- SOC 2: ${frameworks.soc2 ? 'Compliant' : 'Not compliant'}\n`;
    policyText += `- HIPAA (general interpretation): ${frameworks.hipaa ? 'Compliant' : 'Not compliant'}\n`;
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([policyText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'password_policy.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  useEffect(() => {
    // Generate a password when the component mounts or policy changes
    generatePassword();
  }, [policy]);
  
  const securityScore = calculateSecurityScore();
  const usabilityScore = calculateUsabilityScore();
  const timeToCrack = calculateTimeToCrack();
  const frameworkCompliance = evaluateFrameworks();

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
                <span className="matrix-text">Password Policy</span> Builder
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
        <div className="cyber-card p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">Organizational Password Policy Builder</h2>
          <p className="text-gray-300 mb-6">
            Configure password policies and see real-time assessment of security strength versus usability.
            This tool helps you balance security requirements with user experience.
          </p>
          
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('builder')}
                className={`${
                  activeTab === 'builder'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Sliders className="h-5 w-5 mr-2" />
                Policy Builder
              </button>
              
              <button
                onClick={() => setActiveTab('generator')}
                className={`${
                  activeTab === 'generator'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Lock className="h-5 w-5 mr-2" />
                Password Generator
              </button>
              
              <button
                onClick={() => setActiveTab('comparison')}
                className={`${
                  activeTab === 'comparison'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FileText className="h-5 w-5 mr-2" />
                Standards Comparison
              </button>
            </nav>
          </div>
          
          {activeTab === 'builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Password Requirements</h3>
                  <div className="space-y-6">
                    {/* Password Length */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="min-length" className="text-gray-300 font-medium">
                          Minimum Password Length: <span className="text-[var(--matrix-color)]">{policy.minLength} characters</span>
                        </label>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          policy.minLength < 8 ? 'bg-red-900/30 text-red-400' :
                          policy.minLength < 12 ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-green-900/30 text-green-400'
                        }`}>
                          {policy.minLength < 8 ? 'Weak' : policy.minLength < 12 ? 'Moderate' : 'Strong'}
                        </span>
                      </div>
                      <input
                        id="min-length"
                        type="range"
                        min="4"
                        max="32"
                        value={policy.minLength}
                        onChange={(e) => setPolicy({...policy, minLength: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>4</span>
                        <span>8</span>
                        <span>12</span>
                        <span>16</span>
                        <span>20</span>
                        <span>24</span>
                        <span>28</span>
                        <span>32</span>
                      </div>
                    </div>
                    
                    {/* Character Requirements */}
                    <div>
                      <h4 className="text-gray-300 font-medium mb-2">Required Character Types:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <input
                            id="require-uppercase"
                            type="checkbox"
                            checked={policy.requireUppercase}
                            onChange={(e) => setPolicy({...policy, requireUppercase: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="require-uppercase" className="text-gray-300">
                            Uppercase Letters (A-Z)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="require-lowercase"
                            type="checkbox"
                            checked={policy.requireLowercase}
                            onChange={(e) => setPolicy({...policy, requireLowercase: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="require-lowercase" className="text-gray-300">
                            Lowercase Letters (a-z)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="require-numbers"
                            type="checkbox"
                            checked={policy.requireNumbers}
                            onChange={(e) => setPolicy({...policy, requireNumbers: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="require-numbers" className="text-gray-300">
                            Numbers (0-9)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="require-special-chars"
                            type="checkbox"
                            checked={policy.requireSpecialChars}
                            onChange={(e) => setPolicy({...policy, requireSpecialChars: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="require-special-chars" className="text-gray-300">
                            Special Characters (!@#$%^&*)
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Password Expiration */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password-expiration" className="text-gray-300 font-medium">
                          Password Expiration: <span className="text-[var(--matrix-color)]">
                            {policy.passwordExpiration === 0 ? 'Never expires' : `${policy.passwordExpiration} days`}
                          </span>
                        </label>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">NIST Recommendation: Never expire</span>
                          <Info className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <input
                        id="password-expiration"
                        type="range"
                        min="0"
                        max="365"
                        step="30"
                        value={policy.passwordExpiration}
                        onChange={(e) => setPolicy({...policy, passwordExpiration: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Never</span>
                        <span>30d</span>
                        <span>60d</span>
                        <span>90d</span>
                        <span>180d</span>
                        <span>270d</span>
                        <span>365d</span>
                      </div>
                    </div>
                    
                    {/* Password History */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="prevent-reuse" className="text-gray-300 font-medium">
                          Prevent Password Reuse: <span className="text-[var(--matrix-color)]">
                            Last {policy.preventReuse} passwords
                          </span>
                        </label>
                      </div>
                      <input
                        id="prevent-reuse"
                        type="range"
                        min="0"
                        max="24"
                        value={policy.preventReuse}
                        onChange={(e) => setPolicy({...policy, preventReuse: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>None</span>
                        <span>4</span>
                        <span>8</span>
                        <span>12</span>
                        <span>16</span>
                        <span>20</span>
                        <span>24</span>
                      </div>
                    </div>
                    
                    {/* Multi-Factor Authentication */}
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center">
                        <input
                          id="enable-mfa"
                          type="checkbox"
                          checked={policy.enableMFA}
                          onChange={(e) => setPolicy({...policy, enableMFA: e.target.checked})}
                          className="mr-3 h-5 w-5 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                        />
                        <div>
                          <label htmlFor="enable-mfa" className="text-gray-200 font-medium">
                            Require Multi-Factor Authentication (MFA)
                          </label>
                          <p className="text-gray-400 text-sm">
                            Users must verify their identity with a second factor when logging in
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <UserCheck className={`h-6 w-6 ${policy.enableMFA ? 'text-[var(--matrix-color)]' : 'text-gray-500'}`} />
                      </div>
                    </div>
                    
                    {/* Account Lockout */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="lockout-threshold" className="text-gray-300 font-medium">
                          Account Lockout After: <span className="text-[var(--matrix-color)]">
                            {policy.lockoutThreshold} failed attempts
                          </span>
                        </label>
                      </div>
                      <input
                        id="lockout-threshold"
                        type="range"
                        min="1"
                        max="10"
                        value={policy.lockoutThreshold}
                        onChange={(e) => setPolicy({...policy, lockoutThreshold: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                        <span>8</span>
                        <span>9</span>
                        <span>10</span>
                      </div>
                    </div>
                    
                    {/* Custom Banned Words */}
                    <div>
                      <label className="text-gray-300 font-medium mb-2 block">
                        Custom Banned Words/Phrases: <span className="text-xs text-gray-500">(e.g., company name, common terms)</span>
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={bannedWordInput}
                          onChange={(e) => setBannedWordInput(e.target.value)}
                          placeholder="Enter word or phrase to ban"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-l text-white p-2"
                        />
                        <button
                          onClick={addBannedWord}
                          className="bg-[var(--matrix-color)]/20 border border-[var(--matrix-color)]/30 text-[var(--matrix-color)] px-3 py-2 rounded-r hover:bg-[var(--matrix-color)]/30"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {policy.customBannedWords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {policy.customBannedWords.map((word, index) => (
                            <div key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center">
                              <span>{word}</span>
                              <button
                                onClick={() => removeBannedWord(index)}
                                className="ml-2 text-gray-400 hover:text-gray-200"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Policy Impact Analysis</h3>
                    <button
                      onClick={exportPolicy}
                      className="cyber-button px-3 py-2 text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Policy
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-gray-300 font-medium">Security Strength</h4>
                        <Shield className="h-5 w-5 text-[var(--matrix-color)]" />
                      </div>
                      <div className="w-full bg-gray-800 h-3 rounded-full mb-1">
                        <div 
                          className={`h-3 rounded-full ${
                            securityScore < 40 ? 'bg-red-500' : 
                            securityScore < 70 ? 'bg-yellow-500' : 
                            'bg-[var(--matrix-color)]'
                          }`}
                          style={{ width: `${securityScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`font-bold ${
                          securityScore < 40 ? 'text-red-400' : 
                          securityScore < 70 ? 'text-yellow-400' : 
                          'text-[var(--matrix-color)]'
                        }`}>
                          {securityScore}/100
                        </span>
                        <span className="text-gray-400">
                          {securityScore < 40 ? 'Weak' : 
                           securityScore < 70 ? 'Moderate' : 
                           securityScore < 90 ? 'Strong' : 'Very Strong'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-gray-300 font-medium">Usability Impact</h4>
                        <Activity className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="w-full bg-gray-800 h-3 rounded-full mb-1">
                        <div 
                          className={`h-3 rounded-full ${
                            usabilityScore < 40 ? 'bg-red-500' : 
                            usabilityScore < 70 ? 'bg-yellow-500' : 
                            'bg-blue-500'
                          }`}
                          style={{ width: `${usabilityScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`font-bold ${
                          usabilityScore < 40 ? 'text-red-400' : 
                          usabilityScore < 70 ? 'text-yellow-400' : 
                          'text-blue-400'
                        }`}>
                          {usabilityScore}/100
                        </span>
                        <span className="text-gray-400">
                          {usabilityScore < 40 ? 'Frustrating' : 
                           usabilityScore < 70 ? 'Challenging' : 
                           usabilityScore < 90 ? 'Reasonable' : 'User-Friendly'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-gray-300 font-medium">Time to Crack</h4>
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="flex items-center justify-center h-12">
                        <p className="text-xl font-bold text-amber-400">{timeToCrack}</p>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        Estimated time for an offline brute force attack
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[var(--matrix-color)] font-medium mb-1">Security/Usability Balance</h4>
                        <p className="text-gray-300 text-sm">
                          {securityScore > usabilityScore + 30 ? 
                            "Your policy heavily prioritizes security over usability. Consider whether this level of security is necessary for your organization, as it may lead to user frustration and workarounds." :
                          usabilityScore > securityScore + 30 ?
                            "Your policy prioritizes usability over security. While this makes for a better user experience, it may leave your systems vulnerable to attacks." :
                            "Your policy has a good balance between security and usability, which helps ensure both protection and user adoption."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Standards Compliance</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">NIST 800-63B</span>
                      {frameworkCompliance.nist ? 
                        <span className="text-green-400 flex items-center"><Check className="h-4 w-4 mr-1" /> Compliant</span> : 
                        <span className="text-red-400 flex items-center"><X className="h-4 w-4 mr-1" /> Non-compliant</span>
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">CIS Controls</span>
                      {frameworkCompliance.cis ? 
                        <span className="text-green-400 flex items-center"><Check className="h-4 w-4 mr-1" /> Compliant</span> : 
                        <span className="text-red-400 flex items-center"><X className="h-4 w-4 mr-1" /> Non-compliant</span>
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">PCI DSS</span>
                      {frameworkCompliance.pci ? 
                        <span className="text-green-400 flex items-center"><Check className="h-4 w-4 mr-1" /> Compliant</span> : 
                        <span className="text-red-400 flex items-center"><X className="h-4 w-4 mr-1" /> Non-compliant</span>
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">SOC 2</span>
                      {frameworkCompliance.soc2 ? 
                        <span className="text-green-400 flex items-center"><Check className="h-4 w-4 mr-1" /> Compliant</span> : 
                        <span className="text-red-400 flex items-center"><X className="h-4 w-4 mr-1" /> Non-compliant</span>
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">HIPAA</span>
                      {frameworkCompliance.hipaa ? 
                        <span className="text-green-400 flex items-center"><Check className="h-4 w-4 mr-1" /> Compliant</span> : 
                        <span className="text-red-400 flex items-center"><X className="h-4 w-4 mr-1" /> Non-compliant</span>
                      }
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Sample Password</h3>
                    <button
                      onClick={generatePassword}
                      className="text-gray-400 hover:text-gray-200"
                      title="Generate New Password"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 p-3 rounded-lg mb-3 flex items-center">
                    <div className="flex-1 font-mono text-[var(--matrix-color)] truncate">
                      {showPassword ? generatedPassword : '•'.repeat(generatedPassword.length)}
                    </div>
                    <div className="flex items-center ml-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-200 p-1"
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="text-gray-400 hover:text-gray-200 p-1 ml-1"
                        title="Copy to Clipboard"
                      >
                        <Clipboard className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {passwordCopied && (
                    <div className="text-[var(--matrix-color)] text-sm flex items-center justify-center">
                      <Check className="h-4 w-4 mr-1" /> Copied to clipboard
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-gray-300 font-medium mb-2">Password Strength:</h4>
                    <div className="w-full bg-gray-900 h-2 rounded-full mb-1">
                      <div 
                        className={`h-2 rounded-full ${
                          securityScore < 40 ? 'bg-red-500' : 
                          securityScore < 70 ? 'bg-yellow-500' : 
                          'bg-[var(--matrix-color)]'
                        }`}
                        style={{ width: `${securityScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      This password meets all your policy requirements
                    </p>
                  </div>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-1">Recent Security Insight</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        NIST now recommends against mandatory password rotations, instead advocating for longer passwords and MFA. Frequent changes often lead to predictable patterns and weaker passwords.
                      </p>
                      <p className="text-gray-400 text-xs">
                        Source: NIST Special Publication 800-63B
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Password Generator</h3>
                  <p className="text-gray-300 mb-4">
                    Generate strong passwords based on your organization's password policy requirements.
                  </p>
                  
                  <div className="bg-gray-900 p-6 rounded-lg mb-6">
                    <div className="flex mb-3">
                      <div className="flex-1 font-mono text-xl text-[var(--matrix-color)] truncate overflow-x-auto">
                        {showPassword ? generatedPassword : '•'.repeat(generatedPassword.length)}
                      </div>
                      <div className="flex items-center ml-2">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-200 p-1"
                          title={showPassword ? "Hide Password" : "Show Password"}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={generatePassword}
                        className="cyber-button px-4 py-2 flex-1 flex items-center justify-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate New Password
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="cyber-button px-4 py-2 flex items-center justify-center"
                        title="Copy to Clipboard"
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Copy
                      </button>
                    </div>
                    
                    {passwordCopied && (
                      <div className="text-[var(--matrix-color)] text-sm flex items-center justify-center mt-3">
                        <Check className="h-4 w-4 mr-1" /> Copied to clipboard
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-gray-300 font-medium">Current Password Properties:</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Length</span>
                        <span className="text-[var(--matrix-color)] font-mono">{generatedPassword.length} chars</span>
                      </div>
                      
                      <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Uppercase</span>
                        <span className="text-[var(--matrix-color)] font-mono">
                          {/[A-Z]/.test(generatedPassword) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      </div>
                      
                      <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Lowercase</span>
                        <span className="text-[var(--matrix-color)] font-mono">
                          {/[a-z]/.test(generatedPassword) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      </div>
                      
                      <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Numbers</span>
                        <span className="text-[var(--matrix-color)] font-mono">
                          {/[0-9]/.test(generatedPassword) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      </div>
                      
                      <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Special Chars</span>
                        <span className="text-[var(--matrix-color)] font-mono">
                          {/[^A-Za-z0-9]/.test(generatedPassword) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      </div>
                      
                      <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Policy Compliant</span>
                        <span className="text-[var(--matrix-color)] font-mono">
                          <Check className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <Lock className="h-5 w-5 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[var(--matrix-color)] font-medium mb-1">Password Security Tips</h4>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• Never reuse passwords across different accounts</li>
                            <li>• Consider using a password manager to securely store passwords</li>
                            <li>• Enable multi-factor authentication whenever possible</li>
                            <li>• Avoid using personal information in your passwords</li>
                            <li>• Don't share passwords via email or messaging apps</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Password Policy Settings</h3>
                  
                  <div className="space-y-5">
                    {/* Length Setting */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label htmlFor="gen-length" className="text-gray-300">Password Length</label>
                        <span className="text-[var(--matrix-color)]">{policy.minLength} characters</span>
                      </div>
                      <input
                        id="gen-length"
                        type="range"
                        min="8"
                        max="32"
                        value={policy.minLength}
                        onChange={(e) => setPolicy({...policy, minLength: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                      />
                    </div>
                    
                    {/* Character Types */}
                    <div>
                      <h4 className="text-gray-300 mb-2">Character Types</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="gen-uppercase"
                            type="checkbox"
                            checked={policy.requireUppercase}
                            onChange={(e) => setPolicy({...policy, requireUppercase: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="gen-uppercase" className="text-gray-300">
                            Include Uppercase (A-Z)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="gen-lowercase"
                            type="checkbox"
                            checked={policy.requireLowercase}
                            onChange={(e) => setPolicy({...policy, requireLowercase: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="gen-lowercase" className="text-gray-300">
                            Include Lowercase (a-z)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="gen-numbers"
                            type="checkbox"
                            checked={policy.requireNumbers}
                            onChange={(e) => setPolicy({...policy, requireNumbers: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="gen-numbers" className="text-gray-300">
                            Include Numbers (0-9)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="gen-special"
                            type="checkbox"
                            checked={policy.requireSpecialChars}
                            onChange={(e) => setPolicy({...policy, requireSpecialChars: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                          />
                          <label htmlFor="gen-special" className="text-gray-300">
                            Include Special Characters (!@#$%^&*()_-+=)
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Excluded Words */}
                    <div>
                      <h4 className="text-gray-300 mb-2">Excluded Words/Phrases</h4>
                      <div className="space-y-2">
                        <div className="flex">
                          <input
                            type="text"
                            value={bannedWordInput}
                            onChange={(e) => setBannedWordInput(e.target.value)}
                            placeholder="Enter word to exclude"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-l text-white p-2"
                          />
                          <button
                            onClick={addBannedWord}
                            className="bg-[var(--matrix-color)]/20 border border-[var(--matrix-color)]/30 text-[var(--matrix-color)] px-3 py-2 rounded-r hover:bg-[var(--matrix-color)]/30"
                          >
                            Add
                          </button>
                        </div>
                        
                        {policy.customBannedWords.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {policy.customBannedWords.map((word, index) => (
                              <div key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center">
                                <span>{word}</span>
                                <button
                                  onClick={() => removeBannedWord(index)}
                                  className="ml-2 text-gray-400 hover:text-gray-200"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No words or phrases excluded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-white mb-4">Password Strength Comparison</h3>
                  
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="pb-2 text-left">Password Type</th>
                        <th className="pb-2 text-left">Example</th>
                        <th className="pb-2 text-right">Time to Crack</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-gray-700">
                        <td className="py-3">Simple word</td>
                        <td className="py-3 font-mono">password</td>
                        <td className="py-3 text-right text-red-400">Instantly</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3">Simple word with substitutions</td>
                        <td className="py-3 font-mono">p@ssw0rd</td>
                        <td className="py-3 text-right text-red-400">5 hours</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3">Short random</td>
                        <td className="py-3 font-mono">a7D#9v</td>
                        <td className="py-3 text-right text-yellow-400">3 days</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3">Medium random</td>
                        <td className="py-3 font-mono">b8K@p3F$n2</td>
                        <td className="py-3 text-right text-green-400">2 years</td>
                      </tr>
                      <tr>
                        <td className="py-3">Policy-compliant</td>
                        <td className="py-3 font-mono text-[var(--matrix-color)]">
                          {showPassword ? generatedPassword.substring(0, 10) + '...' : '•'.repeat(10) + '...'}
                        </td>
                        <td className="py-3 text-right text-[var(--matrix-color)]">{timeToCrack}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3 mt-4">
                    <p className="text-gray-400 text-xs">
                      * Times are approximate and assume a modern computer for offline attacks.
                      Online attacks would be significantly slower due to rate limiting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'comparison' && (
            <div>
              <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Security Standards Comparison</h3>
                  <button
                    onClick={exportPolicy}
                    className="cyber-button px-3 py-2 text-sm flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Policy
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="pb-3 text-left">Requirement</th>
                        <th className="pb-3 text-center">Your Policy</th>
                        <th className="pb-3 text-center">NIST 800-63B</th>
                        <th className="pb-3 text-center">CIS Controls</th>
                        <th className="pb-3 text-center">PCI DSS</th>
                        <th className="pb-3 text-center">HIPAA</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-gray-700">
                        <td className="py-3 font-medium">Minimum Length</td>
                        <td className="py-3 text-center">{policy.minLength} characters</td>
                        <td className="py-3 text-center">8+ characters</td>
                        <td className="py-3 text-center">14+ characters</td>
                        <td className="py-3 text-center">8+ characters</td>
                        <td className="py-3 text-center">8+ characters</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 font-medium">Character Complexity</td>
                        <td className="py-3 text-center">
                          {[
                            policy.requireUppercase ? 'Upper' : '',
                            policy.requireLowercase ? 'Lower' : '',
                            policy.requireNumbers ? 'Numbers' : '',
                            policy.requireSpecialChars ? 'Special' : ''
                          ].filter(Boolean).join(', ')}
                        </td>
                        <td className="py-3 text-center">No specific requirements</td>
                        <td className="py-3 text-center">All types</td>
                        <td className="py-3 text-center">3 of 4 types</td>
                        <td className="py-3 text-center">All types</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 font-medium">Password Expiration</td>
                        <td className="py-3 text-center">
                          {policy.passwordExpiration === 0 ? 'None' : `${policy.passwordExpiration} days`}
                        </td>
                        <td className="py-3 text-center">Not recommended</td>
                        <td className="py-3 text-center">Not specified</td>
                        <td className="py-3 text-center">90 days max</td>
                        <td className="py-3 text-center">Periodic change</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 font-medium">Password History</td>
                        <td className="py-3 text-center">Last {policy.preventReuse} passwords</td>
                        <td className="py-3 text-center">Not specified</td>
                        <td className="py-3 text-center">5+ previous</td>
                        <td className="py-3 text-center">4+ previous</td>
                        <td className="py-3 text-center">Not specified</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 font-medium">Multi-Factor Authentication</td>
                        <td className="py-3 text-center">{policy.enableMFA ? 'Required' : 'Not required'}</td>
                        <td className="py-3 text-center">Recommended</td>
                        <td className="py-3 text-center">Required</td>
                        <td className="py-3 text-center">Recommended</td>
                        <td className="py-3 text-center">Recommended</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 font-medium">Account Lockout</td>
                        <td className="py-3 text-center">After {policy.lockoutThreshold} attempts</td>
                        <td className="py-3 text-center">Recommended</td>
                        <td className="py-3 text-center">Required</td>
                        <td className="py-3 text-center">After 6 attempts</td>
                        <td className="py-3 text-center">Required</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium">Banned Passwords</td>
                        <td className="py-3 text-center">
                          {policy.customBannedWords.length > 0 ? `${policy.customBannedWords.length} words` : 'None'}
                        </td>
                        <td className="py-3 text-center">Required</td>
                        <td className="py-3 text-center">Recommended</td>
                        <td className="py-3 text-center">Not specified</td>
                        <td className="py-3 text-center">Not specified</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-white mb-4">Framework Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[var(--matrix-color)] font-medium mb-2">NIST 800-63B (2023)</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        The National Institute of Standards and Technology guidelines take a modern approach to password security, focusing on length rather than complexity and eliminating arbitrary password rotation requirements.
                      </p>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Minimum 8 characters, no forced composition rules</li>
                        <li>• No mandatory periodic password changes</li>
                        <li>• Check passwords against known compromised lists</li>
                        <li>• Allow paste functionality and password managers</li>
                        <li>• Rate-limit failed authentication attempts</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-[var(--matrix-color)] font-medium mb-2">CIS Critical Security Controls</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        The Center for Internet Security Controls provides detailed technical guidance for organizations to improve their security posture by implementing specific security controls.
                      </p>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Use multi-factor authentication for all admin accounts</li>
                        <li>• Use 14+ character passwords with complexity</li>
                        <li>• Prevent reuse of passwords across multiple accounts</li>
                        <li>• Store passwords in a secure, hashed format</li>
                        <li>• Use automated tools to verify policy compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-white mb-4">Compliance Recommendations</h3>
                  
                  <div className="space-y-4">
                    {!frameworkCompliance.nist && (
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                        <h4 className="text-red-400 font-medium mb-1 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" /> NIST 800-63B Non-Compliance
                        </h4>
                        <p className="text-gray-300 text-sm">
                          To meet NIST guidelines, consider:
                          {policy.passwordExpiration > 0 && (
                            <span className="block mt-1">• Removing password expiration requirements</span>
                          )}
                          {policy.minLength < 8 && (
                            <span className="block mt-1">• Increasing minimum password length to 8 characters</span>
                          )}
                          {policy.customBannedWords.length === 0 && (
                            <span className="block mt-1">• Adding banned/common passwords to the policy</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {!frameworkCompliance.cis && (
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                        <h4 className="text-red-400 font-medium mb-1 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" /> CIS Controls Non-Compliance
                        </h4>
                        <p className="text-gray-300 text-sm">
                          To meet CIS guidelines, consider:
                          {policy.minLength < 14 && (
                            <span className="block mt-1">• Increasing minimum password length to 14 characters</span>
                          )}
                          {!(policy.requireUppercase && policy.requireLowercase && policy.requireNumbers && policy.requireSpecialChars) && (
                            <span className="block mt-1">• Requiring all character types (uppercase, lowercase, numbers, special)</span>
                          )}
                          {!policy.enableMFA && (
                            <span className="block mt-1">• Enabling multi-factor authentication</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {!frameworkCompliance.pci && (
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                        <h4 className="text-red-400 font-medium mb-1 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" /> PCI DSS Non-Compliance
                        </h4>
                        <p className="text-gray-300 text-sm">
                          To meet PCI DSS guidelines, consider:
                          {policy.minLength < 8 && (
                            <span className="block mt-1">• Increasing minimum password length to 8 characters</span>
                          )}
                          {!((policy.requireUppercase && policy.requireLowercase && policy.requireNumbers) || 
                             (policy.requireUppercase && policy.requireLowercase && policy.requireSpecialChars) || 
                             (policy.requireUppercase && policy.requireNumbers && policy.requireSpecialChars) || 
                             (policy.requireLowercase && policy.requireNumbers && policy.requireSpecialChars)) && (
                            <span className="block mt-1">• Requiring at least 3 of 4 character types</span>
                          )}
                          {policy.passwordExpiration > 90 && (
                            <span className="block mt-1">• Setting password expiration to 90 days or less</span>
                          )}
                          {policy.preventReuse < 4 && (
                            <span className="block mt-1">• Preventing reuse of at least 4 previous passwords</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {!frameworkCompliance.hipaa && (
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                        <h4 className="text-red-400 font-medium mb-1 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" /> HIPAA Non-Compliance
                        </h4>
                        <p className="text-gray-300 text-sm">
                          To meet HIPAA guidelines, consider:
                          {policy.minLength < 8 && (
                            <span className="block mt-1">• Increasing minimum password length to 8 characters</span>
                          )}
                          {!(policy.requireUppercase && policy.requireLowercase && policy.requireNumbers && policy.requireSpecialChars) && (
                            <span className="block mt-1">• Requiring all character types for complexity</span>
                          )}
                          {!policy.enableMFA && (
                            <span className="block mt-1">• Enabling multi-factor authentication</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {(frameworkCompliance.nist && frameworkCompliance.cis && frameworkCompliance.pci && frameworkCompliance.hipaa) && (
                      <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
                        <h4 className="text-green-400 font-medium mb-1 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> All Standards Met
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Your password policy is compliant with all major security frameworks. This provides a strong security posture while balancing usability considerations.
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4 mt-6">
                      <div className="flex items-start">
                        <LockKeyhole className="h-5 w-5 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[var(--matrix-color)] font-medium mb-1">Framework Conflicts</h4>
                          <p className="text-gray-300 text-sm">
                            Note that frameworks may have contradictory requirements. For example, NIST recommends against password expiration while PCI DSS requires it. When implementing your policy, prioritize frameworks most relevant to your organization's industry and requirements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PasswordPolicyPage;