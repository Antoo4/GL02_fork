// src/services/selection.js
// EF03 - Sélection de questions
// Version adaptée à la structure existante

/**
 * Sélectionne des questions pour un examen
 * @param {Array<string>} id - id des questions
 * @param {Array} questions - Tableau de questions de la banque
 * @returns {Object} Résultat
 */
function selectionnerQuestions(id, questions) {
  // Validation basique
  if (!id || id.length === 0) {
    return { success: false, erreur: 'Aucune question sélectionnée.' };
  }
  
  // Vérifier 15-20
  if (id.length < 15) {
    return { 
      success: false, 
      erreur: `Veuillez sélectionner au minimum 15 questions (vous en avez ${id.length}).` 
    };
  }
  
  if (id.length > 20) {
    return { 
      success: false, 
      erreur: `Impossible d’ajouter la question, veuillez choisir entre 15 et 20 questions maximum (vous en avez ${id.length}).` 
    };
  }
  
  // Vérifier doublons
  const idUniques = new Set(id);
  if (idUniques.size !== id.length) {
    return { success: false, erreur: 'Cette question a déjà été sélectionnée précédemment.' 

    };
  }
  
  // Récupérer les questions
  const selection = [];
  const invalides = [];
  
  for (const id of id) {
    const q = questions.find(question => question.id == id);
    if (q) {
      selection.push(q);
    } else {
      invalides.push(id);
    }
  }
  
  if (invalides.length > 0) {
    return { 
      success: false, 
      erreur: `id introuvables : ${invalides.join(', ')}` 
    };
  }
  
  return {
    success: true,
    message: `${selection.length} questions sélectionnées`,
    questions: selection
  };
}

module.exports = { selectionnerQuestions };