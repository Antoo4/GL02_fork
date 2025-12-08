// GIFTParser.js
const Question = require('./Question');

function GIFTParser(showTokenize, showParsedSymb) {
    this.parsedQuestions = [];
    this.symb = [];
    this.showTokenize = showTokenize;
    this.showParsedSymbols = showParsedSymb;
    this.errorCount = 0;
}

// Fake parse: just creates two sample questions
GIFTParser.prototype.fakeParse = function () {
    const q1 = new Question(
        1,
        "Fake Question n°1",
        "Choix Multiple (QCM)",
        "This is the fake question n° 1",
        [
            { text: "ANS1", correct: true,  weight: 100 },
            { text: "ANS2", correct: false, weight: 0 },
            { text: "ANS3", correct: false, weight: 0 },
            { text: "ANS4", correct: false, weight: 0 },
        ]
    );

    this.parsedQuestions.push(q1);

    const q2 = new Question(
        2,
        "Fake Question n°2",
        "Choix Multiple (QCM)",
        "This is the alternative fake question n° 2",
        [
            { text: "ANS1", correct: false, weight: 0 },
            { text: "ANS2", correct: true,  weight: 100 },
            { text: "ANS3", correct: false, weight: 0 },
            { text: "ANS4", correct: false, weight: 0 },
        ]
    );

    this.parsedQuestions.push(q2);
};

module.exports = GIFTParser;
