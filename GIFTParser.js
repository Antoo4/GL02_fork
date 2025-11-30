var Question = require('./Question');


var GIFTParser = function(sTokenize, sParsedSymb){
	//TODO
	this.parsedQuestions = [];
	this.symb = [];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

GIFTParser.prototype.fakeParse = function(){

	//TODO
	let fake = new Question();
	fake.id = 1
	fake.titre = "Fake Question n°1"
	fake.enonce = "This is the fake question n° 1"
	fake.type = "Choix Multiple (QCM)"
	fake.reponses = ["ANS1","ANS2","ANS3","ANS4"]

	this.parsedQuestions.push(fake)

	let fake2 = new Question();
	fake2.id = 2
	fake2.titre = "Fake Question n°2"
	fake2.enonce = "This is the alternative fake question n° 2"
	fake2.type = "Choix Multiple (QCM)"
	fake2.reponses = ["ANS1","ANS2","ANS3","ANS4"]

	this.parsedQuestions.push(fake2)
}


module.exports = GIFTParser;