// selectionner.js
const fs = require('fs');
const readline = require('readline');

/**
 * Writes an array of questions to a GIFT file
 * @param {Array} questions - List of questions objects {titre, enonce, bonnesReponses}
 * @param {string} filename - Output filename
 */
function writeGiftFile(questions, filename) {
    const lines = [];

    questions.forEach(q => {
        const titre = q.titre ? `::${q.titre}:: ` : '';
        lines.push(titre + q.enonce);
        lines.push('{');
        const correct = q.bonnesReponses[0]; // 'T' or 'F'
        const wrong = correct === 'T' ? 'F' : 'T';
        lines.push(`=${correct}`);
        lines.push(`~${wrong}`);
        lines.push('}\n');
    });

    try {
        fs.writeFileSync(filename, lines.join('\n'), 'utf8');
    } catch (err) {
        console.error("Erreur : impossible d'écrire le fichier.", err.message);
        return;
    }
}

/**
 * Parses a simple GIFT file with T/F questions
 * @param {string} data - Content of the GIFT file
 * @returns {Array} questions
 */
function parseGiftFile(data) {
    const lines = data.split(/\r?\n/);
    const questions = [];
    let currentQ = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        if (line.startsWith("::")) {
            currentQ = { titre: line.split("::")[1] || "Sans titre", enonce: "", bonnesReponses: [] };
        } else if (line.startsWith("{")) {
            // start of answers
        } else if (line.startsWith("=")) {
            if (currentQ) currentQ.bonnesReponses.push(line.replace("=", "").trim());
        } else if (line.startsWith("~")) {
            // ignore wrong answer
        } else {
            if (currentQ) currentQ.enonce = line;
            questions.push(currentQ);
            currentQ = null;
        }
    });

    return questions;
}

/**
 * Interactive question selection
 * @param {string} inputFile - Existing GIFT file
 * @param {string} outputFile - New GIFT file with selected questions
 */
async function selectQuestionsFromFile(inputFile, outputFile) {
    if (!fs.existsSync(inputFile)) {
        console.error("Erreur : fichier introuvable :", inputFile);
        return;
    }

    const data = fs.readFileSync(inputFile, 'utf8');
    const questions = parseGiftFile(data);

    if (!questions.length) {
        console.log("Le fichier est vide ou ne contient aucune question.");
        return;
    }

    const selected = [];
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    async function askQuestion() {
        console.log("\nListe des questions disponibles :");
        questions.forEach((q, idx) => {
            console.log(`  ${idx + 1}) ${q.titre} - ${q.enonce}`);
        });

        const questionId = await new Promise(resolve => {
            rl.question("Entrez l'ID de la question à ajouter : ", ans => resolve(parseInt(ans, 10) - 1));
        });

        if (Number.isNaN(questionId) || questionId < 0 || questionId >= questions.length) {
            console.log("ID invalide, essayez un numéro valide.");
            return askQuestion();
        }

        if (selected.includes(questionId)) {
            console.log("Cette question a déjà été sélectionnée.");
            return askQuestion();
        }

        if (selected.length >= 20) {
            console.log("Limite atteinte : 20 questions maximum.");
            rl.close();
            return finalizeSelection();
        }

        selected.push(questionId);

        const more = await new Promise(resolve => {
            rl.question("Voulez-vous ajouter une autre question ? (oui/non) : ", ans => resolve(ans.toLowerCase()));
        });

        if (more === 'oui') {
            askQuestion();
        } else {
            rl.close();
            finalizeSelection();
        }
    }

    function finalizeSelection() {
        if (selected.length < 1) {
            console.log("Aucune question sélectionnée, fichier non modifié.");
            return;
        }

        const filteredQuestions = selected.map(idx => questions[idx]);
        writeGiftFile(filteredQuestions, outputFile);
        console.log(`Fichier GIFT créé avec succès : ${outputFile}`);
    }

    askQuestion();
}

module.exports = { selectQuestionsFromFile };
