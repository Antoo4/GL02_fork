
class Question {
    constructor(id, titre, format, type, enonce, reponses = [], bonnesReponses = []) {
        this.id = id;
        this.titre = titre;
        this.format = format;
        this.enonce = enonce;
        this.type = type;
        this.reponses = Array.isArray(reponses) ? reponses : [];
        this.bonnesReponses = Array.isArray(bonnesReponses) ? bonnesReponses : [];
    }

    toString() {
        let display = "";
        display += "ID: " + this.id + "\n";
        display += "Titre: " + this.titre + "\n";
        display += "Format: " + this.format + "\n";
        display += "Enoncé: " + this.enonce + "\n";
        display += "Type: " + this.type + "\n";
        display += "Réponses possibles:\n";
        this.reponses.forEach(r => display += "  - " + r + "\n");
        display += "Bonnes réponses:\n";
        this.bonnesReponses.forEach(r => display += "  * " + r + "\n");
        return display;
    }

}

module.exports = Question;
