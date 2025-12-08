// spec/syntactic.spec.js
// Tests syntaxiques - Vérifie que le parser reconnaît correctement la syntaxe GIFT

const GIFTParser = require('../GIFTParser');
const Question = require('../Question');

describe('Syntactic Tests - GIFT Parser', () => {
    let parser;

    beforeEach(() => {
        parser = new GIFTParser(false, false);
    });

    describe('Tokenization', () => {
        it('should split content by double newlines', () => {
            const data = "Line 1\n\nLine 2\n\nLine 3";
            const tokens = parser.tokenize(data);
            expect(tokens.length).toBe(3);
            expect(tokens[0]).toBe("Line 1");
            expect(tokens[1]).toBe("Line 2");
            expect(tokens[2]).toBe("Line 3");
        });

        it('should handle CRLF line endings', () => {
            const data = "Line 1\r\n\r\nLine 2";
            const tokens = parser.tokenize(data);
            expect(tokens.length).toBe(2);
        });

        it('should return empty array for empty input', () => {
            const tokens = parser.tokenize("");
            expect(tokens.length).toBe(0);
        });
    });

    describe('Question Title Recognition', () => {
        it('should recognize question title with :: delimiters', () => {
            const data = "::Question Title:: Question text {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
            expect(parser.parsedQuestions[0].titre).toBe("Question Title");
        });

        it('should handle questions without titles', () => {
            const data = "Question text without title {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
            expect(parser.parsedQuestions[0].titre).toBeDefined();
        });

        it('should handle empty titles', () => {
            const data = ":::: Question text {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
        });

        it('should handle titles with special characters', () => {
            const data = "::Q1: Math & Logic #1:: Question text {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].titre).toContain("Math & Logic");
        });
    });

    describe('Format Recognition', () => {
        it('should recognize [html] format', () => {
            const data = "::[html]Question:: Text {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].format).toBe("html");
        });

        it('should recognize [markdown] format', () => {
            const data = "::[markdown]Question:: Text {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].format).toBe("markdown");
        });

        it('should default to sansformat when no format specified', () => {
            const data = "::Question:: Text {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].format).toBe("sansformat");
        });
    });

    describe('True/False Question Syntax', () => {
        it('should recognize TRUE syntax', () => {
            const data = "::Q1:: Is this true? {TRUE}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
            expect(parser.parsedQuestions[0].bonnesReponses).toEqual([1]);
        });

        it('should recognize FALSE syntax', () => {
            const data = "::Q1:: Is this false? {FALSE}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
            expect(parser.parsedQuestions[0].bonnesReponses).toEqual([0]);
        });

        it('should recognize T shorthand', () => {
            const data = "::Q1:: True? {T}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
            expect(parser.parsedQuestions[0].bonnesReponses).toEqual([1]);
        });

        it('should recognize F shorthand', () => {
            const data = "::Q1:: False? {F}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
            expect(parser.parsedQuestions[0].bonnesReponses).toEqual([0]);
        });

        it('should handle TRUE with feedback', () => {
            const data = "::Q1:: True? {TRUE#Correct!}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
        });
    });

    describe('Multiple Choice Syntax', () => {
        it('should recognize = for correct answers', () => {
            const data = "::Q1:: Question {=Correct ~Wrong1 ~Wrong2}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("multiple");
            expect(parser.parsedQuestions[0].bonnesReponses[0]).toBe(1);
        });

        it('should recognize ~ for incorrect answers', () => {
            const data = "::Q1:: Question {=Correct ~Wrong}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].reponses).toContain("Correct");
            expect(parser.parsedQuestions[0].reponses).toContain("Wrong");
        });

        it('should handle multiple correct answers', () => {
            const data = "::Q1:: Question {=Answer1 =Answer2 ~Wrong}";
            parser.parse(data);
            const correctCount = parser.parsedQuestions[0].bonnesReponses.filter(r => r === 1).length;
            expect(correctCount).toBeGreaterThan(1);
        });

        it('should handle answers with whitespace', () => {
            const data = "::Q1:: Question {\n=Answer 1\n~Answer 2\n}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].reponses.length).toBeGreaterThan(0);
        });
    });

    describe('Short Answer Syntax', () => {
        it('should recognize short answer format', () => {
            const data = "::Q1:: What is 2+2? {=4}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("courte");
        });

        it('should handle multiple acceptable answers', () => {
            const data = "::Q1:: Name a color {=red =blue =green}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("courte");
            expect(parser.parsedQuestions[0].bonnesReponses.length).toBeGreaterThan(1);
        });

        it('should handle case-sensitive answers', () => {
            const data = "::Q1:: Capital? {=Paris}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].bonnesReponses).toContain("Paris");
        });
    });

    describe('Matching Question Syntax', () => {
        it('should recognize -> syntax for matching', () => {
            const data = "::Q1:: Match {=Dog->Animal =Cat->Animal}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("appariement");
        });

        it('should parse pairs correctly', () => {
            const data = "::Q1:: Match {=A->1 =B->2 =C->3}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].reponses.length).toBe(3);
            expect(parser.parsedQuestions[0].bonnesReponses.length).toBe(3);
        });
    });

    describe('Numerical Question Syntax', () => {
        it('should recognize # for numerical questions', () => {
            const data = "::Q1:: How many? {#42}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("numerique");
        });

        it('should handle range syntax', () => {
            const data = "::Q1:: Approximate {#42:2}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("numerique");
        });

        it('should handle percentage range', () => {
            const data = "::Q1:: About {#100:5%}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("numerique");
        });

        it('should handle multiple numerical answers', () => {
            const data = "::Q1:: Valid answers {#=42:1 #=100:2}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].bonnesReponses.length).toBeGreaterThan(0);
        });
    });

    describe('Comment Recognition', () => {
        it('should ignore // comments', () => {
            const data = "// This is a comment\n::Q1:: Question {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
        });

        it('should handle inline comments', () => {
            const data = "::Q1:: Question {=answer} // comment";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
        });
    });

    describe('Category Recognition', () => {
        it('should recognize $CATEGORY: syntax', () => {
            const data = "$CATEGORY: Math/Algebra\n::Q1:: Question {=answer}";
            parser.parse(data);
            // Categories are parsed but not stored in current implementation
            expect(parser.parsedQuestions.length).toBe(1);
        });
    });

    describe('Special Characters Handling', () => {
        it('should handle HTML entities in questions', () => {
            const data = "::[html]Q1:: What is &lt;b&gt;bold&lt;/b&gt;? {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain("&lt;");
        });

        it('should handle unicode characters', () => {
            const data = "::Q1:: Quelle est la capitale? {=Paris}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain("Quelle");
        });

        it('should handle quotation marks', () => {
            const data = '::Q1:: He said "hello" {=answer}';
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain('"');
        });

        it('should handle escaped characters', () => {
            const data = "::Q1:: Use \\n for newline {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toContain("\\n");
        });
    });

    describe('Malformed Input Handling', () => {
        it('should handle missing closing brace', () => {
            const data = "::Q1:: Question {=answer";
            expect(() => parser.parse(data)).not.toThrow();
        });

        it('should handle missing opening brace', () => {
            const data = "::Q1:: Question =answer}";
            expect(() => parser.parse(data)).not.toThrow();
        });

        it('should handle empty question blocks', () => {
            const data = "::Q1:: {}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
        });

        it('should handle questions without answers', () => {
            const data = "::Q1:: Question text";
            parser.parse(data);
            expect(parser.parsedQuestions[0].type).toBe("sansreponse");
        });

        it('should handle duplicate titles', () => {
            const data = "::Q1:: First\n\n::Q1:: Second";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(2);
        });
    });

    describe('Complex Multi-line Questions', () => {
        it('should handle multi-line question text', () => {
            const data = "::Q1:: This is a\nmulti-line\nquestion {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce).toBeDefined();
        });

        it('should handle multi-line answers', () => {
            const data = "::Q1:: Question {\n=Answer 1\n~Answer 2\n~Answer 3\n}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].reponses.length).toBe(3);
        });
    });

    describe('Mixed Question Types', () => {
        it('should parse multiple question types in one file', () => {
            const data = `
                ::Q1:: True/False {TRUE}
                
                ::Q2:: Multiple {=A ~B ~C}
                
                ::Q3:: Short {=answer}
                
                ::Q4:: Numeric {#42}
            `;
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(4);
            expect(parser.parsedQuestions[0].type).toBe("vraiFaux");
            expect(parser.parsedQuestions[1].type).toBe("multiple");
            expect(parser.parsedQuestions[2].type).toBe("courte");
            expect(parser.parsedQuestions[3].type).toBe("numerique");
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long question text', () => {
            const longText = "A".repeat(1000);
            const data = `::Q1:: ${longText} {=answer}`;
            parser.parse(data);
            expect(parser.parsedQuestions[0].enonce.length).toBeGreaterThan(100);
        });

        it('should handle empty title with format', () => {
            const data = "::[html]:: Question {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions[0].format).toBe("html");
        });

        it('should handle questions with only whitespace', () => {
            const data = "::   :: {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBe(1);
        });

        it('should handle consecutive delimiters', () => {
            const data = "::::Q1:::: Question {=answer}";
            parser.parse(data);
            expect(parser.parsedQuestions.length).toBeGreaterThan(0);
        });
    });
});