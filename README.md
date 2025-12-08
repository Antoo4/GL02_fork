# GIFT CLI - Gestionnaire d'examens au format GIFT

Utilitaire en ligne de commande pour la création et la gestion d'examens au format GIFT conformément aux exigences du SRYEM (Service de l'Éducation de la République de Sealand).

## Table des matières

- [Description](#description)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [Écarts au cahier des charges](#écarts-au-cahier-des-charges)
- [Équipe](#équipe)

---

## Description

Ce projet implémente un outil CLI permettant aux enseignants de :
- Indexer et gérer une banque de questions au format GIFT
- Rechercher des questions par mots-clés
- Visualiser les questions
- Sélectionner des questions pour créer un examen (15-20 questions)
- Générer un fichier d'examen au format GIFT
- Créer un profil enseignant au format VCard
- Analyser le profil d'un examen (types de questions)
- Simuler un examen et obtenir le bilan des questions et réponses à la fin
- Profiling d'examen avec histogrammes
- Comparer les profils


Le format GIFT (General Import Format Technology) est un standard pour l'importation de questions dans les plateformes d'apprentissage en ligne comme Moodle.

---

## 🚀 Installation

### Prérequis

- **Node.js** version 16 ou supérieure
- **npm** (inclus avec Node.js)
- **Git** (pour cloner le projet)

### Vérifier l'installation de Node.js

```bash
node --version
# Doit afficher : v16.x.x ou supérieur

npm --version
# Doit afficher : 8.x.x ou supérieur
```

### Étapes d'installation

1. **Cloner le projet**

```bash
git clone https://github.com/votre-equipe/projet-gift.git
cd projet-gift
```

2. **Installer les dépendances**

```bash
npm install
```

Cette commande installe automatiquement toutes les dépendances listées dans `package.json` :
- `@caporal/core` : Framework CLI
- `colors` : Coloration de la sortie terminal
- `vega` et `vega-lite` : Visualisation de données
- `jasmine` : Framework de tests (dev)

3. **Vérifier l'installation**

```bash
node caporalCli.js --help
```

Si l'installation est réussie, vous devriez voir l'aide du programme.

---

## 📖 Utilisation

### Commandes disponibles

#### 1. **Afficher l'aide**

```bash
node caporalCli.js --help
```

#### 2. **Visualiser une question**

Affiche les détails complets d'une question par son ID.

```bash
node caporalCli.js display <id>
```

**Exemple :**
```bash
node caporalCli.js display 1
```

**Sortie attendue :**
```
Titre: Fake Question n°1
Description: This is the fake question n° 1
Type: Choix Multiple (QCM)
Réponses possibles: 
	ANS1
	ANS2
	ANS3
	ANS4
```

#### 3. **Rechercher des questions**

Recherche des questions par mots-clés dans le titre, l'énoncé ou les réponses.

```bash
node caporalCli.js search <mots-clés>
```

**Exemple :**
```bash
node caporalCli.js search "fake"
```

#### 4. **Créer un profil VCard**

Génère un fichier VCard (contact.vcf) avec les informations de l'enseignant.

```bash
node caporalCli.js createVCard
```

Le programme vous demandera interactivement :
- Nom de famille
- Prénom
- Date de naissance (format AAAA-MM-JJ)
- Genre (M/F/O)
- Email
- Téléphone
- Organisation (facultatif)
- Titre/Poste (facultatif)
- Rôle (facultatif)
- Note (facultatif)

**Fichier généré :** `contact.vcf`

#### 5. **Simuler un examen**

Permet de passer un examen interactif dans le terminal et obtenir un bilan détaillé.

```bash
node SimulateExam.js <fichier.gift>
```

**Exemple :**
```bash
node SimulateExam.js data/1_sample.gift
```

**Déroulement :**
1. Le programme charge les questions du fichier GIFT
2. Affiche chaque question avec ses réponses possibles numérotées
3. L'utilisateur saisit le numéro de sa réponse
4. À la fin, un bilan complet est affiché :
   - Total des questions
   - Nombre de réponses correctes/incorrectes
   - Détail question par question avec les bonnes réponses

**Exemple de sortie :**
```
--------------------------------------------------
Question 1 :
Titre : Addition simple
Combien font 2+2?
  1) 3
  2) 4
  3) 5
Votre réponse (numéro) : 2

--- Bilan de votre simulation ---
Total des questions : 2
Réponses correctes : 1
Réponses incorrectes : 1

Détail :
Q1 : Combien font 16*2? | Réponse : 32 -> Correct (Bonne réponse : '32')
Q2 : La Terre est plate? | Réponse : Vrai -> Incorrect (Bonne réponse : 'Faux')
```

**Gestion des erreurs :**
- Si le fichier n'existe pas : "Erreur lors de la lecture du fichier GIFT"
- Si fichier vide : "Le fichier est vide ou ne contient aucune question"
- Si réponse invalide : "Entrée invalide, mauvais format de réponse"

---

#### 6. **Profiler**

Permet de donner le nombre de questions dans un fichier GIFT et génère un histogramme des questions, en fonction de leur type.

```bash
node caporalCli.js profiler <fichier.gift>
```

#### 7. **Comparer des profils**

Permet de comparer un fichier de questions avec plusieurs autres. Le programme renvoie deux histogramme, représentant les pourcentages de questions en fonction de leur type, pour le fichier choisi ainsi qu'une moyenne pour les fichiers de comparaisons.

```bash
node caporalCli.js comparerProfils <fichier.gift> <fichierRef1.gift> <fichierRef2.gift> <...>
```

#### 8. **Créer un fichier VCard**

Permet de créer une fiche d'identification au format VCard.

```bash
node caporalCli.js createVCard
```

## ✨ Fonctionnalités

### Implémentées

| Réf. | Fonctionnalité | Statut | Fichier |
|------|----------------|--------|---------|
| EF01 | Rechercher des questions | Implémenté | `caporalCli.js` |
| EF02 | Visualiser une question | Implémenté | `caporalCli.js` |
| EF03 | Sélectionner des questions | Implémenté | `src/services/selectionner.js` |
| EF05 | Générer fichier VCard | Implémenté | `caporalCli.js` |
| EF06 | Simuler un examen | Implémenté | `SimulateExam.js` |
| EF07 | Indexer les questions | Implémenté | `GIFTParser.js` |
| EF04 | Générer fichier GIFT | Implémenté | Intégration avec EF03 |
| EF08 | Profiler examen | Implémenté | Histogrammes |
| EF09 | Comparer profils | Implémenté | - |

---

## Tests

Le projet utilise **Jasmine** comme framework de tests.

### Lancer tous les tests

```bash
npm test
```

### Lancer un fichier de test spécifique

```bash
npx jasmine spec/selection.spec.js
```

### Tests implémentés

#### Tests EF03 - Sélection de questions

Fichier : `spec/selection.spec.js`

**Tests couverts :**
- ✅ Accepte exactement 15 questions (minimum réglementaire)
- ✅ Accepte 20 questions (maximum réglementaire)
- ✅ Refuse moins de 15 questions
- ✅ Refuse plus de 20 questions
- ✅ Détecte les questions en doublon
- ✅ Détecte les IDs invalides

**Exécution :**
```bash
npm test spec/selection.spec.js
```

**Résultat attendu :**
```
4 specs, 0 failures
```

### Jeux de données fournis

#### Données de test intégrées

Le parser GIFT inclut des questions de test via la méthode `fakeParse()` :

```javascript
// GIFTParser.js - Données de test
let fake = new Question();
fake.id = 1
fake.titre = "Fake Question n°1"
fake.enonce = "This is the fake question n° 1"
fake.type = "Choix Multiple (QCM)"
fake.reponses = ["ANS1","ANS2","ANS3","ANS4"]
```

Ces données permettent de tester les commandes `display` et `search` sans nécessiter de fichiers GIFT réels.

#### Créer vos propres fichiers GIFT

Pour tester avec vos propres questions, créez un fichier `.gift` avec la syntaxe suivante :

**Exemple : `data/test.gift`**
```
::Question 1::Combien font 2+2?{
=4
~3
~5
}

::Question 2::La Terre est ronde.{TRUE}

::Question 3::Quelle est la capitale de la France?{
=Paris
~Londres
~Berlin
}
```

#### Fichier GIFT d'exemple fourni

Le projet inclut un fichier d'exemple **`data/1_sample.gift`** contenant des questions réelles sur les adverbes de fréquence en anglais (Unit 1, page 7).

**Contenu :**
- 5 questions de type "réponse courte" (fill in the blank)
- Questions avec format HTML
- Exemples d'utilisation des adverbes : *generally*, *always*, *sometimes*, *usually*, *often*

**Utilisation :**
```bash
# Simuler l'examen avec ce fichier
node SimulateExam.js data/1_sample.gift
```

Ce fichier est idéal pour :
- Tester la fonction de simulation (EF06)
- Voir des exemples de syntaxe GIFT avancée
- Comprendre le format HTML dans GIFT

---

### Fichiers principaux

| Fichier | Description |
|---------|-------------|
| `Question.js` | Classe représentant une question avec ses attributs (id, titre, énoncé, type, réponses) |
| `GIFTParser.js` | Parser pour lire et analyser les fichiers au format GIFT |
| `GIFTParser(2).js` | Version avancée avec tokenisation et support de tous les types de questions |
| `SimulateExam.js` | Module de simulation d'examen interactif (EF06) |
| `caporalCli.js` | Point d'entrée principal avec commandes `display` et `search` |
| `caporalCli(1).js` | Commande `createVCard` pour générer le profil enseignant |
| `src/services/selectionner.js` | Module de sélection de questions (EF03) |
| `spec/selection.spec.js` | Tests unitaires pour la sélection |
| `data/1_sample.gift` | Fichier GIFT d'exemple pour tester la simulation |

---

## ⚠️ Écarts au cahier des charges

### Différences et adaptations

#### 1. **Framework CLI : Caporal au lieu de Commander**

**Cahier des charges :** Non spécifié  
**Implémentation :** Utilisation de `@caporal/core`

**Justification :** Caporal offre une meilleure gestion des commandes complexes et une syntaxe plus intuitive pour notre cas d'usage. Les fonctionnalités restent identiques.

#### 2. **Structure de la classe Question**

**Cahier des charges :** Spécification algébrique avec opérations complexes  
**Implémentation :** Classe JavaScript simplifiée

```javascript
// Version implémentée
var Question = function (id, titre, type, enonce, reponses) {
  this.id = id;
  this.titre = titre;
  this.enonce = enonce;
  this.type = type;
  this.reponses = [].concat(reponses);
}
```

**Justification :** La version simplifiée répond aux besoins fonctionnels tout en étant plus maintenable. Les opérations complexes (ChangerTitre, RemplacerRéponse, etc.) peuvent être ajoutées si nécessaire.

#### 3. **Parser GIFT : Implémentation progressive**

**Cahier des charges :** Support complet de tous les types de questions GIFT  
**Implémentation actuelle :** 
- ✅ QCM (Choix Multiple)
- ✅ Vrai/Faux
- ✅ Questions numériques
- ✅ Appariement
- ✅ Questions courtes
- 🚧 Questions à mot manquant (en cours)

**Justification :** Développement itératif pour assurer la qualité. Les types manquants seront ajoutés dans les prochaines versions.

#### 4. **Indexation (EF07)**

**Cahier des charges :** Indexation avec attribution d'IDs uniques  
**Implémentation :** IDs séquentiels auto-incrémentés

```javascript
this.index += 1;
let newQuestion = new Question(this.index, titre, format, ...);
```

**Justification :** Système simple et efficace pour l'attribution d'IDs uniques.

#### 5. **Messages d'erreur**

**Cahier des charges :** Messages spécifiques pour chaque erreur  
**Implémentation :** Messages conformes aux maquettes du cahier des charges

**Exemple EF03 :**
- ✅ "Cette question a déjà été sélectionnée précédemment." (doublon)
- ✅ "Veuillez sélectionner au minimum 15 questions" (< 15)
- ✅ "Impossible d'ajouter la question, veuillez choisir entre 15 et 20 questions maximum" (> 20)


## Dépendances

### Dépendances de production

| Package | Version | Usage |
|---------|---------|-------|
| `@caporal/core` | ^3.0.2 | Framework CLI |
| `colors` | ^1.4.0 | Coloration terminal |
| `vega` | ^5.17.0 | Visualisation données |
| `vega-lite` | ^4.17.0 | Spécifications graphiques |

### Dépendances de développement

| Package | Version | Usage |
|---------|---------|-------|
| `jasmine` | ^3.6.3 | Framework de tests |

### Installation des dépendances

```bash
# Production + développement
npm install

# Production uniquement
npm install --production
```

---

## 🐛 Dépannage

### Problème : "Cannot find module"

**Symptôme :**
```
Error: Cannot find module '@caporal/core'
```

**Solution :**
```bash
npm install
```

### Problème : "command not found: node"

**Symptôme :**
```
bash: node: command not found
```

**Solution :** Node.js n'est pas installé. Téléchargez-le depuis [nodejs.org](https://nodejs.org)

### Problème : Tests Jasmine échouent

**Symptôme :**
```
Error: Cannot find module '../Question'
```

**Solution :** Vérifier le chemin dans le fichier de test. `Question.js` est à la racine :
```javascript
const Question = require('../Question'); // Correct
```

### Problème : "Permission denied"

**Symptôme sur Mac/Linux :**
```
Error: EACCES: permission denied
```

**Solution :**
```bash
chmod +x caporalCli.js
```

---

## Équipe

### Développeurs

CHARPENTIER Thomas
CHOUHIB Ilias 
EWENCZYK Gabriel
FATHALLAH Yesmine
Mohamad FAWAZ

## 📄 Licence

Projet étudiant - 2025 - Tous droits réservés

---

## 📞 Contact et support

Pour toute question ou problème :
- **Issues GitHub :** Ouvrir une issue sur le dépôt
- **Documentation :** Ce fichier README
- **Code :** Commenté et documenté dans les fichiers sources

---

## Versions

### Version 1.0.0 (Actuelle)
- Commandes display et search opérationnelles
- Génération VCard fonctionnelle
- Module de sélection de questions avec validation 15-20 questions
- Simulation d'examen
- Parser GIFT avec support des principaux types de questions
- Fichier GIFT d'exemple fourni
- Génération complète de fichiers GIFT
- Tests unitaires Jasmine
- Profiling d'examen avec histogrammes
- Comparaison de profils

**Version 2.0.0**
- 🎯 Interface graphique (hors scope actuel)
- 🎯 Export PDF
- 🎯 Statistiques avancées

---

## Ressources supplémentaires

### Documentation externe

- **Format GIFT :** [Moodle GIFT Format](https://docs.moodle.org/en/GIFT_format)
- **Format VCard :** [RFC 6350](https://datatracker.ietf.org/doc/html/rfc6350)
- **Caporal.js :** [Documentation officielle](https://github.com/mattallty/Caporal.js)
- **Jasmine :** [Guide de tests](https://jasmine.github.io/)

### Exemples de fichiers GIFT

Voir le dossier `examples/` (à créer) pour des exemples de fichiers GIFT avec différents types de questions.

---

**Dernière mise à jour :** Décembre 2024  
**Version du document :** 1.0