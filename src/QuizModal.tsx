import React, { useState, useEffect } from 'react';
import { X, Brain, Trophy, AlertTriangle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useUser } from './context/UserContext';
import UserLoginForm from './components/UserLoginForm';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  [key: string]: {
    [difficulty: string]: Question[];
  };
}

// Map of unit codes to descriptive names for display
const unitNames: { [key: string]: string } = {
  'VU23223': 'Cyber Security Legislation & Ethics',
  'VU23213': 'Network Concepts & Protocols',
  'VU23217': 'Organizational Cyber Security',
  'ICTPRG434_435': 'Automation & Scripting',
  'Python': '🐍 Python Programming'
};

const quizData: QuizData = {
  'VU23223': {
    easy: [
      {
        question: "What is the primary purpose of the Privacy Act 1988?",
        options: [
          "To regulate social media usage",
          "To protect personal information of individuals",
          "To control internet access",
          "To manage business operations"
        ],
        correctAnswer: 1,
        explanation: "The Privacy Act 1988 is designed to protect the personal information of individuals and regulate how organizations handle this information."
      },
      {
        question: "Which of these is a key principle of cyber security ethics?",
        options: [
          "Maximizing profit",
          "Sharing all information publicly",
          "Respecting user privacy",
          "Ignoring security breaches"
        ],
        correctAnswer: 2,
        explanation: "Respecting user privacy is a fundamental principle of cyber security ethics."
      },
      {
        question: "What does the Australian Privacy Principle (APP) primarily aim to regulate?",
        options: [
          "Government surveillance",
          "Personal information handling by organizations",
          "Internet service providers",
          "Social media content"
        ],
        correctAnswer: 1,
        explanation: "The Australian Privacy Principles regulate how organizations handle personal information, including collection, use, storage, and disclosure."
      },
      {
        question: "Which legislation criminalizes unauthorized access to computer systems in Australia?",
        options: [
          "Privacy Act 1988",
          "Criminal Code Act 1995",
          "Copyright Act 1968",
          "Telecommunications Act 1997"
        ],
        correctAnswer: 1,
        explanation: "The Criminal Code Act 1995 contains provisions that criminalize unauthorized access to restricted data and computer systems."
      },
      {
        question: "What does ethical hacking involve?",
        options: [
          "Breaking into systems without permission",
          "Authorized testing of security systems to identify vulnerabilities",
          "Developing malware for educational purposes",
          "Accessing personal data for research"
        ],
        correctAnswer: 1,
        explanation: "Ethical hacking involves authorized security testing with explicit permission to identify vulnerabilities before malicious actors can exploit them."
      },
      {
        question: "Under the Privacy Act, what is a 'data breach'?",
        options: [
          "Any access to personal information",
          "Unauthorized access to or disclosure of personal information",
          "Routine data transfers between organizations",
          "Encryption of personal data"
        ],
        correctAnswer: 1,
        explanation: "A data breach involves unauthorized access to or disclosure of personal information that could cause serious harm to affected individuals."
      },
      {
        question: "What does 'informed consent' mean in terms of privacy?",
        options: [
          "Agreeing to terms without reading them",
          "Understanding what personal information will be collected and how it will be used before consenting",
          "Being informed after data collection",
          "Consenting to all possible uses of information"
        ],
        correctAnswer: 1,
        explanation: "Informed consent means individuals understand what personal information will be collected and how it will be used before giving their consent."
      },
      {
        question: "Which of the following is an example of a privacy breach?",
        options: [
          "Using encryption for stored data",
          "Disclosing customer information to unauthorized third parties",
          "Implementing multi-factor authentication",
          "Conducting regular security audits"
        ],
        correctAnswer: 1,
        explanation: "Disclosing customer information to unauthorized third parties is a privacy breach as it involves unauthorized sharing of personal information."
      },
      {
        question: "What is the purpose of a Privacy Impact Assessment (PIA)?",
        options: [
          "To increase data collection",
          "To assess and mitigate privacy risks in projects",
          "To bypass privacy regulations",
          "To track user behavior"
        ],
        correctAnswer: 1,
        explanation: "A Privacy Impact Assessment helps identify and mitigate privacy risks associated with new projects, systems, or policies."
      },
      {
        question: "Which ethical principle emphasizes being truthful about security findings?",
        options: [
          "Confidentiality",
          "Integrity",
          "Non-maleficence",
          "Honesty"
        ],
        correctAnswer: 3,
        explanation: "Honesty is a fundamental ethical principle in cybersecurity that requires truthful reporting of security findings without exaggeration or minimization."
      }
    ],
    medium: [
      {
        question: "What does the GDPR require organizations to do?",
        options: [
          "Only collect data from European citizens",
          "Ignore data protection completely",
          "Protect personal data and respect privacy rights",
          "Share all data publicly"
        ],
        correctAnswer: 2,
        explanation: "GDPR requires organizations to protect personal data and respect individuals' privacy rights."
      }
    ],
    hard: [
      {
        question: "In the context of Australian privacy law, what is a 'Notifiable Data Breach'?",
        options: [
          "Any data breach that occurs",
          "A breach likely to result in serious harm requiring notification to affected individuals",
          "A minor security incident",
          "Loss of non-sensitive data"
        ],
        correctAnswer: 1,
        explanation: "A Notifiable Data Breach is one that's likely to result in serious harm to affected individuals and requires mandatory notification."
      }
    ]
  },
  'VU23213': {
    easy: [
      {
        question: "Which layer of the OSI model deals with routing?",
        options: [
          "Physical Layer",
          "Network Layer",
          "Application Layer",
          "Session Layer"
        ],
        correctAnswer: 1,
        explanation: "The Network Layer (Layer 3) handles routing between networks."
      },
      {
        question: "Which of the following is a valid IPv4 address?",
        options: [
          "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
          "192.168.1.1",
          "10.0.0.256",
          "172.16.0.0/16"
        ],
        correctAnswer: 1,
        explanation: "192.168.1.1 is a valid IPv4 address in dot-decimal notation with each octet within the valid range of 0-255."
      },
      {
        question: "What is the purpose of a firewall?",
        options: [
          "To block all incoming network traffic",
          "To allow all incoming network traffic",
          "To filter network traffic based on rules",
          "To encrypt network traffic"
        ],
        correctAnswer: 2,
        explanation: "A firewall filters network traffic based on predetermined security rules to protect networks from unauthorized access."
      },
      {
        question: "Which protocol is used to automatically assign IP addresses to devices on a network?",
        options: [
          "HTTP",
          "FTP",
          "DHCP",
          "SMTP"
        ],
        correctAnswer: 2,
        explanation: "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses and other network configuration parameters to devices."
      },
      {
        question: "What does TCP stand for?",
        options: [
          "Technical Control Protocol",
          "Transmission Control Protocol",
          "Terminal Communication Process",
          "Transfer Connection Protocol"
        ],
        correctAnswer: 1,
        explanation: "TCP stands for Transmission Control Protocol, which provides reliable, ordered delivery of data between applications."
      },
      {
        question: "What is the purpose of a switch in a network?",
        options: [
          "To connect different networks",
          "To connect devices within the same network",
          "To assign IP addresses to devices",
          "To filter network traffic"
        ],
        correctAnswer: 1,
        explanation: "A switch connects multiple devices within the same network and forwards data to specific devices based on MAC addresses."
      },
      {
        question: "Which of the following is NOT a function of the Application layer in the TCP/IP model?",
        options: [
          "Email services",
          "File transfers",
          "Routing between networks",
          "Web browsing"
        ],
        correctAnswer: 2,
        explanation: "Routing between networks is a function of the Internet layer in the TCP/IP model, not the Application layer."
      },
      {
        question: "What does DNS stand for?",
        options: [
          "Data Network Service",
          "Domain Name System",
          "Digital Network Security",
          "Dynamic Network Socket"
        ],
        correctAnswer: 1,
        explanation: "DNS stands for Domain Name System, which translates human-readable domain names to IP addresses."
      },
      {
        question: "Which of these is a private IP address range?",
        options: [
          "8.8.8.8/24",
          "192.168.0.0/16",
          "209.85.231.0/24",
          "104.244.42.0/24"
        ],
        correctAnswer: 1,
        explanation: "192.168.0.0/16 is a private IP address range reserved for use in private networks as defined in RFC 1918."
      },
      {
        question: "What is the purpose of ARP in networking?",
        options: [
          "To assign IP addresses",
          "To map IP addresses to MAC addresses",
          "To encrypt network traffic",
          "To route packets between networks"
        ],
        correctAnswer: 1,
        explanation: "ARP (Address Resolution Protocol) maps IP addresses to MAC addresses, allowing devices to communicate on a local network."
      }
    ],
    medium: [
      {
        question: "What is the main purpose of the SMB protocol?",
        options: [
          "Email transmission",
          "Web browsing",
          "File and printer sharing",
          "Network routing"
        ],
        correctAnswer: 2,
        explanation: "SMB (Server Message Block) is primarily used for file and printer sharing in networks."
      }
    ],
    hard: [
      {
        question: "Which attack method involves manipulating Address Resolution Protocol messages?",
        options: [
          "SQL Injection",
          "ARP Poisoning",
          "DDoS Attack",
          "Phishing"
        ],
        correctAnswer: 1,
        explanation: "ARP Poisoning involves manipulating Address Resolution Protocol messages to redirect network traffic."
      }
    ]
  },
  'VU23217': {
    easy: [
      {
        question: "What is a botnet?",
        options: [
          "A type of antivirus",
          "A network of infected computers controlled by an attacker",
          "A secure network protocol",
          "A backup system"
        ],
        correctAnswer: 1,
        explanation: "A botnet is a network of compromised computers controlled by an attacker for malicious purposes."
      },
      {
        question: "Which of the following is a common type of cyber attack?",
        options: [
          "DDoS attack",
          "SQL injection",
          "Phishing",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "DDoS attacks, SQL injection, and phishing are all common types of cyber attacks targeting different vulnerabilities."
      },
      {
        question: "What is the purpose of multi-factor authentication?",
        options: [
          "To make logging in more complicated",
          "To provide multiple ways to reset a password",
          "To add additional layers of security beyond passwords",
          "To track user login attempts"
        ],
        correctAnswer: 2,
        explanation: "Multi-factor authentication adds additional security layers beyond passwords, typically combining something you know, have, and are."
      },
      {
        question: "What is a zero-day vulnerability?",
        options: [
          "A vulnerability that has been patched for zero days",
          "A vulnerability that is known to the vendor but not yet patched",
          "A vulnerability that is unknown to the vendor and has no available fix",
          "A vulnerability that affects zero users"
        ],
        correctAnswer: 2,
        explanation: "A zero-day vulnerability is one that is unknown to the vendor and has no available patch, making it particularly dangerous."
      },
      {
        question: "What is social engineering in cybersecurity?",
        options: [
          "Building social networks securely",
          "Manipulating people to divulge confidential information",
          "Engineering social media platforms",
          "Coding social applications"
        ],
        correctAnswer: 1,
        explanation: "Social engineering involves manipulating people psychologically to divulge confidential information or perform actions that compromise security."
      },
      {
        question: "Which of the following best describes a 'threat actor'?",
        options: [
          "A security professional",
          "An individual or entity responsible for cyber threats",
          "A vulnerable system",
          "A security tool"
        ],
        correctAnswer: 1,
        explanation: "A threat actor is an individual or entity that is responsible for cyber threats or attacks against an information system."
      },
      {
        question: "What is the primary purpose of encryption?",
        options: [
          "To speed up data transfer",
          "To compress data",
          "To make data unreadable to unauthorized users",
          "To permanently delete data"
        ],
        correctAnswer: 2,
        explanation: "Encryption converts data into a code to prevent unauthorized access, making it unreadable to anyone without the decryption key."
      },
      {
        question: "What is a security policy?",
        options: [
          "A law enforced by the government",
          "A document that outlines how an organization protects its assets",
          "A type of encryption",
          "A hardware firewall"
        ],
        correctAnswer: 1,
        explanation: "A security policy is a document that outlines rules and procedures for accessing and protecting an organization's information assets."
      },
      {
        question: "What is the principle of least privilege?",
        options: [
          "Giving users the minimum access needed to perform their job",
          "Restricting all user access by default",
          "Providing maximum privileges to administrators",
          "Ensuring equal privileges for all users"
        ],
        correctAnswer: 0,
        explanation: "The principle of least privilege means giving users only the minimum levels of access necessary to perform their job functions."
      },
      {
        question: "What does IoT stand for?",
        options: [
          "Internet of Technology",
          "Input/Output Technology",
          "Internet of Things",
          "Intelligent Online Terminals"
        ],
        correctAnswer: 2,
        explanation: "IoT stands for Internet of Things, referring to physical devices connected to the internet that collect and share data."
      }
    ],
    medium: [
      {
        question: "Which framework provides guidelines for organizational cybersecurity?",
        options: [
          "HTML5",
          "NIST Cybersecurity Framework",
          "TCP/IP",
          "DNS"
        ],
        correctAnswer: 1,
        explanation: "The NIST Cybersecurity Framework provides guidelines and best practices for organizational cybersecurity."
      }
    ],
    hard: [
      {
        question: "What is the primary purpose of the Cyber Kill Chain framework?",
        options: [
          "To develop software",
          "To manage networks",
          "To understand and prevent cyber attacks",
          "To encrypt data"
        ],
        correctAnswer: 2,
        explanation: "The Cyber Kill Chain framework helps understand and prevent cyber attacks by breaking them down into stages."
      }
    ]
  },
  'ICTPRG434_435': {
    easy: [
      {
        question: "What is the purpose of pseudocode?",
        options: [
          "To write final code",
          "To plan and outline logic before coding",
          "To debug programs",
          "To compile programs"
        ],
        correctAnswer: 1,
        explanation: "Pseudocode is used to plan and outline program logic before writing actual code."
      },
      {
        question: "Which of the following is a valid Python variable name?",
        options: [
          "1variable",
          "variable-name",
          "variable_name",
          "variable name"
        ],
        correctAnswer: 2,
        explanation: "variable_name is valid as it uses underscore. Variable names can't start with numbers, contain spaces, or use certain special characters like hyphens."
      },
      {
        question: "What is the purpose of comments in code?",
        options: [
          "To execute code conditionally",
          "To make the code run faster",
          "To provide explanations and improve readability",
          "To identify syntax errors"
        ],
        correctAnswer: 2,
        explanation: "Comments are used to provide explanations about the code, making it more readable and maintainable."
      },
      {
        question: "Which data structure is best for implementing a first-in, first-out (FIFO) behavior?",
        options: [
          "Stack",
          "Queue",
          "Dictionary",
          "Set"
        ],
        correctAnswer: 1,
        explanation: "A queue implements FIFO behavior where the first element added is the first one to be removed."
      },
      {
        question: "What is an algorithm?",
        options: [
          "A programming language",
          "A step-by-step procedure for solving a problem",
          "A type of computer hardware",
          "A debugging tool"
        ],
        correctAnswer: 1,
        explanation: "An algorithm is a step-by-step procedure or set of rules for solving a specific problem."
      },
      {
        question: "What is the purpose of version control systems like Git?",
        options: [
          "To compile code",
          "To track changes to files and coordinate work among multiple people",
          "To debug code automatically",
          "To deploy applications"
        ],
        correctAnswer: 1,
        explanation: "Version control systems track changes to files over time and help coordinate work among multiple developers."
      },
      {
        question: "What is the difference between = and == in Python?",
        options: [
          "They are interchangeable",
          "= is for assignment while == is for comparison",
          "= is for comparison while == is for assignment",
          "= is for variables while == is for constants"
        ],
        correctAnswer: 1,
        explanation: "In Python, = is the assignment operator used to assign values to variables, while == is the equality operator used for comparison."
      },
      {
        question: "Which of the following is NOT a basic data type in Python?",
        options: [
          "Integer",
          "String",
          "Array",
          "Boolean"
        ],
        correctAnswer: 2,
        explanation: "Array is not a basic data type in Python. Python uses lists instead, while integer, string, and boolean are all basic data types."
      },
      {
        question: "What is a function in programming?",
        options: [
          "A mathematical equation",
          "A reusable block of code that performs a specific task",
          "A variable that changes value",
          "A syntax error"
        ],
        correctAnswer: 1,
        explanation: "A function is a reusable block of code designed to perform a specific task when called."
      },
      {
        question: "What does 'debugging' mean?",
        options: [
          "Writing code",
          "Removing insects from computers",
          "Finding and fixing errors in code",
          "Documenting code"
        ],
        correctAnswer: 2,
        explanation: "Debugging is the process of finding, analyzing, and fixing errors, bugs, or defects in computer programs."
      }
    ],
    medium: [
      {
        question: "Which Python feature is used for handling errors?",
        options: [
          "try-except blocks",
          "print statements",
          "comments",
          "variables"
        ],
        correctAnswer: 0,
        explanation: "Try-except blocks are used in Python for handling and managing errors (exceptions)."
      }
    ],
    hard: [
      {
        question: "What is the purpose of computer fingerprinting?",
        options: [
          "To identify users",
          "To uniquely identify and track systems",
          "To secure passwords",
          "To format hard drives"
        ],
        correctAnswer: 1,
        explanation: "Computer fingerprinting is used to uniquely identify and track computer systems based on their characteristics."
      }
    ]
  },
  'Python': {
    easy: [
      {
        question: "What does the `os` module in Python primarily help you with?",
        options: [
          "Creating graphical user interfaces",
          "Performing mathematical operations",
          "Interacting with the operating system and file paths",
          "Handling network connections"
        ],
        correctAnswer: 2,
        explanation: "The `os` module provides a way of interacting with the operating system, including file path manipulations."
      },
      {
        question: "Which Python method is used to read a CSV file most efficiently?",
        options: [
          "file.read()",
          "pandas.read_csv()",
          "csv.reader()",
          "open().readlines()"
        ],
        correctAnswer: 1,
        explanation: "`pandas.read_csv()` is the most efficient and feature-rich method for reading CSV files in Python."
      },
      {
        question: "In Python, what is the purpose of type hinting?",
        options: [
          "To force type conversion",
          "To provide optional type annotations for better code readability and error checking",
          "To make variables immutable",
          "To create static type systems"
        ],
        correctAnswer: 1,
        explanation: "Type hinting provides optional type annotations that improve code readability and can help catch type-related errors."
      },
      {
        question: "Which of the following is the most secure way to handle system information collection in Python?",
        options: [
          "Using eval() to execute system commands",
          "Using os.system() for all system interactions",
          "Using subprocess module with carefully controlled inputs",
          "Directly accessing system files without validation"
        ],
        correctAnswer: 2,
        explanation: "The `subprocess` module allows controlled execution of system commands with proper input validation."
      },
      {
        question: "What is the primary advantage of using list comprehensions in Python?",
        options: [
          "They always run faster than traditional for loops",
          "They provide a concise way to create lists with less code",
          "They automatically sort the resulting list",
          "They can replace all other list creation methods"
        ],
        correctAnswer: 1,
        explanation: "List comprehensions offer a concise and readable way to create lists with less code."
      },
      {
        question: "How can you ensure that a script handles potential errors when collecting system information?",
        options: [
          "By using multiple nested if statements",
          "By implementing try-except blocks",
          "By ignoring all potential errors",
          "By using global error handling"
        ],
        correctAnswer: 1,
        explanation: "Try-except blocks allow graceful handling of potential errors during script execution."
      },
      {
        question: "What is the most Pythonic way to write a function that might return different types?",
        options: [
          "Use multiple return statements",
          "Always return a specific type",
          "Use type hints with Union or Optional types",
          "Avoid writing such functions"
        ],
        correctAnswer: 2,
        explanation: "Using Union or Optional types allows functions to clearly indicate they might return different types."
      },
      {
        question: "Which method is most appropriate for securely collecting system information across different operating systems?",
        options: [
          "Using platform-specific system calls",
          "Implementing a cross-platform library like psutil",
          "Writing separate scripts for each OS",
          "Manually parsing system configuration files"
        ],
        correctAnswer: 1,
        explanation: "`psutil` provides a cross-platform library for retrieving system information."
      },
      {
        question: "What is the recommended approach for writing comments in Python?",
        options: [
          "Write as many comments as possible explaining every line",
          "Use docstrings to explain function purpose and parameters",
          "Avoid comments entirely",
          "Only comment on complex algorithmic logic"
        ],
        correctAnswer: 1,
        explanation: "Docstrings provide clear, comprehensive documentation for functions and modules."
      },
      {
        question: "How can you ensure that your Python script follows best practices for security when collecting system information?",
        options: [
          "By using the most complex possible code",
          "By implementing input validation and sanitization",
          "By avoiding any external module imports",
          "By using print statements for debugging"
        ],
        correctAnswer: 1,
        explanation: "Input validation and sanitization are crucial for preventing security vulnerabilities."
      }
    ],
    medium: [
      {
        question: "What is the difference between a list and a tuple in Python?",
        options: [
          "Lists are ordered while tuples are not",
          "Lists are mutable while tuples are immutable",
          "Lists can only contain numbers while tuples can contain any data type",
          "Lists are slower than tuples for all operations"
        ],
        correctAnswer: 1,
        explanation: "The key difference is that lists are mutable (can be changed after creation) while tuples are immutable (cannot be changed after creation)."
      },
      {
        question: "What is a closure in Python?",
        options: [
          "A built-in security feature",
          "A nested function that can access variables from its containing scope",
          "A way to close open files",
          "A method to terminate a program"
        ],
        correctAnswer: 1,
        explanation: "A closure is a nested function that retains access to variables from its containing (enclosing) function's scope, even after the outer function has finished execution."
      },
      {
        question: "How do context managers work in Python?",
        options: [
          "They monitor system context for security",
          "They provide a way to allocate and release resources precisely using 'with' statements",
          "They track execution context for debugging",
          "They manage multiple inheritance contexts"
        ],
        correctAnswer: 1,
        explanation: "Context managers implemented with 'with' statements ensure proper acquisition and release of resources like files, locks, and connections, even if exceptions occur."
      },
      {
        question: "What is the purpose of the 'yield' keyword in Python?",
        options: [
          "To pause execution and return a value in generator functions",
          "To increase code performance",
          "To declare variables as immutable",
          "To create empty variables"
        ],
        correctAnswer: 0,
        explanation: "The 'yield' keyword is used in generator functions to pause execution and return a value while maintaining function state, allowing iteration without loading all data into memory."
      },
      {
        question: "Which of the following is true about Python's Global Interpreter Lock (GIL)?",
        options: [
          "It allows multiple threads to execute Python bytecode simultaneously",
          "It prevents multiple threads from executing Python bytecode simultaneously",
          "It only affects Python on Windows operating systems",
          "It's a deprecated feature no longer present in Python 3"
        ],
        correctAnswer: 1,
        explanation: "The GIL prevents multiple native threads from executing Python bytecode simultaneously, which means multithreaded CPU-bound Python programs may not see performance improvements on multi-core systems."
      },
      {
        question: "What is a decorator in Python?",
        options: [
          "A design pattern for styling classes",
          "A function that takes another function and extends its behavior",
          "A built-in namespace manager",
          "A special comment that modifies code behavior"
        ],
        correctAnswer: 1,
        explanation: "A decorator is a function that takes another function as an argument and extends or modifies its behavior without explicitly changing its code, typically using the @decorator syntax."
      },
      {
        question: "How does dictionary comprehension differ from list comprehension?",
        options: [
          "Dictionary comprehensions are slower",
          "Dictionary comprehensions create key-value pairs instead of just values",
          "Dictionary comprehensions can only use strings as keys",
          "Dictionary comprehensions cannot use conditional statements"
        ],
        correctAnswer: 1,
        explanation: "Dictionary comprehensions create key-value pairs using the {key:value for item in iterable} syntax, while list comprehensions create lists of values using [value for item in iterable]."
      },
      {
        question: "What is the most efficient way to concatenate many strings in Python?",
        options: [
          "Using the + operator in a loop",
          "Using the += operator in a loop",
          "Using ''.join(list_of_strings)",
          "Using string interpolation with %s"
        ],
        correctAnswer: 2,
        explanation: "Using ''.join(list_of_strings) is more efficient for concatenating many strings because it avoids creating multiple intermediate string objects, unlike repeated + or += operations."
      },
      {
        question: "What is the difference between __str__ and __repr__ methods in Python?",
        options: [
          "There is no difference; they are aliases",
          "__str__ is for user-friendly output while __repr__ is for debugging and development",
          "__str__ is for development only while __repr__ is for production code",
          "__str__ is deprecated in Python 3 in favor of __repr__"
        ],
        correctAnswer: 1,
        explanation: "__str__ aims to be readable for end users (used by print() and str()), while __repr__ aims to be unambiguous for developers (used by the REPL and repr()), ideally containing information to recreate the object."
      },
      {
        question: "What is the purpose of the 'collections' module in Python?",
        options: [
          "To manage memory collection and garbage disposal",
          "To provide specialized container datatypes beyond the built-in types",
          "To handle file collections in directories",
          "To collect metrics on code performance"
        ],
        correctAnswer: 1,
        explanation: "The collections module provides specialized container datatypes like namedtuple, defaultdict, Counter, deque, and OrderedDict that extend functionality beyond built-in types."
      }
    ],
    hard: [
      {
        question: "What is a Python decorator?",
        options: [
          "A design pattern for styling Python applications",
          "A function that takes another function and extends its behavior without modifying it",
          "A class that inherits from multiple parent classes",
          "A tool for compiling Python code"
        ],
        correctAnswer: 1,
        explanation: "A decorator is a function that takes another function and extends its behavior without explicitly modifying its code, using the @decorator syntax."
      },
      {
        question: "What is a metaclass in Python and what is it used for?",
        options: [
          "A design pattern for creating objects",
          "A class whose instances are classes themselves, allowing customization of class creation",
          "A type of class that only exists in memory",
          "A special caching mechanism for performance optimization"
        ],
        correctAnswer: 1,
        explanation: "A metaclass is a class whose instances are classes themselves. It allows customizing class creation by intercepting the class creation process, enabling features like automatic registration, attribute validation, or interface enforcement."
      },
      {
        question: "How does Python's memory management work with respect to reference counting?",
        options: [
          "Python doesn't use reference counting",
          "Python exclusively uses reference counting without garbage collection",
          "Python uses reference counting as a primary mechanism, complemented by garbage collection for cyclic references",
          "Python only uses reference counting for complex objects like dictionaries"
        ],
        correctAnswer: 2,
        explanation: "Python uses reference counting as its primary memory management mechanism (incrementing/decrementing counters when references are created or destroyed), complemented by a cyclic garbage collector to handle circular references."
      },
      {
        question: "What are Python descriptors and when would you use them?",
        options: [
          "Tools for describing code in documentation strings",
          "Objects that implement __get__, __set__, or __delete__ methods to customize attribute access",
          "Special string formats that describe object structure",
          "Design patterns for implementing singletons"
        ],
        correctAnswer: 1,
        explanation: "Descriptors are objects implementing __get__, __set__, or __delete__ methods, which allow customized behavior when accessing, setting or deleting attributes. They're used in properties, class methods, and static methods to control attribute access."
      },
      {
        question: "What is the purpose of asyncio in Python?",
        options: [
          "To provide asynchronous I/O functionality for concurrent programming",
          "To automatically parallelize CPU-bound tasks",
          "To synchronize access to shared resources",
          "To simplify multithreaded programming"
        ],
        correctAnswer: 0,
        explanation: "asyncio is a library for writing concurrent code using the async/await syntax. It's designed for I/O-bound tasks where operations can be suspended while waiting for external operations to complete, allowing other tasks to run during these waiting periods."
      },
      {
        question: "Which of the following best describes Python's approach to multiprocessing vs. multithreading?",
        options: [
          "Python strongly favors multithreading over multiprocessing for all tasks",
          "Due to the GIL, Python threads are most suitable for CPU-bound tasks, while multiprocessing is better for I/O-bound tasks",
          "Due to the GIL, Python multiprocessing is typically better for CPU-bound tasks, while threads work well for I/O-bound tasks",
          "Python only supports multiprocessing starting from version 3.8"
        ],
        correctAnswer: 2,
        explanation: "Due to Python's Global Interpreter Lock (GIL), which prevents multiple threads from executing Python bytecode simultaneously, multiprocessing (which uses separate processes) is typically more effective for CPU-bound tasks. Threads remain useful for I/O-bound tasks where they spend time waiting."
      },
      {
        question: "What is monkey patching in Python and what are its implications?",
        options: [
          "A technique to optimize performance by compiling Python to C code",
          "Dynamically modifying classes or modules at runtime, potentially leading to hard-to-debug code",
          "A design pattern for creating immutable objects",
          "A testing methodology where tests run in isolation"
        ],
        correctAnswer: 1,
        explanation: "Monkey patching is the practice of dynamically modifying classes or modules at runtime, replacing attributes or methods. While powerful for fixing bugs in third-party code or adding features, it can create unpredictable behavior and hard-to-debug code."
      },
      {
        question: "How does Python's functools.lru_cache work and what is it used for?",
        options: [
          "It's a security feature that prevents cache poisoning attacks",
          "It's a decorator that implements Least Recently Used caching to improve performance of expensive function calls",
          "It automatically parallelizes function execution using CPU cores",
          "It limits CPU usage of resource-intensive functions"
        ],
        correctAnswer: 1,
        explanation: "functools.lru_cache is a decorator that implements Least Recently Used caching, which saves the results of expensive function calls and returns the cached result when the same inputs occur again, improving performance for functions with repeated calls using the same arguments."
      },
      {
        question: "What is the difference between deepcopy and copy in Python?",
        options: [
          "deepcopy is just an alias for copy with no actual difference",
          "copy creates a new reference to the same object, while deepcopy creates a new object",
          "copy creates a shallow copy (one level deep), while deepcopy recursively copies nested objects",
          "deepcopy is significantly faster but uses more memory"
        ],
        correctAnswer: 2,
        explanation: "copy.copy() creates a shallow copy, duplicating the container but keeping references to the same contained objects. copy.deepcopy() creates a deep copy by recursively copying nested objects, resulting in a completely independent copy with no shared references."
      },
      {
        question: "What is metaprogramming in Python and how could it be implemented?",
        options: [
          "Writing code that runs faster than regular Python code",
          "Using specialized IDEs to automate coding tasks",
          "Writing code that generates or manipulates other code at runtime",
          "A deprecated approach no longer supported in Python 3"
        ],
        correctAnswer: 2,
        explanation: "Metaprogramming is writing code that generates or manipulates other code at runtime. In Python, this can be implemented using techniques like metaclasses, decorators, dynamic attribute access, exec/eval functions, and abstract base classes, allowing programs to adapt and extend themselves during execution."
      }
    ]
  }
};

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, initialSubject = '' }) => {
  const { user } = useUser();
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [difficulty, setDifficulty] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [savingResults, setSavingResults] = useState<boolean>(false);
  const [needsLogin, setNeedsLogin] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      resetQuiz();
    } else if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [isOpen, initialSubject]);

  const resetQuiz = () => {
    setSelectedSubject(initialSubject || '');
    setDifficulty('');
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setAnswers([]);
    setQuizStarted(false);
    setCorrectAnswers([]);
    setNeedsLogin(false);
  };

  const handleStartQuiz = () => {
    // Check if user is logged in
    if (!user) {
      setNeedsLogin(true);
      return;
    }

    setQuizStarted(true);
    setAnswers(new Array(quizData[selectedSubject][difficulty].length).fill(-1));
    setCorrectAnswers(new Array(quizData[selectedSubject][difficulty].length).fill(false));
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    // Check if the answer is correct and update correctAnswers
    const newCorrectAnswers = [...correctAnswers];
    const isCorrect = answerIndex === quizData[selectedSubject][difficulty][currentQuestion].correctAnswer;
    newCorrectAnswers[currentQuestion] = isCorrect;
    setCorrectAnswers(newCorrectAnswers);

    if (currentQuestion < quizData[selectedSubject][difficulty].length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      const totalCorrect = newCorrectAnswers.filter(correct => correct).length;
      setScore(totalCorrect);
      setShowResults(true);
      saveQuizResults(newCorrectAnswers, totalCorrect);
    }
  };

  const saveQuizResults = async (correctAnswerArray: boolean[], finalScore: number) => {
    if (!user) return;
    
    const totalQuestions = quizData[selectedSubject][difficulty].length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    
    setSavingResults(true);
    try {
      await supabase.from('quiz_results').insert([{
        user_id: user.id,
        subject: selectedSubject,
        difficulty: difficulty,
        score: finalScore,
        total_questions: totalQuestions,
        percentage: percentage
      }]);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    } finally {
      setSavingResults(false);
    }
  };

  const handleLoginSuccess = () => {
    setNeedsLogin(false);
    handleStartQuiz();
  };

  if (!isOpen) return null;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return '';
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / answers.length) * 100;
    if (percentage >= 70) return { icon: Trophy, color: 'text-yellow-400', message: 'Excellent!' };
    if (percentage >= 40) return { icon: Brain, color: 'text-blue-400', message: 'Good job!' };
    return { icon: AlertTriangle, color: 'text-red-400', message: 'Keep practicing!' };
  };

  if (needsLogin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md">
          <UserLoginForm onLogin={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="cyber-card w-full max-w-2xl max-h-[90vh] overflow-auto animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold matrix-text">Cyber Security Quiz</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>

          {!quizStarted ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-200 mb-2">Select Subject:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.keys(quizData).map(subject => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        selectedSubject === subject
                          ? 'border-[var(--matrix-color)] bg-[var(--matrix-color)]/10 text-[var(--matrix-color)]'
                          : 'border-gray-700 hover:border-[var(--matrix-color)] text-gray-300'
                      } ${subject === 'Python' ? 'bg-blue-900/20 border-blue-700/50' : ''}`}
                    >
                      {unitNames[subject]}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubject && (
                <div>
                  <h3 className="text-gray-200 mb-2">Select Difficulty:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`p-3 rounded-lg border capitalize transition-all duration-300 ${
                          difficulty === diff
                            ? 'border-[var(--matrix-color)] bg-[var(--matrix-color)]/10 text-[var(--matrix-color)]'
                            : 'border-gray-700 hover:border-[var(--matrix-color)] text-gray-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubject && difficulty && (
                <button
                  onClick={handleStartQuiz}
                  className="w-full p-3 rounded-lg border border-[var(--matrix-color)] 
                           bg-[var(--matrix-color)]/10 text-[var(--matrix-color)] 
                           hover:bg-[var(--matrix-color)]/20 transition-all duration-300"
                >
                  Start Quiz
                </button>
              )}
            </div>
          ) : showResults ? (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                {(() => {
                  const { icon: Icon, color, message } = getScoreMessage();
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`h-12 w-12 ${color}`} />
                      <h3 className="text-2xl font-bold matrix-text">{message}</h3>
                    </div>
                  );
                })()}
                <p className="text-xl text-gray-300 mt-2">
                  You scored {score} out of {answers.length}
                </p>
                {savingResults && (
                  <p className="text-sm text-gray-400 mt-1">Saving your results...</p>
                )}
              </div>

              <div className="space-y-4">
                {quizData[selectedSubject][difficulty].map((q, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <p className="text-gray-200 mb-2">{q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === q.correctAnswer
                              ? 'bg-green-900/20 border border-green-700'
                              : optIndex === answers[index] && !correctAnswers[index]
                              ? 'bg-red-900/20 border border-red-700'
                              : 'bg-gray-700/20 border border-gray-600'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{q.explanation}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={resetQuiz}
                className="w-full p-3 rounded-lg border border-[var(--matrix-color)] 
                         bg-[var(--matrix-color)]/10 text-[var(--matrix-color)] 
                         hover:bg-[var(--matrix-color)]/20 transition-all duration-300"
              >
                Try Another Quiz
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Question {currentQuestion + 1} of {quizData[selectedSubject][difficulty].length}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full">
                  <div
                    className="bg-[var(--matrix-color)] h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestion + 1) / quizData[selectedSubject][difficulty].length) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg text-gray-200 mb-4">
                  {quizData[selectedSubject][difficulty][currentQuestion].question}
                </h3>
                <div className="space-y-2">
                  {quizData[selectedSubject][difficulty][currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="w-full p-3 text-left rounded-lg border border-gray-700 
                               hover:border-[var(--matrix-color)] hover:bg-[var(--matrix-color)]/10 
                               transition-all duration-300 text-gray-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;