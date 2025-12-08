const fs = require('fs');

// Predefined 8 True/False questions
const questions = [
    {
        titre: "Q1 Basic JS",
        enonce: "JavaScript is a statically typed language.",
        bonnesReponses: ["F"]
    },
    {
        titre: "Q2 HTML",
        enonce: "The <title> tag defines the title of a webpage.",
        bonnesReponses: ["T"]
    },
    {
        titre: "Q3 CSS",
        enonce: "CSS stands for Cascading Style Sheets.",
        bonnesReponses: ["T"]
    },
    {
        titre: "Q4 JS Arrays",
        enonce: "In JavaScript, arrays are fixed in size.",
        bonnesReponses: ["F"]
    },
    {
        titre: "Q5 DOM",
        enonce: "The DOM represents the HTML elements of a webpage.",
        bonnesReponses: ["T"]
    },
    {
        titre: "Q6 HTTP",
        enonce: "HTTP stands for HyperText Transfer Protocol.",
        bonnesReponses: ["T"]
    },
    {
        titre: "Q7 JS Functions",
        enonce: "A JavaScript function can return multiple values directly.",
        bonnesReponses: ["F"]
    },
    {
        titre: "Q8 HTML Forms",
        enonce: "The <input> element can have a type='email'.",
        bonnesReponses: ["T"]
    }
];

function generateGiftFile(filename) {
    const lines = [];

    for (const q of questions) {
        const titre = q.titre ? `::${q.titre}:: ` : "";
        lines.push(titre + q.enonce);

        // Build True/False options
        lines.push("{");
        const correct = q.bonnesReponses[0]; // T or F
        const wrong = correct === "T" ? "F" : "T";
        lines.push(`=${correct}`);
        lines.push(`~${wrong}`);
        lines.push("}\n");
    }

    fs.writeFileSync(filename, lines.join("\n"), 'utf8');
    console.log("GIFT file generated:", filename);
    return filename;
}

module.exports = { generateGiftFile };
