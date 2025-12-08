// SimulateExam.js
const fs = require('fs');
const readline = require('readline');
const GIFTParser = require('./GIFTParser');

/**
 * Simule la passation d'un examen GIFT
 * EF06 du cahier des charges
 */
async function simulateExamFromFile(giftPath) {
    // 1) Vérifier que le fichier existe
    if (!fs.existsSync(giftPath)) {
        console.error("Erreur lors de la lecture du fichier GIFT : fichier introuvable.");
        return;
    }

    console.log("Chargement du fichier GIFT :", giftPath);

    // 2) Parser le fichier (pour l’instant : fakeParse)
    const parser = new GIFTParser(false, false);

    try {
        // TODO pour plus tard : parser.parse(giftPath);
        parser.fakeParse();
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier GIFT.");
        return;
    }

    const questions = parser.parsedQuestions;

    if (!questions || questions.length === 0) {
        console.log("Le fichier est vide ou ne contient aucune question.");
        return;
    }

    // 3) Création de l'interface utilisateur CLI
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let currentIndex = 0;
    let correctCount = 0;
    let details = [];

    function askQuestion() {
        if (currentIndex >= questions.length) {
            rl.close();
            return showFinalReport();
        }

        const q = questions[currentIndex];

        console.log("\n--------------------------------------------------");
        console.log(`Question ${currentIndex + 1} :`);
        if (q.titre) console.log(`Titre : ${q.titre}`);
        console.log(q.enonce);

        // Affichage des réponses possibles
        q.reponses.forEach((r, i) => {
            console.log(`  ${i + 1}) ${r.text}`);
        });

        rl.question("Votre réponse (numéro) : ", (answer) => {
            const index = parseInt(answer, 10) - 1;

            if (Number.isNaN(index) || index < 0 || index >= q.reponses.length) {
                console.log("Entrée invalide, mauvais format de réponse.");
                return askQuestion();
            }

            const selected = q.reponses[index];
            const isCorrect = !!selected.correct;

            if (isCorrect) correctCount++;

            const goodAnswer = q.reponses.find(r => r.correct) || { text: "N/A" };

            details.push({
                question: q.enonce,
                user: selected.text,
                correct: isCorrect,
                good: goodAnswer.text
            });

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
            console.log(
                `Q${i + 1} : ${d.question} | Réponse : ${d.user} -> ${d.correct ? "Correct" : "Incorrect"} (Bonne réponse : '${d.good}')`
            );
        });

        console.log("--------------------------------------------------\n");
    }

    askQuestion();
}

module.exports = {
    simulateExamFromFile
};
