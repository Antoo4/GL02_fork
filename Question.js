// Question.js
var Question = function (id, titre, type, enonce, reponses) {
    this.id = id;
    this.titre = titre;
    this.enonce = enonce;
    this.type = type;
    // reponses = [{ text: '4', correct: true, weight: 100 }, ...]
    this.reponses = [].concat(reponses || []);
};

Question.prototype.toString = function () {
    let display = "";
    display += "Titre: " + this.titre + '\r\n';
    display += "Description: " + this.enonce + '\r\n';
    display += "Type: " + this.type + '\r\n';
    display += "Réponses possibles: " + '\r\n';
    for (const r of this.reponses) {
        display += "\t" + r.text + '\r\n';
    }
    return display;
};

Question.prototype.contains = function (needle) {
    if (this.titre.includes(needle)) return true;
    if (this.enonce.includes(needle)) return true;
    if (this.type.includes(needle)) return true;
    for (const r of this.reponses) {
        if (r.text.includes(needle)) return true;
    }
    return false;
};

module.exports = Question;
