const fs = require('fs');
const readline = require('readline');
const GIFTParser = require('./GIFTParser.js');

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
            console.log(`  ${i + 1}) ${r}`);
        });

        rl.question("Votre réponse (numéro) : ", answer => {
            const index = parseInt(answer, 10) - 1;
            if (isNaN(index) || index < 0 || index >= q.reponses.length) {
                console.log("Entrée invalide, essayez un numéro valide.");
                askQuestion();
                return;
            }

            const selectedAnswer = q.reponses[index];
            const selectedCorrect = q.bonnesReponses[index] === 1;
            const correctAnswer = q.reponses[q.bonnesReponses.findIndex(b => b === 1)];
            
            details.push({
                question: q.enonce,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedCorrect,
                correctAnswer: correctAnswer,
            });

            if (selectedCorrect) {
                correctCount++;
            }

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
            const status = d.isCorrect ? "Correct" : "Incorrect";
            // Montre la bonne réponse si incorrect
            console.log(`Q${i + 1} : ${d.question} | Votre réponse : '${d.selectedAnswer}' -> ${status} ${!d.isCorrect ? ` (Bonne réponse : '${d.correctAnswer}')` : ''}`);
        });
        console.log("--------------------------------------------------\n");
    }

    askQuestion();
}

module.exports = { simulateExamFromFile };
