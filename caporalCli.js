const fs = require('fs');
const colors = require('colors');
const GIFTParser = require('./GIFTParser.js');
const readline = require("readline");
const vg = require('vega');
const vegalite = require('vega-lite');
const cli = require("@caporal/core").default;
const { simulateExamFromFile } = require('./SimulateExam');
const { generateGiftFile } = require('./GiftGenerator.js');
const { selectQuestionsFromFile } = require('./selectionner.js');

cli
    .version('gift-parser-cli')
    .version('0.07')
    // EF01 - Affichage corrigé
    .command('display', 'Display the a Question')
    .argument('<id>', 'The id of the Question to display')
    .action(({ args, options, logger }) => {
        const analyzer = new GIFTParser();
        analyzer.fakeParse(); 

        let questionExists = false;
        // Correction : conversion explicite en nombre pour comparaison stricte
        const targetId = parseInt(args.id, 10);

        for (const question of analyzer.parsedQuestions) {
            if (targetId === question.id) {
                console.log(question.toString());
                questionExists = true;
                break;
            } 
        }
        if (!questionExists) {
            console.log("La question est introuvable.");
        }
    })

    .command('selectionner', 'Sélectionner des questions depuis un fichier GIFT')
    .argument('<input>', 'Le fichier GIFT contenant les questions')
    .argument('<output>', 'Le fichier GIFT à créer avec les questions sélectionnées')
    .action(async ({ args, logger }) => {
        try {
            await selectQuestionsFromFile(args.input, args.output);
        } catch (err) {
            logger.error("Erreur lors de la sélection :", err.message || err);
        }
    })

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

    .command('simulate', 'Simulate an exam from a GIFT file')
    .argument('<file>', 'The GIFT file to simulate')
    .action(async ({ args, logger }) => {
        await simulateExamFromFile(args.file);
    })

    .command('search', 'Free text search on the Questions\' name')
    .argument('<needle>', 'The text to look for in the Question\'s names')
    .action(({ args, options, logger }) => {
        const analyzer = new GIFTParser();
        analyzer.fakeParse(); 
        let it = 0;

        for (const question of analyzer.parsedQuestions) {
            if (question.contains(args.needle)) {
                console.log(question.toString());
            }
        }
    })

    .command('test', 'Test')
    .argument('<file>', 'The file\'s name')
    .action(({ args, options, logger }) => {
        fs.readFile(args.file, 'utf8', function (err, data) {
            if (err) return logger.warn(err);
            const analyzer = new GIFTParser();
            analyzer.parse(data);
            console.log(analyzer.parsedQuestions);
        });
    })

    .command('profiler', 'Profiler')
    .argument('<file>', 'The file\'s name')
    .action(({ args, options, logger }) => {
        fs.readFile(args.file, 'utf8', function (err, data) {
            if (err) return logger.warn(err);
            let analyzer = new GIFTParser();
            analyzer.parse(data);
            logger.info('Nom du fichier : ' + args.file);
            logger.info('Nombre de questions : ' + analyzer.index + '\n');

            if (analyzer.parsedQuestions.length > 0) {
                let hist = analyzer.profile();
                logger.info('Histogramme : ')
                for (let type in hist) {
                    let num = '#'.repeat(hist[type]);
                    logger.info(`${type}${' '.repeat(Math.max(0, 30-type.length))}(${hist[type]}) : ${num}`);
                }
            } else {
                logger.warn('Le fichier est vide ou ne contient aucune question');
            }
        });
    })

    .command('createVCard', 'create VCard File')
    .action(async ({ logger }) => {
        // Correction Issue 3 : Interface créée une seule fois
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question, validate = null) => {
            return new Promise(resolve => {
                rl.question(question, answer => {
                    answer = answer.trim();
                    if (validate && !validate(answer)) {
                        console.log("Veuillez respecter le format demandé.");
                        rl.close();
                        process.exit();
                    } else {
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
        const dob = await ask("Date de naissance (AAAA-MM-JJ) : ", isDate);
        const gender = await ask("Genre (M/F/O) : ", isGender);
        const email = await ask("Email : ", isEmail);
        const tel = await ask("Téléphone : ", isPhone);
        const org = await ask("Organisation (facultatif) : ");
        const title = await ask("Titre/Poste (facultatif) : ");
        const role = await ask("Rôle (facultatif) : ");
        const note = await ask("Note (facultatif) : ");

        const filename = 'contact.vcf';
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
        ].filter(line => line).join('\n');

        fs.writeFileSync(filename, vcard, "utf8");
        logger.info(`vCard générée : ${filename}`);
        rl.close(); // Fermeture propre
    });
cli.run(process.argv.slice(2));