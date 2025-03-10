import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, BookOpen, Check, Code, Play, Lightbulb, HelpCircle, AlertTriangle, RotateCcw, Info, MonitorPlay } from 'lucide-react';
import { useUser } from '../context/UserContext';

const BouncingDVDLogoPage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'code' | 'questions' | 'simulation'>('code');
  const [userCode, setUserCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  
  // Parameters that can be modified
  const [numLogos, setNumLogos] = useState<number>(5);
  const [pauseAmount, setPauseAmount] = useState<number>(0.2);
  const [useReducedColors, setUseReducedColors] = useState<boolean>(false);
  const [useCustomDimensions, setUseCustomDimensions] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(80);
  const [customHeight, setCustomHeight] = useState<number>(25);

  // Function to run the code simulation
  const runCode = () => {
    setIsRunning(true);
    setOutput('');

    setTimeout(() => {
      try {
        // Extract parameters from the code
        let extractedNumLogos = numLogos;
        let extractedPauseAmount = pauseAmount;
        let extractedColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
        let extractedWidth = customWidth;
        let extractedHeight = customHeight;
        
        try {
          // Try to extract NUMBER_OF_LOGOS from code
          const numLogosMatch = userCode.match(/NUMBER_OF_LOGOS\s*=\s*(\d+)/);
          if (numLogosMatch && numLogosMatch[1]) {
            extractedNumLogos = parseInt(numLogosMatch[1]);
          }
          
          // Try to extract PAUSE_AMOUNT from code
          const pauseAmountMatch = userCode.match(/PAUSE_AMOUNT\s*=\s*([0-9.]+)/);
          if (pauseAmountMatch && pauseAmountMatch[1]) {
            extractedPauseAmount = parseFloat(pauseAmountMatch[1]);
          }
          
          // Check if using reduced colors
          if (userCode.includes("COLORS = ['red', 'cyan']") || 
              userCode.includes("COLORS = ['red']")) {
            extractedColors = userCode.includes("COLORS = ['red', 'cyan']") ? 
              ['red', 'cyan'] : ['red'];
          }
          
          // Check for custom dimensions
          const widthHeightMatch = userCode.match(/WIDTH, HEIGHT = (\d+), (\d+)/);
          if (widthHeightMatch && widthHeightMatch[1] && widthHeightMatch[2]) {
            extractedWidth = parseInt(widthHeightMatch[1]);
            extractedHeight = parseInt(widthHeightMatch[2]);
          }
        } catch (err) {
          console.error("Error extracting values from code:", err);
        }
        
        // Simulate running the Bouncing DVD Logo program
        let simulationOutput = 'Bouncing DVD Logo, by Al Sweigart al@inventwithpython.com\n';
        
        // Generate a simple ASCII art simulation of bouncing DVD logos
        simulationOutput += '\n[Simulation of DVD Logo bouncing. Press Ctrl-C to stop.]\n\n';
        
        // Create a virtual screen for the simulation
        const width = Math.min(extractedWidth, 80);  // Limit to reasonable size
        const height = Math.min(extractedHeight, 25);
        
        // Create a virtual representation of the logos
        const logos = [];
        for (let i = 0; i < extractedNumLogos; i++) {
          logos.push({
            x: Math.floor(Math.random() * (width - 4)),
            y: Math.floor(Math.random() * (height - 4)),
            // Make sure x is even (as per original code)
            direction: ['ur', 'ul', 'dr', 'dl'][Math.floor(Math.random() * 4)],
            color: extractedColors[Math.floor(Math.random() * extractedColors.length)]
          });
        }
        
        // Simulate a few frames of the animation
        let cornerBounces = 0;
        const frames = Math.min(10, 10 / extractedPauseAmount);  // Limit to 10 frames or fewer for faster pause amounts
        
        for (let frame = 0; frame < frames; frame++) {
          // Create a screen buffer
          const screen = Array(height).fill().map(() => Array(width).fill(' '));
          
          // Update logo positions and handle bounces
          for (const logo of logos) {
            // Check for corner bounces
            if ((logo.x === 0 && logo.y === 0) || 
                (logo.x === 0 && logo.y === height - 1) ||
                (logo.x === width - 3 && logo.y === 0) ||
                (logo.x === width - 3 && logo.y === height - 1)) {
              cornerBounces++;
              
              // Update direction based on which corner
              if (logo.x === 0 && logo.y === 0) logo.direction = 'dr';
              else if (logo.x === 0 && logo.y === height - 1) logo.direction = 'ur';
              else if (logo.x === width - 3 && logo.y === 0) logo.direction = 'dl';
              else if (logo.x === width - 3 && logo.y === height - 1) logo.direction = 'ul';
              
              // Change color on bounce
              logo.color = extractedColors[Math.floor(Math.random() * extractedColors.length)];
            }
            // Check for bounces off edges
            else if (logo.x === 0) {
              logo.direction = logo.direction === 'ul' ? 'ur' : 'dr';
              logo.color = extractedColors[Math.floor(Math.random() * extractedColors.length)];
            }
            else if (logo.x === width - 3) {
              logo.direction = logo.direction === 'ur' ? 'ul' : 'dl';
              logo.color = extractedColors[Math.floor(Math.random() * extractedColors.length)];
            }
            else if (logo.y === 0) {
              logo.direction = logo.direction === 'ur' ? 'dr' : 'dl';
              logo.color = extractedColors[Math.floor(Math.random() * extractedColors.length)];
            }
            else if (logo.y === height - 1) {
              logo.direction = logo.direction === 'dr' ? 'ur' : 'ul';
              logo.color = extractedColors[Math.floor(Math.random() * extractedColors.length)];
            }
            
            // Move the logo
            if (logo.direction === 'ur') {
              logo.x += 2;
              logo.y -= 1;
            } else if (logo.direction === 'ul') {
              logo.x -= 2;
              logo.y -= 1;
            } else if (logo.direction === 'dr') {
              logo.x += 2;
              logo.y += 1;
            } else if (logo.direction === 'dl') {
              logo.x -= 2;
              logo.y += 1;
            }
            
            // Draw the logo to buffer if in bounds
            if (logo.x >= 0 && logo.x < width - 2 && logo.y >= 0 && logo.y < height) {
              // Place "DVD" at the position
              screen[logo.y][logo.x] = 'D';
              if (logo.x + 1 < width) screen[logo.y][logo.x + 1] = 'V';
              if (logo.x + 2 < width) screen[logo.y][logo.x + 2] = 'D';
            }
          }
          
          // Build the output frame and add to simulation output
          simulationOutput += `Frame ${frame + 1}, Corner bounces: ${cornerBounces}\n`;
          simulationOutput += '╔' + '═'.repeat(width) + '╗\n';
          for (let y = 0; y < height; y++) {
            simulationOutput += '║' + screen[y].join('') + '║\n';
          }
          simulationOutput += '╚' + '═'.repeat(width) + '╝\n\n';
        }
        
        simulationOutput += `Simulation complete. DVD logos bounced ${cornerBounces} times off corners.\n`;
        simulationOutput += `(In a real run, this would continue until you press Ctrl-C to stop.)\n`;
        
        if (extractedNumLogos === 1) {
          simulationOutput += `\nNote: With only 1 logo, it takes much longer on average for a corner bounce to occur.\n`;
        } else if (extractedNumLogos > 20) {
          simulationOutput += `\nNote: With ${extractedNumLogos} logos, the screen gets very crowded quickly!\n`;
        }
        
        if (extractedPauseAmount === 0) {
          simulationOutput += `\nWith PAUSE_AMOUNT = 0, the animation runs at maximum speed, which might be hard to follow.\n`;
        } else if (extractedPauseAmount > 1.0) {
          simulationOutput += `\nWith PAUSE_AMOUNT = ${extractedPauseAmount}, the animation runs quite slowly.\n`;
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
      question: "What happens if you change WIDTH, HEIGHT = bext.size() on line 20 to WIDTH, HEIGHT = 10, 5?",
      answer: "Changing the WIDTH and HEIGHT to fixed values (10, 5) makes the program use a very small screen size (10 columns by 5 rows) instead of automatically detecting the terminal size. This creates a tiny play area where the DVD logos bounce around, making corner hits more frequent but also making it harder to see the animation clearly due to the constrained space.",
      experiment: () => {
        setUseCustomDimensions(!useCustomDimensions);
        
        // Update the code
        if (!useCustomDimensions) {
          const updatedCode = userCode.replace(
            /WIDTH, HEIGHT = bext\.size\(\)/,
            `WIDTH, HEIGHT = ${customWidth}, ${customHeight}`
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /WIDTH, HEIGHT = \d+, \d+/,
            "WIDTH, HEIGHT = bext.size()"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: useCustomDimensions ? "Use terminal size detection" : "Use custom dimensions (10, 5)"
    },
    {
      id: 2,
      question: "What happens if you replace DIR: random.choice(DIRECTIONS) on line 52 with DIR: DOWN_RIGHT?",
      answer: "If you replace random direction selection with DOWN_RIGHT, all DVD logos will start moving in the down-right direction instead of random directions. This makes the initial movement predictable, though the logos will still bounce in different directions when they hit walls or corners.",
      experiment: () => {
        // Update the code to change random direction to fixed DOWN_RIGHT
        if (userCode.includes("DIR: random.choice(DIRECTIONS)")) {
          const updatedCode = userCode.replace(
            /DIR: random\.choice\(DIRECTIONS\)/,
            "DIR: DOWN_RIGHT"
          );
          setUserCode(updatedCode);
        } else if (userCode.includes("DIR: DOWN_RIGHT")) {
          const updatedCode = userCode.replace(
            /DIR: DOWN_RIGHT/,
            "DIR: random.choice(DIRECTIONS)"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: userCode.includes("DIR: random.choice(DIRECTIONS)") ? 
        "Set all logos to DOWN_RIGHT" : "Restore random directions"
    },
    {
      id: 3,
      question: "How can you make the 'Corner bounces:' text not appear on the screen?",
      answer: "To prevent the 'Corner bounces:' text from appearing, you would need to comment out or remove lines 95-97 which display the count of corner bounces. These lines include `bext.goto(5, 0)`, `bext.fg('white')`, and the `print('Corner bounces:', cornerBounces, end='')` statement.",
      experiment: () => {
        // Update the code to comment out the corner bounce display
        if (userCode.includes("print('Corner bounces:', cornerBounces, end='')")) {
          const updatedCode = userCode.replace(
            /(\s+)(bext\.goto\(5, 0\))/,
            "$1# $2"
          ).replace(
            /(\s+)(bext\.fg\('white'\))/,
            "$1# $2"
          ).replace(
            /(\s+)(print\('Corner bounces:', cornerBounces, end=''\))/,
            "$1# $2"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# (bext\.goto\(5, 0\))/,
            "$1$2"
          ).replace(
            /(\s+)# (bext\.fg\('white'\))/,
            "$1$2"
          ).replace(
            /(\s+)# (print\('Corner bounces:', cornerBounces, end=''\))/,
            "$1$2"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: userCode.includes("print('Corner bounces:', cornerBounces, end='')") ? 
        "Hide corner bounce counter" : "Show corner bounce counter"
    },
    {
      id: 4,
      question: "What error message do you get if you delete or comment out cornerBounces = 0 on line 57?",
      answer: "If you delete or comment out `cornerBounces = 0` on line 57, you would get a 'NameError: name 'cornerBounces' is not defined' when the program tries to increment cornerBounces (using cornerBounces += 1) when a logo hits a corner. This happens because the variable would never be initialized before it's used.",
      experiment: () => {
        // Comment out or restore the cornerBounces initialization
        if (userCode.includes("cornerBounces = 0")) {
          const updatedCode = userCode.replace(
            /(\s+)(cornerBounces = 0.*$)/m,
            "$1# $2  # This will cause a NameError"
          );
          setUserCode(updatedCode);
        } else {
          const updatedCode = userCode.replace(
            /(\s+)# (cornerBounces = 0.*$)/m,
            "$1$2"
          );
          setUserCode(updatedCode);
        }
      },
      experimentLabel: userCode.includes("cornerBounces = 0") ? 
        "Comment out cornerBounces initialization" : "Restore cornerBounces initialization"
    }
  ];

  const resetExperiments = () => {
    setNumLogos(5);
    setPauseAmount(0.2);
    setUseReducedColors(false);
    setUseCustomDimensions(false);
    setCustomWidth(80);
    setCustomHeight(25);
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
                <span className="matrix-text">Project #5:</span> Bouncing DVD Logo
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
          <h2 className="text-2xl font-bold text-white mb-2">Bouncing DVD Logo Animation</h2>
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
              This program simulates the classic DVD logo that bounces around the screen, changing color when it hits an edge. 
              The program also tracks how many times the logo hits a corner. This is a nostalgic reference to DVD player 
              screen savers from the early 2000s, where watching and waiting for the logo to perfectly hit a corner became a popular pastime.
            </p>
            <p className="text-gray-300 mb-3">
              The simulation uses the bext module to control terminal colors and cursor position, creating a simple 
              but effective animation. Multiple DVD logos bounce around at different speeds and directions, each logo changing color 
              whenever it hits an edge or corner of the screen.
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Note:</strong> The actual program runs until you press Ctrl-C to stop it, 
              but our simulation will show just a few frames of the animation.
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
                  {(numLogos !== 5 || pauseAmount !== 0.2 || useReducedColors || useCustomDimensions || userCode !== initialCode) && (
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
                    <h4 className="font-medium text-gray-200 mb-1">Code Modifications:</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Edit the code directly in the editor below, or use these controls to modify key parameters.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="num-logos" className="block text-sm font-medium text-gray-300 mb-1">
                          Number of Logos:
                        </label>
                        <div className="flex items-center">
                          <input
                            id="num-logos"
                            type="range"
                            min="1"
                            max="50"
                            value={numLogos}
                            onChange={(e) => setNumLogos(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                          />
                          <span className="ml-2 text-white font-mono w-8 text-center">{numLogos}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="pause-amount" className="block text-sm font-medium text-gray-300 mb-1">
                          Pause Amount:
                        </label>
                        <div className="flex items-center">
                          <input
                            id="pause-amount"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={pauseAmount}
                            onChange={(e) => setPauseAmount(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                          />
                          <span className="ml-2 text-white font-mono w-8 text-center">{pauseAmount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="reduced-colors"
                          type="checkbox"
                          checked={useReducedColors}
                          onChange={() => {
                            setUseReducedColors(!useReducedColors);
                            
                            // Update the code
                            if (!useReducedColors) {
                              const updatedCode = userCode.replace(
                                /COLORS = \[.*?\]/,
                                "COLORS = ['red', 'cyan']"
                              );
                              setUserCode(updatedCode);
                            } else {
                              const updatedCode = userCode.replace(
                                /COLORS = \[.*?\]/,
                                "COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']"
                              );
                              setUserCode(updatedCode);
                            }
                          }}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                        />
                        <label htmlFor="reduced-colors" className="text-sm font-medium text-gray-300">
                          Use fewer colors
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="custom-dimensions"
                          type="checkbox"
                          checked={useCustomDimensions}
                          onChange={() => {
                            setUseCustomDimensions(!useCustomDimensions);
                            
                            // Update the code
                            if (!useCustomDimensions) {
                              const updatedCode = userCode.replace(
                                /WIDTH, HEIGHT = bext\.size\(\)/,
                                `WIDTH, HEIGHT = ${customWidth}, ${customHeight}`
                              );
                              setUserCode(updatedCode);
                            } else {
                              const updatedCode = userCode.replace(
                                /WIDTH, HEIGHT = \d+, \d+/,
                                "WIDTH, HEIGHT = bext.size()"
                              );
                              setUserCode(updatedCode);
                            }
                          }}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--matrix-color)] focus:ring-[var(--matrix-color)]"
                        />
                        <label htmlFor="custom-dimensions" className="text-sm font-medium text-gray-300">
                          Use custom dimensions instead of terminal size
                        </label>
                      </div>
                      
                      {useCustomDimensions && (
                        <div className="grid grid-cols-2 gap-2 pl-6 pt-2">
                          <div>
                            <label htmlFor="custom-width" className="block text-xs font-medium text-gray-400 mb-1">
                              Width:
                            </label>
                            <input
                              id="custom-width"
                              type="number"
                              min="10"
                              max="120"
                              value={customWidth}
                              onChange={(e) => {
                                const newWidth = parseInt(e.target.value);
                                setCustomWidth(newWidth);
                                
                                // Update the code
                                const updatedCode = userCode.replace(
                                  /WIDTH, HEIGHT = (\d+), (\d+)/,
                                  `WIDTH, HEIGHT = ${newWidth}, ${customHeight}`
                                );
                                setUserCode(updatedCode);
                              }}
                              className="w-full py-1 px-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="custom-height" className="block text-xs font-medium text-gray-400 mb-1">
                              Height:
                            </label>
                            <input
                              id="custom-height"
                              type="number"
                              min="5"
                              max="40"
                              value={customHeight}
                              onChange={(e) => {
                                const newHeight = parseInt(e.target.value);
                                setCustomHeight(newHeight);
                                
                                // Update the code
                                const updatedCode = userCode.replace(
                                  /WIDTH, HEIGHT = (\d+), (\d+)/,
                                  `WIDTH, HEIGHT = ${customWidth}, ${newHeight}`
                                );
                                setUserCode(updatedCode);
                              }}
                              className="w-full py-1 px-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        // Update the NUMBER_OF_LOGOS and PAUSE_AMOUNT in the code
                        let updatedCode = userCode;
                        
                        updatedCode = updatedCode.replace(
                          /NUMBER_OF_LOGOS = \d+/,
                          `NUMBER_OF_LOGOS = ${numLogos}`
                        );
                        
                        updatedCode = updatedCode.replace(
                          /PAUSE_AMOUNT = [0-9.]+/,
                          `PAUSE_AMOUNT = ${pauseAmount}`
                        );
                        
                        setUserCode(updatedCode);
                      }}
                      className="mt-4 bg-gray-700 text-gray-300 hover:bg-gray-600 px-4 py-2 rounded text-sm w-full"
                    >
                      Apply Parameter Changes to Code
                    </button>
                    
                    <div className="space-y-1 mt-4">
                      {numLogos !== 5 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Number of logos set to {numLogos}
                        </div>
                      )}
                      {pauseAmount !== 0.2 && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Pause amount set to {pauseAmount}
                        </div>
                      )}
                      {useReducedColors && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Using fewer colors
                        </div>
                      )}
                      {useCustomDimensions && (
                        <div className="text-sm text-[var(--matrix-color)] flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Using custom dimensions: {customWidth}x{customHeight}
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
                        <p className="mt-4 text-gray-400">Running simulation...</p>
                      </div>
                    ) : output ? (
                      <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                    ) : (
                      <div className="text-gray-500 h-full flex items-center justify-center">
                        <div className="text-center">
                          <MonitorPlay className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p>Click "Run Simulation" to see the DVD logo animation</p>
                          <p className="text-sm mt-2">Try different configurations to see how they affect the behavior</p>
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
                    <strong className="text-[var(--matrix-color)]">Animation Technique:</strong> This program creates a colorful animation in the terminal by using cursor positioning and colored text. It demonstrates how to create simple animations without needing graphics libraries.
                  </p>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Key Components:</strong> The program is built around these core features:
                  </p>
                  <ol className="space-y-2 pl-5 list-decimal">
                    <li>
                      <strong>Terminal Setup:</strong> The code uses the bext module for terminal manipulation, getting the dimensions of the terminal window to define the boundaries for the animation.
                    </li>
                    <li>
                      <strong>Direction System:</strong> Each DVD logo has a direction (UP_RIGHT, UP_LEFT, DOWN_RIGHT, DOWN_LEFT) that determines how it moves, and this direction changes when the logo hits the edges of the screen.
                    </li>
                    <li>
                      <strong>Logo Representation:</strong> Each logo is stored as a dictionary containing its position (X, Y), color, and direction. This makes it easy to track multiple logos simultaneously.
                    </li>
                    <li>
                      <strong>Collision Detection:</strong> The program checks if logos hit the edges or corners of the screen, changing their direction and color when they do.
                    </li>
                  </ol>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Interesting Features:</strong> The program tracks how many times a logo bounces off a corner, which is a nod to the popular pastime of watching DVD screensavers to see if the logo would perfectly hit a corner of the screen.
                  </p>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Optimization:</strong> The program uses several optimization techniques:
                  </p>
                  <ul className="space-y-1 pl-5 list-disc">
                    <li>Only erasing and redrawing logos at their old and new positions, not redrawing the entire screen</li>
                    <li>Using conditional checks to ensure logos stay within the screen boundaries</li>
                    <li>Handling the special case for Windows terminals where the last column can't be used without adding a newline</li>
                  </ul>
                  <p>
                    <strong className="text-[var(--matrix-color)]">Error Handling:</strong> The program uses a try-except block to catch keyboard interrupts (Ctrl-C), allowing for clean program termination when the user wants to exit.
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
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Terminal Graphics and Animation:</h5>
                      <p className="text-sm">
                        This program demonstrates how to create animations in a text terminal. Despite the limitations of a text environment, you can create engaging visuals with cursor positioning, colored text, and clever use of timing.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Key Programming Concepts:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>Dictionary data structures for tracking multiple objects</li>
                        <li>Animation using terminal positioning and timing</li>
                        <li>Collision detection and response</li>
                        <li>Event-based programming (handling when logos hit edges)</li>
                        <li>Random generation for colors and positions</li>
                        <li>Main loop structure for continuous animation</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Popular Questions to Explore:</h5>
                      <p className="text-sm">
                        Explore the following aspects of the program to deepen your understanding:
                      </p>
                      <ul className="space-y-1 pl-5 list-disc text-sm mt-1">
                        <li>How does increasing or decreasing the number of logos affect the animation?</li>
                        <li>What happens if you change the PAUSE_AMOUNT to a very small or very large value?</li>
                        <li>How would the program behave if logos could overlap without collision?</li>
                        <li>What modifications would allow the program to run on different terminal sizes?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-[var(--matrix-color)] font-medium mb-1">Extension Ideas:</h5>
                      <ul className="space-y-1 pl-5 list-disc text-sm">
                        <li>Add different shapes or characters for the logos</li>
                        <li>Implement logo-to-logo collisions that change directions</li>
                        <li>Add a score display showing how long until the next corner hit</li>
                        <li>Create a version with gravity affecting the logos' movements</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong className="text-yellow-400">Important Note:</strong> The actual program requires the bext module, which may not be installed by default. In a real environment, you'd need to install it using pip as mentioned in the code. Our simulation approximates what the real program would do.
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
                DVD Logo Simulator
              </h3>
              
              <div className="mb-6 bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-3">Simulation Settings</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="sim-num-logos" className="block text-sm font-medium text-gray-300 mb-1">
                          Number of DVD Logos: <span className="font-medium text-[var(--matrix-color)]">{numLogos}</span>
                        </label>
                        <input 
                          id="sim-num-logos"
                          type="range" 
                          min="1" 
                          max="50" 
                          value={numLogos}
                          onChange={(e) => setNumLogos(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>1</span>
                          <span>10</span>
                          <span>25</span>
                          <span>50</span>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="sim-pause-amount" className="block text-sm font-medium text-gray-300 mb-1">
                          Animation Speed: <span className="font-medium text-[var(--matrix-color)]">{pauseAmount === 0 ? "Max Speed" : pauseAmount === 1 ? "Slow" : "Normal"}</span>
                        </label>
                        <input 
                          id="sim-pause-amount"
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1"
                          value={pauseAmount}
                          onChange={(e) => setPauseAmount(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--matrix-color)]"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>Fast</span>
                          <span>Medium</span>
                          <span>Slow</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Color Options:</label>
                          <select
                            value={useReducedColors ? "reduced" : "full"}
                            onChange={(e) => {
                              setUseReducedColors(e.target.value === "reduced");
                              
                              // Update the code accordingly
                              if (e.target.value === "reduced") {
                                const updatedCode = userCode.replace(
                                  /COLORS = \[.*?\]/,
                                  "COLORS = ['red', 'cyan']"
                                );
                                setUserCode(updatedCode);
                              } else {
                                const updatedCode = userCode.replace(
                                  /COLORS = \[.*?\]/,
                                  "COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']"
                                );
                                setUserCode(updatedCode);
                              }
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                          >
                            <option value="full">Full Color Set</option>
                            <option value="reduced">Reduced Colors</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Screen Size:</label>
                          <select
                            value={useCustomDimensions ? "custom" : "terminal"}
                            onChange={(e) => {
                              setUseCustomDimensions(e.target.value === "custom");
                              
                              // Update the code
                              if (e.target.value === "custom") {
                                const updatedCode = userCode.replace(
                                  /WIDTH, HEIGHT = bext\.size\(\)/,
                                  `WIDTH, HEIGHT = ${customWidth}, ${customHeight}`
                                );
                                setUserCode(updatedCode);
                              } else {
                                const updatedCode = userCode.replace(
                                  /WIDTH, HEIGHT = \d+, \d+/,
                                  "WIDTH, HEIGHT = bext.size()"
                                );
                                setUserCode(updatedCode);
                              }
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                          >
                            <option value="terminal">Use Terminal Size</option>
                            <option value="custom">Custom Dimensions</option>
                          </select>
                        </div>
                      </div>
                      
                      {useCustomDimensions && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="sim-width" className="block text-sm font-medium text-gray-300 mb-1">
                              Width:
                            </label>
                            <input
                              id="sim-width"
                              type="number"
                              min="10"
                              max="120"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="sim-height" className="block text-sm font-medium text-gray-300 mb-1">
                              Height:
                            </label>
                            <input
                              id="sim-height"
                              type="number"
                              min="5"
                              max="40"
                              value={customHeight}
                              onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                            />
                          </div>
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
                            Running Simulation...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run DVD Logo Simulation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-3">DVD Logo Facts</h4>
                    <div className="bg-gray-900 rounded-md p-4 h-[300px] space-y-4 overflow-y-auto">
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">The DVD Logo Phenomenon</h5>
                        <p className="text-xs text-gray-400">
                          The DVD logo screensaver became a cultural icon in the early 2000s. People would watch with anticipation to see if the logo would perfectly hit a corner of the screen, which was a rare and satisfying event. This was even featured in an episode of "The Office" where the entire office staff watches the logo bounce around.
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">Mathematics of the Bounce</h5>
                        <p className="text-xs text-gray-400">
                          The probability of the DVD logo hitting exactly in a corner depends on several factors, including the screen dimensions, logo size, and the starting position and velocity. In a mathematically perfect system with rational dimensions, the logo will eventually hit a corner. However, in real DVD players, slight imperfections in timing and position calculations can make corner hits truly rare events.
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">Beyond the Screensaver</h5>
                        <p className="text-xs text-gray-400">
                          This simple animation demonstrates key concepts in graphics programming, including:
                        </p>
                        <ul className="list-disc pl-4 text-xs text-gray-400 mt-1">
                          <li>Collision detection and response</li>
                          <li>Animation timing and frame rates</li>
                          <li>Color transformations</li>
                          <li>Screen boundary handling</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-[var(--matrix-color)] mb-1">Terminal Graphics</h5>
                        <p className="text-xs text-gray-400">
                          This implementation uses the bext module to create colorful animations in a text terminal. While the capabilities of terminal graphics are limited compared to modern graphics libraries, this approach demonstrates how much can be achieved with simple tools and creative approaches.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/70 border border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-white mb-3 flex items-center">
                  <MonitorPlay className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                  Simulation Output
                </h4>
                
                {output ? (
                  <pre className="font-mono text-sm text-green-400 bg-black p-4 rounded-md h-96 overflow-auto">{output}</pre>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-black rounded-md">
                    <div className="text-center text-gray-500">
                      <MonitorPlay className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Run a simulation to see the DVD logo animation here</p>
                      <p className="text-sm mt-2">Adjust the parameters above and click "Run DVD Logo Simulation"</p>
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

const initialCode = `"""Bouncing DVD Logo, by Al Sweigart al@inventwithpython.com
A bouncing DVD logo animation. You have to be "of a certain age" to
appreciate this. Press Ctrl-C to stop.

NOTE: Do not resize the terminal window while this program is running.
This code is available at https://nostarch.com/big-book-small-python-programming
Tags: short, artistic, bext"""

import sys, random, time

try:
    import bext
except ImportError:
    print('This program requires the bext module, which you')
    print('can install by following the instructions at')
    print('https://pypi.org/project/Bext/')
    sys.exit()

# Set up the constants:
WIDTH, HEIGHT = bext.size()
# We can't print to the last column on Windows without it adding a
# newline automatically, so reduce the width by one:
WIDTH -= 1

NUMBER_OF_LOGOS = 5  # (!) Try changing this to 1 or 100.
PAUSE_AMOUNT = 0.2  # (!) Try changing this to 1.0 or 0.0.
# (!) Try changing this list to fewer colors:
COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

UP_RIGHT   = 'ur'
UP_LEFT    = 'ul'
DOWN_RIGHT = 'dr'
DOWN_LEFT  = 'dl'
DIRECTIONS = (UP_RIGHT, UP_LEFT, DOWN_RIGHT, DOWN_LEFT)

# Key names for logo dictionaries:
COLOR = 'color'
X = 'x'
Y = 'y'
DIR = 'direction'


def main():
    bext.clear()

    # Generate some logos.
    logos = []
    for i in range(NUMBER_OF_LOGOS):
        logos.append({COLOR: random.choice(COLORS),
                      X: random.randint(1, WIDTH - 4),
                      Y: random.randint(1, HEIGHT - 4),
                      DIR: random.choice(DIRECTIONS)})
        if logos[-1][X] % 2 == 1:
            # Make sure X is even so it can hit the corner.
            logos[-1][X] -= 1

    cornerBounces = 0  # Count how many times a logo hits a corner.
    while True:  # Main program loop.
        for logo in logos:  # Handle each logo in the logos list.
            # Erase the logo's current location:
            bext.goto(logo[X], logo[Y])
            print('   ', end='')  # (!) Try commenting this line out.

            originalDirection = logo[DIR]

            # See if the logo bounces off the corners:
            if logo[X] == 0 and logo[Y] == 0:
                logo[DIR] = DOWN_RIGHT
                cornerBounces += 1
            elif logo[X] == 0 and logo[Y] == HEIGHT - 1:
                logo[DIR] = UP_RIGHT
                cornerBounces += 1
            elif logo[X] == WIDTH - 3 and logo[Y] == 0:
                logo[DIR] = DOWN_LEFT
                cornerBounces += 1
            elif logo[X] == WIDTH - 3 and logo[Y] == HEIGHT - 1:
                logo[DIR] = UP_LEFT
                cornerBounces += 1

            # See if the logo bounces off the left edge:
            elif logo[X] == 0 and logo[DIR] == UP_LEFT:
                logo[DIR] = UP_RIGHT
            elif logo[X] == 0 and logo[DIR] == DOWN_LEFT:
                logo[DIR] = DOWN_RIGHT

            # See if the logo bounces off the right edge:
            # (WIDTH - 3 because 'DVD' has 3 letters.)
            elif logo[X] == WIDTH - 3 and logo[DIR] == UP_RIGHT:
                logo[DIR] = UP_LEFT
            elif logo[X] == WIDTH - 3 and logo[DIR] == DOWN_RIGHT:
                logo[DIR] = DOWN_LEFT

            # See if the logo bounces off the top edge:
            elif logo[Y] == 0 and logo[DIR] == UP_LEFT:
                logo[DIR] = DOWN_LEFT
            elif logo[Y] == 0 and logo[DIR] == UP_RIGHT:
                logo[DIR] = DOWN_RIGHT

            # See if the logo bounces off the bottom edge:
            elif logo[Y] == HEIGHT - 1 and logo[DIR] == DOWN_LEFT:
                logo[DIR] = UP_LEFT
            elif logo[Y] == HEIGHT - 1 and logo[DIR] == DOWN_RIGHT:
                logo[DIR] = UP_RIGHT

            if logo[DIR] != originalDirection:
                # Change color when the logo bounces:
                logo[COLOR] = random.choice(COLORS)

            # Move the logo. (X moves by 2 because the terminal
            # characters are twice as tall as they are wide.)
            if logo[DIR] == UP_RIGHT:
                logo[X] += 2
                logo[Y] -= 1
            elif logo[DIR] == UP_LEFT:
                logo[X] -= 2
                logo[Y] -= 1
            elif logo[DIR] == DOWN_RIGHT:
                logo[X] += 2
                logo[Y] += 1
            elif logo[DIR] == DOWN_LEFT:
                logo[X] -= 2
                logo[Y] += 1

        # Display number of corner bounces:
        bext.goto(5, 0)
        bext.fg('white')
        print('Corner bounces:', cornerBounces, end='')

        for logo in logos:
            # Draw the logos at their new location:
            bext.goto(logo[X], logo[Y])
            bext.fg(logo[COLOR])
            print('DVD', end='')

        bext.goto(0, 0)

        sys.stdout.flush()  # (Required for bext-using programs.)
        time.sleep(PAUSE_AMOUNT)


# If this program was run (instead of imported), run the game:
if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print()
        print('Bouncing DVD Logo, by Al Sweigart')
        sys.exit()  # When Ctrl-C is pressed, end the program.`;

export default BouncingDVDLogoPage;