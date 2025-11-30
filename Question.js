var Question = function (id, titre, type, enonce, reponses) {
	this.id = id
	this.titre = titre;
	this.enonce = enonce;
	this.type = type;
	this.reponses = [].concat(reponses);
}



Question.prototype.toString = function () {
	let display = ""
	display += "Titre: " + this.titre + '\r\n'
	display += "Description: " + this.enonce + '\r\n'
	display += "Type: " + this.type + '\r\n'
	display += "Réponses possibles: " + '\r\n'
	for (reponse of this.reponses) {
		display += "\t" + reponse + '\r\n'
	}
	return display
}


Question.prototype.contains = function (needle) {
	let found = false
	if (this.titre.includes(needle)) {
		found = true
	}
	if (this.enonce.includes(needle)) {
		found = true
	}
	if (this.type.includes(needle)) {
		found = true
	}
	for (reponse of this.reponses) {
		if (reponse.includes(needle)) {
			found = true
		}
	}
	return found
}

module.exports = Question;