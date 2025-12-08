var Question = require('./Question');


var GIFTParser = function(sTokenize, sParsedSymb){
	//TODO
	this.parsedQuestions = [];
	this.symb = [];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Dans GIFTParser.prototype.fakeParse
let fake = new Question(
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

this.parsedQuestions.push(fake);

let fake2 = new Question(
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

this.parsedQuestions.push(fake2);



module.exports = GIFTParser;