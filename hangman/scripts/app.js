import { createCustomElement } from './createCustomElement.js';
import { questionsList } from './questionsList.js';
// console.log('Hangman');
let inbox = null;

export function initHangmanGame(box) {
  inbox = box;
  startHangmanGame();
};

function startHangmanGame() {

  inbox.innerHTML = '';

  const classesNames = {
    mainClass: 'hangman-game',
    quizBoxClass: 'quiz-box',
    gallowsBoxClass: 'gallows-box',
    modalBoxClass: 'modal-box',
  };

  const container = createCustomElement({ tag: 'section', tagClass: 'container' });
  const hangmanGame = createCustomElement({ tag: 'main', tagClass: classesNames.mainClass });

  let incorrectGuesses = 0;
  const maxGuesses = 6;

  const gallowsImages = [
    { img: 'images/gallows.svg', alt: 'gallows image' },
    { img: 'images/head.svg', alt: 'head image', cls: 'head-image' },
    { img: 'images/body.svg', alt: 'body image', cls: 'body-image' },
    { img: 'images/hand-one.svg', alt: 'hand one image', cls: 'hand-one-image' },
    { img: 'images/hand-two.svg', alt: 'hand two image', cls: 'hand-two-image' },
    { img: 'images/leg-one.svg', alt: 'leg one image', cls: 'leg-one-image' },
    { img: 'images/leg-two.svg', alt: 'leg two image', cls: 'leg-two-image' },
  ];

  function getRandomIndex() {
    return Math.floor(Math.random() * questionsList.length);
  };

  const index = getRandomIndex();
  const { hint, word } = questionsList[index];

  createGallowsBoxContent(classesNames, hangmanGame, gallowsImages);
  createQuizBoxContent(classesNames, hangmanGame, gallowsImages, maxGuesses, incorrectGuesses, hint, word);

  container.append(hangmanGame);
  inbox.append(container);
};

//gallows box
function createGallowsBoxContent(classesNames, hangmanGame, gallowsImages) {
  const { mainClass, gallowsBoxClass } = classesNames;

  const gallowsBox = {
    gallowsImage: createCustomElement({ tag: 'div', tagClass: `${gallowsBoxClass}__gallows-image` }),
    titleH1: createCustomElement({ tag: 'h1', tagClass: `${gallowsBoxClass}__title` }),
  };

  const gameGallowsBox = createCustomElement({ tag: 'section', tagClass: `${mainClass}__${gallowsBoxClass}` });

  const gallowsImg = new Image();
  gallowsImg.src = gallowsImages[0].img;
  gallowsImg.alt = gallowsImages[0].alt;


  gallowsBox.gallowsImage.append(gallowsImg);
  gallowsBox.titleH1.innerText = 'hangman game';

  for (let item in gallowsBox) {
    gameGallowsBox.append(gallowsBox[item]);
  };

  hangmanGame.append(gameGallowsBox);
};


