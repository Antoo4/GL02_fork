// main.js

const GIFTParser = require('./GIFTParser');
const { generateGiftFile } = require('./GiftGenerator');
const { simulateExamFromFile } = require('./SimulateExam');

function showUsage() {
    console.log("Usage :");
    console.log("  node main.js test");
    console.log("      -> teste le parser (fakeParse) et affiche les questions");
    console.log("");
    console.log("  node main.js gen <nom_fichier.gift>");
    console.log("      -> génère un fichier GIFT (EF04) à partir des questions parsées");
    console.log("");
    console.log("  node main.js sim <nom_fichier.gift>");
    console.log("      -> simule la passation de l'examen (EF06) à partir d'un fichier GIFT");
    console.log("");
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showUsage();
        process.exit(0);
    }

    const command = args[0];

    if (command === 'test') {
        // Simple test du parser
        const parser = new GIFTParser(false, false);
        parser.fakeParse(); // plus tard : parser.parse('banque.gift');

        console.log("Questions parsées :");
        for (const q of parser.parsedQuestions) {
            console.log("--------------------------------------------------");
            console.log(q.toString());
        }
        return;
    }

    if (command === 'gen') {
        // Génération d'un fichier GIFT (EF04)
        const filename = args[1];
        if (!filename) {
            console.log("Erreur : vous devez préciser un nom de fichier .gift");
            console.log("Exemple : node main.js gen examen.gift");
            process.exit(1);
        }

        // Récupération des questions (pour l'instant via fakeParse)
        const parser = new GIFTParser(false, false);
        parser.fakeParse(); // plus tard : parser.parse('banque.gift');

        // Ici, on simule une sélection de questions.
        // Pour respecter la contrainte 15-20, on duplique les fake questions.
        let selected = [];
        while (selected.length < 15) {
            selected = selected.concat(parser.parsedQuestions);
        }
        selected = selected.slice(0, 15); // on garde 15 questions

        try {
            generateGiftFile(selected, filename);
        } catch (e) {
            // Les messages d'erreur sont déjà affichés dans generateGiftFile
            process.exit(1);
        }
        return;
    }

    if (command === 'sim') {
        // Simulation d'examen (EF06)
        const giftPath = args[1];
        if (!giftPath) {
            console.log("Erreur : vous devez préciser un fichier GIFT à simuler.");
            console.log("Exemple : node main.js sim examen.gift");
            process.exit(1);
        }

        await simulateExamFromFile(giftPath);
        return;
    }

    // Commande inconnue
    console.log("Commande inconnue :", command);
    showUsage();
}

main().catch((err) => {
    console.error("Erreur inattendue :", err);
    process.exit(1);
});
