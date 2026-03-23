export class DictionaryEntity {
    constructor() {
        this.words = { en: [], it: [] };
        this.currentLang = 'en';
    }
}

export class PuzzleEntity {
    constructor() {
        this.centerLetter = '';
        this.outerLetters = [];
        this.validWords = new Set();
    }

    update(center, outers, validWordsSet) {
        this.centerLetter = center;
        this.outerLetters = outers;
        this.validWords = validWordsSet;
    }

    getAllLetters() {
        return [this.centerLetter, ...this.outerLetters];
    }
}

export class ProgressEntity {
    constructor() {
        this.foundWords = new Set();
        this.score = 0;
    }

    reset() {
        this.foundWords.clear();
        this.score = 0;
    }

    addWord(word) {
        this.foundWords.add(word);
    }

    hasWord(word) {
        return this.foundWords.has(word);
    }

    addScore(points) {
        this.score += points;
    }
}