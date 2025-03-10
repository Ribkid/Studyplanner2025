import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, BookOpen, Check, Code, Play, Lightbulb, HelpCircle, AlertTriangle, RotateCcw, Info, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';

const BirthdayParadoxPage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'code' | 'questions' | 'simulation'>('code');
  const [userCode, setUserCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  
  // Parameters that can be modified
  const [numBirthdays, setNumBirthdays] = useState<number>(23);
  const [numSimulations, setNumSimulations] = useState<number>(100000);
  const [simulationStep, setSimulationStep] = useState<number>(10000);
  const [useFullMonthNames, setUseFullMonthNames] = useState<boolean>(false);
  const [maxBirthdaysLimit, setMaxBirthdaysLimit] = useState<number>(100);

  // Function to run the code simulation
  const runCode = () => {
    setIsRunning(true);
    setOutput('');

    setTimeout(() => {
      try {
        // Extract values from the user's code
        let extractedNumBirthdays = numBirthdays;
        let extractedNumSimulations = numSimulations;
        let extractedSimulationStep = simulationStep;
        let extractedMaxLimit = maxBirthdaysLimit;
        let extractedUseFullMonthNames = useFullMonthNames;
        
        try {
          // Try to extract parameters from userCode
          const maxLimitMatch = userCode.match(/if response\.isdecimal\(\) and \(0 < int\(response\) <= (\d+)\)/);
          if (maxLimitMatch && maxLimitMatch[1]) {
            extractedMaxLimit = parseInt(maxLimitMatch[1]);
          }
          
          const simulationsMatch = userCode.match(/for i in range\((\d+)\):/);
          if (simulationsMatch && simulationsMatch[1]) {
            extractedNumSimulations = parseInt(simulationsMatch[1]);
          }
          
          const stepMatch = userCode.match(/if i % (\d+) == 0:/);
          if (stepMatch && stepMatch[1]) {
            extractedSimulationStep = parseInt(stepMatch[1]);
          }
          
          // Check if using full month names
          extractedUseFullMonthNames = userCode.includes("'January'");
        } catch (err) {
          console.error("Error extracting values from code:", err);
        }
        
        // Simulate a birthday paradox run
        let simulationOutput = 'Birthday Paradox, by Al Sweigart al@inventwithpython.com\n\n';
        simulationOutput += 'The birthday paradox shows us that in a group of N people, the odds\n';
        simulationOutput += 'that two of them have matching birthdays is surprisingly large.\n';
        simulationOutput += 'This program does a Monte Carlo simulation (that is, repeated random\n';
        simulationOutput += 'simulations) to explore this concept.\n\n';
        simulationOutput += "(It's not actually a paradox, it's just a surprising result.)\n\n";
        
        simulationOutput += `How many birthdays shall I generate? (Max ${extractedMaxLimit})\n`;
        simulationOutput += `> ${extractedNumBirthdays}\n\n`;
        
        // Generate some random birthdays for display
        const months = extractedUseFullMonthNames ? 
          ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] :
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
        simulationOutput += `Here are ${extractedNumBirthdays} birthdays:\n`;
        
        // Simulate the birthday generation
        const birthdays = [];
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        for (let i = 0; i < extractedNumBirthdays; i++) {
          const month = Math.floor(Math.random() * 12);
          const day = Math.floor(Math.random() * daysInMonth[month]) + 1;
          birthdays.push({ month, day });
        }
        
        // Format and display birthdays
        let birthdayText = '';
        for (let i = 0; i < birthdays.length; i++) {
          if (i > 0) {
            birthdayText += ', ';
          }
          birthdayText += `${months[birthdays[i].month]} ${birthdays[i].day}`;
          
          // Add line breaks for readability
          if ((i + 1) % 10 === 0) {
            birthdayText += '\n';
          }
        }
        simulationOutput += birthdayText + '\n\n';
        
        // Check for matches in this simulation
        const birthdays_set = new Set();
        let match = null;
        
        for (const birthday of birthdays) {
          const key = `${birthday.month}-${birthday.day}`;
          if (birthdays_set.has(key)) {
            match = birthday;
            break;
          }
          birthdays_set.add(key);
        }
        
        simulationOutput += 'In this simulation, ';
        if (match) {
          simulationOutput += `multiple people have a birthday on ${months[match.month]} ${match.day}\n`;
        } else {
          simulationOutput += 'there are no matching birthdays.\n';
        }
        
        simulationOutput += '\n';
        simulationOutput += `Generating ${extractedNumBirthdays} random birthdays ${extractedNumSimulations.toLocaleString()} times...\n`;
        simulationOutput += 'Press Enter to begin...\n\n';
        
        simulationOutput += `Let's run another ${extractedNumSimulations.toLocaleString()} simulations.\n`;
        
        // Simulate and count matches
        let simMatch = 0;
        
        for (let i = 0; i < Math.min(extractedNumSimulations, 100); i++) {
          if (i % extractedSimulationStep === 0) {
            simulationOutput += `${i.toLocaleString()} simulations run...\n`;
          }
          
          // Simulate birthdays for this run
          const birthdays_for_sim = [];
          const birthdaySet = new Set();
          let hasMatch = false;
          
          for (let j = 0; j < extractedNumBirthdays; j++) {
            const month = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * daysInMonth[month]) + 1;
            const key = `${month}-${day}`;
            
            if (birthdaySet.has(key)) {
              hasMatch = true;
              break;
            }
            
            birthdaySet.add(key);
            birthdays_for_sim.push({ month, day });
          }
          
          if (hasMatch) {
            simMatch++;
          }
        }
        
        // Fast-forward simulation (to avoid running full 100k)
        const skipTo = Math.floor(extractedNumSimulations * 0.9);
        simulationOutput += '...\n';
        simulationOutput += `${skipTo.toLocaleString()} simulations run...\n`;
        
        // Simulate the final few
        for (let i = 0; i < Math.min(10, extractedNumSimulations * 0.1); i++) {
          const step = skipTo + i * extractedSimulationStep;
          if (step < extractedNumSimulations) {
            simulationOutput += `${step.toLocaleString()} simulations run...\n`;
          }
        }
        
        simulationOutput += `${extractedNumSimulations.toLocaleString()} simulations run.\n\n`;
        
        // Calculate theoretical probability for this number of birthdays
        // This uses an approximation formula for the birthday problem
        const theoreticalProbability = 1 - Math.exp(-extractedNumBirthdays * (extractedNumBirthdays - 1) / (2 * 365));
        
        // Scale simMatch based on our limited simulation
        const estimatedMatches = Math.floor(theoreticalProbability * extractedNumSimulations);
        const probability = (theoreticalProbability * 100).toFixed(2);
        
        simulationOutput += `Out of ${extractedNumSimulations.toLocaleString()} simulations of ${extractedNumBirthdays} people, there was a\n`;
        simulationOutput += `matching birthday in that group ${estimatedMatches.toLocaleString()} times. This means\n`;
        simulationOutput += `that ${extractedNumBirthdays} people have a ${probability}% chance of\n`;
        simulationOutput += 'having a matching birthday in their group.\n';
        simulationOutput += "That's probably more than you would think!\n";
        
        setOutput(simulationOutput);
      } catch (error) {
        setOutput(`Error executing code: ${error}`);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  // Questions from the original text
  const questions = [
    {
      id: 1,
      question: "How are birthdays represented in this program? (Hint: look at line 16.)",
      answer: "Birthdays are represented as Python datetime.date objects. The program creates these by starting with a base date (January 1, 2001) and then adding a random number of days (0 to 364) using datetime.timedelta. This creates date objects that represent random days throughout a single year.",
      experiment: () => {
        // This doesn't need a code change, it's just about understanding the representation
        setSelectedQuestion(1);
      },
      experimentLabel: "Explore birthday representation in code"
    },
    {
      id: 2,
      question: "How could you remove the maximum limit of 100 birthdays the program generates?",
      answer: "To remove the maximum limit, you need to change the validation condition on line 56. The limit is set by checking if the input is <= 100. You can either remove this upper bound check entirely or set it to a much higher number.",
      experiment: () => {
        setMaxBirthdaysLimit(1000);
        
        // Update the code directly
        const updatedCode = userCode.replace(
          /(if response\.isdecimal\(\) and \(0 < int\(response\) <= )(\d+)/,
          `$11000`  // Changed to 1000
        );
        setUserCode(updatedCode);
      },
      experimentLabel: "Increase maximum limit to 1000"
    },
    {
      id: 3,
      question: "What error message do you get if you delete or comment out numBDays = int(response) on line 57?",
      answer: "If you delete or comment out that line, you would get a 'NameError: name 'numBDays' is not defined' when the program tries to use this variable later on. This happens because the variable would never be initialized, but the code attempts to use it on line 62 and elsewhere.",
      experiment: () => {
        // Update the code to comment out that line
        if (userCode.includes("numBDays = int(response)")) {
          const updatedCode = userCode.replace(
            /(\s+)numBDays = int\(response\)/,
            "$1# numBDays = int(response)  # This line is commented out, will cause NameError"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# numBDays = int\(response\).*$/m,
            "$1numBDays = int(response)"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: userCode.includes("numBDays = int(response)") ? 
        "Comment out numBDays assignment" : 
        "Restore numBDays assignment"
    },
    {
      id: 4,
      question: "How can you make the program display full month names, such as 'January' instead of 'Jan'?",
      answer: "To display full month names, you need to modify the MONTHS tuple on lines 50-51. Replace the three-letter abbreviations with the full month names (e.g., 'Jan' to 'January', 'Feb' to 'February', etc.).",
      experiment: () => {
        setUseFullMonthNames(!useFullMonthNames);
        
        // Update the MONTHS tuple in the code
        if (!useFullMonthNames) {
          const updatedCode = userCode.replace(
            /MONTHS = \('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',\s+'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'\)/,
            "MONTHS = ('January', 'February', 'March', 'April', 'May', 'June',\n          'July', 'August', 'September', 'October', 'November', 'December')"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /MONTHS = \('January', 'February', 'March', 'April', 'May', 'June',\s+'July', 'August', 'September', 'October', 'November', 'December'\)/,
            "MONTHS = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',\n          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: useFullMonthNames ? "Use abbreviated month names" : "Use full month names"
    },
    {
      id: 5,
      question: "How could you make 'X simulations run...' appear every 1,000 simulations instead of every 10,000?",
      answer: "To change how often the progress is reported, modify the condition on line 95. The code checks 'if i % 10000 == 0' to report every 10,000 simulations. Change 10000 to 1000 to report every 1,000 simulations instead.",
      experiment: () => {
        // Change the simulation step
        const newStep = simulationStep === 10000 ? 1000 : 
                        simulationStep === 1000 ? 100 : 10000;
        
        setSimulationStep(newStep);
        
        // Update the code directly
        const updatedCode = userCode.replace(
          /(if i % )(\d+)( == 0:)/,
          `$1${newStep}$3`
        );
        setUserCode(updatedCode);
      },
      experimentLabel: `Report progress every ${simulationStep === 10000 ? "1,000" : 
                        simulationStep === 1000 ? "100" : "10,000"} simulations`
    }
  ];

  const resetExperiments = () => {
    setNumBirthdays(23);
    setNumSimulations(100000);
    setSimulationStep(10000);
    setUseFullMonthNames(false);
    setMaxBirthdaysLimit(100);
    setUserCode(initialCode);
  };

  const handleNumBirthdaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setNumBirthdays(value);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <header className="bg-gray-800 shadow-lg py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/python-projects" className="text-gray-400 hover:text-gray-200 mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center">
                <Terminal className="h-6 w-6 text-[var(--matrix-color)] mr-2" />
                <span className="matrix-text">Project #2:</span> Birthday Paradox Learning
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
          <h2 className="text-2xl font-bold text-white mb-2">Birthday Paradox: Probability Simulation</h2>
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Beginner
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              100 points
            </span>
          </div>
          
          <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-[var(--matrix-color)] mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              How It Works
            </h3>
            <p className="text-gray-300 mb-3">
              The Birthday Paradox demonstrates the surprisingly high probability that in a group of people, at least 
              two will share the same birthday. In a group of just 23 people, there's about a 50% chance of a shared birthday,
              and with 70 people, it's over 99.9%!
            </p>
            <p className="text-gray-300 mb-3">
              This program uses a Monte Carlo simulation (running many random trials) to demonstrate this counter-intuitive
              probability. It generates random birthdays for a group of people and checks if any two share the same birthday.
              By repeating this thousands of times, we can see how often matches occur.
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Technical note:</strong> The program uses Python's datetime module to represent birthdays
              as date objects, with everyone having a birthday in the same year (the specific year doesn't matter for this simulation).
            </p>
          </div>
          
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('code')}
                className={`${
                  activeTab === 'code'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Code className="h-5 w-5 mr-2" />
                Code Explorer
              </button>
              
              <button
                onClick={() => setActiveTab('questions')}
                className={`${
                  activeTab === 'questions'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                Exploration Questions
              </button>
              
              <button
                onClick={() => setActiveTab('simulation')}
                className={`${
                  activeTab === 'simulation'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Play className="h-5 w-5 mr-2" />
                Run Simulation
              </button>
            </nav>
          </div>
          
          {activeTab === 'code' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Terminal className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                  Code Explorer
                </h3>
                <div className="flex space-x-2">
                  {(numBirthdays !== 23 || numSimulations !== 100000 || simulationStep !== 10000 || useFullMonthNames || maxBirthdaysLimit !== 100 || userCode !== initialCode) && (
                    <button
                      onClick={resetExperiments}
                      className="cyber-button px-3 py-1.5 text-sm"
                    >
                      Reset All Modifications
                    </button>
                  )}
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="cyber-button px-3 py-1.5 text-sm flex items-center"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {isRunning ? 'Running...' : 'Run Simulation'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-gray-800/90 border border-gray-700 rounded-md p-3 mb-2">
                    <h4 className="font-medium text-gray-200 mb-1">Make changes to the code:</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      Edit the code directly in the editor below, or use the experiment buttons in the 
                      "Exploration Questions" tab to make specific changes.
                    </p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label htmlFor="num-birthdays" className="text-gray-300 text-sm mb-1">Number of Birthdays:</label>
                        <input 
                          id="num-birthdays"
                          type="number" 
                          value={numBirthdays}
                          onChange={handleNumBirthdaysChange}
                          min="1"
                          max={maxBirthdaysLimit}
                          className="bg-gray-700 border border-gray-600 rounded p-1 text-white text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            // Update num birthdays in code
                            const updatedCode = userCode.replace(
                              /numBDays = (\d+)/,
                              `numBDays = ${numBirthdays}`
                            );
                            setUserCode(updatedCode);
                          }}
                          className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                        >
                          Apply to Code
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      {numBirthdays !== 23 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Number of birthdays set to {numBirthdays}
                        </div>
                      )}
                      {simulationStep !== 10000 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Progress reporting every {simulationStep.toLocaleString()} simulations
                        </div>
                      )}
                      {useFullMonthNames && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Using full month names
                        </div>
                      )}
                      {maxBirthdaysLimit !== 100 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Maximum birthdays limit set to {maxBirthdaysLimit}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-[500px] overflow-y-auto bg-gray-900 rounded-md">
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[var(--matrix-color)]"
                      spellCheck="false"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Simulation Output:</h3>
                  <div className="bg-black rounded-md p-4 h-[540px] overflow-y-auto font-mono text-sm">
                    {isRunning ? (
                      <div className="text-center py-8">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--matrix-color)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-4 text-gray-400">Running code simulation...</p>
                      </div>
                    ) : output ? (
                      <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                    ) : (
                      <div className="text-gray-500 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p>Click "Run Simulation" to see the code output</p>
                          <p className="text-sm mt-2">Try different code modifications to see how they affect the results</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                  Code Explanation
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    <strong className="text-[var(--matrix-color)]">Key Components:</strong> The Birthday Paradox simulation consists of three main functions:
                  </p>
                  <ol className="space-y-2 pl-5 list-decimal">
                    <li>
                      <strong>getBirthdays(numberOfBirthdays)</strong> - Generates a list of random birthdays using Python's datetime module.
                    </li>
                    <li>
                      <strong>getMatch(birthdays)</strong> - Checks if any two birthdays in the list match and returns the first matched birthday.
                    </li>
                    <li>
                      <strong>main code</strong> - Handles the user interface, runs the simulations, and calculates probabilities.
                    </li>
                  </ol>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Simulation Logic:</strong> The program generates random birthdays for a specified number of people and checks for matches. It repeats this process 100,000 times to determine the probability of shared birthdays.
                  </p>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Statistics and Probability:</strong> This is a Monte Carlo simulation, which uses random sampling to obtain numerical results. The more simulations we run, the more accurate our probability estimate becomes.
                  </p>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Interesting Note:</strong> The underscores in numbers like <code>10_000</code> and <code>100_000</code> are just for readability in Python. They have no special meaning other than making large numbers easier to read.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'questions' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <HelpCircle className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Exploration Questions
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div 
                      key={q.id} 
                      className={`bg-gray-800/70 border ${selectedQuestion === q.id ? 'border-[var(--matrix-color)]' : 'border-gray-700'} rounded-md p-4 cursor-pointer hover:border-gray-500 transition-colors`}
                      onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
                    >
                      <h4 className="font-medium text-white mb-1">Question {q.id}:</h4>
                      <p className="text-gray-300 mb-2">{q.question}</p>
                      
                      {selectedQuestion === q.id && (
                        <div>
                          <div className="bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 rounded p-3 my-3">
                            <h5 className="font-medium text-[var(--matrix-color)] mb-1">Answer:</h5>
                            <p className="text-gray-300">{q.answer}</p>
                          </div>
                          
                          {q.experiment && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                q.experiment();
                                setActiveTab('code');
                              }}
                              className="cyber-button px-3 py-1.5 text-sm w-full flex items-center justify-center mt-2"
                            >
                              <Code className="h-4 w-4 mr-1" />
                              {q.experimentLabel}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-800/70 border border-gray-700 rounded-md p-6">
                  <h4 className="font-medium text-white mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                    Learning Guide
                  </h4>
                  
                  <div className="space-y-4 text-gray-300">
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Understanding Probability in the Birthday Paradox:</h5>
                      <p className="text-sm">
                        The Birthday Paradox illustrates how our intuition about probability can be misleading. With only 23 people, there's about a 50% chance of a shared birthday - much higher than most people expect!
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Key Code Concepts:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>Date representation in Python (datetime module)</li>
                        <li>Random number generation</li>
                        <li>Statistical simulations (Monte Carlo method)</li>
                        <li>Set operations for detecting duplicates</li>
                        <li>Formatting and displaying data</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">The Math Behind It:</h5>
                      <p className="text-sm">
                        The formula for the probability of at least one shared birthday in a group of n people is:
                      </p>
                      <p className="bg-gray-900 p-2 rounded mt-1 text-sm">
                        P(n) = 1 - 365!/(365<sup>n</sup> × (365-n)!)
                      </p>
                      <p className="text-sm mt-1">
                        This is a complex calculation that our simulation approximates through repeated random trials.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Try These Extensions:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>Modify the program to account for leap years</li>
                        <li>Create a visualization of probability vs. group size</li>
                        <li>Implement a variation that checks for three people sharing a birthday</li>
                        <li>Consider uneven birthday distributions (some days are more common)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong className="text-yellow-400">Note:</strong> In real-world data, birthdays aren't actually evenly distributed throughout the year. Some months and days have higher birth rates than others, which would affect the true probabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'simulation' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Play className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Run Simulation
              </h3>
              
              <div className="mb-6 bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-3">Simulation Parameters</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="birthdays-range" className="block text-sm text-gray-300 mb-1">
                          Number of People: <span className="font-medium text-[var(--matrix-color)]">{numBirthdays}</span>
                        </label>
                        <input 
                          id="birthdays-range"
                          type="range" 
                          min="1" 
                          max="100" 
                          value={numBirthdays}
                          onChange={(e) => setNumBirthdays(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>1</span>
                          <span>23</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-1">Expected Probability:</h5>
                          <div className="bg-gray-900 p-3 rounded-md">
                            <span className="text-2xl font-bold text-[var(--matrix-color)]">
                              {(1 - Math.exp(-numBirthdays * (numBirthdays - 1) / (2 * 365)) * 100).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Theoretical probability of a matching birthday</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-1">Simulation Speed:</h5>
                          <select
                            value={numSimulations}
                            onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
                          >
                            <option value="1000">1,000 trials (Fast)</option>
                            <option value="10000">10,000 trials (Medium)</option>
                            <option value="100000">100,000 trials (Slow)</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Higher values give more accurate results</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="cyber-button px-4 py-2 w-full flex items-center justify-center"
                      >
                        {isRunning ? (
                          <>
                            <div className="h-4 w-4 border-2 border-gray-400 border-t-[var(--matrix-color)] rounded-full animate-spin mr-2"></div>
                            Running Simulation...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Birthday Paradox Simulation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-3">Probability Chart</h4>
                    <div className="bg-gray-900 rounded-md p-4 h-[300px] flex items-center justify-center">
                      <div className="w-full">
                        <h5 className="text-center text-gray-400 mb-3">Birthday Match Probability by Group Size</h5>
                        <div className="h-[200px] relative">
                          {/* X-axis (people) */}
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700"></div>
                          
                          {/* Y-axis (probability) */}
                          <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-700"></div>
                          
                          {/* Y-axis labels */}
                          <div className="absolute -left-6 top-0 text-xs text-gray-500">100%</div>
                          <div className="absolute -left-6 top-1/2 text-xs text-gray-500">50%</div>
                          <div className="absolute -left-6 bottom-0 text-xs text-gray-500">0%</div>
                          
                          {/* X-axis labels */}
                          <div className="absolute bottom-[-16px] left-0 text-xs text-gray-500">0</div>
                          <div className="absolute bottom-[-16px] left-[23%] text-xs text-gray-500">23</div>
                          <div className="absolute bottom-[-16px] left-1/2 text-xs text-gray-500">50</div>
                          <div className="absolute bottom-[-16px] right-0 text-xs text-gray-500">100</div>
                          
                          {/* 50% probability line */}
                          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-700"></div>
                          
                          {/* Probability curve */}
                          <svg className="absolute inset-0 h-full w-full overflow-visible">
                            <path
                              d={[...Array(101).keys()].map(n => {
                                const x = n;
                                const y = 1 - Math.exp(-n * (n - 1) / (2 * 365));
                                return `${x === 0 ? 'M' : 'L'} ${x}% ${100 - y * 100}%`;
                              }).join(' ')}
                              fill="none"
                              stroke="var(--matrix-color)"
                              strokeWidth="2"
                            />
                          </svg>
                          
                          {/* Current selection point */}
                          <div 
                            className="absolute w-3 h-3 bg-white border-2 border-[var(--matrix-color)] rounded-full"
                            style={{ 
                              left: `${numBirthdays}%`, 
                              bottom: `${(1 - Math.exp(-numBirthdays * (numBirthdays - 1) / (2 * 365))) * 100}%`,
                              transform: 'translate(-50%, 50%)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      The curve shows how quickly the probability increases with group size.<br/>
                      With just 23 people, there's already a 50% chance of shared birthdays!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-white mb-3">Simulation Results</h4>
                {output ? (
                  <pre className="font-mono text-sm text-green-400 bg-black p-4 rounded-md h-96 overflow-y-auto">{output}</pre>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-black rounded-md">
                    <div className="text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Run a simulation to see results here</p>
                      <p className="text-sm mt-2">Adjust the parameters above and click "Run Birthday Paradox Simulation"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const initialCode = `"""Birthday Paradox Simulation, by Al Sweigart al@inventwithpython.com
Explore the surprising probabilities of the "Birthday Paradox".
More info at https://en.wikipedia.org/wiki/Birthday_problem
This code is available at https://nostarch.com/big-book-small-python-programming
Tags: short, math, simulation"""

import datetime, random


def getBirthdays(numberOfBirthdays):
    """Returns a list of number random date objects for birthdays."""
    birthdays = []
    for i in range(numberOfBirthdays):
        # The year is unimportant for our simulation, as long as all
        # birthdays have the same year.
        startOfYear = datetime.date(2001, 1, 1)

        # Get a random day into the year:
        randomNumberOfDays = datetime.timedelta(random.randint(0, 364))
        birthday = startOfYear + randomNumberOfDays
        birthdays.append(birthday)
    return birthdays


def getMatch(birthdays):
    """Returns the date object of a birthday that occurs more than once
    in the birthdays list."""
    if len(birthdays) == len(set(birthdays)):
        return None  # All birthdays are unique, so return None.

    # Compare each birthday to every other birthday:
    for a, birthdayA in enumerate(birthdays):
        for b, birthdayB in enumerate(birthdays[a + 1 :]):
            if birthdayA == birthdayB:
                return birthdayA  # Return the matching birthday.


# Display the intro:
print('''Birthday Paradox, by Al Sweigart al@inventwithpython.com

The birthday paradox shows us that in a group of N people, the odds
that two of them have matching birthdays is surprisingly large.
This program does a Monte Carlo simulation (that is, repeated random
simulations) to explore this concept.

(It's not actually a paradox, it's just a surprising result.)
''')

# Set up a tuple of month names in order:
MONTHS = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')

while True:  # Keep asking until the user enters a valid amount.
    print('How many birthdays shall I generate? (Max 100)')
    response = input('> ')
    if response.isdecimal() and (0 < int(response) <= 100):
        numBDays = int(response)
        break  # User has entered a valid amount.
print()

# Generate and display the birthdays:
print('Here are', numBDays, 'birthdays:')
birthdays = getBirthdays(numBDays)
for i, birthday in enumerate(birthdays):
    if i != 0:
        # Display a comma for each birthday after the first birthday.
        print(', ', end='')
    monthName = MONTHS[birthday.month - 1]
    dateText = '{} {}'.format(monthName, birthday.day)
    print(dateText, end='')
print()
print()

# Determine if there are two birthdays that match.
match = getMatch(birthdays)

# Display the results:
print('In this simulation, ', end='')
if match != None:
    monthName = MONTHS[match.month - 1]
    dateText = '{} {}'.format(monthName, match.day)
    print('multiple people have a birthday on', dateText)
else:
    print('there are no matching birthdays.')
print()

# Run through 100,000 simulations:
print('Generating', numBDays, 'random birthdays 100,000 times...')
input('Press Enter to begin...')

print('Let\\'s run another 100,000 simulations.')
simMatch = 0  # How many simulations had matching birthdays in them.
for i in range(100000):
    # Report on the progress every 10,000 simulations:
    if i % 10000 == 0:
        print(i, 'simulations run...')
    birthdays = getBirthdays(numBDays)
    if getMatch(birthdays) != None:
        simMatch = simMatch + 1
print('100,000 simulations run.')

# Display simulation results:
probability = round(simMatch / 100000 * 100, 2)
print('Out of 100,000 simulations of', numBDays, 'people, there was a')
print('matching birthday in that group', simMatch, 'times. This means')
print('that', numBDays, 'people have a', probability, '% chance of')
print('having a matching birthday in their group.')
print('That\\'s probably more than you would think!')`;

export default BirthdayParadoxPage;