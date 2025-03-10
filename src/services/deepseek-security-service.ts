import OpenAI from 'openai';

// Get API key from environment variables
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

// Initialize the OpenAI client with DeepSeek's API endpoint
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true
});

// Check if API key is available
const isApiKeyAvailable = () => {
  return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 0 && DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here';
};

// Phishing scenarios
export interface PhishingScenario {
  id: string;
  subject: string;
  from: string;
  content: string;
  timestamp: string;
  redFlags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  explanation: string;
}

// SOC alert scenarios
export interface SOCAlert {
  id: string;
  alertName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  description: string;
  affectedAssets: string[];
  indicators: string[];
  recommendedActions: string[];
  category: string;
  falsePositive: boolean;
  explanation: string;
}

// Fallback phishing emails in case the API doesn't work
const SAMPLE_PHISHING_EMAILS: PhishingScenario[] = [
  {
    id: 'phish-001',
    subject: 'Urgent: Your Account Access Will Be Suspended',
    from: 'security-alerts@bankofamerica-secure.com',
    content: `
Dear Valued Customer,

We have detected unusual activity on your Bank of America account. To prevent unauthorized access, your account will be suspended within 24 hours unless you verify your information immediately.

Please click on the link below to verify your account details:
[Verify Account Now](http://secure-bankofamerica.credential-check.com/verify)

This is an urgent matter regarding the security of your account.

Regards,
Bank of America Security Team
    `,
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    redFlags: [
      'Suspicious domain name (not bankofamerica.com)',
      'Creates a sense of urgency',
      'Contains threatening language about account suspension',
      'Generic greeting instead of using your name',
      'Uses a suspicious link with a non-bank domain'
    ],
    difficulty: 'easy',
    category: 'Banking',
    explanation: 'This is a classic phishing attempt mimicking a bank security alert. The sender\'s email domain is a red flag as it\'s not the official Bank of America domain. Legitimate banks don\'t use third-party domains for security communications. The message creates artificial urgency and fear to manipulate you into acting quickly without thinking. Also, legitimate banks typically address you by name, not as "Valued Customer."'
  },
  {
    id: 'phish-002',
    subject: 'Your Microsoft 365 subscription requires immediate attention',
    from: 'ms365-noreply@microsoft-securityteam.net',
    content: `
Dear Microsoft Customer,

Your Microsoft 365 subscription has encountered a billing problem. Your subscription will expire in 24 hours if the issue is not resolved.

To ensure uninterrupted service, please update your payment information by following these steps:
1. Click here to log in: [Microsoft 365 Account Portal](http://microsoft-365-validate.net/account-verify)
2. Verify your payment details
3. Continue using Microsoft 365 without interruption

Ignoring this email will result in the suspension of your Microsoft 365 services.

Thank you,
Microsoft 365 Billing Department
    `,
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    redFlags: [
      'Suspicious domain (not microsoft.com)',
      'Creates urgency with service suspension threat',
      'Contains suspicious link with non-Microsoft domain',
      'Generic greeting instead of your registered name',
      'Poor formatting and questionable sender address'
    ],
    difficulty: 'medium',
    category: 'Software/Services',
    explanation: 'This email attempts to impersonate Microsoft by creating urgency around a subscription issue. The sender\'s email domain is suspicious as it\'s not from microsoft.com. The link provided points to a non-Microsoft domain designed to steal credentials. Microsoft always addresses customers by their registered name and sends billing communications from authenticated microsoft.com domains.'
  },
  {
    id: 'phish-003',
    subject: 'ZOOM: You have a missed meeting recording to review',
    from: 'zoom-notifications@zoom-meetings-recordings.com',
    content: `
Zoom Meeting Reminder:

You've missed an important Zoom meeting. The host has recorded this meeting and requested you to review it as soon as possible.

Meeting Details:
* Date: April 11, 2025
* Time: 3:30 PM EST
* Host: James Peterson, Senior Manager
* Subject: Quarterly Team Updates

To view the recording, click the secure link below and sign in with your company credentials:
[View Recording](http://zoom-secure-recordings.com/playback/0c8aJ92xP)

This link will expire in 48 hours.

Thank you for using Zoom Video Communications.
    `,
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    redFlags: [
      'Suspicious domain not matching official Zoom domain',
      'Vague information about the meeting',
      'Request to enter credentials on a non-company site',
      'Creates curiosity and urgency with expiring link',
      'No specific information that personally identifies you'
    ],
    difficulty: 'hard',
    category: 'Video Conferencing',
    explanation: 'This sophisticated phishing email targets remote workers by referencing Zoom meetings, which are commonplace. The email creates curiosity about a missed meeting and provides just enough specific information to seem legitimate. However, the domain is not Zoom\'s official domain, and the link would take you to a credential-harvesting site. Legitimate Zoom notifications come from zoom.us domains and typically include more specific information about the host and meeting.'
  }
];

