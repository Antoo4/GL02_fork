// main.js
const { generateGiftFile } = require('./GiftGenerator');
const GIFTParser = require('./GIFTParser');

// Imaginons que tu aies déjà une liste de questions sélectionnées :
const parser = new GIFTParser(false, false);
parser.fakeParse(); // plus tard -> parser.parseFichier('banque.gift');

const selectedQuestions = parser.parsedQuestions.slice(0, 15); // exemple

try {
    generateGiftFile(selectedQuestions, 'examen.gift');
} catch (e) {
    // message déjà affiché dans generateGiftFile
}
