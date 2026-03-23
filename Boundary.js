export class UIBoundary {
    constructor(control) {
        this.control = control;
        this.currentInput = "";
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.cacheDOM();
        this.bindEvents();
    }

cacheDOM() {
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.gameContainer = document.getElementById('game-container');
        this.inputDisplay = document.getElementById('current-input');
        this.scoreValue = document.getElementById('score-value');
        this.messageBox = document.getElementById('message-box');
        this.foundWordsUl = document.getElementById('found-words-ul');
        this.hexButtonsOuter = Array.from(document.querySelectorAll('.hex-btn.outer'));
        this.hexButtonCenter = document.querySelector('.hex-btn.center');
        
        // Updated Controls
        this.btnDelete = document.getElementById('btn-delete');
        this.btnShuffle = document.getElementById('btn-shuffle');
        this.btnEnter = document.getElementById('btn-enter');
        this.btnHelp = document.getElementById('btn-help');
        
        // Modal Elements
        this.rulesModal = document.getElementById('rules-modal');
        this.btnCloseRules = document.getElementById('btn-close-rules');
        this.rulesTitle = document.getElementById('rules-title');
        this.rulesText = document.getElementById('rules-text');
        
        this.inputContainer = document.getElementById('input-display');
        this.langToggle = document.getElementById('lang-toggle');
        this.btnNewGame = document.getElementById('btn-new-game');
    }

bindEvents() {
        const allHexes = [...this.hexButtonsOuter, this.hexButtonCenter];
        allHexes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addLetter(e.target.dataset.letter);
                this.playSound(400, 'sine', 0.05);
            });
        });

        this.btnDelete.addEventListener('click', () => this.deleteLetter());
        this.btnShuffle.addEventListener('click', () => this.shuffleOuterLetters());
        this.btnEnter.addEventListener('click', () => this.submitGuess());
        
        this.btnHelp.addEventListener('click', () => this.toggleRules(true));
        this.btnCloseRules.addEventListener('click', () => this.toggleRules(false));

        this.langToggle.addEventListener('change', (e) => {
            this.control.setLanguage(e.target.value);
            this.renderGame();
        });

        this.btnNewGame.addEventListener('click', () => {
            this.control.generateNewPuzzle();
            this.renderGame();
        });

        this.initRules();
    }

    renderGame() {
        this.hexButtonCenter.dataset.letter = this.control.puzzle.centerLetter;
        this.hexButtonCenter.textContent = this.control.puzzle.centerLetter;

        this.control.puzzle.outerLetters.forEach((letter, index) => {
            this.hexButtonsOuter[index].dataset.letter = letter;
            this.hexButtonsOuter[index].textContent = letter;
        });

        this.clearInput();
        this.scoreValue.textContent = this.control.progress.score;
        this.foundWordsUl.innerHTML = '';
        this.control.progress.foundWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            this.foundWordsUl.prepend(li);
        });
    }

    showGame() {
        this.loadingOverlay.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        this.renderGame();
    }

    addLetter(letter) {
        this.currentInput += letter;
        this.updateInputDisplay();
    }

    deleteLetter() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateInputDisplay();
    }

    updateInputDisplay() {
        this.inputDisplay.textContent = this.currentInput;
    }

    clearInput() {
        this.currentInput = "";
        this.updateInputDisplay();
    }

    showMessage(msg) {
        this.messageBox.textContent = msg;
        this.messageBox.classList.add('show');
        setTimeout(() => {
            this.messageBox.classList.remove('show');
        }, 1500);
    }

submitGuess() {
        if (this.currentInput.length === 0) return;

        const result = this.control.processGuess(this.currentInput);

        if (result.valid) {
            this.playSound(600, 'triangle', 0.1);
            this.showMessage(result.message);
            this.scoreValue.textContent = result.totalScore;
            
            const li = document.createElement('li');
            li.textContent = result.word;
            this.foundWordsUl.prepend(li);
            
            this.clearInput();
        } else {
            this.playSound(200, 'sawtooth', 0.1);
            this.showMessage(result.message);
            this.triggerShake();
            
            // Clears the input field after the 300ms shake animation completes
            setTimeout(() => {
                this.clearInput();
            }, 300);
        }
    }

    triggerShake() {
        this.inputContainer.classList.remove('shake-animation');
        void this.inputContainer.offsetWidth;
        this.inputContainer.classList.add('shake-animation');
    }

    shuffleOuterLetters() {
        const letters = this.hexButtonsOuter.map(hex => hex.dataset.letter);
        
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }

        this.hexButtonsOuter.forEach((hex, index) => {
            hex.dataset.letter = letters[index];
            hex.textContent = letters[index];
        });
    }

    playSound(freq, type, duration) {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + duration);
    }
    initRules() {
        const userLang = navigator.language || navigator.userLanguage;
        const isItalian = userLang.toLowerCase().startsWith('it');

        if (isItalian) {
            this.rulesTitle.textContent = "Regole di Serening Bee";
            this.btnCloseRules.textContent = "Chiudi";
            this.rulesText.innerHTML = `
                <li>Le parole devono contenere almeno 4 lettere.</li>
                <li>Le parole devono includere la lettera centrale.</li>
                <li>Le lettere possono essere usate più di una volta.</li>
                <li>Le parole di 4 lettere valgono 1 punto.</li>
                <li>Le parole più lunghe valgono 1 punto per ogni lettera.</li>
                <li>I "Pangrammi" usano tutte e 7 le lettere e valgono 7 punti extra.</li>
            `;
        } else {
            this.rulesTitle.textContent = "Serening Bee Rules";
            this.btnCloseRules.textContent = "Close";
            this.rulesText.innerHTML = `
                <li>Words must contain at least 4 letters.</li>
                <li>Words must include the center letter.</li>
                <li>Letters can be used more than once.</li>
                <li>Words with 4 letters are worth 1 point.</li>
                <li>Longer words earn 1 point per letter.</li>
                <li>"Pangrams" use all 7 letters and earn 7 extra points.</li>
            `;
        }
    }

    toggleRules(show) {
        if (show) {
            this.rulesModal.classList.remove('modal-hidden');
        } else {
            this.rulesModal.classList.add('modal-hidden');
        }
    }
}