// Fallback SOC alerts in case the API doesn't work
const SAMPLE_SOC_ALERTS: SOCAlert[] = [
  {
    id: 'soc-001',
    alertName: 'Multiple Failed Login Attempts',
    severity: 'medium',
    source: 'Azure Active Directory',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    description: 'Multiple failed authentication attempts detected from IP 185.173.35.22 targeting user account jsmith@company.com',
    affectedAssets: ['User: jsmith@company.com', 'Azure AD'],
    indicators: [
      '15 failed login attempts within 5 minutes',
      'Source IP: 185.173.35.22 (Location: Russia)',
      'User has no history of logins from this location',
      'Attempts continued after account lockout policy triggered'
    ],
    recommendedActions: [
      'Confirm with user if they were attempting to log in',
      'Reset user password if suspicious',
      'Enable MFA for the affected account if not already enabled',
      'Block the source IP address in the firewall'
    ],
    category: 'Authentication',
    falsePositive: false,
    explanation: 'This alert indicates a potential brute force attack targeting a specific user account. The high number of failed attempts in a short time period from a foreign IP address that the user has never connected from before strongly suggests malicious activity rather than a user forgetting their password. The continued attempts even after lockout suggests automated tooling.'
  },
  {
    id: 'soc-002',
    alertName: 'Unusual PowerShell Command Execution',
    severity: 'high',
    source: 'Endpoint Detection and Response (EDR)',
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    description: 'Suspicious PowerShell activity detected on workstation WIN-DEV-042 including encoded commands and connection attempts to unusual domains',
    affectedAssets: ['Workstation: WIN-DEV-042', 'User: mwilliams'],
    indicators: [
      'Base64 encoded PowerShell command execution',
      'PowerShell script attempting to disable Windows Defender',
      'Connection attempts to dominotrack362.ru',
      'Process injection detected',
      'Scheduled task creation for persistence'
    ],
    recommendedActions: [
      'Isolate the affected workstation from the network immediately',
      'Initiate incident response procedures',
      'Capture memory dump for forensic analysis',
      'Scan network for similar indicators of compromise',
      'Prepare for system reimaging after data collection'
    ],
    category: 'Endpoint Threat',
    falsePositive: false,
    explanation: 'This alert represents a serious security incident with multiple indicators of compromise. The encoded PowerShell commands are being used to hide malicious activity, and the attempt to disable security software indicates an attacker trying to evade detection. The connection to a suspicious domain and persistence mechanisms show this is an active intrusion attempt requiring immediate response.'
  },
  {
    id: 'soc-003',
    alertName: 'Unusual Data Transfer Volume',
    severity: 'medium',
    source: 'Data Loss Prevention (DLP)',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    description: 'Large volume of data (2.7GB) transferred to external cloud storage service from Finance department workstation FIN-WS-015',
    affectedAssets: ['Workstation: FIN-WS-015', 'User: lgarcia'],
    indicators: [
      '2.7GB of data uploaded to personal Dropbox account',
      'Transfer occurred outside normal business hours (2:15 AM)',
      'Multiple compressed files with finance-related naming',
      'User authenticated to VPN from residential IP address',
      'No previous history of large cloud transfers from this user'
    ],
    recommendedActions: [
      'Contact user to verify legitimacy of the transfer',
      'Review logs to identify what files were transferred',
      'Temporarily block access to unauthorized cloud storage services',
      'Escalate to management if data breach is suspected',
      'Review DLP policies for Finance department'
    ],
    category: 'Data Protection',
    falsePositive: true,
    explanation: 'While this alert shows suspicious activity, it may be a false positive. The finance team member could be working late on quarter-end reports and backing up their work. The timing is unusual but not impossible. You should investigate by contacting the user before taking disruptive action, as there may be a legitimate business reason for this transfer. This requires careful balancing of security with business operations.'
  },
  {
    id: 'soc-004',
    alertName: 'Potential Web Application Attack',
    severity: 'critical',
    source: 'Web Application Firewall (WAF)',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    description: 'Multiple SQL injection and XSS attack patterns detected targeting customer portal application',
    affectedAssets: ['Application: customer-portal.company.com', 'Database: CUST-DB-PROD'],
    indicators: [
      'Multiple SQL injection payloads detected in form submissions',
      'Attempted path traversal attacks on file upload feature',
      'Cross-site scripting (XSS) payloads in comment fields',
      'Source IPs associated with known VPN services',
      'Attack patterns match recent exploit toolkit signatures'
    ],
    recommendedActions: [
      'Enable WAF blocking mode for the detected patterns',
      'Review application logs for signs of successful exploitation',
      'Deploy emergency patch for the vulnerable components if available',
      'Notify application development team for code review',
      'Consider temporarily disabling affected features if exploitation risk is high'
    ],
    category: 'Web Application Security',
    falsePositive: false,
    explanation: 'This alert indicates an active web application attack using multiple techniques to find vulnerabilities. The presence of both SQL injection and XSS payloads shows sophisticated attackers methodically testing different attack vectors. The critical severity is warranted because successful exploitation could lead to customer data compromise or unauthorized access to the database. Immediate action is required to block the attack patterns while developers review the application for vulnerabilities.'
  }
];

