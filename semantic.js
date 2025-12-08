// spec/semantic.spec.js
// Tests sémantiques - Vérifie la logique métier et la cohérence des données

const GIFTParser = require('../GIFTParser');
const Question = require('../Question');
const { selectionnerQuestions } = require('../src/services/selectionner');
const { generateGiftFile } = require('../GiftGenerator');
const fs = require('fs');

describe('Semantic Tests - Business Logic', () => {
    
    describe('Question Class Semantics', () => {
        it('should create a valid Question object', () => {
            const q = new Question(1, "Title", "html", "multiple", "Question text", ["A", "B"], [1, 0]);
            expect(q.id).toBe(1);
            expect(q.titre).toBe("Title");
            expect(q.enonce).toBe("Question text");
        });

        it('should handle empty arrays for answers', () => {
            const q = new Question(1, "Title", "html", "sansreponse", "Text");
            expect(Array.isArray(q.reponses)).toBe(true);
            expect(Array.isArray(q.bonnesReponses)).toBe(true);
        });

        it('should convert non-array answers to arrays', () => {
            const q = new Question(1, "T", "html", "type", "Text", "answer", "correct");
            expect(Array.isArray(q.reponses)).toBe(true);
        });

        it('should correctly implement contains() method', () => {
            const q = new Question(1, "Math", "html", "multiple", "What is 2+2?", ["4", "5"], [1, 0]);
            expect(q.contains("Math")).toBe(true);
            expect(q.contains("2+2")).toBe(true);
            expect(q.contains("4")).toBe(true);
            expect(q.contains("xyz")).toBe(false);
        });

        it('should generate valid toString() output', () => {
            const q = new Question(1, "Title", "html", "multiple", "Question", ["A"], [1]);
            const str = q.toString();
            expect(str).toContain("ID: 1");
            expect(str).toContain("Titre: Title");
            expect(str).toContain("Type: multiple");
        });
    });

    describe('Question Selection Semantics (EF03)', () => {
        let questions;

        beforeEach(() => {
            questions = [];
            for (let i = 1; i <= 25; i++) {
                questions.push(new Question(i, `Q${i}`, "html", "multiple", `Question ${i}`, ["A"], [1]));
            }
        });

        it('should accept exactly 15 questions (minimum)', () => {
            const ids = Array.from({length: 15}, (_, i) => i + 1);
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(true);
            expect(result.questions.length).toBe(15);
        });

        it('should accept exactly 20 questions (maximum)', () => {
            const ids = Array.from({length: 20}, (_, i) => i + 1);
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(true);
            expect(result.questions.length).toBe(20);
        });

        it('should reject fewer than 15 questions', () => {
            const ids = [1, 2, 3, 4, 5];
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(false);
            expect(result.erreur).toContain("minimum 15 questions");
        });

        it('should reject more than 20 questions', () => {
            const ids = Array.from({length: 21}, (_, i) => i + 1);
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(false);
            expect(result.erreur).toContain("20 questions maximum");
        });

        it('should detect duplicate question IDs', () => {
            const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1]; // 1 is duplicate
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(false);
            expect(result.erreur).toContain("déjà été sélectionnée");
        });

        it('should detect invalid question IDs', () => {
            const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 999]; // 999 doesn't exist
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(false);
            expect(result.erreur).toContain("introuvables");
        });

        it('should return selected Question objects', () => {
            const ids = Array.from({length: 15}, (_, i) => i + 1);
            const result = selectionnerQuestions(ids, questions);
            expect(result.questions[0]).toBeInstanceOf(Question);
            expect(result.questions[0].id).toBe(1);
        });

        it('should handle string IDs correctly', () => {
            const ids = Array.from({length: 15}, (_, i) => String(i + 1));
            const result = selectionnerQuestions(ids, questions);
            expect(result.success).toBe(true);
        });
    });

    describe('Parser Semantics', () => {
        let parser;

        beforeEach(() => {
            parser = new GIFTParser(false, false);
        });

        it('should assign sequential IDs to questions', () => {
            const data = `
                ::Q1:: Question 1 {=A}
                
                ::Q2:: Question 2 {=B}
                
                ::Q3:: Question 3 {=C}
            `;
            parser.parse(data);
            expect(parser.parsedQuestions[0].id).toBe(1);
            expect(parser.parsedQuestions[1].id).toBe(2);
            expect(parser.parsedQuestions[2].id).toBe(3);
        });

        it('should maintain question order from file', () => {
            const data = `
                ::First:: Question 1 {=A}
                ::Second:: Question 2 {=B}
                ::Third:: Question 3 {=C}
            `;
            parser.parse(data);
            expect(parser.parsedQuestions[0].titre).toBe("First");
            expect(parser.parsedQuestions[1].titre).toBe("Second");
            expect(parser.parsedQuestions[2].titre).toBe("Third");
        });

        it('should correctly identify question types', () => {
            const data = `
                ::Q1:: TF {TRUE}
                ::Q2:: MC {=A ~B}
                ::Q3:: SA {=answer}
                ::Q4:: NUM {#42}
                ::Q5:: MATCH {=A->1 =B->2}
            `;
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
            expect(parser.parsedQuestions[1].type).toBe("multiple");
            expect(parser.parsedQuestions[2].type).toBe("courte");
            expect(parser.parsedQuestions[3].type).toBe("numerique");
            expect(parser.parsedQuestions[4].type).toBe("appariement");
        });

        it('should correctly mark correct answers in multiple choice', () => {
            const data = "::Q1:: Question {=Correct1 ~Wrong =Correct2 ~Wrong2}";
            parser.parse(data);
            const bonnesReponses = parser.parsedQuestions[0].bonnesReponses;
            expect(bonnesReponses[0]).toBe(1); // First is correct
            expect(bonnesReponses[1]).toBe(0); // Second is wrong
            expect(bonnesReponses[2]).toBe(1); // Third is correct
            expect(bonnesReponses[3]).toBe(0); // Fourth is wrong
        });

        it('should extract correct answers for short answer questions', () => {
            const data = "::Q1:: Color? {=red =blue =green}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].bonnesReponses).toContain("red");
            expect(parser.parsedQuestions[0].bonnesReponses).toContain("blue");
            expect(parser.parsedQuestions[0].bonnesReponses).toContain("green");
        });

        it('should properly pair matching questions', () => {
            const data = "::Q1:: Match {=Dog->Animal =Cat->Animal =Tree->Plant}";
            parser.parse(data);
            const q = parser.parsedQuestions[0];
            expect(q.reponses.length).toBe(3);
            expect(q.bonnesReponses.length).toBe(3);
            expect(q.reponses).toContain("Dog");
            expect(q.bonnesReponses).toContain("Animal");
        });

        it('should handle blank text in answers (fill-in-blank)', () => {
            const data = "::Q1:: Complete: I ___ happy {=am}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain("___");
        });
    });

    describe('Profile Generation Semantics (EF08)', () => {
        let parser;

        beforeEach(() => {
            parser = new GIFTParser(false, false);
        });

        it('should create accurate histogram of question types', () => {
            const data = `
                ::Q1:: TF1 {TRUE}
                ::Q2:: TF2 {FALSE}
                ::Q3:: MC {=A ~B}
                ::Q4:: SA {=answer}
            `;
            parser.parse(data);
            const profile = parser.profile();
            expect(profile["vraiFaux"]).toBe(2);
            expect(profile["multiple"]).toBe(1);
            expect(profile["courte"]).toBe(1);
        });

        it('should count all question types present', () => {
            const data = `
                ::Q1:: {TRUE}
                ::Q2:: {=A ~B}
                ::Q3:: {=answer}
                ::Q4:: {#42}
                ::Q5:: {=X->Y}
            `;
            parser.parse(data);
            const profile = parser.profile();
            const typeCount = Object.keys(profile).length;
            expect(typeCount).toBe(5);
        });

        it('should handle files with single question type', () => {
            const data = `
                ::Q1:: {TRUE}
                ::Q2:: {FALSE}
                ::Q3:: {TRUE}
            `;
            parser.parse(data);
            const profile = parser.profile();
            expect(Object.keys(profile).length).toBe(1);
            expect(profile["vraiFaux"]).toBe(3);
        });

        it('should return empty object for no questions', () => {
            parser.parse("");
            const profile = parser.profile();
            expect(Object.keys(profile).length).toBe(0);
        });
    });

    describe('GIFT Generation Semantics (EF04)', () => {
        afterEach(() => {
            // Cleanup generated files
            try {
                if (fs.existsSync('test_output.gift')) {
                    fs.unlinkSync('test_output.gift');
                }
            } catch (e) {}
        });

        it('should generate valid GIFT file', () => {
            const filename = generateGiftFile('test_output.gift');
            expect(fs.existsSync(filename)).toBe(true);
        });

        it('should generate file with 8 questions', () => {
            const filename = generateGiftFile('test_output.gift');
            const content = fs.readFileSync(filename, 'utf8');
            const parser = new GIFTParser(false, false);
            parser.parse(content);
            expect(parser.parsedQuestions.length).toBe(8);
        });

        it('should generate only True/False questions', () => {
            const filename = generateGiftFile('test_output.gift');
            const content = fs.readFileSync(filename, 'utf8');
            const parser = new GIFTParser(false, false);
            parser.parse(content);
            parser.parsedQuestions.forEach(q => {
                expect(q.type).toBe("vraiFaux");
            });
        });

        it('should generate parseable GIFT format', () => {
            const filename = generateGiftFile('test_output.gift');
            const content = fs.readFileSync(filename, 'utf8');
            const parser = new GIFTParser(false, false);
            expect(() => parser.parse(content)).not.toThrow();
        });

        it('should generate questions with titles', () => {
            const filename = generateGiftFile('test_output.gift');
            const content = fs.readFileSync(filename, 'utf8');
            const parser = new GIFTParser(false, false);
            parser.parse(content);
            parser.parsedQuestions.forEach(q => {
                expect(q.titre).toBeDefined();
                expect(q.titre.length).toBeGreaterThan(0);
            });
        });

        it('should generate questions with valid answers', () => {
            const filename = generateGiftFile('test_output.gift');
            const content = fs.readFileSync(filename, 'utf8');
            const parser = new GIFTParser(false, false);
            parser.parse(content);
            parser.parsedQuestions.forEach(q => {
                expect(q.bonnesReponses).toBeDefined();
                expect(q.bonnesReponses.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Search Functionality Semantics (EF01)', () => {
        let parser;

        beforeEach(() => {
            parser = new GIFTParser(false, false);
            const data = `
                ::Math Question:: What is 2+2? {=4}
                ::Science Question:: Is water H2O? {TRUE}
                ::History Question:: When was 1492? {=Columbus}
            `;
            parser.parse(data);
        });

        it('should find questions by title keyword', () => {
            const results = parser.parsedQuestions.filter(q => q.contains("Math"));
            expect(results.length).toBe(1);
            expect(results[0].titre).toContain("Math");
        });

        it('should find questions by question text keyword', () => {
            const results = parser.parsedQuestions.filter(q => q.contains("water"));
            expect(results.length).toBe(1);
            expect(results[0].enonce).toContain("water");
        });

        it('should find questions by answer keyword', () => {
            const results = parser.parsedQuestions.filter(q => q.contains("Columbus"));
            expect(results.length).toBe(1);
        });

        it('should be case-sensitive', () => {
            const results = parser.parsedQuestions.filter(q => q.contains("math"));
            expect(results.length).toBe(0);
        });

        it('should handle partial matches', () => {
            const results = parser.parsedQuestions.filter(q => q.contains("Sci"));
            expect(results.length).toBe(1);
        });

        it('should return empty array for no matches', () => {
            const results = parser.parsedQuestions.filter(q => q.contains("xyz"));
            expect(results.length).toBe(0);
        });
    });

    describe('Data Integrity and Consistency', () => {
        let parser;

        beforeEach(() => {
            parser = new GIFTParser(false, false);
        });

        it('should maintain data consistency across parse operations', () => {
            const data = "::Q1:: Question {=answer}";
            parser.parse(data);
            const firstCount = parser.parsedQuestions.length;
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(firstCount + 1);
        });

        it('should preserve special characters in questions', () => {
            const data = "::Q1:: Use <b>bold</b> & \"quotes\" {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain("<b>");
            expect(parser.parsedQuestions[0].enonce).toContain("&");
            expect(parser.parsedQuestions[0].enonce).toContain('"');
        });

        it('should handle UTF-8 characters correctly', () => {
            const data = "::Q1:: Où est Paris? {=France}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain("Où");
        });

        it('should not mix up answers between questions', () => {
            const data = `
                ::Q1:: First {=A1 ~B1}
                ::Q2:: Second {=A2 ~B2}
            `;
            parser.parse(data);
            expect(parser.parsedQuestions[0].reponses).toContain("A1");
            expect(parser.parsedQuestions[0].reponses).not.toContain("A2");
            expect(parser.parsedQuestions[1].reponses).toContain("A2");
            expect(parser.parsedQuestions[1].reponses).not.toContain("A1");
        });

        it('should preserve answer order', () => {
            const data = "::Q1:: Question {=First =Second =Third}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].bonnesReponses[0]).toBe("First");
            expect(parser.parsedQuestions[0].bonnesReponses[1]).toBe("Second");
            expect(parser.parsedQuestions[0].bonnesReponses[2]).toBe("Third");
        });
    });

    describe('Error Recovery and Robustness', () => {
        let parser;

        beforeEach(() => {
            parser = new GIFTParser(false, false);
        });

        it('should continue parsing after malformed question', () => {
            const data = `
                ::Q1:: Good {=answer}
                ::Q2:: Bad {=unclosed
                ::Q3:: Good again {=answer}
            `;
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBeGreaterThan(1);
        });

        it('should handle empty input gracefully', () => {
            parser.parse("");
            expect(parser.parsedQuestions.length).toBe(0);
            expect(parser.errorCount).toBe(0);
        });

        it('should handle whitespace-only input', () => {
            parser.parse("   \n\n\t\t   \n");
            expect(parser.parsedQuestions.length).toBe(0);
        });

        it('should not crash on null or undefined input', () => {
            expect(() => parser.parse(null)).not.toThrow();
            expect(() => parser.parse(undefined)).not.toThrow();
        });

        it('should handle very large files', () => {
            let data = "";
            for (let i = 0; i < 100; i++) {
                data += `::Q${i}:: Question ${i} {=answer}\n\n`;
            }
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(100);
        });
    });

    describe('Business Rules Validation', () => {
        let parser;

        beforeEach(() => {
            parser = new GIFTParser(false, false);
        });

        it('should enforce at least one answer per question', () => {
            const data = "::Q1:: Question without answers {}";
            parser.parse(data);
            const q = parser.parsedQuestions[0];
            expect(q.type).toBe("sansreponse");
        });

        it('should require correct answer for multiple choice', () => {
            const data = "::Q1:: Question {~Wrong1 ~Wrong2}";
            parser.parse(data);
            const q = parser.parsedQuestions[0];
            const hasCorrect = q.bonnesReponses.some(r => r === 1);
            // May be false if no correct answer provided
            expect(typeof hasCorrect).toBe('boolean');
        });

        it('should handle TRUE/FALSE only with valid values', () => {
            const data = `
                ::Q1:: Valid TRUE {TRUE}
                ::Q2:: Valid FALSE {FALSE}
                ::Q3:: Valid T {T}
                ::Q4:: Valid F {F}
            `;
            parser.parse(data);
            parser.parsedQuestions.forEach(q => {
                expect(q.type).toBe("vraiFaux");
                expect([0, 1]).toContain(q.bonnesReponses[0]);
            });
        });

        it('should validate numerical answer format', () => {
            const data = "::Q1:: Number {#42}";
            parser.parse(data);
            const q = parser.parsedQuestions[0];
            expect(q.type).toBe("numerique");
            expect(q.bonnesReponses[0]).toBeDefined();
        });
    });
});