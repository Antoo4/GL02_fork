const fs = require('fs');
const readline = require("readline");
const cli = require("@caporal/core").default;

cli
	.version('vpf-parser-cli')
	.version('0.07')

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
