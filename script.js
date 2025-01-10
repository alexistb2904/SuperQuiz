// Sélection de l'élément principal de l'application
const app = document.getElementById('app');
// Récupération des éléments audio
const audio = new Audio('./sound/quizMusic.mp3');
const correctAnswer = new Audio('./sound/correctAnswer.mp3');
const wrongAnswer = new Audio('./sound/wrongAnswer.mp3');

let isMute = false;

function createStartPage() {
	stopMusic();
	app.innerHTML = ''; // Réinitialisation du contenu de l'application
	const startPage = document.createElement('div'); // Création d'un nouvel élément div
	startPage.classList.add('startPage'); // Ajout d'une classe CSS
	startPage.innerHTML = `
            <h1 class="firstText">Bienvenue</h1>
			<h2 class="firstText">Sur</h2>
			<h3 class="firstText">The Quiz</h3>
			<button class="actionButton" onclick="startPageAnimation()">Jouer</button>
        `;
	app.appendChild(startPage); // Ajout de la page au DOM
}

function playMusic() {
	audio.play();
	audio.volume = 0.15;
	audio.loop = true;
	console.log('Musique activée');
	if (!document.querySelector('.volume')) {
		const volume = document.createElement('div');
		volume.classList.add('volume');
		volume.innerHTML = `
		<img src="./img/volume_on.svg" alt="volume">
		`;

		volume.querySelector('img').addEventListener('click', () => {
			if (isMute) {
				playMusic();
				isMute = false;
				volume.querySelector('img').src = './img/volume_on.svg';
			} else {
				pauseMusic();
				isMute = true;
				volume.querySelector('img').src = './img/volume_off.svg';
			}
		});

		console.log(volume);
		document.querySelector('.gamePage').appendChild(volume);
	}
}

function pauseMusic() {
	console.log('Musique mise sur pause');
	audio.pause();
}

function stopMusic() {
	audio.pause();
	audio.currentTime = 0;

	const volume = document.querySelector('.volume');
	if (volume) {
		volume.remove();
	}
}

function correctAnswerSound() {
	correctAnswer.play();
}

function wrongAnswerSound() {
	wrongAnswer.play();
}

// Fonction pour gérer l'animation et la transition de la page d'accueil
function startPageAnimation() {
	stopMusic();
	// Recherche ou création de la page de démarrage
	let startPage = document.querySelector('.startPage');
	if (!startPage) {
		createStartPage();
		startPage = document.querySelector('.startPage');
	}

	// Ajout d'une classe pour l'animation de sortie
	startPage.classList.add('exitAnimation');
	setTimeout(() => {
		// Suppression de la page de démarrage après l'animation
		startPage.remove();
		// Transition vers la page de configuration
		configPage();
	}, 1000); // Délai de 1 seconde
}

// Fonction pour afficher la page de configuration
function configPage() {
	app.innerHTML = ''; // Réinitialisation du contenu de l'application
	stopMusic();
	const configPage = document.createElement('div'); // Création d'un nouvel élément div
	configPage.classList.add('configPage'); // Ajout d'une classe CSS
	configPage.innerHTML = `
        <h1>Configuration</h1>
        <div class="configContainer">
            <div class="configItem">
                <label>
                Difficulté
                <select id="difficulty">
                    <option value="facile">Facile</option>
                    <option value="moyenne">Moyen</option>
                    <option value="difficile">Difficile</option>
                </select>
                </label>
            </div>
            <div class="configItem">
                <label>
                Nombre de questions
                <input type="number" id="amountOfQuestions" value="10" min="5" max="20">
                </label>
            </div>
            <div class="configItem">
                <label>
                Quand voir les résultats
                <select id="results">
                    <option value="instant">Instantané</option>
                    <option value="page">A la fin uniquement</option>
                </select>
                </label>
            </div>
            <div class="configItem">
                <label>
                Temps pour chaque question
                <input type="number" id="time" value="15" min="10" max="60">
                </label>
            </div>
        </div>
        <button class="actionButton">Commencer</button>
		<button class="actionButton" onclick="createStartPage()">Retourner au menu</button>
    `;

	app.appendChild(configPage); // Ajout de la page de configuration au DOM

	// Ajout d'un gestionnaire d'événement pour le bouton "Commencer"
	configPage.querySelector('button:first-of-type').addEventListener('click', () => {
		// Récupération des valeurs des champs de configuration
		const amountOfQuestions = document.getElementById('amountOfQuestions').value;
		const difficulty = document.getElementById('difficulty').value;
		const results = document.getElementById('results').value;
		const time = document.getElementById('time').value;
		// Appel de la fonction pour démarrer le jeu
		startGame(amountOfQuestions, difficulty, results, time);
	});
}

