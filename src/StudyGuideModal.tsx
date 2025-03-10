import React, { useState } from 'react';
import { X, BookOpen, List, CheckCircle, Book } from 'lucide-react';

const studyGuides = {
  'VU23223': {
    title: "VU23223: Apply cyber security legislation, privacy and ethics",
    dueDate: "March 21, 2025",
    sections: [
      {
        name: "Part 1: Review of cyber security legislative and regulatory requirements",
        topics: [
          "Australian Federal cyber security legislation (Privacy Act 1988, Criminal Code Act 1995)",
          "State/Territory legislation relevant to cyber security",
          "Sector-specific cyber security legislation",
          "International legislation affecting Australian organisations (GDPR, etc.)",
          "Interdependencies between legislation and industry regulators",
          "Current and upcoming privacy and surveillance law reforms"
        ],
        resources: [
          "Australian Privacy Principles (APPs)",
          "ACSC Essential Eight framework",
          "Industry regulator websites (APRA, ASIC, ACCC, etc.)"
        ]
      },
      {
        name: "Part 2: Cyber Security Findings and Recommendations",
        topics: [
          "Organizational policy compliance analysis",
          "Privacy policy review and improvement recommendations",
          "Documentation of policy level and compliance"
        ],
        resources: [
          "Angelonia Fashion and Turtle Movers privacy documentation",
          "Sample privacy policy templates"
        ]
      },
      {
        name: "Part 3: Privacy Policies and Best Practices Review",
        topics: [
          "Review of organizational practices",
          "Shortcomings identification",
          "Improvement proposals for organizational practices"
        ],
        resources: [
          "Privacy by Design principles",
          "Privacy best practices from OAIC"
        ]
      },
      {
        name: "Part 4: Ethical behavior in cyber security",
        topics: [
          "Ethics Code of Practice development",
          "Red and blue team tools ethical usage",
          "Consequences of unauthorized access to network devices",
          "Copyright compliance implications",
          "Examples of unethical behavior and impact analysis"
        ],
        resources: [
          "Cybersecurity ethics guidelines",
          "Professional codes of conduct (ISACA, ISC2)"
        ]
      }
    ]
  },
  'VU23213': {
    title: "VU23213: Utilise basic network concepts and protocols",
    dueDate: "March 21, 2025",
    sections: [
      {
        name: "Part 1: Network communication, security and security policies",
        topics: [
          "Network communication models (OSI and TCP/IP)",
          "Network security concepts and vulnerabilities",
          "Security policy review and improvement",
          "Binary and hexadecimal conversions",
          "IP addressing schemes (IPv4 and IPv6)"
        ],
        resources: [
          "MidTown IT Security Policy",
          "Network+ or CCNA study guides"
        ]
      },
      {
        name: "Part 2: Security services, standards and protocols",
        topics: [
          "Server Message Block (SMB) functionality",
          "QUIC User Datagram Protocol (UDP)",
          "Narrowband Internet of Things (NB-IoT)",
          "Long Range IoT (LoRa-IoT)"
        ],
        resources: [
          "IoT standards documentation",
          "Protocol specifications"
        ]
      },
      {
        name: "Part 3: Networking devices, components, cyber network attacks",
        topics: [
          "Network devices functionality (switches, routers, WAPs)",
          "Firewall operations",
          "Network testing tools",
          "Virtualization tools",
          "Current cyber attack methods (DDoS, Ransomware, ARP poisoning)",
          "Industry cyber security awareness resources"
        ],
        resources: [
          "NIST Cybersecurity Framework",
          "OWASP Top 10"
        ]
      },
      {
        name: "Part 4: LAB Security testing environment",
        topics: [
          "Network expansion planning",
          "Network diagram creation (logical and physical)",
          "Device configuration",
          "Connectivity testing and troubleshooting",
          "File sharing in virtual environments"
        ],
        resources: [
          "Network simulation tools",
          "PowerShell commands for SMB"
        ]
      }
    ]
  },
  'VU23217': {
    title: "VU23217: Recognise the need for cyber security in an organisation",
    dueDate: "March 23, 2025",
    sections: [
      {
        name: "Part 1: Cyber-security concepts",
        topics: [
          "Cyber-security threat definitions",
          "Threat actors, vectors, and goals",
          "Cyber-security attack characteristics",
          "Common and emerging cyber-security attacks",
          "Current cyber-threat trends",
          "Technical security terms (botnets, malware, viruses, worms, rootkits)"
        ],
        resources: [
          "ACSC Annual Cyber Threat Report",
          "Vendor security reports (Microsoft, Cisco, etc.)"
        ]
      },
      {
        name: "Part 2: Organisation security needs",
        topics: [
          "Data risk identification",
          "Data access methods",
          "Security breach risk assessment",
          "Organizational data protection",
          "Online identity protection",
          "Organizational vulnerabilities",
          "Attacker infiltration techniques",
          "Cyber-attack methods",
          "Defense strategies (methods, techniques, policies, procedures)",
          "Cyber-security awareness practices"
        ],
        resources: [
          "Risk assessment frameworks",
          "Security awareness training materials"
        ]
      },
      {
        name: "Part 3: Methods and tools to safeguard privacy",
        topics: [
          "Security methods and tools",
          "Infrastructure, equipment, and software setup",
          "Cyber attack protection measures",
          "Mitigation strategies (Cyber Kill Chain, MITRE ATT&CK)",
          "Behavior-based security vs. traditional firewalls",
          "Personal data protection in online services",
          "Malware simulation"
        ],
        resources: [
          "Security tool documentation",
          "Online service privacy policies"
        ]
      },
      {
        name: "Part 4: IoT devices",
        topics: [
          "IoT device implementation examples",
          "Data privacy protection methods",
          "Cyber threat protection techniques",
          "User authentication techniques",
          "Device vulnerabilities"
        ],
        resources: [
          "IoT security best practices",
          "Manufacturer documentation"
        ]
      },
      {
        name: "Part 5: Current cyber-security frameworks",
        topics: [
          "NIST Cyber Security Framework (CSF)",
          "Australian Cyber Security Centre (ACSC)",
          "Centre for Internet Security (CIS)"
        ],
        resources: [
          "Framework documentation from respective organizations"
        ]
      },
      {
        name: "Part 6: Contingency task",
        topics: [
          "Managing stakeholder expectations",
          "Justifying security recommendations",
          "Addressing resistance to security measures"
        ],
        resources: [
          "Communication strategies for security professionals"
        ]
      }
    ]
  },
  'ICTPRG434_435': {
    title: "ICTPRG434/435: Automate processes & Write scripts",
    dueDate: "May 30, 2025",
    sections: [
      {
        name: "Part 1: Software application requirements",
        topics: [
          "Process automation identification",
          "Application requirements specification",
          "Expected application outcomes",
          "Client expectations (functionality and security)",
          "Operating environment description",
          "Requirements confirmation and documentation",
          "Potential solutions identification and evaluation"
        ],
        resources: [
          "Software requirements specification templates",
          "Requirements gathering techniques"
        ]
      },
      {
        name: "Part 2: Developing algorithmic solution",
        topics: [
          "Pseudocode algorithm development",
          "Algorithm efficiency analysis",
          "Control structures utilization",
          "Algorithm testing and desk checking"
        ],
        resources: [
          "Algorithm design patterns",
          "Efficiency testing methods"
        ]
      },
      {
        name: "Part 3: IDE and scripting language",
        topics: [
          "Python characteristics and frameworks",
          "IDE selection and justification",
          "Pseudocode translation to Python",
          "Syntax selection efficiency",
          "Debugging features use",
          "Internal documentation creation"
        ],
        resources: [
          "Python style guides",
          "Debugging techniques"
        ]
      },
      {
        name: "Part 4: Finalising scripts and signoff",
        topics: [
          "User-level documentation creation",
          "Project documentation finalization",
          "Code review and approval processes",
          "Testing on multiple computers",
          "Network computer fingerprinting"
        ],
        resources: [
          "Documentation templates",
          "Computer fingerprinting techniques"
        ]
      },
      {
        name: "Part 5: Contingency tasks",
        topics: [
          "Managing client change requests",
          "Adapting to new IDE versions",
          "Version control processes"
        ],
        resources: [
          "Change management procedures",
          "Software versioning strategies"
        ]
      }
    ]
  }
};

const StudyGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('VU23223');
  
  if (!isOpen) return null;
  
  const activeGuide = studyGuides[activeTab];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Assignment Study Guides</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex border-b mb-4">
            {Object.keys(studyGuides).map(key => (
              <button 
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-2 px-4 font-medium ${activeTab === key 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              >
                {key}
              </button>
            ))}
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">{activeGuide.title}</h3>
              <p className="text-red-600 font-medium">Due: {activeGuide.dueDate}</p>
            </div>
            
            <div className="space-y-6">
              {activeGuide.sections.map((section, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    {section.name}
                  </h4>
                  
                  <div className="ml-7">
                    <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                      <List className="h-4 w-4 text-blue-600 mr-1" />
                      Key Topics:
                    </h5>
                    <ul className="space-y-1 mb-3">
                      {section.topics.map((topic, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{topic}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                      <List className="h-4 w-4 text-blue-600 mr-1" />
                      Recommended Resources:
                    </h5>
                    <ul className="space-y-1">
                      {section.resources.map((resource, i) => (
                        <li key={i} className="flex items-start">
                          <Book className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGuideModal;