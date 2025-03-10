import React, { useState } from 'react';
import { Calendar, Clock, FileText, Book, Code, CheckSquare, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, X, BookOpen, List, CheckCircle, Info, ExternalLink } from 'lucide-react';
import TimetableModal from './TimetableModal';

interface CyberSecurityAssignmentsProps {
  setShowTranslationGame?: (show: boolean) => void;
}

// Subject information modal component
const SubjectInfoModal = ({ isOpen, onClose, subjectCode }) => {
  const subjectInfo = {
    'VU23223': {
      title: 'Apply cyber security legislation, privacy and ethics',
      description: 'This unit covers the legislative and regulatory requirements for cyber security in Australia, including privacy laws and ethical considerations. Students learn to identify and apply relevant legal frameworks to organizational cyber security practices.',
      topics: [
        'Australian Privacy Principles',
        'Criminal Code Act provisions for cybercrime',
        'Ethical hacking frameworks',
        'Privacy impact assessments',
        'Cyber ethics and professional conduct'
      ],
      importance: 'Understanding legal and ethical frameworks is essential for all cybersecurity professionals to ensure compliance and protect organizations from legal liability while maintaining ethical standards.'
    },
    'VU23213': {
      title: 'Utilise basic network concepts and protocols',
      description: 'This unit explores the fundamental concepts of computer networking, including protocols, models, and security considerations. Students learn to understand network architecture and communication mechanisms.',
      topics: [
        'OSI and TCP/IP models',
        'Network protocols and addressing',
        'Subnetting and VLANS',
        'Network security fundamentals',
        'Practical network implementation'
      ],
      importance: 'Networking is the foundation of all IT systems. Understanding how networks function is critical for implementing effective security measures and troubleshooting connectivity issues.'
    },
    'VU23217': {
      title: 'Recognise the need for cyber security in an organisation',
      description: 'This unit focuses on identifying organizational security requirements and implementing appropriate safeguards based on threat analysis and risk assessment.',
      topics: [
        'Organizational threat landscape',
        'Risk assessment methodologies',
        'Security frameworks and standards',
        'Data protection strategies',
        'IoT security considerations'
      ],
      importance: 'Organizations must understand their specific security needs to allocate resources effectively and implement appropriate protective measures that align with business objectives.'
    },
    'ICTPRG434_435': {
      title: 'Automate processes & Write scripts',
      description: 'This unit covers the development of automation scripts and programs to enhance security operations and system administration, with a focus on Python programming.',
      topics: [
        'Python programming fundamentals',
        'Security automation techniques',
        'Script development methodology',
        'Testing and debugging',
        'Implementation in production environments'
      ],
      importance: 'Automation is increasingly essential in cyber security for handling repetitive tasks, responding to incidents quickly, and managing large-scale systems effectively.'
    }
  };

  if (!isOpen) return null;
  
  const info = subjectInfo[subjectCode] || {
    title: 'Subject Information',
    description: 'Information about this subject is not available.',
    topics: [],
    importance: ''
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="cyber-card w-full max-w-2xl max-h-[90vh] overflow-auto animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">{subjectCode}: {info.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-300 leading-relaxed">{info.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[var(--matrix-color)] mb-2">Key Topics</h3>
              <ul className="space-y-2">
                {info.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-[var(--matrix-color)] mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[var(--matrix-color)] mb-2">Why It Matters</h3>
              <p className="text-gray-300">{info.importance}</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="cyber-button px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ title, code, dueDate, timeNeeded, sections, difficulty }) => {
  const getDifficultyColor = (level) => {
    switch(level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const difficultyClass = getDifficultyColor(difficulty);
  
  return (
    <div className="cyber-card p-6 mb-6 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100">{title}</h3>
          <p className="text-gray-400 font-medium matrix-text">{code}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyClass}`}>
          {difficulty} Difficulty
        </span>
      </div>
      
      <div className="flex items-center mb-3 text-gray-300">
        <Calendar className="mr-2 h-5 w-5 matrix-text" />
        <span className="font-medium">Due: {dueDate}</span>
      </div>
      
      <div className="flex items-center mb-4 text-gray-300">
        <Clock className="mr-2 h-5 w-5 matrix-text" />
        <span className="font-medium">Estimated Time: {timeNeeded}</span>
      </div>
      
      <h4 className="font-bold text-gray-200 mb-2">Key Sections:</h4>
      <ul className="space-y-2">
        {sections.map((section, index) => (
          <li key={index} className="flex items-start">
            <ArrowRight className="mr-2 h-5 w-5 flex-shrink-0 matrix-text" />
            <span>{section.name} <span className="text-gray-400">- {section.focus}</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Timeline = () => {
  const today = new Date();
  const march21 = new Date(2025, 2, 21);
  const march23 = new Date(2025, 2, 23);
  const may30 = new Date(2025, 4, 30);
  
  const totalDays = Math.floor((may30 - today) / (1000 * 60 * 60 * 24));
  const daysTillMarch21 = Math.floor((march21 - today) / (1000 * 60 * 60 * 24));
  const daysTillMarch23 = Math.floor((march23 - today) / (1000 * 60 * 60 * 24));
  const daysTillMay30 = Math.floor((may30 - today) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="mb-8 cyber-card p-6 animate-slide-up">
      <h3 className="text-xl font-bold text-gray-100 mb-4">Assignment Timeline</h3>
      <div className="relative h-16">
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-700 rounded"></div>
        
        <div className="absolute top-6 left-0 flex flex-col items-center">
          <div className="w-3 h-3 bg-[var(--matrix-color)] rounded-full"></div>
          <div className="mt-2 text-xs font-medium text-gray-300">Today</div>
          <div className="text-xs text-gray-400">March 8</div>
        </div>
        
        <div className="absolute top-6 left-1/4 flex flex-col items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">VU23223 & VU23213</div>
          <div className="text-xs text-gray-500">March 21 ({daysTillMarch21} days)</div>
        </div>
        
        <div className="absolute top-6 left-1/3 flex flex-col items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">VU23217</div>
          <div className="text-xs text-gray-500">March 23 ({daysTillMarch23} days)</div>
        </div>
        
        <div className="absolute top-6 right-0 flex flex-col items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">ICTPRG434/435</div>
          <div className="text-xs text-gray-500">May 30 ({daysTillMay30} days)</div>
        </div>
      </div>
    </div>
  );
};

const PriorityActions = ({ onShowSubjectInfo }) => {
  return (
    <div className="cyber-card p-6 mb-6 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-100 mb-4">Priority Actions</h3>
      <div className="space-y-3">
        <div 
          className="flex items-start p-3 bg-red-900/30 border border-red-700/50 rounded-md cursor-pointer hover:bg-red-900/40 transition-colors"
          onClick={() => onShowSubjectInfo(['VU23223', 'VU23213'])}
        >
          <AlertTriangle className="mr-2 h-5 w-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-400 flex items-center">
              Immediate Focus (7-10 days)
              <Info className="ml-2 h-4 w-4" />
            </p>
            <p className="text-gray-300">Complete VU23223 and VU23213 assignments due March 21</p>
          </div>
        </div>
        <div 
          className="flex items-start p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-md cursor-pointer hover:bg-yellow-900/40 transition-colors"
          onClick={() => onShowSubjectInfo(['VU23217'])}
        >
          <Clock className="mr-2 h-5 w-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-400 flex items-center">
              Secondary Focus (10-14 days)
              <Info className="ml-2 h-4 w-4" />
            </p>
            <p className="text-gray-300">Work on VU23217 assignment due March 23</p>
          </div>
        </div>
        <div 
          className="flex items-start p-3 bg-blue-900/30 border border-blue-700/50 rounded-md cursor-pointer hover:bg-blue-900/40 transition-colors"
          onClick={() => onShowSubjectInfo(['ICTPRG434_435'])}
        >
          <FileText className="mr-2 h-5 w-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-400 flex items-center">
              Long-term Focus (2-3 months)
              <Info className="ml-2 h-4 w-4" />
            </p>
            <p className="text-gray-300">Plan and execute ICTPRG434/435 assignments due May 30</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyRoadmap = () => {
  return (
    <div className="cyber-card p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
        <BookOpen className="mr-2 h-6 w-6 text-[var(--matrix-color)]" />
        Study Roadmap
      </h3>
      <div className="space-y-4">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--matrix-color)]/20 text-[var(--matrix-color)] font-bold mr-3">1</div>
          <div>
            <h4 className="text-lg font-medium text-gray-100">Legislation & Network Concepts (This Week)</h4>
            <p className="text-gray-400">Focus on Australian privacy legislation, ethical codes, OSI & TCP/IP models</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--matrix-color)]/20 text-[var(--matrix-color)] font-bold mr-3">2</div>
          <div>
            <h4 className="text-lg font-medium text-gray-100">Security Needs (Next Week)</h4>
            <p className="text-gray-400">Work on organizational security concepts, threat actors, data risks</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--matrix-color)]/20 text-[var(--matrix-color)] font-bold mr-3">3</div>
          <div>
            <h4 className="text-lg font-medium text-gray-100">Lab Work (Late March)</h4>
            <p className="text-gray-400">Complete network building and file sharing labs</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--matrix-color)]/20 text-[var(--matrix-color)] font-bold mr-3">4</div>
          <div>
            <h4 className="text-lg font-medium text-gray-100">Programming & Automation (April)</h4>
            <p className="text-gray-400">Start Python programming, algorithms, pseudocode development</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--matrix-color)]/20 text-[var(--matrix-color)] font-bold mr-3">5</div>
          <div>
            <h4 className="text-lg font-medium text-gray-100">Final Implementation (May)</h4>
            <p className="text-gray-400">Complete implementation of the computer fingerprint collector</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CyberSecurityAssignments: React.FC<CyberSecurityAssignmentsProps> = ({ setShowTranslationGame = () => {} }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSubjectInfo, setShowSubjectInfo] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const assignments = [
    {
      title: "Apply cyber security legislation, privacy and ethics",
      code: "VU23223",
      dueDate: "March 21, 2025",
      timeNeeded: "24-32 hours (3-4 days full-time)",
      difficulty: "Medium",
      sections: [
        { name: "Part 1", focus: "Review of cyber security legislation" },
        { name: "Part 2", focus: "Cyber Security Findings and Recommendations" },
        { name: "Part 3", focus: "Privacy Policies and Best Practices" },
        { name: "Part 4", focus: "Ethical behavior in cyber security" }
      ]
    },
    {
      title: "Utilise basic network concepts and protocols",
      code: "VU23213",
      dueDate: "March 21, 2025",
      timeNeeded: "32-40 hours (4-5 days full-time)",
      difficulty: "High",
      sections: [
        { name: "Part 1", focus: "Network communication, security policies" },
        { name: "Part 2", focus: "Security services, standards, protocols" },
        { name: "Part 3", focus: "Networking devices, components, cyber attacks" },
        { name: "Part 4", focus: "LAB Security testing environment" }
      ]
    },
    {
      title: "Recognise the need for cyber security in an organisation",
      code: "VU23217",
      dueDate: "March 23, 2025",
      timeNeeded: "32 hours (4 days full-time)",
      difficulty: "Medium",
      sections: [
        { name: "Part 1", focus: "Cyber-security concepts" },
        { name: "Part 2", focus: "Organisation security needs" },
        { name: "Part 3", focus: "Methods and tools to safeguard privacy" },
        { name: "Part 4", focus: "IoT devices" },
        { name: "Part 5", focus: "Current cyber-security frameworks" },
        { name: "Part 6", focus: "Contingency task" }
      ]
    },
    {
      title: "Automate processes & Write scripts",
      code: "ICTPRG434/435",
      dueDate: "May 30, 2025",
      timeNeeded: "48 hours (6 days full-time)",
      difficulty: "High",
      sections: [
        { name: "Part 1", focus: "Software application requirements" },
        { name: "Part 2", focus: "Developing algorithmic solution" },
        { name: "Part 3", focus: "IDE and scripting language" },
        { name: "Part 4", focus: "Finalising scripts and signoff" },
        { name: "Part 5", focus: "Contingency tasks" }
      ]
    }
  ];

  const handleShowSubjectInfo = (subjects: string[]) => {
    setSelectedSubjects(subjects);
    setShowSubjectInfo(true);
  };

  return (
    <div className="bg-gray-900 cyber-grid p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-100 mb-6 matrix-text">
        Cyber Security Assignments Planner
      </h1>
      <div className="flex justify-center items-center gap-4 mb-6">
        <button 
          onClick={() => setIsCalendarOpen(true)}
          className="cyber-button flex items-center justify-center py-3 px-6 text-lg"
        >
          <Calendar className="mr-2 h-5 w-5" />
          <span>View March Timetable</span>
        </button>
        <button 
          onClick={() => setShowTranslationGame(true)}
          className="cyber-button cyber-button-glow flex items-center justify-center py-3 px-6 text-lg group relative"
        >
          <Code className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span>SyntaxShift</span>
          <div className="absolute -right-2 -top-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            NEW
          </div>
        </button>
      </div>
      <Timeline />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PriorityActions onShowSubjectInfo={handleShowSubjectInfo} />
          <AssignmentCard {...assignments[0]} />
          <AssignmentCard {...assignments[2]} />
        </div>
        <div>
          <StudyRoadmap />
          <AssignmentCard {...assignments[1]} />
          <AssignmentCard {...assignments[3]} />
        </div>
      </div>
      <TimetableModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      
      {/* Subject Info Modal for Multiple Subjects */}
      {showSubjectInfo && selectedSubjects.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="cyber-card w-full max-w-3xl max-h-[90vh] overflow-auto animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-100">Subject Information</h2>
                <button onClick={() => setShowSubjectInfo(false)} className="text-gray-400 hover:text-gray-200">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {selectedSubjects.map((subjectCode) => {
                  const subjectInfo = {
                    'VU23223': {
                      title: 'Apply cyber security legislation, privacy and ethics',
                      description: 'This unit covers the legislative and regulatory requirements for cyber security in Australia, including privacy laws and ethical considerations. Students learn to identify and apply relevant legal frameworks to organizational cyber security practices.',
                      topics: [
                        'Australian Privacy Principles',
                        'Criminal Code Act provisions for cybercrime',
                        'Ethical hacking frameworks',
                        'Privacy impact assessments',
                        'Cyber ethics and professional conduct'
                      ],
                      importance: 'Understanding legal and ethical frameworks is essential for all cybersecurity professionals to ensure compliance and protect organizations from legal liability while maintaining ethical standards.'
                    },
                    'VU23213': {
                      title: 'Utilise basic network concepts and protocols',
                      description: 'This unit explores the fundamental concepts of computer networking, including protocols, models, and security considerations. Students learn to understand network architecture and communication mechanisms.',
                      topics: [
                        'OSI and TCP/IP models',
                        'Network protocols and addressing',
                        'Subnetting and VLANS',
                        'Network security fundamentals',
                        'Practical network implementation'
                      ],
                      importance: 'Networking is the foundation of all IT systems. Understanding how networks function is critical for implementing effective security measures and troubleshooting connectivity issues.'
                    },
                    'VU23217': {
                      title: 'Recognise the need for cyber security in an organisation',
                      description: 'This unit focuses on identifying organizational security requirements and implementing appropriate safeguards based on threat analysis and risk assessment.',
                      topics: [
                        'Organizational threat landscape',
                        'Risk assessment methodologies',
                        'Security frameworks and standards',
                        'Data protection strategies',
                        'IoT security considerations'
                      ],
                      importance: 'Organizations must understand their specific security needs to allocate resources effectively and implement appropriate protective measures that align with business objectives.'
                    },
                    'ICTPRG434_435': {
                      title: 'Automate processes & Write scripts',
                      description: 'This unit covers the development of automation scripts and programs to enhance security operations and system administration, with a focus on Python programming.',
                      topics: [
                        'Python programming fundamentals',
                        'Security automation techniques',
                        'Script development methodology',
                        'Testing and debugging',
                        'Implementation in production environments'
                      ],
                      importance: 'Automation is increasingly essential in cyber security for handling repetitive tasks, responding to incidents quickly, and managing large-scale systems effectively.'
                    }
                  };

                  const info = subjectInfo[subjectCode] || {
                    title: 'Subject Information',
                    description: 'Information about this subject is not available.',
                    topics: [],
                    importance: ''
                  };

                  return (
                    <div key={subjectCode} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <h3 className="text-lg font-bold text-[var(--matrix-color)] mb-2">{subjectCode}: {info.title}</h3>
                      <p className="text-gray-300 mb-4">{info.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-200 mb-2">Key Topics:</h4>
                        <ul className="space-y-1 pl-2">
                          {info.topics.map((topic, idx) => (
                            <li key={idx} className="flex items-start">
                              <ArrowRight className="h-4 w-4 text-[var(--matrix-color)] mr-2 flex-shrink-0 mt-1" />
                              <span className="text-gray-300">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-3">
                        <h4 className="font-semibold text-[var(--matrix-color)] mb-1">Why It Matters:</h4>
                        <p className="text-gray-300">{info.importance}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSubjectInfo(false)}
                  className="cyber-button px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CyberSecurityAssignments;