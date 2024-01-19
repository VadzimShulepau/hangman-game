import { createCustomElement } from './createCustomElement.js';
import { questionsList } from './questionsList.js';
// console.log('Hangman');
let inbox = null;
let isGame = false;
let usedKeys = [];
let word = '';
let hint = '';
let alphabet = Array.from({ length: 26 }, (item, i) => {
  let index = i + 65;
  return item = String.fromCharCode(index);
});
// for (let i = 65; i < 91; i++) {
//   alphabet.push(String.fromCharCode(i));
// };

let quizWord = [];
let incorrectGuesses = 0;
let keyboard = null;
let wordLength = null;
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

const { mainClass, gallowsBoxClass, quizBoxClass, modalBoxClass } = {
  mainClass: 'hangman-game',
  quizBoxClass: 'quiz-box',
  gallowsBoxClass: 'gallows-box',
  modalBoxClass: 'modal-box',
};

let container = null;
let hangmanGame = null;
let quizBox = {};
let gallowsBox = {};

export function initHangmanGame(box) {
  inbox = box;
  startHangmanGame();
};

function startHangmanGame() {
  console.log('Start')
  // resetGame();

  isGame = true;

  function getRandomIndex() {
    return Math.floor(Math.random() * questionsList.length);
  };

  const index = getRandomIndex();
  hint = questionsList[index].hint;
  word = questionsList[index].word;
  wordLength = word.length;

  container = createCustomElement({ tag: 'section', tagClass: 'container' });
  hangmanGame = createCustomElement({ tag: 'main', tagClass: mainClass });

  createGallowsBoxContent();
  createQuizBoxContent();

  container.append(hangmanGame);
  inbox.append(container);
  inbox.addEventListener('keydown', keyAction);
};

function resetGame() {
  inbox.innerHTML = '';
  inbox.removeEventListener('keydown', keyAction);
  usedKeys = [];
  incorrectGuesses = 0;
  isGame = false;
};

//gallows box
function createGallowsBoxContent() {

  gallowsBox = {
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


function createQuizBoxContent() {
  console.log(word)
  const gameQuizBox = createCustomElement({ tag: 'section', tagClass: `${mainClass}__${quizBoxClass}` });

  quizBox = {
    boxWord: createCustomElement({ tag: 'ul', tagClass: `${quizBoxClass}__word` }),
    hint: createCustomElement({ tag: 'p', tagClass: `${quizBoxClass}__hint-box` }),
    guess: createCustomElement({ tag: 'p', tagClass: `${quizBoxClass}__guess-box` }),
    keyboardBox: createCustomElement({ tag: 'div', tagClass: `${quizBoxClass}__keyboard-box` }),
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

  quizWord = Array.from(word.toUpperCase(), (item) => {
    const letter = createCustomElement(wordLetterObject);
    // letter.textContent = item;
    letter.style.width = `calc((100% / ${wordLength}) - (2rem / ${wordLength}))`;
    quizBox.boxWord.append(letter);
    return letter;
  });

  const keyItemObject = {
    tag: 'button',
    tagClass: `${quizBoxClass}__key ${quizBoxClass}__button ${mainClass}__button`,
    elType: 'button',
    listener: {
      type: 'click',
      action: keyAction,
    },
  };

  // quizBox.keyboardBox.innerHtml = '';

  keyboard = Array.from(alphabet, (item) => {
    const key = createCustomElement(keyItemObject);
    key.innerText = item;
    key.dataset.letter = item;
    quizBox.keyboardBox.append(key);
    return key;
  });

  updateGuesses();
  updateHint();

  for (let item in quizBox) {
    gameQuizBox.append(quizBox[item]);
  };

  hangmanGame.append(gameQuizBox);
};

function updateGuesses() {
  quizBox.guess.innerHTML = `Incorrect guesses: <span>${incorrectGuesses}</span> / <span>${maxGuesses}</span>`;
};

function updateHint() {
  quizBox.hint.innerHTML = `Hint: <span>${hint}</span>`;
};

function keyAction(e) {
  e.preventDefault();

  const letter = e.target?.dataset?.letter || e.key.toUpperCase();

  const isContains = word.toUpperCase().includes(letter);
  const isUsedKey = usedKeys.includes(letter);
  const checkKey = alphabet.includes(letter);

  if (checkKey && !isUsedKey) {
    keyboard.forEach((item) => {
      if (item.dataset.letter === letter) {
        item.classList.add('key--disabled');
        item.setAttribute('disabled', true);
        item.removeEventListener('click', keyAction);
        usedKeys.push(letter);
        console.log(letter)
      };
    });

    if (isContains) {

      [...word.toUpperCase()].forEach((item, i) => {

        if (item === letter) {
          quizWord[i].innerText = item;
          quizWord[i].classList.remove('word-letter--hidden');

          wordLength -= 1;

          if (wordLength < 1) {
            showModal(true);
          };
        };
      });

    } else {
      incorrectGuesses += 1;
      updateGuesses();
      gallowsBox.gallowsImage.append(createCustomElement({ tag: 'div', tagClass: gallowsImages[incorrectGuesses]?.cls }));

      if (incorrectGuesses === maxGuesses) {
        showModal(false);
      };
    };
  } else {
    if (e?.key === 'Enter' && !isGame) {
      resetGame();
      startHangmanGame();
    };
  };
};

function showModal(status) {
  isGame = false;

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
        resetGame();
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