function createQuizBoxContent(classesNames, hangmanGame, gallowsImages, maxGuesses, incorrectGuesses, hint, word) {
  console.log(word)
  const { mainClass, quizBoxClass } = classesNames;

  const gameQuizBox = createCustomElement({ tag: 'section', tagClass: `${mainClass}__${quizBoxClass}` });

  const alphabet = [];
  for (let i = 65; i < 91; i++) {
    alphabet.push(String.fromCharCode(i));
  };

  let wordLength = word.length;

  const quizBox = {
    boxWord: createCustomElement({ tag: 'ul', tagClass: `${quizBoxClass}__word` }),
    hint: createCustomElement({ tag: 'p', tagClass: `${quizBoxClass}__hint-box` }),
    guess: createCustomElement({ tag: 'p', tagClass: `${quizBoxClass}__guess-box` }),
    lettersBox: createCustomElement({ tag: 'div', tagClass: `${quizBoxClass}__keyboard-box` }),
  };

  const wordLetterObject = {
    tag: 'li',
    tagClass: `${quizBoxClass}__word-letter  word-letter--hidden`,
    listener: {
      type: 'click',
      action: function clickLetterAction(e) {
        e.preventDefault();
      },
    },
  };

  const quizWord = Array.from(word.toUpperCase(), (item) => {
    const letter = createCustomElement(wordLetterObject);
    // letter.textContent = item;
    letter.style.width = `calc((100% / ${word.length}) - (2rem / ${word.length}))`;
    quizBox.boxWord.append(letter);
    return letter;
  });

  function updateGuesses(incorrectGuesses) {
    quizBox.guess.innerHTML = `Incorrect guesses: <span>${incorrectGuesses}</span> / <span>${maxGuesses}</span>`;
  };
  updateGuesses(incorrectGuesses);

  function updateHint(hint) {
    quizBox.hint.innerHTML = `Hint: <span>${hint}</span>`;
  };
  updateHint(hint);

  for (let item in quizBox) {
    gameQuizBox.append(quizBox[item]);
  };

  const keyItemObject = {
    tag: 'button',
    tagClass: `${quizBoxClass}__key ${quizBoxClass}__button ${mainClass}__button`,
    elType: 'button',
    listener: {
      type: 'click',
      action: function keyAction(e) {
        e.preventDefault();
        e.target.removeEventListener('click', keyAction);
        e.target.classList.add('key--select');
        e.target.setAttribute('disabled', true);

        const isContains = word.toUpperCase().includes(e.target.dataset.letter);
        const letter = e.target.dataset.letter;

        if (isContains) {

         [...word.toUpperCase()].forEach((item, i) => {

            if (item === letter) {
              quizWord[i].innerText = item;
              quizWord[i].classList.remove('word-letter--hidden');


              wordLength -= 1;
              if (wordLength < 1) {
                showModal(classesNames, hangmanGame, word, true);
              };
            };
          });

        } else {
          incorrectGuesses += 1;
          updateGuesses(incorrectGuesses);

          hangmanGame.querySelector('.gallows-box__gallows-image').append(createCustomElement({ tag: 'div', tagClass: gallowsImages[incorrectGuesses].cls }));

          if (incorrectGuesses === maxGuesses) {
            showModal(classesNames, hangmanGame, word, false);
          };
        };
      },
    },
  };

  const keyboard = Array.from(alphabet, (item) => {
    const key = createCustomElement(keyItemObject);
    key.innerText = item;
    key.dataset.letter = item;
    quizBox.lettersBox.append(key);
    return key;
  });

  hangmanGame.append(gameQuizBox);
};


function showModal(classesNames, hangmanGame, word, status) {
  const { mainClass, modalBoxClass } = classesNames;

  const message = {
    victory: 'victory',
    trueMsg: `Congratulations, the word is guessed correctly! - <b>${word.toLowerCase()}</b>`,
    gameover: 'game over',
    falseMsg: `Correct answer - <b>${word.toLowerCase()}</b>`,
  };

  const gameModalBox = createCustomElement({ tag: 'section', tagClass: `${mainClass}__${modalBoxClass} modal-box--show` });
  const modalContentBox = createCustomElement({ tag: 'div', tagClass: `${modalBoxClass}__content` });

  const modalBox = {
    title: createCustomElement({ tag: 'span' }),
    answer: createCustomElement({ tag: 'p' }),
    playButton: null,
  };

  const playButtonObject = {
    tag: 'button',
    tagClass: `${modalBoxClass}__button ${mainClass}__button`,
    elType: 'button',
    listener: {
      type: 'click',
      action: function playGameAction(e) {
        e.preventDefault();
        startHangmanGame();
      },
    },
  };

  modalBox.playButton = createCustomElement(playButtonObject);

  modalBox.title.innerText = status ? message.victory : message.gameover;
  modalBox.answer.innerHTML = status ? message.trueMsg : message.falseMsg;
  modalBox.playButton.innerText = 'play again';

  for (let item in modalBox) {
    modalContentBox.append(modalBox[item]);
  };

  gameModalBox.append(modalContentBox);

  hangmanGame.append(gameModalBox);
};

