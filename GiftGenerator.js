// GiftGenerator.js
const fs = require('fs');

function generateGiftFile(questions, filename) {
    // 1) Vérifier le nombre de questions (15 à 20)
    if (!Array.isArray(questions)) {
        throw new Error("La liste de questions est invalide.");
    }

    const count = questions.length;
    if (count < 15 || count > 20) {
        throw new Error(
            "Erreur : Un examen réglementaire doit contenir entre 15 et 20 questions."
        );
    }

    // 2) Construire le contenu GIFT
    let lines = [];

    for (const q of questions) {
        // Ligne titre + énoncé
        // ::Titre:: Enoncé
        const titre = q.titre ? `::${q.titre}:: ` : "";
        lines.push(titre + q.enonce);

        // Bloc de réponses
        lines.push("{");

        if (q.type === "Choix Multiple (QCM)") {
            for (const r of q.reponses) {
                const prefix = r.correct ? "=" : "~";
                // weight optionnel : %100%
                const weight =
                    typeof r.weight === "number" && r.weight !== 100
                        ? `%${r.weight}%`
                        : "";
                lines.push(prefix + weight + r.text);
            }
        } else {
            // pour d'autres types, à adapter plus tard
            for (const r of q.reponses) {
                lines.push("=" + r.text);
            }
        }

        lines.push("}");
        lines.push(""); // ligne vide entre questions
    }

    const content = lines.join("\n");

    // 3) Écrire le fichier
    try {
        fs.writeFileSync(filename, content, 'utf8');
        console.log("Fichier GIFT généré avec succès :", filename);
    } catch (err) {
        console.error("Erreur : Impossible d'écrire le fichier sur le disque.");
        console.error(err.message);
        throw err;
    }
}

module.exports = {
    generateGiftFile,
};
