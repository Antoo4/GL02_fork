const fs = require('fs');

const questions = [
    { titre: "Q1 JS", enonce: "JavaScript is a statically typed language.", bonnesReponses: ["F"] },
    { titre: "Q2 HTML", enonce: "The <title> tag defines the title of a webpage.", bonnesReponses: ["T"] },
    { titre: "Q3 CSS", enonce: "CSS stands for Cascading Style Sheets.", bonnesReponses: ["T"] },
    { titre: "Q4 JS Arrays", enonce: "In JavaScript, arrays are fixed in size.", bonnesReponses: ["F"] },
    { titre: "Q5 DOM", enonce: "The DOM represents the HTML elements of a webpage.", bonnesReponses: ["T"] },
    { titre: "Q6 HTTP", enonce: "HTTP stands for HyperText Transfer Protocol.", bonnesReponses: ["T"] },
    { titre: "Q7 JS Functions", enonce: "A JavaScript function can return multiple values directly.", bonnesReponses: ["F"] },
    { titre: "Q8 HTML Forms", enonce: "The <input> element can have a type='email'.", bonnesReponses: ["T"] },
    { titre: "Q9 CSS Selectors", enonce: "The ID selector in CSS uses a '.' symbol.", bonnesReponses: ["F"] },
    { titre: "Q10 JS Loops", enonce: "The 'for' loop in JavaScript can iterate over arrays.", bonnesReponses: ["T"] },
    { titre: "Q11 HTML Elements", enonce: "The <footer> element represents the main content of a webpage.", bonnesReponses: ["F"] },
    { titre: "Q12 JS Variables", enonce: "'let' variables can be redeclared in the same scope.", bonnesReponses: ["F"] },
    { titre: "Q13 CSS Units", enonce: "The 'em' unit is relative to the font-size of the parent.", bonnesReponses: ["T"] },
    { titre: "Q14 HTML Forms", enonce: "The <form> element can contain input elements.", bonnesReponses: ["T"] },
    { titre: "Q15 JS Functions", enonce: "Arrow functions bind their own 'this' value.", bonnesReponses: ["F"] },
    { titre: "Q16 HTTP", enonce: "HTTPS is the secure version of HTTP.", bonnesReponses: ["T"] },
    { titre: "Q17 CSS", enonce: "Flexbox is used to create flexible layouts.", bonnesReponses: ["T"] },
    { titre: "Q18 HTML", enonce: "The <head> element contains the content displayed in the browser.", bonnesReponses: ["F"] },
    { titre: "Q19 JS Objects", enonce: "Objects in JavaScript can store key-value pairs.", bonnesReponses: ["T"] },
    { titre: "Q20 CSS", enonce: "The 'position: absolute' property positions relative to the nearest positioned ancestor.", bonnesReponses: ["T"] },
    { titre: "Q21 HTML", enonce: "The <nav> element is used for navigation links.", bonnesReponses: ["T"] },
    { titre: "Q22 JS Arrays", enonce: "The 'push' method removes an element from the end of an array.", bonnesReponses: ["F"] },
    { titre: "Q23 CSS", enonce: "The 'z-index' property controls stacking order.", bonnesReponses: ["T"] },
    { titre: "Q24 JS", enonce: "The 'typeof' operator returns the type of a variable.", bonnesReponses: ["T"] },
    { titre: "Q25 HTML", enonce: "The <section> element represents a thematic grouping of content.", bonnesReponses: ["T"] },
    { titre: "Q26 JS Loops", enonce: "The 'while' loop executes at least once before checking the condition.", bonnesReponses: ["F"] },
    { titre: "Q27 CSS", enonce: "The 'display: none' property hides an element and removes it from the layout.", bonnesReponses: ["T"] },
    { titre: "Q28 HTML", enonce: "The <article> element is intended for self-contained content.", bonnesReponses: ["T"] },
    { titre: "Q29 JS", enonce: "The 'const' keyword allows reassignment of the variable.", bonnesReponses: ["F"] },
    { titre: "Q30 CSS", enonce: "The 'opacity' property can make an element partially transparent.", bonnesReponses: ["T"] }
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
