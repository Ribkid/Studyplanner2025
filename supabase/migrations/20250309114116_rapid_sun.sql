/*
  # Seed data for Python Projects
  
  This migration adds the first 5 Python projects to the database.
*/

-- Insert the first 5 projects
INSERT INTO python_projects (title, description, difficulty, code_template, solution_code, test_code, order_number, points)
VALUES
  ('Bagels', 'A deductive logic game where you must guess a secret three-digit number based on clues. The game offers hints: "Pico" when your guess has a correct digit in the wrong place, "Fermi" when your guess has a correct digit in the correct place, and "Bagels" if your guess has no correct digits.', 
  'beginner',
  '"""Bagels Game
A deductive logic game where you must guess a number based on clues.
"""

import random

NUM_DIGITS = 3
MAX_GUESSES = 10

def main():
    # TODO: Implement the main game function
    pass

def getSecretNum():
    # TODO: Generate and return a secret number
    pass

def getClues(guess, secretNum):
    # TODO: Return appropriate clues based on the guess
    pass

# If the program is run (instead of imported), run the game:
if __name__ == "__main__":
    main()',
  
  '"""Bagels Game
A deductive logic game where you must guess a number based on clues.
"""

import random

NUM_DIGITS = 3
MAX_GUESSES = 10

def main():
    print(f"I am thinking of a {NUM_DIGITS}-digit number with no repeated digits.")
    print("Try to guess what it is. Here are some clues:")
    print("When I say:    That means:")
    print("  Pico         One digit is correct but in the wrong position.")
    print("  Fermi        One digit is correct and in the right position.")
    print("  Bagels       No digit is correct.")
    
    secretNum = getSecretNum()
    print("I have thought up a number.")
    print(f"You have {MAX_GUESSES} guesses to get it.")
    
    numGuesses = 1
    while numGuesses <= MAX_GUESSES:
        guess = ""
        while len(guess) != NUM_DIGITS or not guess.isdecimal():
            print(f"Guess #{numGuesses}: ")
            guess = input("> ")
        
        clues = getClues(guess, secretNum)
        print(clues)
        numGuesses += 1
        
        if guess == secretNum:
            print("You got it!")
            return
        
        if numGuesses > MAX_GUESSES:
            print("You ran out of guesses.")
            print(f"The answer was {secretNum}.")
    
    print("Do you want to play again? (yes or no)")
    if not input("> ").lower().startswith("y"):
        print("Thanks for playing!")

def getSecretNum():
    numbers = list("0123456789")
    random.shuffle(numbers)
    secretNum = ""
    for i in range(NUM_DIGITS):
        secretNum += str(numbers[i])
    return secretNum

def getClues(guess, secretNum):
    if guess == secretNum:
        return "You got it!"
    
    clues = []
    for i in range(len(guess)):
        if guess[i] == secretNum[i]:
            clues.append("Fermi")
        elif guess[i] in secretNum:
            clues.append("Pico")
    
    if len(clues) == 0:
        return "Bagels"
    
    clues.sort()
    return " ".join(clues)

# If the program is run (instead of imported), run the game:
if __name__ == "__main__":
    main()',
  
  '# Test code for Bagels game
import unittest
from io import StringIO
import sys
import random
from unittest.mock import patch

# Function to test the getSecretNum function
def test_getSecretNum():
    # Set seed for reproducibility
    random.seed(42)
    secretNum = getSecretNum()
    assert len(secretNum) == NUM_DIGITS
    assert secretNum.isdigit()
    # Check if all digits are unique
    assert len(set(secretNum)) == NUM_DIGITS
    return True

# Function to test the getClues function
def test_getClues():
    # Test case 1: All correct digits in correct positions
    assert getClues("123", "123") == "You got it!"
    
    # Test case 2: One correct digit in correct position
    clues = getClues("123", "456")
    assert clues == "Bagels"
    
    # Test case 3: One correct digit in correct position
    clues = getClues("123", "145")
    assert "Fermi" in clues
    
    # Test case 4: One correct digit in wrong position
    clues = getClues("123", "312")
    assert clues.count("Pico") >= 1
    
    # Test case 5: Mix of correct and incorrect
    clues = getClues("123", "132")
    assert "Fermi" in clues and "Pico" in clues
    
    return True

if "getSecretNum" in globals() and "getClues" in globals():
    test_results = []
    test_results.append(test_getSecretNum())
    test_results.append(test_getClues())
    all_passed = all(test_results)
    print(f"All tests passed: {all_passed}")
else:
    print("Functions not implemented yet")
', 1, 100),

  ('Birthday Paradox', 'A simulation that explores the surprising probability that two people will have the same birthday in a relatively small group. This program runs multiple simulations to determine the actual percentages.', 
  'beginner',
  '"""Birthday Paradox Simulation
Explore the surprising probabilities of the "Birthday Paradox".
"""

import datetime
import random

def getBirthdays(numberOfBirthdays):
    # TODO: Return a list of random date objects for birthdays
    pass

def getMatch(birthdays):
    # TODO: Return the date object of a birthday that occurs more than once
    # Return None if all birthdays are unique
    pass

def main():
    # TODO: Implement the main simulation
    pass

# If the program is run (instead of imported), run the simulation:
if __name__ == "__main__":
    main()',
  
  '"""Birthday Paradox Simulation
Explore the surprising probabilities of the "Birthday Paradox".
"""

import datetime
import random

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

def main():
    print("Birthday Paradox Simulation")
    
    # Get user input for number of birthdays
    while True:
        print("How many birthdays shall I generate? (Max 100)")
        response = input("> ")
        if response.isdecimal() and (0 < int(response) <= 100):
            numBDays = int(response)
            break
    
    # Generate and display birthdays
    print(f"Here are {numBDays} birthdays:")
    birthdays = getBirthdays(numBDays)
    
    # Display the birthdays
    for i, birthday in enumerate(birthdays):
        if i != 0:
            print(", ", end="")
        monthName = birthday.strftime("%b")
        dateText = f"{monthName} {birthday.day}"
        print(dateText, end="")
    print()
    
    # Determine if there are two birthdays that match
    match = getMatch(birthdays)
    
    # Display the results
    print("In this simulation, ", end="")
    if match != None:
        monthName = match.strftime("%b")
        dateText = f"{monthName} {match.day}"
        print(f"multiple people have a birthday on {dateText}")
    else:
        print("there are no matching birthdays.")
    
    # Run Monte Carlo simulation
    print(f"Generating {numBDays} random birthdays 100,000 times...")
    print("Press Enter to begin...")
    input()
    
    # Run simulations
    simMatch = 0  # Count matching simulations
    for i in range(100000):
        # Display progress
        if i % 10000 == 0:
            print(f"{i} simulations run...")
        
        # Generate birthdays and check for matches
        birthdays = getBirthdays(numBDays)
        if getMatch(birthdays) != None:
            simMatch += 1
    
    # Display results
    probability = round(simMatch / 100000 * 100, 2)
    print(f"Out of 100,000 simulations of {numBDays} people, there was a")
    print(f"matching birthday in that group {simMatch} times. This means")
    print(f"that {numBDays} people have a {probability}% chance of")
    print("having a matching birthday in their group.")

# If the program is run (instead of imported), run the simulation:
if __name__ == "__main__":
    main()',
  
  '# Test code for Birthday Paradox simulation
import datetime

# Test getBirthdays function
def test_getBirthdays():
    # Check that the function returns the correct number of birthdays
    assert len(getBirthdays(5)) == 5
    assert len(getBirthdays(10)) == 10
    assert len(getBirthdays(23)) == 23
    
    # Check that all returned objects are datetime.date
    birthdays = getBirthdays(10)
    for birthday in birthdays:
        assert isinstance(birthday, datetime.date)
    
    return True

# Test getMatch function
def test_getMatch():
    # Test case 1: No matches
    startDate = datetime.date(2001, 1, 1)
    distinct_birthdays = [startDate + datetime.timedelta(days=i) for i in range(5)]
    assert getMatch(distinct_birthdays) is None
    
    # Test case 2: With a match
    birthdays_with_match = distinct_birthdays.copy()
    birthdays_with_match.append(distinct_birthdays[0])  # Add a duplicate
    assert getMatch(birthdays_with_match) == distinct_birthdays[0]
    
    return True

if "getBirthdays" in globals() and "getMatch" in globals():
    test_results = []
    test_results.append(test_getBirthdays())
    test_results.append(test_getMatch())
    all_passed = all(test_results)
    print(f"All tests passed: {all_passed}")
else:
    print("Functions not implemented yet")
', 2, 150),

  ('Bitmap Message', 'A program that displays a text message according to a bitmap pattern. It uses a multiline string as a bitmap to determine how it should display a message from the user.', 
  'beginner',
  '"""Bitmap Message
Displays a text message according to the provided bitmap image.
"""

import sys

# (!) Try changing this multiline string to any image you like:
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

def main():
    # TODO: Implement the main function to display message according to bitmap
    pass

# If the program is run (instead of imported), run the main function:
if __name__ == "__main__":
    main()',
  
  '"""Bitmap Message
Displays a text message according to the provided bitmap image.
"""

import sys

# (!) Try changing this multiline string to any image you like:
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

def main():
    print("Bitmap Message")
    print("Enter the message to display with the bitmap.")
    message = input("> ")
    
    if message == "":
        sys.exit()
    
    # Loop over each line in the bitmap:
    for line in bitmap.splitlines():
        # Loop over each character in the line:
        for i, bit in enumerate(line):
            if bit == " ":
                # Print an empty space since there is a space in the bitmap
                print(" ", end="")
            else:
                # Print a character from the message
                print(message[i % len(message)], end="")
        print()  # Print a newline after each row

# If the program is run (instead of imported), run the main function:
if __name__ == "__main__":
    main()',
  
  '# Test code for Bitmap Message

import sys
from io import StringIO

def run_bitmap_message_with_input(input_text):
    # Save the original stdout and create a mock one
    original_stdout = sys.stdout
    mock_stdout = StringIO()
    sys.stdout = mock_stdout
    
    # Mock the input function
    original_input = __builtins__["input"]
    __builtins__["input"] = lambda _: input_text
    
    try:
        # Run the main function
        main()
        # Get the output
        output = mock_stdout.getvalue()
        return output
    finally:
        # Restore stdout and input
        sys.stdout = original_stdout
        __builtins__["input"] = original_input

# Test with a simple message
def test_bitmap_message():
    try:
        output = run_bitmap_message_with_input("TEST")
        
        # Check if output contains the message characters
        assert "T" in output
        assert "E" in output
        assert "S" in output
        
        # Count lines to ensure the bitmap was processed
        lines = output.split("\n")
        # 2 lines for prompts + bitmap lines
        assert len(lines) > 20  # Bitmap has at least 20 lines
        
        # Check proper formatting: spaces are preserved
        for line in output.split("\n")[2:]:  # Skip the prompt lines
            if line:  # Skip empty lines
                assert " " in line or all(c in "TEST" for c in line.strip())
        
        return True
    except Exception as e:
        print(f"Test failed: {e}")
        return False

if "main" in globals():
    test_result = test_bitmap_message()
    print(f"All tests passed: {test_result}")
else:
    print("Main function not implemented yet")
', 3, 100),

  ('Caesar Cipher', 'An encryption algorithm that shifts letters by a certain number of places in the alphabet. It encrypts by shifting the alphabet by a certain key, and decrypts by shifting the alphabet in reverse.', 
  'beginner',
  '"""Caesar Cipher
The Caesar cipher is a shift cipher that uses addition and subtraction
to encrypt and decrypt letters.
"""

def encrypt(message, key):
    # TODO: Implement the encryption function
    pass

def decrypt(message, key):
    # TODO: Implement the decryption function
    pass

def main():
    # TODO: Implement the main function with user interaction
    pass

# If the program is run (instead of imported), run the main function:
if __name__ == "__main__":
    main()',
  
  '"""Caesar Cipher
The Caesar cipher is a shift cipher that uses addition and subtraction
to encrypt and decrypt letters.
"""

def encrypt(message, key):
    """
    Encrypts a message using the Caesar cipher.
    
    Args:
        message (str): The message to encrypt
        key (int): The encryption key (shift amount)
        
    Returns:
        str: The encrypted message
    """
    encrypted = ""
    # Define the symbols that can be encrypted
    SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    
    # Loop through each character in the message
    for symbol in message.upper():
        if symbol in SYMBOLS:
            # Get the encrypted symbol position
            symbolIndex = SYMBOLS.find(symbol)
            translatedIndex = (symbolIndex + key) % len(SYMBOLS)
            
            # Add the encrypted symbol
            encrypted += SYMBOLS[translatedIndex]
        else:
            # Add the symbol without encrypting
            encrypted += symbol
            
    return encrypted

def decrypt(message, key):
    """
    Decrypts a message using the Caesar cipher.
    
    Args:
        message (str): The message to decrypt
        key (int): The encryption key (shift amount)
        
    Returns:
        str: The decrypted message
    """
    # Decryption is just encryption with the negative key
    return encrypt(message, -key)

def main():
    print("Caesar Cipher")
    print("The Caesar cipher encrypts letters by shifting them over by a")
    print("key number. For example, a key of 2 means the letter A is")
    print("encrypted into C, the letter B encrypted into D, and so on.")
    print()
    
    # Let the user enter if they are encrypting or decrypting
    while True:
        print("Do you want to (e)ncrypt or (d)ecrypt?")
        response = input("> ").lower()
        if response.startswith("e"):
            mode = "encrypt"
            break
        elif response.startswith("d"):
            mode = "decrypt"
            break
        print("Please enter the letter e or d.")
    
    # Let the user enter the key
    while True:
        print("Please enter the key (0 to 25) to use.")
        response = input("> ")
        if not response.isdecimal():
            continue
            
        key = int(response)
        if 0 <= key <= 25:
            break
    
    # Let the user enter the message
    print(f"Enter the message to {mode}.")
    message = input("> ")
    
    # Perform the encryption/decryption
    if mode == "encrypt":
        translated = encrypt(message, key)
    else:
        translated = decrypt(message, key)
    
    print(f"The {mode}ed message is:")
    print(translated)

# If the program is run (instead of imported), run the main function:
if __name__ == "__main__":
    main()',
  
  '# Test code for Caesar Cipher

# Test encrypt function
def test_encrypt():
    # Test with key 1
    assert encrypt("ABC", 1) == "BCD"
    # Test with key 25
    assert encrypt("ABC", 25) == "ZAB"
    # Test with key 0
    assert encrypt("HELLO", 0) == "HELLO"
    # Test with key 13
    assert encrypt("HELLO", 13) == "URYYB"
    
    # Test with non-alphabetic characters
    assert encrypt("HELLO, WORLD!", 5) == "MJQQT, BTWQI!"
    
    # Test wrapping around the alphabet
    assert encrypt("XYZ", 3) == "ABC"
    
    return True

# Test decrypt function
def test_decrypt():
    # Test with key 1
    assert decrypt("BCD", 1) == "ABC"
    # Test with key 25
    assert decrypt("ZAB", 25) == "ABC"
    # Test with key 0
    assert decrypt("HELLO", 0) == "HELLO"
    # Test with key 13
    assert decrypt("URYYB", 13) == "HELLO"
    
    # Test with non-alphabetic characters
    assert decrypt("MJQQT, BTWQI!", 5) == "HELLO, WORLD!"
    
    # Test wrapping around the alphabet
    assert decrypt("ABC", 3) == "XYZ"
    
    return True

# Test that encryption and decryption are inverses
def test_roundtrip():
    message = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
    for key in range(26):
        encrypted = encrypt(message, key)
        decrypted = decrypt(encrypted, key)
        assert decrypted == message
    
    return True

if "encrypt" in globals() and "decrypt" in globals():
    test_results = []
    test_results.append(test_encrypt())
    test_results.append(test_decrypt())
    test_results.append(test_roundtrip())
    all_passed = all(test_results)
    print(f"All tests passed: {all_passed}")
else:
    print("Functions not implemented yet")
', 4, 150),

  ('Blackjack', 'The classic card game also known as 21. Players try to get as close to 21 points as possible without going over, competing against a dealer.', 
  'intermediate',
  '"""Blackjack
The classic card game also known as 21.
"""

import random

# Card constants
HEARTS = chr(9829)   # Character 9829 is ''♥''
DIAMONDS = chr(9830) # Character 9830 is ''♦''
SPADES = chr(9824)   # Character 9824 is ''♠''
CLUBS = chr(9827)    # Character 9827 is ''♣''

def getDeck():
    # TODO: Create and return a standard deck of 52 cards
    pass

def displayCards(cards):
    # TODO: Display all the cards in the cards list
    pass

def getHandValue(cards):
    # TODO: Calculate and return the value of the cards
    pass

def main():
    # TODO: Implement the main game loop
    pass

# If the program is run (instead of imported), run the game:
if __name__ == "__main__":
    main()',
  
  '"""Blackjack
The classic card game also known as 21.
"""

import random, sys

# Card constants
HEARTS = chr(9829)   # Character 9829 is ''♥''
DIAMONDS = chr(9830) # Character 9830 is ''♦''
SPADES = chr(9824)   # Character 9824 is ''♠''
CLUBS = chr(9827)    # Character 9827 is ''♣''
BACKSIDE = "backside"

def getDeck():
    """Return a list of (rank, suit) tuples for all 52 cards."""
    deck = []
    for suit in (HEARTS, DIAMONDS, SPADES, CLUBS):
        for rank in range(2, 11):
            deck.append((str(rank), suit))  # Add the numbered cards
        for rank in ("J", "Q", "K", "A"):
            deck.append((rank, suit))  # Add the face and ace cards
    random.shuffle(deck)
    return deck

def displayCards(cards):
    """Display all the cards in the cards list."""
    rows = ["", "", "", "", ""]  # The text to display on each row
    
    for i, card in enumerate(cards):
        rows[0] += " ___  "  # Print the top line of the card
        
        if card == BACKSIDE:
            # Print a card''s back
            rows[1] += "|## | "
            rows[2] += "|###| "
            rows[3] += "|_##| "
        else:
            # Print the card''s front
            rank, suit = card
            rows[1] += "|{} | ".format(rank.ljust(2))
            rows[2] += "| {} | ".format(suit)
            rows[3] += "|_{}| ".format(rank.rjust(2, "_"))
    
    # Print each row on the screen
    for row in rows:
        print(row)

def getHandValue(cards):
    """Returns the value of the cards. Face cards are worth 10, aces are
    worth 11 or 1 (this function picks the most suitable ace value)."""
    value = 0
    numberOfAces = 0
    
    # Add the value for non-ace cards
    for card in cards:
        rank = card[0]  # card is a tuple like (rank, suit)
        if rank == "A":
            numberOfAces += 1
        elif rank in ("K", "Q", "J"):  # Face cards are worth 10 points
            value += 10
        else:
            value += int(rank)  # Numbered cards are worth their number
    
    # Add the value for aces
    value += numberOfAces  # Add 1 per ace
    for i in range(numberOfAces):
        # If another 10 can be added without busting, do so
        if value + 10 <= 21:
            value += 10
    
    return value

def main():
    print("Blackjack")
    print("Rules:")
    print("  Try to get as close to 21 without going over.")
    print("  Kings, Queens, and Jacks are worth 10 points.")
    print("  Aces are worth 1 or 11 points.")
    print("  Cards 2 through 10 are worth their face value.")
    print("  (H)it to take another card.")
    print("  (S)tand to stop taking cards.")
    print("  The dealer stops hitting at 17.")
    
    money = 5000
    
    while True:  # Main game loop
        # Check if the player has run out of money
        if money <= 0:
            print("You''re broke!")
            print("Thanks for playing!")
            sys.exit()
        
        # Let the player enter their bet
        print(f"Money: ${money}")
        bet = getBet(money)
        
        # Get a deck and deal cards to dealer and player
        deck = getDeck()
        dealerHand = [deck.pop(), deck.pop()]
        playerHand = [deck.pop(), deck.pop()]
        
        # Handle player actions
        print(f"Bet: ${bet}")
        
        while True:  # Player''s turn
            displayHands(playerHand, dealerHand, False)
            
            # Check if player has bust
            if getHandValue(playerHand) > 21:
                break
            
            # Get player''s move
            move = getMove(playerHand)
            
            if move == "H":
                # Hit: Player takes another card
                newCard = deck.pop()
                rank, suit = newCard
                print(f"You drew a {rank} of {suit}.")
                playerHand.append(newCard)
                
                if getHandValue(playerHand) > 21:
                    # Player has busted
                    continue
            
            if move == "S":
                # Stand: Player''s turn is over
                break
        
        # Dealer''s turn
        if getHandValue(playerHand) <= 21:
            while getHandValue(dealerHand) < 17:
                # Dealer hits
                print("Dealer hits...")
                dealerHand.append(deck.pop())
                displayHands(playerHand, dealerHand, False)
                
                if getHandValue(dealerHand) > 21:
                    break  # Dealer has busted
        
        # Show final hands
        displayHands(playerHand, dealerHand, True)
        
        # Handle the game outcome
        playerValue = getHandValue(playerHand)
        dealerValue = getHandValue(dealerHand)
        
        # Determine if player won, lost, or tied
        if dealerValue > 21:
            print(f"Dealer busts! You win ${bet}")
            money += bet
        elif playerValue > 21 or playerValue < dealerValue:
            print("You lost!")
            money -= bet
        elif playerValue > dealerValue:
            print(f"You won ${bet}!")
            money += bet
        elif playerValue == dealerValue:
            print("It''s a tie, the bet is returned to you.")
        
        # Ask player if they want to continue
        print()
        input("Press Enter to continue...")
        print("\n\n")

def getBet(maxBet):
    """Ask the player how much they want to bet for this round."""
    while True:
        print(f"How much do you bet? (1-{maxBet}, or QUIT)")
        bet = input("> ").upper().strip()
        
        if bet == "QUIT":
            print("Thanks for playing!")
            sys.exit()
        
        if not bet.isdecimal():
            continue  # Ask again if the input is not a number
        
        bet = int(bet)
        if 1 <= bet <= maxBet:
            return bet

def getMove(playerHand):
    """Asks the player for their move and returns ''H'' for hit or ''S'' for stand."""
    while True:
        moves = ["(H)it", "(S)tand"]
        movePrompt = ", ".join(moves) + ": "
        move = input(movePrompt).upper()
        
        if move in ("H", "S"):
            return move

def displayHands(playerHand, dealerHand, showDealerHand):
    """Show the player''s and dealer''s cards. Hide the dealer''s first
    card if showDealerHand is False."""
    print()
    if showDealerHand:
        print(f"DEALER: {getHandValue(dealerHand)}")
        displayCards(dealerHand)
    else:
        print("DEALER: ???")
        # Hide the dealer''s first card
        displayCards([BACKSIDE] + dealerHand[1:])
    
    # Show the player''s cards
    print(f"PLAYER: {getHandValue(playerHand)}")
    displayCards(playerHand)

# If the program is run (instead of imported), run the game:
if __name__ == "__main__":
    main()',
  
  '# Test code for Blackjack game

# Test getDeck function
def test_getDeck():
    deck = getDeck()
    # Check deck has 52 cards
    assert len(deck) == 52
    
    # Check deck has correct number of each suit
    hearts = diamonds = spades = clubs = 0
    for card in deck:
        suit = card[1]
        if suit == HEARTS:
            hearts += 1
        elif suit == DIAMONDS:
            diamonds += 1
        elif suit == SPADES:
            spades += 1
        elif suit == CLUBS:
            clubs += 1
    
    assert hearts == 13
    assert diamonds == 13
    assert spades == 13
    assert clubs == 13
    
    return True

# Test getHandValue function
def test_getHandValue():
    # Test with numeric cards
    assert getHandValue([("2", HEARTS), ("3", CLUBS)]) == 5
    assert getHandValue([("10", HEARTS), ("5", CLUBS)]) == 15
    
    # Test with face cards
    assert getHandValue([("K", HEARTS), ("Q", CLUBS)]) == 20
    assert getHandValue([("J", HEARTS), ("10", CLUBS)]) == 20
    
    # Test with aces (as 11)
    assert getHandValue([("A", HEARTS), ("9", CLUBS)]) == 20
    
    # Test with aces (as 1 to avoid bust)
    assert getHandValue([("A", HEARTS), ("J", CLUBS), ("Q", SPADES)]) == 21
    
    # Test multiple aces
    assert getHandValue([("A", HEARTS), ("A", CLUBS)]) == 12
    assert getHandValue([("A", HEARTS), ("A", CLUBS), ("9", DIAMONDS)]) == 21
    assert getHandValue([("A", HEARTS), ("A", CLUBS), ("A", DIAMONDS)]) == 13
    
    # Test bust scenario
    assert getHandValue([("K", HEARTS), ("Q", CLUBS), ("J", SPADES)]) == 30
    
    return True

if "getDeck" in globals() and "getHandValue" in globals():
    test_results = []
    test_results.append(test_getDeck())
    test_results.append(test_getHandValue())
    all_passed = all(test_results)
    print(f"All tests passed: {all_passed}")
else:
    print("Functions not implemented yet")
', 5, 200);