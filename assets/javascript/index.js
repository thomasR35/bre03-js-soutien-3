document.addEventListener("DOMContentLoaded", async function () {
  const game = {
    word: "",
    tries: 5,
    letters: [],
  };

  async function getWord() {
    const response = await fetch(
      "https://random-word-api.vercel.app/api?words=1&length=8"
    );
    const data = await response.json();
    return data[0];
  }

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

  async function gameLoop() {
    game.word = await getWord();
    console.log(game.word);

    cleanWord(game);
    console.log("Mot nettoyé :", game.word);

    game.tries = 5;
    game.letters = [];

    document.querySelector("header h3 span").textContent = game.tries;

    const letterBoxes = document.querySelectorAll("#word li");
    letterBoxes.forEach((box) => {
      box.textContent = "";
    });

    const keyboardButtons = document.querySelectorAll("#keyboard li");
    keyboardButtons.forEach((button) => {
      button.classList.remove("disabled");
      button.style.color = "";
    });

    saveGameState();
  }

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

  function saveGameState() {
    localStorage.setItem("gameState", JSON.stringify(game));
  }

  function loadGameState() {
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    if (gameState) {
      game.word = gameState.word;
      game.tries = gameState.tries;
      game.letters = gameState.letters;

      document.querySelector("header h3 span").textContent = game.tries;

      const letterBoxes = document.querySelectorAll("#word li");
      letterBoxes.forEach((box, index) => {
        if (game.letters.includes(game.word[index])) {
          box.textContent = game.word[index];
        }
      });

      const keyboardButtons = document.querySelectorAll("#keyboard li");
      keyboardButtons.forEach((button) => {
        if (game.letters.includes(button.innerText.toLowerCase())) {
          button.classList.add("disabled");
        }
      });
    } else {
      gameLoop();
    }
  }

  document.getElementById("keyboard").addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      const letter = e.target.innerText.toLowerCase();
      if (!game.letters.includes(letter)) {
        game.letters.push(letter);
        e.target.classList.add("disabled");
        console.log(game.letters);

        let letterFound = false;
        const letterBoxes = document.querySelectorAll("#word li");
        for (let i = 0; i < game.word.length; i++) {
          if (game.word[i] === letter) {
            letterBoxes[i].textContent = letter;
            letterFound = true;
          }
        }

        if (!letterFound) {
          game.tries--;
          document.querySelector("header h3 span").textContent = game.tries;
        }

        saveGameState();

        if (game.tries === 0) {
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
          setTimeout(gameLoop, 2000);
        } else {
          let allLettersFound = true;
          for (let i = 0; i < letterBoxes.length; i++) {
            if (letterBoxes[i].textContent === "") {
              allLettersFound = false;
              break;
            }
          }
          if (allLettersFound) {
            alert("Bravo, vous avez trouvé le mot !");
            setTimeout(gameLoop, 2000);
          }
        }
      }
    }
  });

  loadGameState();
});
