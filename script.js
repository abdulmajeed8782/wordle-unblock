
// Game state
let currentGame = 'wordle';
let wordleState = {
    targetWord: '',
    currentRow: 0,
    currentGuess: '',
    gameOver: false,
    words: ['APPLE', 'BRAVE', 'CHAIR', 'DANCE', 'EARTH', 'FLAME', 'GRACE', 'HAPPY', 'LIGHT', 'MAGIC', 'OCEAN', 'PEACE', 'QUICK', 'SMILE', 'TRUST', 'VOICE', 'WORLD', 'YOUTH', 'ZEBRA', 'BREAD']
};

let scrambleState = {
    currentWord: '',
    scrambledWord: '',
    words: [
        { word: 'JAVASCRIPT', scrambled: '' },
        { word: 'COMPUTER', scrambled: '' },
        { word: 'KEYBOARD', scrambled: '' },
        { word: 'MONITOR', scrambled: '' },
        { word: 'PROGRAM', scrambled: '' },
        { word: 'WEBSITE', scrambled: '' },
        { word: 'INTERNET', scrambled: '' },
        { word: 'DATABASE', scrambled: '' }
    ]
};

let wordGuessState = {
    currentWord: '',
    hint: '',
    words: [
        { word: 'OCEAN', hint: 'Large body of salt water' },
        { word: 'MOUNTAIN', hint: 'High elevation of land' },
        { word: 'RAINBOW', hint: 'Colorful arc in the sky' },
        { word: 'BUTTERFLY', hint: 'Insect with colorful wings' },
        { word: 'LIBRARY', hint: 'Place with many books' },
        { word: 'GUITAR', hint: 'Six-stringed musical instrument' },
        { word: 'TELESCOPE', hint: 'Device for viewing distant objects' },
        { word: 'VOLCANO', hint: 'Mountain that can erupt' }
    ]
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGames();
    setupGameSwitching();
    setupWordle();
});

function initializeGames() {
    // Initialize Wordle
    resetWordle();
    
    // Initialize Word Scramble
    newScramble();
    
    // Initialize Word Guess
    newWordGuess();
}

function setupGameSwitching() {
    const gameCards = document.querySelectorAll('.game-card');
    const gameContents = document.querySelectorAll('.game-content');
    
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameType = this.dataset.game;
            
            // Update active card
            gameCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Update active game content
            gameContents.forEach(content => content.classList.remove('active'));
            document.getElementById(gameType + '-game').classList.add('active');
            
            currentGame = gameType;
        });
    });
}

// WORDLE GAME
function setupWordle() {
    createWordleGrid();
    createKeyboard();
    document.addEventListener('keydown', handleWordleKeyPress);
}

function createWordleGrid() {
    const grid = document.getElementById('wordle-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.id = `cell-${i}-${j}`;
            row.appendChild(cell);
        }
        
        grid.appendChild(row);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];
    
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(letter => {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.id = `key-${letter}`;
            
            if (letter === 'ENTER' || letter === '⌫') {
                key.classList.add('wide');
            }
            
            key.addEventListener('click', () => handleWordleInput(letter));
            rowDiv.appendChild(key);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

function handleWordleKeyPress(event) {
    if (currentGame !== 'wordle' || wordleState.gameOver) return;
    
    const key = event.key.toUpperCase();
    
    if (key === 'ENTER') {
        handleWordleInput('ENTER');
    } else if (key === 'BACKSPACE') {
        handleWordleInput('⌫');
    } else if (key.match(/[A-Z]/) && key.length === 1) {
        handleWordleInput(key);
    }
}

function handleWordleInput(letter) {
    if (wordleState.gameOver) return;
    
    if (letter === 'ENTER') {
        if (wordleState.currentGuess.length === 5) {
            submitWordleGuess();
        }
    } else if (letter === '⌫') {
        if (wordleState.currentGuess.length > 0) {
            wordleState.currentGuess = wordleState.currentGuess.slice(0, -1);
            updateWordleDisplay();
        }
    } else if (wordleState.currentGuess.length < 5) {
        wordleState.currentGuess += letter;
        updateWordleDisplay();
    }
}

function updateWordleDisplay() {
    const row = wordleState.currentRow;
    
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${row}-${i}`);
        if (i < wordleState.currentGuess.length) {
            cell.textContent = wordleState.currentGuess[i];
            cell.classList.add('filled');
        } else {
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    }
}

function submitWordleGuess() {
    const guess = wordleState.currentGuess;
    const target = wordleState.targetWord;
    
    // Check each letter
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${wordleState.currentRow}-${i}`);
        const letter = guess[i];
        const key = document.getElementById(`key-${letter}`);
        
        if (letter === target[i]) {
            cell.classList.add('correct');
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (target.includes(letter)) {
            cell.classList.add('present');
            if (!key.classList.contains('correct')) {
                key.classList.remove('absent');
                key.classList.add('present');
            }
        } else {
            cell.classList.add('absent');
            key.classList.add('absent');
        }
    }
    
    // Check win/lose conditions
    if (guess === target) {
        document.getElementById('wordle-message').innerHTML = '<span class="success">🎉 Congratulations! You found the word!</span>';
        wordleState.gameOver = true;
    } else if (wordleState.currentRow === 5) {
        document.getElementById('wordle-message').innerHTML = `<span class="error">Game Over! The word was: ${target}</span>`;
        wordleState.gameOver = true;
    }
    
    // Move to next row
    wordleState.currentRow++;
    wordleState.currentGuess = '';
    document.getElementById('attempts').textContent = wordleState.currentRow;
}

function resetWordle() {
    wordleState.targetWord = wordleState.words[Math.floor(Math.random() * wordleState.words.length)];
    wordleState.currentRow = 0;
    wordleState.currentGuess = '';
    wordleState.gameOver = false;
    
    document.getElementById('attempts').textContent = '0';
    document.getElementById('wordle-message').innerHTML = '';
    
    // Reset grid
    const cells = document.querySelectorAll('.wordle-cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'wordle-cell';
    });
    
    // Reset keyboard
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.className = 'key';
        if (key.textContent === 'ENTER' || key.textContent === '⌫') {
            key.classList.add('wide');
        }
    });
}

