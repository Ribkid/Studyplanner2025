import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, BookOpen, Check, Code, Play, Lightbulb, HelpCircle, AlertTriangle, RotateCcw, Info, FileText, MessageSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';

const BitmapMessagePage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'code' | 'questions' | 'simulation'>('code');
  const [userCode, setUserCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  
  // Custom messages and bitmap
  const [userMessage, setUserMessage] = useState<string>('Hello!');
  const [customBitmap, setCustomBitmap] = useState<string>('');
  const [useCustomBitmap, setUseCustomBitmap] = useState<boolean>(false);
  const [printNewline, setPrintNewline] = useState<boolean>(true);

  // Function to run the code simulation
  const runCode = () => {
    setIsRunning(true);
    setOutput('');

    setTimeout(() => {
      try {
        // Extract current bitmap from code
        let bitmap = '';
        try {
          const bitmapMatch = userCode.match(/bitmap = """([\s\S]*?)"""/);
          if (bitmapMatch && bitmapMatch[1]) {
            bitmap = bitmapMatch[1];
          } else {
            bitmap = initialBitmap;
          }
        } catch (err) {
          console.error("Error extracting bitmap from code:", err);
          bitmap = initialBitmap;
        }

        // Check if print() on line 52 is commented out
        const hasPrintStatement = !userCode.includes("# print()  # Print a newline");
        
        // Simulate running the code
        let simulationOutput = 'Bitmap Message, by Al Sweigart al@inventwithpython.com\n';
        simulationOutput += 'Enter the message to display with the bitmap.\n';
        simulationOutput += `> ${userMessage}\n\n`;
        
        if (userMessage === '') {
          simulationOutput += "You must enter a message.";
          setOutput(simulationOutput);
          setIsRunning(false);
          return;
        }
        
        // Process the bitmap and apply the message
        const lines = bitmap.split('\n');
        let result = '';
        
        for (const line of lines) {
          for (let i = 0; i < line.length; i++) {
            const bit = line[i];
            if (bit === ' ') {
              result += ' ';
            } else {
              result += userMessage[i % userMessage.length];
            }
          }
          
          if (hasPrintStatement) {
            result += '\n';
          }
        }
        
        simulationOutput += result;
        setOutput(simulationOutput);
      } catch (error) {
        setOutput(`Error executing code: ${error}`);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  const handleUpdateBitmap = () => {
    if (!useCustomBitmap) {
      return;
    }
    
    // Update the bitmap in the code
    const updatedCode = userCode.replace(
      /bitmap = """[\s\S]*?"""/,
      `bitmap = """\n${customBitmap}\n"""`
    );
    
    setUserCode(updatedCode);
  };

  // Questions from the original text
  const questions = [
    {
      id: 1,
      question: "What happens if the player enters a blank string for the message?",
      answer: "If the player enters a blank string for the message, the program will exit immediately due to the conditional check on line 39: 'if message == '': sys.exit()'. This prevents the program from trying to process a blank message.",
      experiment: () => {
        setUserMessage('');
        setActiveTab('simulation');
      },
      experimentLabel: "Try with a blank message"
    },
    {
      id: 2,
      question: "Does it matter what the nonspace characters are in the bitmap variable's string?",
      answer: "No, it doesn't matter what the nonspace characters are in the bitmap. Any character that is not a space will be replaced by characters from the message. The bitmap only distinguishes between spaces (which remain spaces) and non-spaces (which get replaced by message characters).",
      experiment: () => {
        // Replace all non-space characters with different symbols
        const updatedCode = userCode.replace(
          /bitmap = """[\s\S]*?"""/,
          `bitmap = """\n....................................................................
   ++++++++++++++   +  +++ ++  +      ++++++++++++++++++++++++++++++
   ********************* ** ** *  * ****************************** *
  ##      #################       ##############################
           -------------          --  - ---- -- -------------- -
            @@@@@@@@@            @@@@@@@   @@@@@@@@@@@@@@@@ @ @
             %%%%%%%%           %%%%%%%%%%%%%%%%%%%%%%%%%%  %
    $        $ $$$$ $$$         $$$$$$$$$$$$$$$ $$$$$$  $$ $
                ||||  |         |||||||||||||||   ||| |||  |
                  ^^^^^^         ^^^^^^^^^^^^^    ^^   ^^  ^
                  ********        *************    *  ** ***
                    ////////         ////////          * *** ****
                    ---------         ------  -        ---- -- - --
                    @@@@@@@@@         @@@@@@ @ @           @@@ @   @
                      ^^^^^^          ^^^^^ ^^             ^^^^^   ^
                      %%%%%            %%%% %            %%%%%%%%
                     !!!!              !!!!              !!!!!!!!
                     ````              ``                 ```````   `
                     ???                                       ?    ?
                     ^^     ^                    ^
...................................................................."""`
        );
        setUserCode(updatedCode);
        setActiveTab('code');
      },
      experimentLabel: "Change bitmap characters"
    },
    {
      id: 3,
      question: "What does the i variable created on line 45 represent?",
      answer: "The i variable in 'for i, bit in enumerate(line)' represents the index or position of each character in the current line of the bitmap. This index is used to determine which character from the message to print via 'message[i % len(message)]', ensuring the message repeats as needed.",
      experiment: null,
      experimentLabel: null
    },
    {
      id: 4,
      question: "What bug happens if you delete or comment out print() on line 52?",
      answer: "If you delete or comment out the print() statement on line 52, the program will not print a newline character after each line of the bitmap. This will cause all lines to run together horizontally, making the bitmap pattern unrecognizable. The printed output will be a single long line of text instead of a properly formatted bitmap image.",
      experiment: () => {
        setPrintNewline(!printNewline);
        
        // Update the code by commenting/uncommenting print()
        if (printNewline) {
          const updatedCode = userCode.replace(
            /(\s+)print\(\)  # Print a newline\./,
            "$1# print()  # Print a newline."
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# print\(\)  # Print a newline\./,
            "$1print()  # Print a newline."
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: printNewline ? "Comment out print() statement" : "Restore print() statement"
    }
  ];

  const resetExperiments = () => {
    setUserMessage('Hello!');
    setCustomBitmap('');
    setUseCustomBitmap(false);
    setPrintNewline(true);
    setUserCode(initialCode);
  };

  useEffect(() => {
    if (useCustomBitmap && customBitmap) {
      handleUpdateBitmap();
    }
  }, [useCustomBitmap, customBitmap]);

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
                <span className="matrix-text">Project #3:</span> Bitmap Message
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
          <h2 className="text-2xl font-bold text-white mb-2">Bitmap Message Display</h2>
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
              This program uses a multiline string as a bitmap, a 2D image with only two possible colors for each pixel, 
              to determine how it should display a message from the user. In this bitmap, space characters represent an empty space, 
              and all other characters are replaced by characters in the user's message.
            </p>
            <p className="text-gray-300 mb-3">
              The binary simplicity of the space-or-message-characters system makes it good for beginners. 
              The provided bitmap resembles a world map, but you can change this to any image you'd like.
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Try experimenting with different messages!</strong> The characters in your 
              message will repeat as needed to fill the entire bitmap pattern.
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
                Run Bitmap
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
                  {(userMessage !== 'Hello!' || useCustomBitmap || !printNewline || userCode !== initialCode) && (
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
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-gray-800/90 border border-gray-700 rounded-md p-3 mb-2">
                    <h4 className="font-medium text-gray-200 mb-1">Code Modifications:</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Edit the code directly in the editor below, or use the experiment buttons in the 
                      "Exploration Questions" tab to make specific changes.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="message-input" className="block text-sm font-medium text-gray-300 mb-1">
                          Message to Display:
                        </label>
                        <input
                          id="message-input"
                          type="text"
                          value={userMessage}
                          onChange={(e) => setUserMessage(e.target.value)}
                          placeholder="Enter a message to display"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="custom-bitmap-toggle"
                          type="checkbox"
                          checked={useCustomBitmap}
                          onChange={(e) => setUseCustomBitmap(e.target.checked)}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                        />
                        <label htmlFor="custom-bitmap-toggle" className="text-sm font-medium text-gray-300">
                          Use custom bitmap pattern
                        </label>
                      </div>
                      
                      {useCustomBitmap && (
                        <div>
                          <label htmlFor="custom-bitmap" className="block text-sm font-medium text-gray-300 mb-1">
                            Custom Bitmap Pattern:
                          </label>
                          <textarea
                            id="custom-bitmap"
                            value={customBitmap}
                            onChange={(e) => setCustomBitmap(e.target.value)}
                            className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                            placeholder="Enter your custom bitmap pattern here..."
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Spaces will remain spaces, all other characters will be replaced with your message.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 mt-4">
                      {userMessage !== 'Hello!' && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Custom message: "{userMessage}"
                        </div>
                      )}
                      {useCustomBitmap && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Using custom bitmap pattern
                        </div>
                      )}
                      {!printNewline && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          print() statement commented out (newlines disabled)
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
                  <h3 className="font-medium text-gray-200 mb-2">Program Output:</h3>
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
                          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p>Click "Run Code" to see the bitmap message output</p>
                          <p className="text-sm mt-2">Try different messages to see how they appear in the bitmap pattern</p>
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
                    <strong className="text-[var(--matrix-color)]">Bitmap Concept:</strong> A bitmap is fundamentally a grid where each cell or pixel can be in one of two states. In this program, a space character represents a "blank" state, while any other character represents a "filled" state that will be replaced by the message.
                  </p>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Key Operations:</strong> The program does the following:
                  </p>
                  <ol className="space-y-2 pl-5 list-decimal">
                    <li>
                      Defines a multiline string <code>bitmap</code> that visually represents a world map using ASCII characters.
                    </li>
                    <li>
                      Asks the user for a message to display within the bitmap.
                    </li>
                    <li>
                      Processes each character in the bitmap:
                      <ul className="pl-5 list-disc mt-1">
                        <li>Spaces remain spaces (preserving the "empty" parts of the image)</li>
                        <li>Any other character is replaced with a character from the user's message</li>
                      </ul>
                    </li>
                    <li>
                      The message repeats as needed using modular arithmetic: <code>message[i % len(message)]</code> cycles through the message characters.
                    </li>
                  </ol>
                  <p>
                    <strong className="text-[var(--matrix-color)]">String Processing:</strong> The program uses string manipulation techniques to:
                  </p>
                  <ul className="space-y-1 pl-5 list-disc">
                    <li>Iterate through each line in the bitmap using <code>splitlines()</code></li>
                    <li>Iterate through each character in each line using <code>enumerate(line)</code></li>
                    <li>Use modulo operation (<code>%</code>) to cycle through message characters indefinitely</li>
                    <li>Control output formatting with <code>end=''</code> parameter in <code>print()</code></li>
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
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">ASCII Art and Bitmaps:</h5>
                      <p className="text-sm">
                        ASCII art is a technique of creating images using text characters. Bitmap message programs like this one use text patterns as templates where some characters (in this case, spaces) remain unchanged while others are replaced by message characters.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Key Programming Concepts:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>String manipulation and multiline string handling</li>
                        <li>Looping through characters and lines of text</li>
                        <li>Conditional statements for character replacement</li>
                        <li>Modular arithmetic for cycling through message characters</li>
                        <li>Text-based graphical output formatting</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Creative Possibilities:</h5>
                      <p className="text-sm">
                        You can create your own ASCII art patterns for the bitmap. Try making logos, shapes, or text banners. Any non-space character in your pattern will be replaced with message characters, while spaces will remain as spaces.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Try These Extensions:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>Create your own custom bitmap patterns for different messages</li>
                        <li>Modify the code to use different characters for different parts of the pattern</li>
                        <li>Add color to the output for a more visually appealing display</li>
                        <li>Create an animation by changing the message or pattern over time</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong className="text-yellow-400">Tip:</strong> When creating your own bitmap patterns, make sure to maintain consistent line lengths for the best visual results. Uneven line lengths can cause the pattern to appear distorted.
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
                Bitmap Message Generator
              </h3>
              
              <div className="mb-6 bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Message Configuration</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="sim-message" className="block text-sm font-medium text-gray-300 mb-1">
                          Enter Your Message:
                        </label>
                        <input
                          id="sim-message"
                          type="text"
                          value={userMessage}
                          onChange={(e) => setUserMessage(e.target.value)}
                          placeholder="Type a message to display in the bitmap"
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          This message will repeat throughout the pattern, replacing all non-space characters.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Bitmap Options:
                        </label>
                        <div className="flex items-center">
                          <input
                            id="use-world-map"
                            type="radio"
                            name="bitmap-choice"
                            checked={!useCustomBitmap}
                            onChange={() => setUseCustomBitmap(false)}
                            className="mr-2 h-4 w-4"
                          />
                          <label htmlFor="use-world-map" className="text-gray-300">
                            Use World Map Pattern
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="use-custom-pattern"
                            type="radio"
                            name="bitmap-choice"
                            checked={useCustomBitmap}
                            onChange={() => setUseCustomBitmap(true)}
                            className="mr-2 h-4 w-4"
                          />
                          <label htmlFor="use-custom-pattern" className="text-gray-300">
                            Use Custom Pattern
                          </label>
                        </div>
                      </div>
                      
                      {useCustomBitmap && (
                        <div>
                          <label htmlFor="sim-custom-bitmap" className="block text-sm font-medium text-gray-300 mb-1">
                            Custom Bitmap Pattern:
                          </label>
                          <textarea
                            id="sim-custom-bitmap"
                            value={customBitmap}
                            onChange={(e) => setCustomBitmap(e.target.value)}
                            className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                            placeholder="Create your own pattern using any characters. Spaces will remain spaces, all other characters will be replaced."
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="cyber-button px-4 py-2 w-full flex items-center justify-center"
                      >
                        {isRunning ? (
                          <>
                            <div className="h-4 w-4 border-2 border-gray-400 border-t-[var(--matrix-color)] rounded-full animate-spin mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Generate Bitmap Message
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-3">Pattern Examples</h4>
                    <div className="bg-gray-900 rounded-md p-4 h-[300px] overflow-y-auto space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">World Map (Default):</h5>
                        <pre className="text-xs text-gray-400 whitespace-pre">
{`   **************   *  *** **  *      ******************************
   ********************* ** ** *  * ****************************** *
  **      *****************       ******************************
           *************          **  * **** ** ************** *
            *********            *******   **************** * *
             ********           ***************************  *
    *        * **** ***         *************** ******  ** *
                ****  *         ***************   *** ***  *
                  ******         *************    **   **  *
                  ********        *************    *  ** ***`}
                        </pre>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">Heart Pattern:</h5>
                        <pre className="text-xs text-gray-400 whitespace-pre">
{`  *****     *****  
 *******   ******* 
********* *********
*******************
*******************
 *****************
  ***************
   *************
    ***********
     *********
      *******
       *****
        ***
         *`}
                        </pre>
                        <button 
                          onClick={() => {
                            setCustomBitmap(`  *****     *****  
 *******   ******* 
********* *********
*******************
*******************
 *****************
  ***************
   *************
    ***********
     *********
      *******
       *****
        ***
         *`);
                            setUseCustomBitmap(true);
                          }}
                          className="text-xs text-[var(--matrix-color)] hover:underline mt-1"
                        >
                          Use this pattern
                        </button>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">Text Banner:</h5>
                        <pre className="text-xs text-gray-400 whitespace-pre">
{`#######   #     #   #######   #     #    ####    #     # 
   #      ##    #      #      ##    #   #    #   ##    # 
   #      # #   #      #      # #   #   #        # #   # 
   #      #  #  #      #      #  #  #   #        #  #  # 
   #      #   # #      #      #   # #   #        #   # # 
   #      #    ##      #      #    ##   #    #   #    ## 
#######   #     #      #      #     #    ####    #     #`}
                        </pre>
                        <button 
                          onClick={() => {
                            setCustomBitmap(`#######   #     #   #######   #     #    ####    #     # 
   #      ##    #      #      ##    #   #    #   ##    # 
   #      # #   #      #      # #   #   #        # #   # 
   #      #  #  #      #      #  #  #   #        #  #  # 
   #      #   # #      #      #   # #   #        #   # # 
   #      #    ##      #      #    ##   #    #   #    ## 
#######   #     #      #      #     #    ####    #     #`);
                            setUseCustomBitmap(true);
                          }}
                          className="text-xs text-[var(--matrix-color)] hover:underline mt-1"
                        >
                          Use this pattern
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-white mb-3 flex items-center">
                  <FileText className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                  Generated Output
                </h4>
                
                {output ? (
                  <pre className="font-mono text-sm text-green-400 bg-black p-4 rounded-md h-96 overflow-auto">{output}</pre>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-black rounded-md">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Generate a bitmap message to see the result here</p>
                      <p className="text-sm mt-2">Click the "Generate Bitmap Message" button above</p>
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

// Initial bitmap pattern (world map)
const initialBitmap = `
....................................................................
   **************   *  *** **  *      ******************************
   ********************* ** ** *  * ****************************** *
  **      *****************       ******************************
           *************          **  * **** ** ************** *
            *********            *******   **************** * *
             ********           ***************************  *
    *        * **** ***         *************** ******  ** *
                ****  *         ***************   *** ***  *
                  ******         *************    **   **  *
                  ********        *************    *  ** ***
                    ********         ********          * *** ****
                    *********         ******  *        **** ** * **
                    *********         ****** * *           *** *   *
                      ******          ***** **             *****   *
                      *****            **** *            ********
                     *****             ****              *********
                     ****              **                 *******   *
                     ***                                       *    *
                     **     *                    *
....................................................................`;

const initialCode = `"""Bitmap Message, by Al Sweigart al@inventwithpython.com
Displays a text message according to the provided bitmap image.
This code is available at https://nostarch.com/big-book-small-python-programming
Tags: tiny, beginner, artistic"""

import sys

# (!) Try changing this multiline string to any image you like:

# There are 68 periods along the top and bottom of this string:
# (You can also copy and paste this string from
# https://inventwithpython.com/bitmapworld.txt)
bitmap = """
....................................................................
   **************   *  *** **  *      ******************************
   ********************* ** ** *  * ****************************** *
  **      *****************       ******************************
           *************          **  * **** ** ************** *
            *********            *******   **************** * *
             ********           ***************************  *
    *        * **** ***         *************** ******  ** *
                ****  *         ***************   *** ***  *
                  ******         *************    **   **  *
                  ********        *************    *  ** ***
                    ********         ********          * *** ****
                    *********         ******  *        **** ** * **
                    *********         ****** * *           *** *   *
                      ******          ***** **             *****   *
                      *****            **** *            ********
                     *****             ****              *********
                     ****              **                 *******   *
                     ***                                       *    *
                     **     *                    *
...................................................................."""

print('Bitmap Message, by Al Sweigart al@inventwithpython.com')
print('Enter the message to display with the bitmap.')
message = input('> ')
if message == '':
    sys.exit()

# Loop over each line in the bitmap:
for line in bitmap.splitlines():
    # Loop over each character in the line:
    for i, bit in enumerate(line):
        if bit == ' ':
            # Print an empty space since there's a space in the bitmap:
            print(' ', end='')
        else:
            # Print a character from the message:
            print(message[i % len(message)], end='')
    print()  # Print a newline.`;

export default BitmapMessagePage;