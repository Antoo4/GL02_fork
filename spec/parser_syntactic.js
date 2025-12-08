describe("Program Syntactic testing", function(){

  it("Test du parser", function(){
        var parser = GIFTParser;
        var testString = "::U1 p7 Adverbs GR 1.2::[html]Take care when using this machinery. (<i>always</i>) {\n=Always take care when using this machinery.\n=Always take care when using this machinery}"
        parser.parse(testString)
        let question = new Question(1, 'U1 p7 Adverbs GR 1.2', 'html', 'Take care when using this machinery. (<i>always</i>) ___', 'courte', [], ['Always take care when using this machinery. ', 'Always take care when using this machinery'])
        expect(parser.parsedQuestions[0], question)
    })
  
});
