const fs = require('fs');

console.log("Script starting...");

function buildDictionary(txtFilename, jsonFilename) {
    console.log(`Attempting to read: ${txtFilename}`);
    
    if (!fs.existsSync(txtFilename)) {
        console.error(`ERROR: File not found: ${txtFilename}`);
        return;
    }

    try {
        const rawText = fs.readFileSync(txtFilename, 'utf-8');
        console.log(`Read ${rawText.length} characters from ${txtFilename}`);
        
        const wordsArray = rawText
            .split(/\r?\n/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length >= 4 && /^[A-Z]+$/.test(word));
        
        const uniqueWords = [...new Set(wordsArray)];
        fs.writeFileSync(jsonFilename, JSON.stringify(uniqueWords));
        
        console.log(`SUCCESS: Created ${jsonFilename} with ${uniqueWords.length} words.`);
    } catch (error) {
        console.error(`SYSTEM ERROR processing ${txtFilename}:`, error.message);
    }
}

// Adjust these to match your exact file names (with or without .txt)
buildDictionary('englishWords.txt', 'en.json');
buildDictionary('italianWords.txt', 'it.json');

console.log("Script finished.");