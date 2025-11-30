const fs = require('fs');
const colors = require('colors');
const GIFTParser = require('./GIFTParser.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;

cli
	.version('gift-parser-cli')
	.version('0.07')
	// readme
	.command('display', 'Display the a Question')
	.argument('<id>', 'The id of the Question to display')
	.action(({ args, options, logger }) => {
		analyzer = new GIFTParser();
		analyzer.fakeParse(); //TODO


		let questionExists = false
		for (const question of analyzer.parsedQuestions) {
			if (args.id == question.id){
				console.log(question.toString());
				questionExists = true
				break;
			} 
		}
		if(!questionExists){
			console.log("La question est introuvable.")
		}
	})

	// search
	.command('search', 'Free text search on the Questions\' name')
	.argument('<needle>', 'The text to look for in the Question\'s names')
	.action(({ args, options, logger }) => {
		analyzer = new GIFTParser();
		analyzer.fakeParse(); //TODO
		let displayQuestions = []
		let it =0

		for (const question of analyzer.parsedQuestions) {
			displayQuestions[it] = question.contains(args.needle)
			it++
		}
		it = 0
		for (const question of analyzer.parsedQuestions) {
			if(displayQuestions[it]){
				console.log(question.toString())
			}
			it++
		}
		
	})

cli.run(process.argv.slice(2));