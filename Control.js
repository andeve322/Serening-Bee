export class GameControl {
    constructor(dictionaryEntity, puzzleEntity, progressEntity) {
        this.dictionary = dictionaryEntity;
        this.puzzle = puzzleEntity;
        this.progress = progressEntity;
    }

    async init() {
        try {
            const [enRes, itRes] = await Promise.all([
                fetch('en.json'),
                fetch('it.json')
            ]);
            
            this.dictionary.words.en = await enRes.json();
            this.dictionary.words.it = await itRes.json();
            
            this.generateNewPuzzle();
            return true;
        } catch (error) {
            console.error("Failed to load dictionaries", error);
            return false;
        }
    }

    setLanguage(lang) {
        this.dictionary.currentLang = lang;
        this.generateNewPuzzle();
    }

    generateNewPuzzle() {
        const currentDict = this.dictionary.words[this.dictionary.currentLang];
        
        // Find pangrams (words with exactly 7 unique letters)
        const pangrams = currentDict.filter(word => new Set(word.toUpperCase()).size === 7);
        
        if (pangrams.length === 0) {
            console.error("No valid pangrams found in the dictionary to generate a puzzle.");
            return;
        }

        // Pick a random pangram
        const randomPangram = pangrams[Math.floor(Math.random() * pangrams.length)].toUpperCase();
        const uniqueLetters = Array.from(new Set(randomPangram));

        // Assign center and outer letters
        const centerIndex = Math.floor(Math.random() * uniqueLetters.length);
        const centerLetter = uniqueLetters[centerIndex];
        const outerLetters = uniqueLetters.filter((_, index) => index !== centerIndex);

        // Compute all valid words for this specific set
        const validSet = new Set(uniqueLetters);
        const validWords = new Set(
            currentDict
                .map(w => w.toUpperCase())
                .filter(word => 
                    word.length >= 4 &&
                    word.includes(centerLetter) &&
                    [...word].every(char => validSet.has(char))
                )
        );

        this.puzzle.update(centerLetter, outerLetters, validWords);
        this.progress.reset();
    }

    processGuess(guess) {
        const word = guess.toUpperCase();

        if (word.length < 4) return { valid: false, message: "Too short" };
        if (!word.includes(this.puzzle.centerLetter)) return { valid: false, message: "Missing center letter" };

        const validLetters = new Set(this.puzzle.getAllLetters());
        for (let char of word) {
            if (!validLetters.has(char)) return { valid: false, message: "Invalid letters used" };
        }

        if (this.progress.hasWord(word)) return { valid: false, message: "Already found" };
        if (!this.puzzle.validWords.has(word)) return { valid: false, message: "Not in word list" };

        const isPangram = this.checkPangram(word);
        const points = this.calculateScore(word, isPangram);
        
        this.progress.addWord(word);
        this.progress.addScore(points);

        return { 
            valid: true, 
            message: isPangram ? "Pangram!" : "Good!", 
            points: points,
            word: word,
            totalScore: this.progress.score
        };
    }

    calculateScore(word, isPangram) {
        if (word.length === 4) return 1;
        let score = word.length;
        if (isPangram) score += 7;
        return score;
    }

    checkPangram(word) {
        const uniqueLetters = new Set(word);
        return uniqueLetters.size === 7;
    }
}