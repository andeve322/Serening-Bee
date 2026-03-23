import { DictionaryEntity, PuzzleEntity, ProgressEntity } from './Entity.js';
import { GameControl } from './Control.js';
import { UIBoundary } from './Boundary.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dictionary = new DictionaryEntity();
    const puzzle = new PuzzleEntity();
    const progress = new ProgressEntity();
    
    const control = new GameControl(dictionary, puzzle, progress);
    const ui = new UIBoundary(control);

    // Wait for dictionaries to load before showing the game
    const loaded = await control.init();
    if (loaded) {
        ui.showGame();
    } else {
        document.getElementById('loading-overlay').textContent = "Error loading dictionaries.";
    }
});