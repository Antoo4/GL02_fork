var Question = function(id, titre, enonce, reponses){
	this.id = id
	this.titre = titre;
	this.enonce = enonce;
	this.reponses = [].concat(reponses);
}
	


Question.prototype.toString = function(){
	return this.titre + '\r\n' +this.enonce
};
	


module.exports = Question;