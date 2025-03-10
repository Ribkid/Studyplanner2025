import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, BookOpen, Code, Info, FileText, CheckCircle, XCircle, Play, Lightbulb, HelpCircle, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const BagelsGamePage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'game' | 'code' | 'questions'>('code');
  const [userCode, setUserCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [secretNumFixed, setSecretNumFixed] = useState<boolean>(false);
  const [numDigits, setNumDigits] = useState<number>(3);
  const [maxGuesses, setMaxGuesses] = useState<number>(10);
  const [disableRandomize, setDisableRandomize] = useState<boolean>(false);
  const [skipWinCheck, setSkipWinCheck] = useState<boolean>(false);
  const [skipGuessIncrement, setSkipGuessIncrement] = useState<boolean>(false);

  // Function to run the code simulation
  const runCode = () => {
    setIsRunning(true);
    setOutput('');

    setTimeout(() => {
      try {
        // Simulate code execution with different modifications
        let simulationOutput = 'Bagels, a deductive logic game.\n';
        simulationOutput += 'By Al Sweigart al@inventwithpython.com\n\n';
        
        // Extract values from the user's code
        let extractedNumDigits = numDigits;
        let extractedMaxGuesses = maxGuesses;
        
        try {
          // Try to extract NUM_DIGITS from the userCode
          const numDigitsMatch = userCode.match(/NUM_DIGITS\s*=\s*(\d+)/);
          if (numDigitsMatch && numDigitsMatch[1]) {
            extractedNumDigits = parseInt(numDigitsMatch[1]);
          }
          
          // Try to extract MAX_GUESSES from the userCode
          const maxGuessesMatch = userCode.match(/MAX_GUESSES\s*=\s*(\d+)/);
          if (maxGuessesMatch && maxGuessesMatch[1]) {
            extractedMaxGuesses = parseInt(maxGuessesMatch[1]);
          }
        } catch (err) {
          console.error("Error extracting values from code:", err);
        }
        
        // Check for user modifications in the code
        const hasSecretNumFixed = userCode.includes("secretNum = '123'");
        const hasRandomizeDisabled = userCode.includes("# random.shuffle(numbers)");
        const hasWinCheckSkipped = userCode.includes("# if guess == secretNum") || 
                                   userCode.includes("if False");
        const hasGuessIncrementSkipped = userCode.includes("# numGuesses += 1");
        
        if (extractedNumDigits > 10 && !hasRandomizeDisabled) {
          simulationOutput += 'Error: Cannot have more digits than available (0-9)\n';
          simulationOutput += 'This happens because we can only use each digit once, and there are only 10 digits (0-9).\n';
        } else {
          simulationOutput += `I am thinking of a ${extractedNumDigits}-digit number with no repeated digits.\n`;
          simulationOutput += 'Try to guess what it is. Here are some clues:\n';
          simulationOutput += 'When I say:    That means:\n';
          simulationOutput += '  Pico         One digit is correct but in the wrong position.\n';
          simulationOutput += '  Fermi        One digit is correct and in the right position.\n';
          simulationOutput += '  Bagels       No digit is correct.\n\n';
          
          // Secret number simulation
          let secretNumber = '';
          if (hasSecretNumFixed) {
            secretNumber = '123'; // Fixed for demo
            simulationOutput += 'Secret number is fixed to: 123\n';
          } else if (hasRandomizeDisabled) {
            secretNumber = '0123456789'.substring(0, extractedNumDigits);
            simulationOutput += `Secret number is not randomized: ${secretNumber}\n`;
          } else {
            // Simulate random selection
            simulationOutput += 'Secret number is randomly generated\n';
            secretNumber = '427'; // Pretend this was randomly generated
          }
          
          simulationOutput += 'I have thought up a number.\n';
          simulationOutput += ` You have ${extractedMaxGuesses} guesses to get it.\n\n`;
          
          // Simulate some guesses
          let guessCount = 1;
          
          // First guess
          simulationOutput += `Guess #${guessCount}: \n> 123\n`;
          
          if (hasSecretNumFixed) {
            if (hasWinCheckSkipped) {
              simulationOutput += 'Fermi Fermi Fermi\n';
            } else {
              simulationOutput += 'You got it!\n';
              simulationOutput += 'Do you want to play again? (yes or no)\n> no\n';
              simulationOutput += 'Thanks for playing!\n';
            }
          } else {
            simulationOutput += 'Fermi\n';
          }
          
          if (!hasGuessIncrementSkipped) {
            guessCount++;
          } else {
            simulationOutput += '(Note: guess counter not incrementing due to modification)\n';
          }
          
          if (!hasSecretNumFixed || hasWinCheckSkipped) {
            // Second guess
            simulationOutput += `\nGuess #${guessCount}: \n> 456\n`;
            simulationOutput += 'Pico\n';
            
            if (!hasGuessIncrementSkipped) {
              guessCount++;
            }
            
            // Third guess
            simulationOutput += `\nGuess #${guessCount}: \n> 789\n`;
            simulationOutput += 'Bagels\n';
            
            simulationOutput += '\n(Simulation stopped after 3 guesses for brevity)\n';
          }
        }
        
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
      question: "What happens when you change the NUM_DIGITS constant?",
      answer: "Changing NUM_DIGITS alters the length of the secret number. A higher value makes the game harder by increasing possible combinations, while a lower value makes it easier. This affects both the secret number generation and the validation of user guesses.",
      experiment: () => {
        const newValue = numDigits === 3 ? 1 : numDigits === 1 ? 10 : 3;
        setNumDigits(newValue);
        
        // Update the code directly
        const updatedCode = userCode.replace(
          /NUM_DIGITS\s*=\s*\d+/,
          `NUM_DIGITS = ${newValue}`
        );
        setUserCode(updatedCode);
      },
      experimentLabel: `Set NUM_DIGITS to ${numDigits === 3 ? 1 : numDigits === 1 ? 10 : 3}`
    },
    {
      id: 2,
      question: "What happens when you change the MAX_GUESSES constant?",
      answer: "Changing MAX_GUESSES affects how many attempts the player gets to guess the secret number. More guesses makes the game easier, fewer makes it harder. This only affects the game loop logic, not the game mechanics themselves.",
      experiment: () => {
        const newValue = maxGuesses === 10 ? 3 : maxGuesses === 3 ? 100 : 10;
        setMaxGuesses(newValue);
        
        // Update the code directly
        const updatedCode = userCode.replace(
          /MAX_GUESSES\s*=\s*\d+/,
          `MAX_GUESSES = ${newValue}`
        );
        setUserCode(updatedCode);
      },
      experimentLabel: `Set MAX_GUESSES to ${maxGuesses === 10 ? 3 : maxGuesses === 3 ? 100 : 10}`
    },
    {
      id: 3,
      question: "What happens if you set NUM_DIGITS to a number larger than 10?",
      answer: "Since the game uses each digit (0-9) only once, setting NUM_DIGITS larger than 10 would cause an error. There aren't enough unique digits to create a secret number longer than 10 digits without repeating digits.",
      experiment: () => {
        setNumDigits(11);
        
        // Update the code directly
        const updatedCode = userCode.replace(
          /NUM_DIGITS\s*=\s*\d+/,
          `NUM_DIGITS = 11`
        );
        setUserCode(updatedCode);
      },
      experimentLabel: "Set NUM_DIGITS to 11"
    },
    {
      id: 4,
      question: "What happens if you replace secretNum = getSecretNum() with secretNum = '123'?",
      answer: "This makes the secret number always '123' instead of being randomly generated. The game becomes predictable and loses its challenge after the first play, as the player will know the answer for all future games.",
      experiment: () => {
        setSecretNumFixed(!secretNumFixed);
        
        // Update the code directly
        if (!secretNumFixed) {
          // Replace the getSecretNum call with a fixed value
          const updatedCode = userCode.replace(
            /secretNum = getSecretNum\(\)/,
            "secretNum = '123'  # Fixed for demonstration"
          );
          setUserCode(updatedCode);
        } else {
          // Restore the original line
          const updatedCode = userCode.replace(
            /secretNum = '123'.*$/m,
            "secretNum = getSecretNum()"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: secretNumFixed ? "Restore random secret number" : "Fix secret number to '123'"
    },
    {
      id: 5,
      question: "What error message do you get if you delete or comment out numGuesses = 1?",
      answer: "You would get a 'NameError: name 'numGuesses' is not defined' because the code tries to use numGuesses before it's declared. Variables must be defined before they're used in Python.",
      experiment: () => {
        // Update the code directly to comment out or restore the line
        if (userCode.includes("numGuesses = 1")) {
          const updatedCode = userCode.replace(
            /(\s+)numGuesses = 1/,
            "$1# numGuesses = 1  # This line is commented out, will cause NameError"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# numGuesses = 1.*$/m,
            "$1numGuesses = 1"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: userCode.includes("numGuesses = 1") ? 
        "Comment out numGuesses = 1" : 
        "Restore numGuesses = 1"
    },
    {
      id: 6,
      question: "What happens if you delete or comment out random.shuffle(numbers)?",
      answer: "The game would become predictable because the secret number would always be '012...' (the first N digits). The lack of randomization removes the challenge, as the secret number would be the same every time.",
      experiment: () => {
        setDisableRandomize(!disableRandomize);
        
        // Update the code directly
        if (!disableRandomize) {
          const updatedCode = userCode.replace(
            /(\s+)random\.shuffle\(numbers\)/,
            "$1# random.shuffle(numbers)  # This line is commented out"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# random\.shuffle\(numbers\).*$/m,
            "$1random.shuffle(numbers)  # Shuffle them into random order."
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: disableRandomize ? "Restore random.shuffle() function" : "Remove random.shuffle() call"
    },
    {
      id: 7,
      question: "What happens if you delete or comment out 'if guess == secretNum:' and 'return 'You got it!''?",
      answer: "The game would never detect when the player wins. Even with the correct guess, it would continue generating Fermi clues for each correct digit and position, instead of declaring victory.",
      experiment: () => {
        setSkipWinCheck(!skipWinCheck);
        
        // Update the code directly
        if (!skipWinCheck) {
          let updatedCode = userCode.replace(
            /(\s+)if guess == secretNum:/,
            "$1if False:  # Win condition check removed"
          );
          updatedCode = updatedCode.replace(
            /(\s+)return 'You got it!'/,
            "$1return 'You got it!'  # This will never be reached"
          );
          setUserCode(updatedCode);
        } else {
          let updatedCode = userCode.replace(
            /(\s+)if False:.*$/m,
            "$1if guess == secretNum:"
          );
          updatedCode = updatedCode.replace(
            /(\s+)return 'You got it!'.*$/m,
            "$1return 'You got it!'"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: skipWinCheck ? "Restore win condition check" : "Remove win condition check"
    },
    {
      id: 8,
      question: "What happens if you comment out numGuesses += 1?",
      answer: "The game would enter an infinite loop on the same guess number. The guesses counter would never increment, so the player would always be on 'Guess #1' and would never run out of guesses.",
      experiment: () => {
        setSkipGuessIncrement(!skipGuessIncrement);
        
        // Update the code directly
        if (!skipGuessIncrement) {
          const updatedCode = userCode.replace(
            /(\s+)numGuesses \+= 1/,
            "$1# numGuesses += 1  # This line is commented out"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# numGuesses \+= 1.*$/m,
            "$1numGuesses += 1"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: skipGuessIncrement ? "Restore guess counter increment" : "Remove guess counter increment"
    }
  ];

  const resetExperiments = () => {
    setNumDigits(3);
    setMaxGuesses(10);
    setSecretNumFixed(false);
    setDisableRandomize(false);
    setSkipWinCheck(false);
    setSkipGuessIncrement(false);
    setUserCode(initialCode);
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
                <span className="matrix-text">Project #1:</span> Bagels Game Learning
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
          <h2 className="text-2xl font-bold text-white mb-2">Bagels: Deductive Logic Game</h2>
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
            <p className="text-gray-300 mb-2">
              In Bagels, a deductive logic game, you must guess a secret three-digit number based on clues. 
              The game offers one of the following hints in response to your guess:
            </p>
            <ul className="mb-4 space-y-1 pl-8">
              <li className="text-gray-300 list-disc"><span className="text-cyan-400 font-medium">Pico</span> - One digit is correct but in the wrong position</li>
              <li className="text-gray-300 list-disc"><span className="text-green-400 font-medium">Fermi</span> - One digit is correct and in the right position</li>
              <li className="text-gray-300 list-disc"><span className="text-red-400 font-medium">Bagels</span> - No digit is correct</li>
            </ul>
            <p className="text-gray-300 mb-2">
              <strong>Important Note:</strong> This program uses string values that contain numeric digits, not integer values. 
              For example, '426' is a different value than 426. We need string comparison rather than mathematical operations.
            </p>
            <p className="text-gray-300">
              Remember that '0' can be a leading digit: the string '026' is different from '26', but the integer 026 is the same as 26.
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
                onClick={() => setActiveTab('game')}
                className={`${
                  activeTab === 'game'
                    ? 'border-[var(--matrix-color)] text-[var(--matrix-color)]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Play className="h-5 w-5 mr-2" />
                Play the Game
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
                  {(numDigits !== 3 || maxGuesses !== 10 || secretNumFixed || disableRandomize || skipWinCheck || skipGuessIncrement || userCode !== initialCode) && (
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
                    <div className="space-y-1">
                      {numDigits !== 3 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          NUM_DIGITS set to {numDigits}
                        </div>
                      )}
                      {maxGuesses !== 10 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          MAX_GUESSES set to {maxGuesses}
                        </div>
                      )}
                      {secretNumFixed && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Secret number fixed to '123'
                        </div>
                      )}
                      {disableRandomize && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          random.shuffle() disabled
                        </div>
                      )}
                      {skipWinCheck && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Win condition check removed
                        </div>
                      )}
                      {skipGuessIncrement && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Guess counter increment removed
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
                          <Play className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p>Click "Run Simulation" to see the code output</p>
                          <p className="text-sm mt-2">Try different code modifications to see how they affect the game</p>
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
                    <strong className="text-[var(--matrix-color)]">Key Components:</strong> The Bagels game consists of three main functions:
                  </p>
                  <ol className="space-y-2 pl-5 list-decimal">
                    <li>
                      <strong>main()</strong> - Controls the overall game flow, including setup, player guessing, and asking to play again.
                    </li>
                    <li>
                      <strong>getSecretNum()</strong> - Generates a random secret number with no repeated digits.
                    </li>
                    <li>
                      <strong>getClues()</strong> - Compares the player's guess to the secret number and generates appropriate clues.
                    </li>
                  </ol>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Game Logic:</strong> The program generates a secret number with unique digits. The player has a limited number of guesses to figure out this number. After each guess, the program provides clues based on how close the guess is to the secret number.
                  </p>
                  <p>
                    <strong className="text-[var(--matrix-color)]">String vs Integer:</strong> The program uses string operations rather than mathematical operations because:
                  </p>
                  <ul className="space-y-1 pl-5 list-disc">
                    <li>We need to check individual digits and their positions</li>
                    <li>Leading zeros matter (e.g., '042' is different from '42' for our game)</li>
                    <li>String comparison makes it easier to check if a digit is in a particular position</li>
                  </ul>
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
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">How to Use This Explorer:</h5>
                      <p className="text-sm">
                        Click on each question to reveal its answer and experiment options. Use the experiments to see how different code modifications affect the behavior of the game. Run the simulation after each change to observe the effects.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Key Programming Concepts:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>Variable assignment and scope</li>
                        <li>String manipulation and comparison</li>
                        <li>Conditional statements (if/else)</li>
                        <li>Loops (while and for)</li>
                        <li>Functions and return values</li>
                        <li>Random number generation</li>
                        <li>List operations (append, sort, join)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Learning by Experimentation:</h5>
                      <p className="text-sm">
                        The best way to understand code is to modify it and observe the results. Use the provided experiments to see how different changes affect the program's behavior. Try combining multiple modifications to see their combined effects!
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Try on Your Own:</h5>
                      <p className="text-sm">
                        After exploring the provided questions, try to implement these advanced modifications:
                      </p>
                      <ul className="space-y-1 pl-5 list-disc text-sm mt-1">
                        <li>Allow repeated digits in the secret number</li>
                        <li>Add a scoring system based on number of guesses used</li>
                        <li>Include letters as well as digits in the secret code</li>
                        <li>Add a hint system that costs extra guesses but provides additional information</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong className="text-yellow-400">Remember:</strong> In programming, errors and unexpected behaviors are valuable learning opportunities. Don't be afraid to experiment and make mistakes!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'game' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Play className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                Play the Game
              </h3>
              
              <iframe 
                src="https://trinket.io/embed/python/29ef0e3ba2?outputOnly=true&runOption=run" 
                width="100%" 
                height="600" 
                frameBorder="0" 
                marginWidth={0} 
                marginHeight={0} 
                allowFullScreen
                className="rounded-md"
              ></iframe>
              
              <div className="mt-4 bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-white mb-2">Instructions:</h4>
                <p className="text-gray-300 text-sm">
                  Use the interactive console above to play the Bagels game. Enter your guesses when prompted, and use the clues to deduce the secret number.
                  Remember the clue meanings:
                </p>
                <ul className="mt-2 space-y-1 pl-5">
                  <li className="text-gray-300 text-sm"><span className="text-cyan-400 font-medium">Pico</span> - One digit is correct but in the wrong position</li>
                  <li className="text-gray-300 text-sm"><span className="text-green-400 font-medium">Fermi</span> - One digit is correct and in the right position</li>
                  <li className="text-gray-300 text-sm"><span className="text-red-400 font-medium">Bagels</span> - No digit is correct</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const initialCode = `"""Bagels, by Al Sweigart al@inventwithpython.com
A deductive logic game where you must guess a number based on clues.
This code is available at https://nostarch.com/big-book-small-python-programming
A version of this game is featured in the book, "Invent Your Own
Computer Games with Python" https://nostarch.com/inventwithpython
Tags: short, game, puzzle"""

import random

NUM_DIGITS = 3  # (!) Try setting this to 1 or 10.
MAX_GUESSES = 10  # (!) Try setting this to 1 or 100.


def main():
    print('''Bagels, a deductive logic game.
By Al Sweigart al@inventwithpython.com

I am thinking of a {}-digit number with no repeated digits.
Try to guess what it is. Here are some clues:
When I say:    That means:
  Pico         One digit is correct but in the wrong position.
  Fermi        One digit is correct and in the right position.
  Bagels       No digit is correct.

For example, if the secret number was 248 and your guess was 843, the
clues would be Fermi Pico.'''.format(NUM_DIGITS))

    while True:  # Main game loop.
        # This stores the secret number the player needs to guess:
        secretNum = getSecretNum()
        print('I have thought up a number.')
        print(' You have {} guesses to get it.'.format(MAX_GUESSES))

        numGuesses = 1
        while numGuesses <= MAX_GUESSES:
            guess = ''
            # Keep looping until they enter a valid guess:
            while len(guess) != NUM_DIGITS or not guess.isdecimal():
                print('Guess #{}: '.format(numGuesses))
                guess = input('> ')

            clues = getClues(guess, secretNum)
            print(clues)
            numGuesses += 1

            if guess == secretNum:
                break  # They're correct, so break out of this loop.
            if numGuesses > MAX_GUESSES:
                print('You ran out of guesses.')
                print('The answer was {}.'.format(secretNum))

        # Ask player if they want to play again.
        print('Do you want to play again? (yes or no)')
        if not input('> ').lower().startswith('y'):
            break
    print('Thanks for playing!')


def getSecretNum():
    """Returns a string made up of NUM_DIGITS unique random digits."""
    numbers = list('0123456789')  # Create a list of digits 0 to 9.
    random.shuffle(numbers)  # Shuffle them into random order.

    # Get the first NUM_DIGITS digits in the list for the secret number:
    secretNum = ''
    for i in range(NUM_DIGITS):
        secretNum += str(numbers[i])
    return secretNum


def getClues(guess, secretNum):
    """Returns a string with the pico, fermi, bagels clues for a guess
    and secret number pair."""
    if guess == secretNum:
        return 'You got it!'

    clues = []

    for i in range(len(guess)):
        if guess[i] == secretNum[i]:
            # A correct digit is in the correct place.
            clues.append('Fermi')
        elif guess[i] in secretNum:
            # A correct digit is in the incorrect place.
            clues.append('Pico')
    if len(clues) == 0:
        return 'Bagels'  # There are no correct digits at all.
    else:
        # Sort the clues into alphabetical order so their original order
        # doesn't give information away.
        clues.sort()
        # Make a single string from the list of string clues.
        return ' '.join(clues)


# If the program is run (instead of imported), run the game:
if __name__ == '__main__':
    main()`;

export default BagelsGamePage;