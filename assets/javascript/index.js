document.addEventListener("DOMContentLoaded", async function () {
  /*Objet de jeu*/
  const game = {
    word: "" /*Mot à deviner*/,
    tries: 5 /*Nombre d'essais*/,
    letters: [] /*Lettres déjà essayées*/,
  };

  /*Fonction qui charge le mot depuis l'API*/
  async function getWord() {
    const response = await fetch(
      "https://random-word-api.vercel.app/api?words=1&length=8"
    );
    const data = await response.json();
    return data[0];
  }

  /*Fonction de réappropriation des voyelles*/
  function cleanWord(game) {
    let newWord = game.word;
    const replacements = [
      { from: "é", to: "e" },
      { from: "è", to: "e" },
      { from: "ê", to: "e" },
      { from: "ë", to: "e" },
      { from: "ï", to: "i" },
      { from: "î", to: "i" },
      { from: "ç", to: "c" },
      { from: "à", to: "a" },
      { from: "â", to: "a" },
      { from: "ô", to: "o" },
      { from: "ù", to: "u" },
      { from: "û", to: "u" },
    ];

    replacements.forEach((replacement) => {
      newWord = newWord.split(replacement.from).join(replacement.to);
    });

    game.word = newWord;
  }

  /*Fonction de boucle de jeu*/
  async function gameLoop() {
    /*Charger un nouveau mot depuis l'API*/
    game.word = await getWord();
    console.log(game.word);

    /*Nettoyer le mot (réappropriation des voyelles)*/
    cleanWord(game);
    console.log("Mot nettoyé :", game.word);

    /*Réinitialiser les essais et les lettres essayées*/
    game.tries = 5;
    game.letters = [];

    /*Mettre à jour l'affichage des essais restants*/
    document.querySelector("header h3 span").textContent = game.tries;

    /*Réinitialiser les cases de lettres*/
    const letterBoxes = document.querySelectorAll("#word li");
    letterBoxes.forEach((box) => {
      box.textContent = "";
    });

    /*Réinitialiser les boutons du clavier*/
    const keyboardButtons = document.querySelectorAll("#keyboard li");
    keyboardButtons.forEach((button) => {
      button.classList.remove("disabled");
      button.style.color = "";
    });

    /*Sauvegarder l'état du jeu*/
    saveGameState();
  }

  /*Fonction de coloration des lettres incorrectes*/
  function redWrongLetters() {
    const keyboardButtons = document.querySelectorAll("#keyboard li");
    for (let i = 0; i < game.word.length; i++) {
      const letter = game.word[i];
      const button = Array.from(keyboardButtons).find(
        (btn) => btn.innerText.toLowerCase() === letter
      );
      if (button && !button.classList.contains("disabled")) {
        button.style.color = "red";
      }
    }
  }

  /*Fonction de sauvegarde du jeu*/
  function saveGameState() {
    localStorage.setItem("gameState", JSON.stringify(game));
  }

  /*Fonction de chargement du jeu*/
  function loadGameState() {
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    if (gameState) {
      /*Charger l'état du jeu depuis le localStorage*/
      game.word = gameState.word;
      game.tries = gameState.tries;
      game.letters = gameState.letters;

      /*Mettre à jour l'affichage des essais restants*/
      document.querySelector("header h3 span").textContent = game.tries;

      /*Mettre à jour les cases de lettres*/
      const letterBoxes = document.querySelectorAll("#word li");
      letterBoxes.forEach((box, index) => {
        if (game.letters.includes(game.word[index])) {
          box.textContent = game.word[index];
        }
      });

      /*Mettre à jour les boutons du clavier*/
      const keyboardButtons = document.querySelectorAll("#keyboard li");
      keyboardButtons.forEach((button) => {
        if (game.letters.includes(button.innerText.toLowerCase())) {
          button.classList.add("disabled");
        }
      });
    } else {
      /*Si aucun état de jeu n'est sauvegardé, démarrer une nouvelle partie*/
      gameLoop();
    }
  }

  /*Fonction de gestion des clics sur le clavier*/
  document.getElementById("keyboard").addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      const letter = e.target.innerText.toLowerCase();
      if (!game.letters.includes(letter)) {
        /*Ajouter la lettre aux lettres essayées*/
        game.letters.push(letter);
        e.target.classList.add("disabled");
        console.log(game.letters);

        let letterFound = false;
        const letterBoxes = document.querySelectorAll("#word li");
        for (let i = 0; i < game.word.length; i++) {
          if (game.word[i] === letter) {
            /*Si la lettre est dans le mot, l'afficher*/
            letterBoxes[i].textContent = letter;
            letterFound = true;
          }
        }

        if (!letterFound) {
          /*Si la lettre n'est pas dans le mot, décrémenter les essais*/
          game.tries--;
          document.querySelector("header h3 span").textContent = game.tries;
        }

        /*Sauvegarder l'état du jeu*/
        saveGameState();

        if (game.tries === 0) {
          /*Si tous les essais sont épuisés, demander au joueur de deviner le mot*/
          const userGuess = prompt(
            "Vous avez épuisé vos essais. Devinez le mot : "
          );
          if (userGuess.toLowerCase() === game.word) {
            alert("Bravo, vous avez trouvé le mot !");
          } else {
            alert(
              "Dommage, vous avez perdu. Le mot mystère était : " + game.word
            );
            redWrongLetters();
          }
          /*Redémarrer une nouvelle partie après un délai*/
          setTimeout(gameLoop, 2000);
        } else {
          /*Vérifier si toutes les lettres du mot ont été trouvées*/
          let allLettersFound = true;
          for (let i = 0; i < letterBoxes.length; i++) {
            if (letterBoxes[i].textContent === "") {
              allLettersFound = false;
              break;
            }
          }
          if (allLettersFound) {
            alert("Bravo, vous avez trouvé le mot !");
            /*Redémarrer une nouvelle partie après un délai*/
            setTimeout(gameLoop, 2000);
          }
        }
      }
    }
  });

  /*Charger l'état du jeu au démarrage*/
  loadGameState();
});