// Generate a phishing email
export const generatePhishingEmail = async (params: {
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  specificTechnique?: string;
}): Promise<PhishingScenario> => {
  try {
    if (!isApiKeyAvailable()) {
      console.warn('DeepSeek API key not found or invalid. Using fallback phishing emails.');
      const filteredEmails = SAMPLE_PHISHING_EMAILS.filter(email => {
        if (params.difficulty && email.difficulty !== params.difficulty) return false;
        if (params.category && !email.category.toLowerCase().includes(params.category.toLowerCase())) return false;
        return true;
      });
      
      if (filteredEmails.length === 0) return SAMPLE_PHISHING_EMAILS[Math.floor(Math.random() * SAMPLE_PHISHING_EMAILS.length)];
      return filteredEmails[Math.floor(Math.random() * filteredEmails.length)];
    }

    const { difficulty = 'medium', category = '', specificTechnique = '' } = params;

    // Prepare the prompt for DeepSeek
    const promptContent = `
Generate a realistic phishing email scenario for training cybersecurity students.

Parameters:
- Difficulty level: ${difficulty}
- Target category: ${category || 'Any relevant business or service'}
- Specific technique to demonstrate: ${specificTechnique || 'Any relevant phishing technique'}

The response should be formatted as a JSON object with the following structure:
{
  "subject": "The email subject line",
  "from": "The sender's email address (make it deceptive/suspicious)",
  "content": "The full email body content including any deceptive links or formatting",
  "redFlags": ["List 5 specific red flags in this email that indicate it's phishing"],
  "difficulty": "${difficulty}",
  "category": "The category this phishing attempt falls under (banking, social media, etc.)",
  "explanation": "A detailed explanation of why this is a phishing email and what techniques it uses"
}

Make the phishing email realistic but include several typical phishing indicators. For ${difficulty} difficulty, make it ${
      difficulty === 'easy' ? 'obvious with multiple clear red flags' : 
      difficulty === 'medium' ? 'somewhat sophisticated but still with detectable issues' : 
      'very sophisticated with subtle indicators that would require careful inspection'
    }.
`;

    // Call DeepSeek API to generate the phishing email
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a cybersecurity training assistant that creates realistic phishing email scenarios to help students learn to identify threats." },
        { role: "user", content: promptContent }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from API");

    // Parse the JSON response
    const phishingData = JSON.parse(content);
    
    // Create a structured phishing scenario
    const phishingScenario: PhishingScenario = {
      id: `phish-${Date.now()}`,
      subject: phishingData.subject,
      from: phishingData.from,
      content: phishingData.content,
      timestamp: new Date().toISOString(),
      redFlags: phishingData.redFlags,
      difficulty: phishingData.difficulty as 'easy' | 'medium' | 'hard',
      category: phishingData.category,
      explanation: phishingData.explanation
    };

    return phishingScenario;
  } catch (error) {
    console.error('Error generating phishing email:', error);
    // Return a random sample phishing email in case of error
    return SAMPLE_PHISHING_EMAILS[Math.floor(Math.random() * SAMPLE_PHISHING_EMAILS.length)];
  }
};

