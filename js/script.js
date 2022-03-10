const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const targetWord = targetWords[Math.floor(dayOffset)];
let victoryLine = 0;
let lastCorrect = 0

startInteraction();

function startInteraction() {
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
    if(e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key);
        return;
    }
    if(e.target.matches("[data-enter]")) {
        submitGuess();
        return;
    }
    if(e.target.matches("[data-delete")) {
        deleteKey();
        return;
    }
}

function handleKeyPress(e) {
    if(e.key === "Enter") {
        submitGuess();
        return;
    }
    if(e.key === "Backspace" || e.key === "Delete") {
        deleteKey();
        return;
    }
    if(e.key.match(/^[a-z]$/)) {
        pressKey(e.key);
        return;
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles();
    if (activeTiles.length >= WORD_LENGTH) return;
    const nextTile = guessGrid.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
}

function deleteKey() {
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length - 1];
    if (lastTile == null) return;
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()];
    if (activeTiles.length !== WORD_LENGTH) {
        showAlert("System Failure: Not enough letters");
        shakeTiles(activeTiles);
        return;
    }
    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter;
    }, "")

    if (!dictionary.includes(guess)) {
        showAlert("System Failure: Not in word list");
        shakeTiles(activeTiles);
        return;
    }

    stopInteraction();
    activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter;
    const key = keyboard.querySelector(`[data-key="${letter}"i]`);
    setTimeout(() => {
        tile.classList.add("flip");
    }, (index * FLIP_ANIMATION_DURATION) / 2);

    tile.addEventListener("transitionend", () => {
        tile.classList.remove("flip");
        if (targetWord[index] === letter) {
            tile.dataset.state = "correct";
            key.classList.add("correct");
        } else if (targetWord.includes(letter)) {
            tile.dataset.state = "wrong-location";
            key.classList.add("wrong-location");
        } else {
            tile.dataset.state = "wrong";
            key.classList.add("wrong");
        }

        if(index === array.length - 1) {
            tile.addEventListener("transitionend", () => {
                startInteraction();
                checkWinLose(guess, array);
            }, { once: true });
        }
    }, { once: true });
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
    const alert = document.createElement("div");
    alert.textContent = message;
    alert.classList.add("alert");
    alertContainer.prepend(alert);
    if (duration == null) return;

    setTimeout(() => {
        alert.classList.add("hide");
        alert.addEventListener("transitionend", ()=> {
            alert.remove();
        })
    }, duration);
}

function victory() {
    const shareBtn = document.createElement("button");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#FFFFFF" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path></svg>';
    shareBtn.innerHTML = 'Share ' + svg;
    shareBtn.classList.add('btnShare');
    shareBtn.setAttribute("onclick","shareResults();");
    const victory = document.createElement("div");
    victory.textContent = 'You win!';
    victory.classList.add("alert");
    alertContainer.classList.add('alert-container-win');
    alertContainer.prepend(shareBtn);
    alertContainer.prepend(victory);
    for (let index = 0; index < guessGrid.children.length; index++) {
        if (guessGrid.children[index].dataset.state === 'correct') {
            lastCorrect = index;
        }
    }
    switch(lastCorrect) {
        case 4:
            victoryLine = 1;
            break;
        case 9:
            victoryLine = 2;
            break;
        case 14:
            victoryLine = 3;
            break;
        case 19:
            victoryLine = 4;
            break;
        case 24:
            victoryLine = 5;
            break;
        default:
            victoryLine = 6;
            break;
    }
}

async function shareResults() {
    let result = `Lostle ${datediff(new Date('2022-03-06'), new Date())} ${victoryLine}/6 \n\n`;
    for (let index = 0; index < lastCorrect + 1; index++) {
        var endOfLine = [4, 9, 14, 19, 24];
        switch (guessGrid.children[index].dataset.state) {
            case 'correct':
                result += '🟩';
                if (endOfLine.indexOf(index) > -1 && index + 1 !== lastCorrect) {
                    result +=  `\n`
                }
                break;
            case 'wrong-location':
                result += '🟨';
                if (endOfLine.indexOf(index) > -1) {
                    result +=  `\n`
                }
                break;
            default:
                result += '⬛';
                if (endOfLine.indexOf(index) > -1) {
                    result +=  `\n`
                }
                break;
          }
    }
    await navigator['share']({ url: 'https://lostle.bomblikeapps.com', title: 'Lostle', text: result });
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake");
        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake");
        }, { once: true })
    });
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord) {
        victory();
        danceTiles(tiles);
        stopInteraction();
        return;
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0) {
        const reloadBtn = document.createElement("button");
        reloadBtn.innerHTML = 'Try again';
        reloadBtn.classList.add('btnReload');
        reloadBtn.setAttribute("onclick","window.location.reload();");
        const fail = document.createElement("div");
        fail.textContent = 'System failure: You lose!';
        fail.classList.add("alert");
        fail.classList.add("alert-lose");
        alertContainer.classList.add('alert-container-lose');
        alertContainer.prepend(reloadBtn);
        alertContainer.prepend(fail);
        stopInteraction();
    }
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance");
            tile.addEventListener("animationend", () => {
                tile.classList.remove("dance");
        }, { once: true })
        }, (index * DANCE_ANIMATION_DURATION) / 5);
    })
}

function showInfo() {
    if (document.getElementsByClassName('info').length === 0) {
        const info = document.createElement("div");
        info.innerHTML = `Lostle - A daily word game based on Lost TV series. <br />(C) 2022 BombLike Apps - Thanks Josh Wardle for original <a href="https://www.nytimes.com/games/wordle/index.html">Wordle</a>.<br /> Lost originally aired on <a href="https://abc.com">ABC</a> from 2004 to 2010,<br /> created by Jeffrey Lieber, J. J Abrams and Damon Lindelof.</a>`;
        info.classList.add("info");
        alertContainer.prepend(info);
    
        setTimeout(() => {
            info.classList.add("hide");
            info.addEventListener("transitionend", ()=> {
                info.remove();
            })
        }, 3000);
    }
}

function parseDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1]);
}

function datediff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}
