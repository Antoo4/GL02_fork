const fs = require('fs');
const readline = require('readline');
const GIFTParser = require('./GIFTParser'); // your parser
const { generateGiftFile } = require('./GiftGenerator'); // your generator

async function selectQuestionsFromFile(giftPath) {
    if (!fs.existsSync(giftPath)) {
        console.error("Erreur : fichier introuvable :", giftPath);
        return;
    }

    const data = fs.readFileSync(giftPath, 'utf8');
    const parser = new GIFTParser();
    parser.parse(data);
    const questions = parser.parsedQuestions;

    if (!questions || questions.length === 0) {
        console.log("Le fichier est vide ou ne contient aucune question.");
        return;
    }

    const selected = [];
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    async function askQuestion() {
        console.log("\nListe des questions disponibles :");
        questions.forEach((q, idx) => {
            console.log(`  ${idx + 1}) ${q.titre || 'Sans titre'} - ${q.enonce}`);
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

        try {
            generateGiftFile(filteredQuestions, giftPath); 
            console.log(`Fichier GIFT mis à jour : ${giftPath}`);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du fichier :", err.message || err);
        }
    }

    askQuestion();
}

module.exports = { selectQuestionsFromFile };