function startWordle() {
    // Switch to Wordle game
    document.querySelectorAll('.game-card').forEach(card => card.classList.remove('active'));
    document.querySelector('[data-game="wordle"]').classList.add('active');
    
    document.querySelectorAll('.game-content').forEach(content => content.classList.remove('active'));
    document.getElementById('wordle-game').classList.add('active');
    
    currentGame = 'wordle';
    resetWordle();
    
    // Scroll to game
    document.querySelector('.game-container').scrollIntoView({ behavior: 'smooth' });
}

// WORD SCRAMBLE GAME
function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

function newScramble() {
    const randomIndex = Math.floor(Math.random() * scrambleState.words.length);
    const wordObj = scrambleState.words[randomIndex];
    
    scrambleState.currentWord = wordObj.word;
    scrambleState.scrambledWord = scrambleWord(wordObj.word);
    
    // Make sure scrambled word is different from original
    while (scrambleState.scrambledWord === scrambleState.currentWord) {
        scrambleState.scrambledWord = scrambleWord(wordObj.word);
    }
    
    document.getElementById('scrambled-word').textContent = scrambleState.scrambledWord;
    document.getElementById('scramble-input').value = '';
    document.getElementById('scramble-message').innerHTML = '';
    
    // Focus input
    setTimeout(() => {
        document.getElementById('scramble-input').focus();
    }, 100);
}

function checkScramble() {
    const userInput = document.getElementById('scramble-input').value.toUpperCase().trim();
    const messageEl = document.getElementById('scramble-message');
    
    if (!userInput) {
        messageEl.innerHTML = '<span class="error">Please enter a word!</span>';
        return;
    }
    
    if (userInput === scrambleState.currentWord) {
        messageEl.innerHTML = '<span class="success">🎉 Correct! Well done!</span>';
        setTimeout(newScramble, 2000);
    } else {
        messageEl.innerHTML = '<span class="error">❌ Try again!</span>';
        document.getElementById('scramble-input').value = '';
    }
}

// Add enter key support for scramble
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('scramble-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkScramble();
        }
    });
    
    document.getElementById('wordguess-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkWordGuess();
        }
    });
});

// WORD GUESS GAME
function newWordGuess() {
    const randomIndex = Math.floor(Math.random() * wordGuessState.words.length);
    const wordObj = wordGuessState.words[randomIndex];
    
    wordGuessState.currentWord = wordObj.word;
    wordGuessState.hint = wordObj.hint;
    
    document.getElementById('word-hint').textContent = wordObj.hint;
    document.getElementById('wordguess-input').value = '';
    document.getElementById('wordguess-message').innerHTML = '';
    
    // Focus input
    setTimeout(() => {
        document.getElementById('wordguess-input').focus();
    }, 100);
}

function checkWordGuess() {
    const userInput = document.getElementById('wordguess-input').value.toUpperCase().trim();
    const messageEl = document.getElementById('wordguess-message');
    
    if (!userInput) {
        messageEl.innerHTML = '<span class="error">Please enter a word!</span>';
        return;
    }
    
    if (userInput === wordGuessState.currentWord) {
        messageEl.innerHTML = '<span class="success">🎉 Excellent! You got it right!</span>';
        setTimeout(newWordGuess, 2000);
    } else {
        messageEl.innerHTML = '<span class="error">❌ Not quite right. Try again!</span>';
        document.getElementById('wordguess-input').value = '';
    }
}

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