// Fonction principale pour démarrer le jeu
async function startGame(amountOfQuestions, difficulty, results, time) {
	console.log('Nombre de questions:', amountOfQuestions);
	console.log('Difficulté:', difficulty);
	console.log('Résultats:', results);
	console.log('Temps:', time);
	console.log('Début du jeu');

	document.querySelector('.configPage').remove(); // Suppression de la page de configuration
	const gamePage = document.createElement('div'); // Création d'un nouvel élément div pour la page du jeu
	gamePage.classList.add('gamePage'); // Ajout d'une classe CSS

	let timerGlobal = parseInt((time * amountOfQuestions) / 1.5);
	console.log('Temps global:', timerGlobal);
	const timerGlobalDiv = document.createElement('span');
	timerGlobalDiv.classList.add('timerGlobal');
	timerGlobalDiv.innerHTML = `${timerGlobal}s`;

	gamePage.appendChild(timerGlobalDiv);

	const intervalGlobal = setInterval(() => {
		timerGlobal--;
		timerGlobalDiv.innerHTML = `${timerGlobal}s`;
		if (timerGlobal === 0) {
			clearInterval(intervalGlobal);
			const nombreDeQuestionACompleter = amountOfQuestions - reponseQuestions.length;
			for (let i = 0; i < nombreDeQuestionACompleter; i++) {
				reponseQuestions.push('Pas de réponse');
			}
			showResult(questionsMelange, reponseQuestions);
		}
	}, 1000);

	let questionsMelange = []; // Liste pour stocker les questions mélangées
	console.log('Récupération des questions...');
	await fetch('listOfQuestions.json') // Chargement des questions depuis un fichier JSON
		.then((response) => {
			if (!response.ok) {
				throw new Error('Erreur lors du chargement du fichier JSON');
			}
			return response.json(); // Conversion de la réponse en JSON
		})
		.then((data) => {
			const questions = data.questions; // Extraction des questions
			console.log('Questions récupérées:', questions);

			// Filtrage des questions par difficulté
			const questionsFiltre = questions.filter((question) => question.difficulty == difficulty.toLowerCase());
			console.log('Questions filtrées:', questionsFiltre);

			// Mélange des questions et sélection d'un sous-ensemble
			questionsMelange = questionsFiltre.sort(() => Math.random() - 0.5).slice(0, amountOfQuestions);
			console.log('Questions mélangées:', questionsMelange);

			// Ajout de la page de jeu au DOM
			app.appendChild(gamePage);
		})
		.catch((error) => {
			console.error('Erreur:', error); // Gestion des erreurs lors du chargement des questions
		});

	let reponseQuestions = []; // Liste pour stocker les réponses de l'utilisateur

	playMusic(); // Démarrage de la musique

	// Fonction pour créer et afficher une question
	async function createQuestion(question, index) {
		return new Promise((resolve) => {
			console.log('Création de la question n°', index);

			// Mélange des réponses si nécessaire
			let allReponses = question.options;
			if (question.type != 'true/false') {
				allReponses = allReponses.sort(() => Math.random() - 0.5);
			}

			// Initialisation du temps restant pour répondre
			let tempsRestant = time;

			// Création d'un conteneur pour la question
			const questionContainer = document.createElement('div');
			questionContainer.classList.add('questionContainer');
			questionContainer.innerHTML = `
                <h1 class="question">${question.question}</h1>
                <span class="counter">${index}/${questionsMelange.length}</span>
                <span class="timer">${tempsRestant}s</span>
                <div class="reponses">
                    ${allReponses
						.map((reponse) => {
							return `
                        <label class="radio">
                            <input type="radio" name="radio">
                            <span class="reponse">${reponse}</span>
                        </label>
                        `;
						})
						.join('')}
                </div>
            `;

			// Ajout du bouton suivant ou résultats
			questionContainer.innerHTML += `
                <button class="actionButton">${index === questionsMelange.length ? 'Résultats' : 'Suivant'}</button>
            `;

			questionContainer.querySelector('.reponses').animate(
				[
					{ transform: 'translateX(-100%)', opacity: 0 },
					{ transform: 'translateX(0)', opacity: 1 },
				],
				{
					duration: 1000,
					easing: 'ease-in-out',
				}
			);

			questionContainer.querySelector('.question').animate(
				[
					{ transform: 'translateY(-100%)', opacity: 0 },
					{ transform: 'translateY(0)', opacity: 1 },
				],
				{
					duration: 1000,
					easing: 'ease-in-out',
				}
			);

			// Gestionnaire d'événement pour le bouton "Suivant" ou "Résultats"
			questionContainer.querySelector('.actionButton').addEventListener('click', () => {
				// Récupération de la réponse sélectionnée par l'utilisateur
				const reponses = questionContainer.querySelectorAll(`.radio`);
				let reponseToPush = '';
				reponses.forEach((reponse) => {
					if (reponse.querySelector('input').checked) {
						reponseToPush = reponse.querySelector('.reponse').textContent;
					}
				});
				console.log('Réponse sélectionnée:', reponseToPush);
				console.log('Réponse correcte:', question.answer);

				// Si une réponse est sélectionnée ou si le temps est écoulé
				if (reponseToPush || tempsRestant === 0) {
					reponseQuestions.push(reponseToPush == '' ? 'Pas de réponse' : reponseToPush); // Ajout de la réponse à la liste
					if (results == 'instant') {
						clearInterval(interval);
						if (reponseToPush === question.answer) {
							correctAnswerSound();
						} else {
							wrongAnswerSound();
						}

						questionContainer.innerHTML = `
                        <h1 class="question">${question.question}</h1>
                        <span class="counter">${index}/${questionsMelange.length}</span>
                        <div class="reponses background_${reponseToPush === question.answer}">
                            <div class="reponse">Votre réponse: ${reponseToPush}</div>
                            <div class="reponse">Réponse correcte: ${question.answer}</div>
                        </div>
                        <div>Passage à la question suivante dans 2 secondes...</div>`;
						setTimeout(() => {
							questionContainer.remove(); // Suppression de la question affichée
							resolve(); // Passage à la question suivante
						}, 2000);
					} else {
						clearInterval(interval);
						questionContainer.querySelector('.reponses').classList.add('exitAnimation');
						questionContainer.querySelector('.question').classList.add('exitAnimation');
						setTimeout(() => {
							questionContainer.remove(); // Suppression de la question affichée
							resolve(); // Passage à la question suivante
						}, 1000);
					}
				} else {
					alert('Vous devez choisir une réponse'); // Alerte si aucune réponse n'est sélectionnée
				}
			});

			gamePage.appendChild(questionContainer); // Ajout de la question à la page

			// Gestion du chronomètre
			const timer = document.querySelector('.timer');
			const interval = setInterval(() => {
				if (timerGlobal > 0) {
					tempsRestant--; // Décrémentation du temps restant
					timer.innerHTML = tempsRestant + 's'; // Mise à jour de l'affichage du temps
					if (tempsRestant === 0) {
						clearInterval(interval); // Arrêt du chronomètre
						console.log('Temps écoulé');
						if (questionContainer.querySelector('.actionButton')) {
							questionContainer.querySelector('.actionButton').click(); // Passage automatique à la question suivante
						}
					}
				} else {
					clearInterval(interval);
				}
			}, 1000);
		});
	}

	// Création et affichage des questions
	for (const [index, question] of questionsMelange.entries()) {
		if (timerGlobal > 0) {
			await createQuestion(question, index + 1);
		}
	}

	console.log('Fin du jeu');
	if (timerGlobal > 0) {
		showResult(questionsMelange, reponseQuestions); // Affichage des résultats
	}

	// Fonction pour afficher les résultats
	function showResult(questions, reponses) {
		gamePage.innerHTML = ''; // Réinitialisation de la page
		const bestScore = localStorage.getItem('bestScore') || 0; // Récupération du meilleur score
		const bestScoreLength = localStorage.getItem('bestScoreLength') || 0; // Récupération du nombre de questions du meilleur score
		const resultPage = document.createElement('div'); // Création d'un conteneur pour les résultats
		resultPage.classList.add('resultPage');
		let score = 0; // Initialisation du score
		questions.forEach((question, index) => {
			if (question.answer === reponses[index]) {
				score++; // Incrémentation du score si la réponse est correcte
			}
		});

		// Mise à jour du meilleur score dans le stockage local
		localStorage.setItem('bestScore', score > bestScore ? score : bestScore);
		localStorage.setItem('bestScoreLength', score > bestScore ? questions.length : bestScoreLength);

		// Affichage des résultats
		resultPage.innerHTML = `
            <h1>Résultat</h1>
            ${score > bestScore ? `<h2>Nouveau meilleur score: ${score}/${questions.length}</h2>` : `<h2>Meilleur score: ${bestScore}/${bestScoreLength}</h2>`}
            <div class="score">Score: ${score}/${questions.length}</div>
            ${questions
				.map((question, index) => {
					return `
                    <div class="resultContainer">
                        <div class="question">${index + 1} - ${question.question}</div>
                        <div class="reponses">
                            <div class="reponse">Votre réponse: ${reponses[index]}</div>
                            <div class="reponse">Réponse correcte: ${question.answer}</div>
                        </div>
                    </div>
                `;
				})
				.join('')}
            <button class="actionButton">Recommencer</button>
        `;
		gamePage.appendChild(resultPage);

		// Gestionnaire d'événement pour le bouton "Recommencer"
		resultPage.querySelector('.actionButton').addEventListener('click', () => {
			gamePage.remove(); // Suppression de la page des résultats
			configPage(); // Retour à la page de configuration
		});
	}
}