// Generate a SOC alert
export const generateSOCAlert = async (params: {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  falsePositive?: boolean;
}): Promise<SOCAlert> => {
  try {
    if (!isApiKeyAvailable()) {
      console.warn('DeepSeek API key not found or invalid. Using fallback SOC alerts.');
      const filteredAlerts = SAMPLE_SOC_ALERTS.filter(alert => {
        if (params.severity && alert.severity !== params.severity) return false;
        if (params.category && !alert.category.toLowerCase().includes(params.category.toLowerCase())) return false;
        if (params.falsePositive !== undefined && alert.falsePositive !== params.falsePositive) return false;
        return true;
      });
      
      if (filteredAlerts.length === 0) return SAMPLE_SOC_ALERTS[Math.floor(Math.random() * SAMPLE_SOC_ALERTS.length)];
      return filteredAlerts[Math.floor(Math.random() * filteredAlerts.length)];
    }

    const { severity = 'medium', category = '', falsePositive = false } = params;

    // Prepare the prompt for DeepSeek
    const promptContent = `
Generate a realistic Security Operations Center (SOC) alert scenario for training cybersecurity analysts.

Parameters:
- Alert severity: ${severity}
- Alert category: ${category || 'Any relevant security category'}
- Should be a ${falsePositive ? 'false positive' : 'real security incident'}

The response should be formatted as a JSON object with the following structure:
{
  "alertName": "Brief name of the security alert",
  "severity": "${severity}",
  "source": "The security tool or system that generated this alert",
  "description": "Detailed description of the alert",
  "affectedAssets": ["List of affected systems, users, or resources"],
  "indicators": ["List of 5 specific technical indicators related to this alert"],
  "recommendedActions": ["List of 5 recommended response actions for this alert"],
  "category": "The category this alert falls under (e.g., Malware, Authentication, Data Loss)",
  "falsePositive": ${falsePositive},
  "explanation": "A detailed explanation of this alert, why it matters, and how to handle it properly"
}

Make the alert realistic with appropriate technical details. ${falsePositive ? 'Since this is a false positive, include subtle clues that would indicate to an experienced analyst that this is not a real threat, while still making it seem concerning at first glance.' : 'Since this is a real security incident, include clear indicators of compromise and appropriate urgency in the response actions.'}
`;

    // Call DeepSeek API to generate the SOC alert
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a cybersecurity training assistant that creates realistic SOC alert scenarios to help analysts learn to identify and respond to security threats." },
        { role: "user", content: promptContent }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from API");

    // Parse the JSON response
    const alertData = JSON.parse(content);
    
    // Create a structured SOC alert
    const socAlert: SOCAlert = {
      id: `soc-${Date.now()}`,
      alertName: alertData.alertName,
      severity: alertData.severity as 'low' | 'medium' | 'high' | 'critical',
      source: alertData.source,
      timestamp: new Date().toISOString(),
      description: alertData.description,
      affectedAssets: alertData.affectedAssets,
      indicators: alertData.indicators,
      recommendedActions: alertData.recommendedActions,
      category: alertData.category,
      falsePositive: alertData.falsePositive,
      explanation: alertData.explanation
    };

    return socAlert;
  } catch (error) {
    console.error('Error generating SOC alert:', error);
    // Return a random sample SOC alert in case of error
    return SAMPLE_SOC_ALERTS[Math.floor(Math.random() * SAMPLE_SOC_ALERTS.length)];
  }
};

export default {
  generatePhishingEmail,
  generateSOCAlert
};