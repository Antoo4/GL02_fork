const fs = require('fs');
const readline = require('readline');

/**
 * Parse a simple True/False GIFT file
 */
class GIFTParser {
    constructor() {
        this.parsedQuestions = [];
    }

    parse(data) {
        const lines = data.split(/\r?\n/);
        let current = null;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Question title + enonce
            const titleMatch = line.match(/^::(.*?)::\s*(.*)$/);
            if (titleMatch) {
                if (current) this.parsedQuestions.push(current);
                current = {
                    titre: titleMatch[1],
                    enonce: titleMatch[2],
                    reponses: []
                };
            } else if (line.startsWith("{") || line.startsWith("}")) {
                // ignore braces
            } else if (line.startsWith("=") || line.startsWith("~")) {
                const correct = line.startsWith("=");
                const text = line.slice(1).trim();
                current.reponses.push({ text, correct });
            }
        });

        if (current) this.parsedQuestions.push(current);
    }
}

/**
 * Simulate an exam from a GIFT file
 */
async function simulateExamFromFile(giftPath) {
    if (!fs.existsSync(giftPath)) {
        console.error("File not found:", giftPath);
        return;
    }

    const data = fs.readFileSync(giftPath, 'utf8');
    const parser = new GIFTParser();
    parser.parse(data);
    const questions = parser.parsedQuestions;

    if (!questions.length) {
        console.log("No questions found in file.");
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let currentIndex = 0;
    let correctCount = 0;
    const details = [];

    function askQuestion() {
        if (currentIndex >= questions.length) {
            rl.close();
            showFinalReport();
            return;
        }

        const q = questions[currentIndex];
        console.log("\n--------------------------------------------------");
        console.log(`Question ${currentIndex + 1} :`);
        if (q.titre) console.log(`Titre : ${q.titre}`);
        console.log(q.enonce);

        // show options
        q.reponses.forEach((r, i) => {
            console.log(`  ${i + 1}) ${r.text}`);
        });

        rl.question("Votre réponse (numéro) : ", answer => {
            const index = parseInt(answer, 10) - 1;
            if (isNaN(index) || index < 0 || index >= q.reponses.length) {
                console.log("Entrée invalide, essayez un numéro valide.");
                askQuestion();
                return;
            }

            const selected = q.reponses[index];
            const goodAnswer = q.reponses.find(r => r.correct);
            details.push({
                question: q.enonce,
                user: selected.text,
                correct: selected.correct,
                good: goodAnswer.text
            });

            if (selected.correct) correctCount++;
            currentIndex++;
            askQuestion();
        });
    }

    function showFinalReport() {
        console.log("\n\n--- Bilan de votre simulation ---");
        console.log("Total des questions :", questions.length);
        console.log("Réponses correctes :", correctCount);
        console.log("Réponses incorrectes :", questions.length - correctCount);
        console.log("\nDétail :");
        details.forEach((d, i) => {
            const status = d.correct ? "Correct" : "Incorrect";
            console.log(`Q${i + 1} : ${d.question} | Votre réponse : '${d.user}' -> ${status} (Bonne réponse : '${d.good}')`);
        });
        console.log("--------------------------------------------------\n");
    }

    askQuestion();
}

module.exports = { simulateExamFromFile };
