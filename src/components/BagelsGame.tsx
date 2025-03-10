import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Send, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface BagelsGameProps {
  onCompleted?: () => void;
  showPythonCode?: boolean;
}

const BagelsGame: React.FC<BagelsGameProps> = ({ onCompleted, showPythonCode = true }) => {
  const [secretNum, setSecretNum] = useState<string>('');
  const [guesses, setGuesses] = useState<{guess: string, clue: string}[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [numDigits] = useState<number>(3);
  const [maxGuesses] = useState<number>(10);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  // Focus input after each guess
  useEffect(() => {
    if (gameState === 'playing') {
      inputRef.current?.focus();
    }
  }, [guesses, gameState]);

  const startNewGame = () => {
    // Generate a random secret number
    const newSecretNum = getSecretNum();
    setSecretNum(newSecretNum);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setError(null);
    console.log('New game started! Secret number:', newSecretNum); // For debugging
  };

  const getSecretNum = (): string => {
    // Create a list of digits 0-9
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    // Shuffle the digits
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    // Get the first numDigits digits
    let secret = '';
    for (let i = 0; i < numDigits; i++) {
      secret += numbers[i];
    }
    
    return secret;
  };

  const getClues = (guess: string): string => {
    // If the guess is correct, the player wins
    if (guess === secretNum) {
      return 'You got it!';
    }
    
    const clues: string[] = [];
    
    // Check for matching digits
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === secretNum[i]) {
        // A correct digit in the correct place
        clues.push('Fermi');
      } else if (secretNum.includes(guess[i])) {
        // A correct digit in the wrong place
        clues.push('Pico');
      }
    }
    
    // If no clues, return 'Bagels'
    if (clues.length === 0) {
      return 'Bagels';
    }
    
    // Sort clues alphabetically (just like in the original game)
    clues.sort();
    return clues.join(' ');
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate guess
    if (currentGuess.length !== numDigits || !/^\d+$/.test(currentGuess)) {
      setError(`Please enter a ${numDigits}-digit number.`);
      return;
    }
    
    setError(null);
    
    // Get clues for this guess
    const clue = getClues(currentGuess);
    
    // Add guess to history
    const newGuesses = [...guesses, { guess: currentGuess, clue }];
    setGuesses(newGuesses);
    
    // Check game state
    if (clue === 'You got it!') {
      setGameState('won');
      if (onCompleted) onCompleted();
    } else if (newGuesses.length >= maxGuesses) {
      setGameState('lost');
    }
    
    // Clear current guess
    setCurrentGuess('');
  };

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value) && value.length <= numDigits) {
      setCurrentGuess(value);
      setError(null);
    }
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Bagels Number Guessing Game</h2>
          <p className="text-gray-400 text-sm">
            Guess the {numDigits}-digit number. You have {maxGuesses} tries.
          </p>
        </div>
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-gray-400 hover:text-[var(--matrix-color)] p-1"
          title="Game Instructions"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
      
      {showInstructions && (
        <div className="bg-gray-800/70 border border-gray-700 rounded-md p-4 mb-4">
          <h3 className="font-bold text-gray-200 mb-2">How to Play:</h3>
          <p className="text-gray-300 mb-2">
            I'm thinking of a {numDigits}-digit number with no repeated digits. Try to guess what it is.
          </p>
          <div className="mb-2">
            <p className="text-gray-300">When I say:</p>
            <ul className="ml-8 mt-1 text-gray-300 space-y-1">
              <li className="list-disc"><span className="text-cyan-400 font-medium">Pico</span> - One digit is correct but in the wrong position</li>
              <li className="list-disc"><span className="text-green-400 font-medium">Fermi</span> - One digit is correct and in the right position</li>
              <li className="list-disc"><span className="text-red-400 font-medium">Bagels</span> - No digit is correct</li>
            </ul>
          </div>
          <p className="text-gray-300 text-sm italic">
            Example: If the secret number is 248 and your guess is 843, the clues would be "Fermi Pico"
          </p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-gray-800/70 border border-gray-700 rounded-md p-4 mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Guess History</span>
              <span className="text-gray-400 text-sm">{guesses.length}/{maxGuesses} tries</span>
            </div>
            
            {guesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic">
                No guesses yet. Enter your first guess below!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {guesses.map((g, index) => (
                  <div key={index} className="bg-gray-900/70 rounded p-2 flex justify-between items-center">
                    <div>
                      <span className="text-gray-400 text-sm">#{index + 1}:</span>
                      <span className="text-white font-mono ml-2">{g.guess}</span>
                    </div>
                    <div className={`
                      px-2 py-1 rounded text-sm font-medium
                      ${g.clue === 'Bagels' ? 'bg-red-900/30 text-red-400' : 
                        g.clue === 'You got it!' ? 'bg-green-900/30 text-green-400' : 
                        'bg-blue-900/30 text-blue-400'}
                    `}>
                      {g.clue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {gameState === 'playing' ? (
            <form onSubmit={handleGuessSubmit} className="mb-2">
              <div className="flex">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentGuess}
                  onChange={handleGuessChange}
                  placeholder={`Enter a ${numDigits}-digit number`}
                  maxLength={numDigits}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:border-[var(--matrix-color)]"
                  disabled={gameState !== 'playing'}
                />
                <button
                  type="submit"
                  className="bg-[var(--matrix-color)]/20 hover:bg-[var(--matrix-color)]/30 text-[var(--matrix-color)] font-bold py-2 px-4 rounded-r-md border border-[var(--matrix-color)]/30 transition-colors"
                  disabled={currentGuess.length !== numDigits || gameState !== 'playing'}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </form>
          ) : (
            <div className={`p-4 rounded-md mb-4 flex items-start ${
              gameState === 'won' ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'
            }`}>
              {gameState === 'won' ? (
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-green-400">Congratulations!</h3>
                    <p className="text-gray-300">
                      You guessed the number in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-400">Game Over!</h3>
                    <p className="text-gray-300">
                      You ran out of guesses. The secret number was <span className="font-mono font-bold">{secretNum}</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={startNewGame}
            className="cyber-button px-4 py-2 w-full flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {gameState === 'playing' ? 'Restart Game' : 'Play Again'}
          </button>
        </div>
        
        {showPythonCode && (
          <div className="flex-1 md:order-2">
            <div className="bg-gray-800/70 border border-gray-700 rounded-md">
              <div className="border-b border-gray-700 px-4 py-2">
                <h3 className="font-medium text-gray-300">Python Implementation</h3>
              </div>
              <pre className="text-xs leading-relaxed font-mono bg-gray-900 rounded-b-md p-4 overflow-auto max-h-80 text-gray-300">
{`import random

NUM_DIGITS = 3
MAX_GUESSES = 10

def main():
    print(f"I am thinking of a {NUM_DIGITS}-digit number.")
    print("Try to guess what it is. Here are some clues:")
    print("When I say:    That means:")
    print("  Pico         One digit is correct but in the wrong position.")
    print("  Fermi        One digit is correct and in the right position.")
    print("  Bagels       No digit is correct.")
    
    while True:  # Main game loop
        # Generate the secret number
        secretNum = getSecretNum()
        print("I have thought up a number.")
        print(f"You have {MAX_GUESSES} guesses to get it.")
        
        numGuesses = 1
        while numGuesses <= MAX_GUESSES:
            guess = ""
            # Keep asking until they enter a valid guess
            while len(guess) != NUM_DIGITS or not guess.isdecimal():
                print(f"Guess #{numGuesses}: ")
                guess = input("> ")
            
            # Get and display clues
            clues = getClues(guess, secretNum)
            print(clues)
            numGuesses += 1
            
            # Check if they won
            if guess == secretNum:
                break  # Exit the loop if correct
                
            # Check if they ran out of guesses
            if numGuesses > MAX_GUESSES:
                print("You ran out of guesses.")
                print(f"The answer was {secretNum}.")
        
        # Ask if they want to play again
        print("Do you want to play again? (yes or no)")
        if not input("> ").lower().startswith("y"):
            break
    
    print("Thanks for playing!")

def getSecretNum():
    """Returns a string of NUM_DIGITS unique random digits."""
    numbers = list("0123456789")  # Create list of digits
    random.shuffle(numbers)  # Shuffle into random order
    
    # Get the first NUM_DIGITS digits for the secret number
    secretNum = ""
    for i in range(NUM_DIGITS):
        secretNum += str(numbers[i])
    return secretNum

def getClues(guess, secretNum):
    """Returns the clues for a guess and secret number pair."""
    if guess == secretNum:
        return "You got it!"
    
    clues = []
    
    # Check each digit
    for i in range(len(guess)):
        if guess[i] == secretNum[i]:
            # Digit is correct and in right position
            clues.append("Fermi")
        elif guess[i] in secretNum:
            # Digit is correct but in wrong position
            clues.append("Pico")
    
    # If no clues, return Bagels
    if len(clues) == 0:
        return "Bagels"
    else:
        # Sort clues alphabetically (to avoid giving extra info)
        clues.sort()
        return " ".join(clues)

if __name__ == "__main__":
    main()`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BagelsGame;