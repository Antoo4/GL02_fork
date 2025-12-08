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

	// test
	.command('test', 'Test')
	.argument('<file>', 'The file\'s name')
	.action(({ args, options, logger }) => {

		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new GIFTParser();
			analyzer.parse(data);
			console.log(analyzer.parsedQuestions);
		});
		
	})

	// EF08
	.command('profiler', 'Profiler')
	.argument('<file>', 'The file\'s name')
	.action(({ args, options, logger }) => {

		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			let analyzer = new GIFTParser();
			analyzer.parse(data);

			logger.info('Nom du fichier : ' + args.file);
			logger.info('Nombre de questions : ' + analyzer.index + '\n');

			if (analyzer.parsedQuestions.length > 0) {
				let hist = analyzer.profile();
				logger.info('Histogramme : ')
				for (type in hist) {
					let num = '';
					for (let i = 0; i < hist[type]; i++) {num += '#'}
					logger.info(`${type}${' '.repeat(30-type.length)}(${hist[type]}) : ${num}`);
				}
			} else {
				logger.warn('Le fichier est vide ou ne contient aucune question');
			}
			
		});

	})

	// EF09
	.command('comparerProfils', 'Comparer les Profils')
	.argument('<file>', 'The file\'s name')
	.argument('<ref...>', 'The reference file\'s names')
	.action(({args, options, logger}) => {

		let dataFile = fs.readFileSync(args.file, 'utf8');
		let analyzer = new GIFTParser();
		analyzer.parse(dataFile);
		let fileHist = analyzer.profile();

		let otherAnalyzer  = new GIFTParser();
		for (let i = 0; i < args.ref.length; i++) {
			let dataRef = fs.readFileSync(args.ref[i], 'utf8');
			otherAnalyzer.parse(dataRef);
		}
		let refHist = otherAnalyzer.profile();

		let fileQuestionCount = Object.values(fileHist).reduce((acc, cur) => acc + cur, 0);
		let pourcentageFile = {}
		for (type in fileHist) {
			pourcentageFile[type] = fileHist[type] / fileQuestionCount;
		}
		let refQuestionCount = Object.values(refHist).reduce((acc, cur) => acc + cur, 0);
		let pourcentageRef = {}
		for (type in refHist) {
			pourcentageRef[type] = refHist[type] / refQuestionCount;
		}

		logger.info(`Fichier analysé : ${args.file} (Total : ${fileQuestionCount} questions)`);
		logger.info(`Fichiers de référence : ${args.ref.join(', ')} (Total : ${refQuestionCount} questions)\n`);

		logger.info('Type de question :'+' '.repeat(12)+'Profil :'+' '.repeat(22)+'Référence :');
		for (type in pourcentageFile) {
			if (pourcentageRef[type]) {
				logger.info(`${type}${' '.repeat(30-type.length)}${(pourcentageFile[type]*100).toFixed(1)}%${' '.repeat(26)}${(pourcentageRef[type]*100).toFixed(1)}%`);
			} else {
				logger.info(`${type}${' '.repeat(30-type.length)}${(pourcentageFile[type]*100).toFixed(1)}%${' '.repeat(26)}0.0%`);
			}
		}
		for (type in pourcentageRef) {
			if (!pourcentageFile[type]) {
				logger.info(`${type}${' '.repeat(30-type.length)}0.0%${' '.repeat(26)}${(pourcentageRef[type]*100).toFixed(1)}%`);
			}
		}

	})

cli.run(process.argv.slice(2));