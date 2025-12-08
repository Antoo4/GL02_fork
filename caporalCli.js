const fs = require('fs');
const colors = require('colors');
const GIFTParser = require('./GIFTParser.js');
const readline = require("readline");
const vg = require('vega');
const vegalite = require('vega-lite');
const cli = require("@caporal/core").default;
const { simulateExamFromFile } = require('./SimulateExam');
const { generateGiftFile } = require('./GiftGenerator.js');
const {selectQuestionsFromFile}=require('./selectionner.js')
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
//EF03
//Selectionner
.command('selectionner', 'Sélectionner des questions depuis un fichier GIFT')
  .argument('<file>', 'Le fichier GIFT contenant les questions')
  .action(async ({ args, logger }) => {
      try {
          await selectQuestionsFromFile(args.file);
      } catch (err) {
          logger.error("Erreur lors de la sélection :", err.message || err);
      }
  })



	//EF04
	//Generate
 .command('generate', 'Generate a GIFT file from predefined questions')
    .argument('<file>', 'Output GIFT filename')
    .action(({ args, logger }) => {
        try {
            const filename = generateGiftFile(args.file);
            logger.info(`Fichier GIFT généré avec succès : ${filename}`);
        } catch (err) {
            logger.error("Erreur lors de la génération du fichier GIFT : " + (err.message || err));
        }
    })
//EF06
	//simulate 
	.command('simulate', 'Simulate an exam from a GIFT file')
    .argument('<file>', 'The GIFT file to simulate')
    .action(async ({ args, logger }) => {
        await simulateExamFromFile(args.file);
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

	//EF3
	.command('createVCard', 'create VCard File')
	.action(async ({ logger }) => {

		const ask = (question, validate = null) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			return new Promise(resolve => {
				rl.question(question, answer => {
					answer = answer.trim();
					if (validate && !validate(answer)) {
						console.log("Veuillez à respecter le formatde l’information demandée.");
						process.exit()
					} else {
						rl.close();
						resolve(answer);
					}
				});
			});
		};


		const notEmpty = str => str.length > 0;
		const isEmail = str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
		const isPhone = str => /^[0-9+\-\s()]{4,20}$/.test(str);
		const isGender = str => ["M", "F", "O"].includes(str.toUpperCase());
		const isDate = str => /^\d{4}-\d{2}-\d{2}$/.test(str);



		logger.info("Création d'une vCard");

		const lastName = await ask("Nom de famille : ", notEmpty);
		const firstName = await ask("Prénom : ", notEmpty);
		const dob = await ask("Date de naissance (AAAA-MM-JJ) : ", isDate)
		const gender = await ask("Genre (M/F/O) : ", isGender)

		const email = await ask("Email : ", isEmail);
		const tel = await ask("Téléphone : ", isPhone);

		const org = await ask("Organisation (facultatif) : ");
		const title = await ask("Titre/Poste (facultatif) : ");
		const role = await ask("Rôle (facultatif) : ");
		const note = await ask("Note (facultatif) : ");


		const filename = 'contact.vcf';
		if (fs.existsSync(filename)) {
			const overwrite = await ask(`Le fichier "${filename}" existe déjà. Voulez-vous l'écraser ? (oui/non) : `);

			if (overwrite !== "oui") {
				logger.info("Opération annulée");
				return;
			}
		}

		const vcard = [
			'BEGIN:VCARD',
			'VERSION:4.0',
			`FN:${firstName} ${lastName}`,
			`N:${lastName};${firstName};;;`,
			`BDAY:${dob}`,
			`GENDER:${gender}`,
			email ? `EMAIL:${email}` : null,
			tel ? `TEL:${tel}` : null,
			org ? `ORG:${org}` : null,
			role ? `ROLE:${role}` : null,
			title ? `TITLE:${title}` : null,
			note ? `NOTE:${note}` : null,
			`REV:${new Date().toISOString()}`,
			'END:VCARD'
		].filter(line => line && line.trim() !== "").join('\n');

		try {
			fs.writeFileSync(filename, vcard, "utf8");
			logger.info(`vCard générée : ${filename}`);
		} catch (err) {
			logger.error("Erreur lors de l'écriture du fichier :", err.message || err);
		}
	});


cli.run(process.argv.slice(2));