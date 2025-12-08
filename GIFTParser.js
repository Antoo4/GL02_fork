var Question = require('./Question');


var GIFTParser = function(sTokenize, sParsedSymb){
	//TODO
	this.parsedQuestions = [];
	this.symb = ["//", "$CATEGORY:", "::"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
	this.index = 0;
}

// tokenize : tranform the data input into a list
// <eol> = CRLF
GIFTParser.prototype.tokenize = function(data) {
	var separator = /(\n\n|\n\r\n)/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator));
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
GIFTParser.prototype.parse = function (data) {
	var tData = this.tokenize(data);
	if (this.showTokenize) {
		console.log(tData);
	}
	this.objectGift(tData);
}

GIFTParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
GIFTParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
GIFTParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}

// check : check whether the arg elt is on the head of the list
GIFTParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
GIFTParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}


// Parser rules


// <objectGift> = *(Commentaire / Catégorie / Question)
GIFTParser.prototype.objectGift = function(input){
	input.forEach(element => {
		this.commentaire(element);
		this.categorie(element);
		this.question(element);
	});
}

// <commentaire> = "//" TEXT CRLF
GIFTParser.prototype.commentaire = function(input){
	//console.log(input);
}

// <categorie> = BLANK_LINE "$CATEGORY:" TEXT BLANK_LINE
GIFTParser.prototype.categorie = function(input){
	//console.log(input);
}

// <question> = “::” [texte] “::” [format] texte (“{“ vrai_faux / multiple / courte / appariement / numerique / composition ”}”)
GIFTParser.prototype.question = function(input){
	let matched = input.match(/::.{1,}::/);
	if (matched) {
		let titre = matched[0].split('::').join('');
		let format = 'sansformat';
		let contenu = {}
		matched = input.match(/\[.{1,}\]/);
		if (matched) {
			format = matched[0].split(/\[|\]/).join('');
			contenu = this.contenuQuestion(input);
		} else {
			contenu = this.contenuQuestion(input);
		}

		this.index += 1;
		let newQuestion = new Question(this.index, titre, format, contenu.type, contenu.texte, contenu.reponses, contenu.bonnesReponses);
		this.parsedQuestions.push(newQuestion);
	}
}

GIFTParser.prototype.contenuQuestion = function(input) {
	let texte = input.match(/::(?!.*::)[\s\S]*$/)[0];
	if (input.match(/\[.{1,}\]/)) { // If there is a format
		texte = input.match(/][\s\S]*$/)[0];
	}

	let reponses = input.match(/{([^}]{1,})}/);
	let bonnesReponses = [];
	let type;
	if (reponses) {
		reponses = reponses[0].split('{').join('').split('}').join('');
		texte = texte.replace('{', '___').replace('}', '');
		texte = texte.replace(reponses, '');
		reponses = reponses.split('\r\n').join('').split('\n').join('').split('  ').join('');

		//Types de question

		//VRAIFAUX - L'utilisateur doit rentrer une des bonnesReponses (1 pour vrai ou 0 pour faux), reponses contient le texte a afficher en cas de bonne réponse
		vraiFaux = reponses.match(/^(TRUE|T|FALSE|F)#/);

		//multiple - La liste reponses contient les choix, la liste bonnesReponses est composée de 0 si la réponse a cet index est fausse et 1 si elle est vraie.
		multiple = reponses.match(/~.*/);

		//courte - L'utilisateur doit rentrer une des bonnesReponses
		courte = reponses.match(/=.*/);

		//appariement - La liste réponse contient une moitié de paire, bonneRéponses contient l'autre moitié au même index.
		appariement = reponses.match(/=.*->.*/);

		//numerique - La liste bonneReponses contient les bonnes réponses.
		numerique = reponses.match(/^#/);

		if (vraiFaux) {
			type = "vraiFaux";
			if (vraiFaux[0].match(/(TRUE|T)/)) { // True
				bonnesReponses = [1];
			} else { // False
				bonnesReponses = [0];
			}
			reponses = reponses.split('#');
		}
		else if (multiple) { // TODO
			type = "multiple";
			reponses = reponses.split('~');
			if (reponses[0][0] == '=') {
				reponses[0] = reponses[0].substring(1);
				bonnesReponses.push(1);
			} else {
				reponses.shift();
			}
			reponses.forEach(elem => {
				if (elem[0] == '=') {
					let newElem = elem.substring(1);
					reponses[reponses.indexOf(elem)] = newElem;
					bonnesReponses.push(1);
				} else if (elem.includes('=')) {
					let newElem = elem.substring(0, elem.indexOf('='));
					let newBonneReponse = elem.substring(elem.indexOf('=')+1);
					reponses[reponses.indexOf(elem)] = newElem;
					reponses.splice(reponses.indexOf(elem)-1,0,newBonneReponse);
					bonnesReponses.push(0);
					bonnesReponses.push(1);
				} else {
					bonnesReponses.push(0);
				}
			});
		}
		else if (appariement) {
			type = "appariement";
			
			bonnesReponses = reponses.split('->');
			bonnesReponses.shift();
			bonnesReponses.forEach(elem => {
				if (elem.indexOf('=') > 0) {
					let newElem = elem.substring(0, elem.indexOf('='));
					bonnesReponses[bonnesReponses.indexOf(elem)] = newElem;
				}
			});
			reponses = reponses.split('=');
			reponses.shift();
			reponses.forEach(elem => {
				let newElem = elem.substring(0, elem.indexOf('-'));
				reponses[reponses.indexOf(elem)] = newElem;
			});
		}
		else if (numerique) {
			type = "numerique";
			bonnesReponses = reponses.split('=');
			bonnesReponses.shift();
			bonnesReponses.forEach(elem => {
				let newElem;
				if (elem.match(/%/)) {
					newElem = elem.substring(elem.indexOf('%',1)+1, elem.indexOf(':'));
				} else {
					newElem = elem.substring(0, elem.indexOf(':'));
				}
				bonnesReponses[bonnesReponses.indexOf(elem)] = newElem;
			});
			reponses = [];
		}
		else if (courte) {
			type = "courte";
			bonnesReponses = reponses.split('=');
			bonnesReponses.shift();
			reponses = [];
		}
		

	} else {
		//Type sans réponse

		type = "sansreponse";
		reponses = [];

	}

	texte = texte.split('::').join('').split(']').join('').split('{').join('').split('\r\n').join('').split('\n').join('');

	return {type, texte, reponses, bonnesReponses}

}

GIFTParser.prototype.profile = function () {
	let hist = {}
	this.parsedQuestions.forEach(question => {
		if (!hist[question.type]) {
			hist[question.type] = 0;
		}
		hist[question.type] += 1;
	});
	return hist;
}
// Add this at the bottom of GIFTParser.js
GIFTParser.prototype.fakeParse = function(filePath = "1_sample.gift") {
    const fs = require('fs');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        this.parse(data); // ✅ call the real parser
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier :", err.message);
    }
};


module.exports = GIFTParser;