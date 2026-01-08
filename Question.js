
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

    contains(needle) {
        const searchText = needle.toLowerCase();
        
        // Recherche dans le titre
        if (this.titre && this.titre.toLowerCase().includes(searchText)) {
            return true;
        }
        
        // Recherche dans l'énoncé
        if (this.enonce && this.enonce.toLowerCase().includes(searchText)) {
            return true;
        }
        
        // Recherche dans les réponses
        if (this.reponses && this.reponses.some(r => r.toLowerCase().includes(searchText))) {
            return true;
        }
        
        return false;
    }

}

module.exports = Question;
