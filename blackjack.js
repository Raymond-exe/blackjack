const SUITS = ['Club', 'Diamond', 'Heart', 'Spade'];
const SUIT_CHARS = { Club: '♣', Diamond: '♦', Heart: '♥', Spade: '♠',};
const NO_EMOJI = String.fromCodePoint(0xFE0F);

let playerDeck = [];
let dealerDeck = [];
const wins = {
    player: 0,
    dealer: 0,
};


// array to specify which card values use which spots
suitLayouts = [
    ['B3'], // A
    ['B1', 'B5'], // 2
    ['B0', 'B3', 'B6'], // 3
    ['A1', 'A5', 'C1', 'C5'], // 4
    ['A1', 'A5', 'B3', 'C1', 'C5'], // 5
    ['A1', 'A3', 'A5', 'C1', 'C3', 'C5'], // 6
    ['A1', 'A3', 'A5', 'B2', 'C1', 'C3', 'C5'], // 7
    ['A1', 'A3', 'A5', 'B2', 'B4', 'C1', 'C3', 'C5'], // 8
    ['A1', 'A2', 'A4', 'A5', 'B3', 'C1', 'C2', 'C4', 'C5'], // 9
    ['A1', 'A2', 'A4', 'A5', 'B1', 'B5', 'C1', 'C2', 'C4', 'C5'], // 10
    [], // J
    [], // Q
    [], // K
]



// selects a random element from a given array
function pickRand(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}


// returns a value between 'a' and 'b', scaled via 't'
function lerp(a, b, t) {
    return a*(1-t)+b*t
}


// returns true if the cards are the same
function compare(card1, card2) {
    return card1.suit === card2.suit && card1.value === card2.value;
}


// checks to see if either the player or dealer has the card
function cardExists(card) {
    for (other of playerDeck.concat(dealerDeck)) {
        if (compare(other, card)) {
            return true;
        }
    }
    return false;
}


// returns a new card that does not already exist
function getRandomCard() {
    let output = {
        suit: pickRand(SUITS),
        value: Math.ceil(Math.random()*13),
    }
    output.element = createCardDiv(output.suit, output.value);

    return (cardExists(output) ? getRandomCard() : output);
}


// calculates the maximum value of a given deck
function calculateMaxValue(deck) {
    let total = 0;
    let aceCount = 0;

    // adds up all card values, aces = 11
    for (card of deck) {
        if (card.value === 1) { // aces
            total += 11;
            aceCount++;
        } else {
            total += Math.min(card.value, 10);
        }
    }

    // if the deck busts, count aces as 1 one-at-a-time
    while (aceCount > 0 && total > 21) {
        total -= 10;
        aceCount--;
    }

    return total;
}


// just clears both decks
function reshuffle() {
    playerDeck = [];
    dealerDeck = [];

    const playerDeckElement = document.getElementById('player');
    const dealerDeckElement = document.getElementById('dealer');

    let child = playerDeckElement.firstChild;
    while (child) {
        playerDeckElement.removeChild(child);
        child = playerDeckElement.firstChild;
    }

    child = dealerDeckElement.firstChild;
    while (child) {
        dealerDeckElement.removeChild(child);
        child = dealerDeckElement.firstChild;
    }
}


// converts the card to user-friendly text
function stringifyCard(card) {
    let value = `${card.value}`;
    switch (card.value) {
        case 1:
            value = 'Ace';
            break;
        case 11:
            value = 'Jack';
            break;
        case 12:
            value = 'Queen';
            break;
        case 13:
            value = 'King';
            break;
    }
    return `${value} of ${card.suit}s`;
}



/* ======================================== */
/*	          GAME STATE MACHINE            */
/* ======================================== */


const GameState = {
    RESET:0,
    IDLE:1,
    HIT:2,
    STAY:3,
    GAMEOVER:4,
};

let state = GameState.RESET;

function loop() {
    let stop = false;

    switch (state) {

        case GameState.RESET:
            reshuffle();

            playerDeck.push(getRandomCard());
            playerDeck.push(getRandomCard());
            
            dealerDeck.push(getRandomCard());
            dealerDeck.push(getRandomCard());

            updatePlayerDeck();
            updateDealerDeck();

            setTimeout(updateScores, 1);

            state = GameState.IDLE;
            break;
        
        
        case GameState.IDLE:

            stop = true;
            break;


        case GameState.HIT:
            playerDeck.push(getRandomCard());
            updatePlayerDeck();
            state = GameState.IDLE;
            break;

        
        case GameState.STAY:
            if (calculateMaxValue(dealerDeck) <= 16) {
                dealerDeck.push(getRandomCard());
                updateDealerDeck();
                setTimeout(loop, 750);
                return;
            }

            state = GameState.GAMEOVER;
            break;
        
        
        case GameState.GAMEOVER:

            let playerTotal = calculateMaxValue(playerDeck);
            let dealerTotal = calculateMaxValue(dealerDeck);

            let winMsg;
            let subMsg;
            if (playerTotal > 21) {
                winMsg = 'The dealer wins!';
                subMsg = `Your hand totaled to ${playerTotal}.`;
                wins.dealer++;
            } else if (dealerTotal > 21) {
                winMsg = 'You win!';
                subMsg = `The dealer's hand totaled to ${dealerTotal}.`;
                wins.player++;

                if (playerTotal === 21 && playerDeck.length == 2) {
                    winMsg = 'Blackjack!';
                }
            } else if (playerTotal > dealerTotal) {
                winMsg = 'You win!';
                subMsg = `You held a ${playerTotal}, the dealer only had ${dealerTotal}.`;
                wins.player++;

                if (playerTotal === 21 && playerDeck.length == 2) {
                    winMsg = 'Blackjack!';
                }
            } else if (dealerTotal > playerTotal) {
                winMsg = 'The dealer wins!';
                subMsg = `The dealer held a ${dealerTotal}, you only had ${playerTotal}.`;
                wins.dealer++;
            } else {
                winMsg = 'Break even!';
                subMsg = `Both you and the dealer had ${Math.max(dealerTotal, playerTotal)}.`
            }
            updateScores();

            setTitle(winMsg);
            setSubtext(subMsg);

            revealHand(dealerDeck);

            hideElement(stay, 250);
            hideElement(hit, 250);
            showElement(play, 250);

            stop = true;
            break;
    }

    return (stop ? true : loop());
}




/* ======================================== */
/*	            CARD FUNCTIONS              */
/* ======================================== */


// TODO: on the update functions below, show a movement animation when a card is added
function updatePlayerDeck() {
    const playerElement = document.getElementById('player');
    for (let card of playerDeck) {
        if (!playerElement.contains(card.element)) {
            hideCard(card);
            playerElement.appendChild(card.element);
            animateWidth(card.element, isLandscape() ? 3 : 2, 'em');
            showElement(card.element, 100);
        }
    }
}


// adds cards from dealer's array of cards to div element
function updateDealerDeck() {
    const dealerElement = document.getElementById('dealer');
    let first = true;
    for (let card of dealerDeck) {
        if (!dealerElement.contains(card.element)) {
            hideCard(card);
            dealerElement.appendChild(card.element);
            animateWidth(card.element, isLandscape() ? 3 : 2, 'em');
            showElement(card.element, 100);
        }

        if (first) {
            showCard(card);
            first = false;
        } else {
            hideCard(card);
        }
    }
}


function animateWidth(element, expectedWidth = 100, unit = 'px') {
    let currentWidth = 0;
    element.style.width = 0;

    lerpWidth();

    function lerpWidth() {
        currentWidth = lerp(currentWidth, expectedWidth, 0.05);
        if (currentWidth < expectedWidth*0.999) {
            setTimeout(lerpWidth, 10);
        } else {
            currentWidth = expectedWidth;
        }
        element.style.width = currentWidth + unit;
    }
}


// adds cards from player's array of cards to div element
function revealHand(deck, duration = deck.length*200) {
    const timeBetweenCards = duration / (deck.length-1);
    for (let i = 0; i < deck.length; i++) {
        setTimeout(() => {
            let card = deck[i];
            if (isHidden(card)) {
                showCard(card);
            }
        }, (i-1)*timeBetweenCards);
    }
}


// returns the location of the deck of cards relative to the window
let deckLocation;
function getDeckLocation() {
    if (!deckLocation) {
        const {top, bottom, left, right} = document.getElementById('deck').getBoundingClientRect();
        deckLocation = {x: Math.round((left+right)/2.0), y: Math.round((top+bottom)/2.0)};
    }
    return deckLocation;
}


// creates a div element of a card with the given suit & value
function createCardDiv(suit, value, hidden = false) {
    const asciiSuit = SUIT_CHARS[suit] + NO_EMOJI;
    const color = (suit === 'Spade' || suit === 'Club' ? 'BLACK' : 'RED');

    const cardDiv = document.createElement('div');
    cardDiv.className = (hidden ? 'card hidden' : 'card');
    cardDiv.style.color = color;

    const front = document.createElement('div');
    front.className = 'front';
    cardDiv.appendChild(front);
    cardDiv.front = front;

    const back = document.createElement('div');
    back.className = 'cardback';
    front.appendChild(back);

    let val = value;
    switch(value) {
        case 1: val = 'A'; break;
        case 11: val = 'J'; break;
        case 12: val = 'Q'; break;
        case 13: val = 'K'; break;
    }

    // number and small suit in top left corner
    const index = document.createElement('div');
    index.className = 'card-index top-left';
    index.textContent = `${val}\n${asciiSuit}`;
    front.appendChild(index);

    // bottom right index
    const index2 = document.createElement('div');
    index2.className = 'card-index bot-right';
    index2.textContent = `${val}\n${asciiSuit}`;
    front.appendChild(index2);

    if (value === 1 || value > 10) {
        const centered = document.createElement('div');
        centered.className = 'centered-spot';
        centered.textContent = asciiSuit;
        front.appendChild(centered);
        return cardDiv;
    } else {
        // added to ensure suit centering
        const suitWrapper = document.createElement('div');
        suitWrapper.classList = 'suit-wrapper';
        front.appendChild(suitWrapper);

        for (let spot of suitLayouts[value-1]) {
            const spotDiv = document.createElement('div');
            spotDiv.className = `spot${spot}`;
            spotDiv.textContent = asciiSuit;
            suitWrapper.appendChild(spotDiv);
        }
    }

    return cardDiv;
}


// util function used to get the div containing all elements in the card
function getCardFront(card) {
    if (!card.front) {
        card.front = card.element.getElementsByClassName('front')[0]
    }
    return card.front;
}


// flips the card to be face-down
function hideCard(card) {
    card = (card.element ? card.element : card);
    if (isShown(card) && !card.classList.contains('no-flip')) {
        getCardFront(card).className += ' hidden';
    }
}


// flips the card to be face-up
function showCard(card) {
    card = (card.element ? card.element : card);
    if (isHidden(card) && !card.classList.contains('no-flip')) {
        getCardFront(card).classList.remove('hidden');
    }
}


// returns true if the card is face-down
function isHidden(card) {
    card = (card.element ? card.element : card);
    return card.classList.contains('no-flip') || getCardFront(card).classList.contains('hidden');
}


// returns true if the card is face-up
function isShown(card) {
    card = (card.element ? card.element : card);
    return !isHidden(card);
}


// returns {x, y} that an element should be updated to given the settings below
function lerpMovement(element, to, lerpAlpha) {
    const {top, bottom, left, right} = element.getBoundingClientRect();
    const currentX = Math.round((left+right)/2.0);
    const currentY = Math.round((top+bottom)/2.0);

    const {x, y} = to;

    const lerpX = lerp(currentX, x, lerpAlpha);
    const lerpY = lerp(currentY, y, lerpAlpha);
    
    return {x: lerpX, y: lerpY};
}


setTimeout(() => {
    loop();
}, 1);

let hit, stay, play, help;
setTimeout(() => {
    hit = document.getElementById('hitBtn');
    stay = document.getElementById('stayBtn');
    play = document.getElementById('playAgain');
    help = document.getElementById('helpBtn');
}, 5);

let firstInteraction = true;

function hitBtn() {
    if (isPlayerHandHidden() && firstInteraction) {
        flashSubtext(3, 150);
        return;
    }
    if (hit.style.opacity === '1') {
        let val = calculateMaxValue(playerDeck);
        firstInteraction = false;
        if (val > 21) {
            setSubtext('Reveal your new card before drawing another');
        } else if (state === GameState.IDLE) {
            hideIfVisible(title);
            hideIfVisible(subtext);
            hideIfVisible(help);
            state = GameState.HIT;
            loop();
        }
    } else {
        playAgain();
    }
}
function stayBtn() {
    if (isPlayerHandHidden() && firstInteraction) {
        flashSubtext(3, 150);
        return;
    }
    if (stay.style.opacity === '1' && state === GameState.IDLE) {
        firstInteraction = false;
        hideIfVisible(title, 350);
        hideIfVisible(subtext, 350);
        hideIfVisible(help);
        state = GameState.STAY;
        loop();
        revealHand(playerDeck, 0);
    } else {
        playAgain();
    }
}
function playAgain() {
    if (play.style.opacity === '1') {
        // reactivate buttons
        hideElement(play, 250);
        showElement(stay, 250);
        showElement(hit, 250);

        hideIfVisible(title, 350);
        hideIfVisible(subtext, 350);

        state = GameState.RESET;
        loop();
    }
}
function helpBtn() {
    window.open('https://github.com/Raymond-exe/blackjack#how-do-i-play');
}

function isPlayerHandHidden() {
    for (let card of playerDeck) {
        if (isShown(card)) {
            return false;
        }
    }
    return true;
}

let title, subtext, playerScore, dealerScore;

setTimeout(() => {
    title = document.getElementById('title');
    subtext = document.getElementById('subtext');
    playerScore = document.getElementById('playerScore');
    dealerScore = document.getElementById('dealerScore');
}, 1);

function setTitle(txt) {
    title.textContent = txt;
    showElement(title);
}

function setSubtext(txt, remainFor = 0) {
    subtext.textContent = txt;
    showElement(subtext);

    if (remainFor) {
        setTimeout(() => hideElement(subtext), remainFor);
    }
}

function flashSubtext(flashes, freq, alternateColor) {
    const defaultClasses = `${subtext.classList}`;
    const copy = defaultClasses + ' shadow-text';

    if (defaultClasses.includes('shadow-text')) return;

    for (let i = 0; i < flashes*2; i++) {
        setTimeout(() => {
            subtext.classList = (i%2 === 1 ? defaultClasses : copy);
        }, i*freq);
    }
}

function updateScores() {
    playerScore.textContent = `Your wins: ${wins.player}`;
    dealerScore.textContent = `Dealer's wins: ${wins.dealer}`;
}

// fades the element until it is invisible, over the given duration
function hideElement(element, duration = 1000) {
    const style = element.style;

    // if (element.tagName === 'BUTTON') { style.cursor = 'default'; }

    for (let i = 100; i >= 0; i--) {
        setTimeout(() => {
            style.opacity = (i/100.0);
        }, duration - (i*(duration/100.0)));
    }
}

// fades the element until it is visible, over the given duration
function showElement(element, duration = 1000) {
    let style = element.style;

    if (element.tagName === 'BUTTON') { setTimeout(() => style.cursor = 'pointer', duration); }

    for (let i = 0; i <= 100; i++) {
        setTimeout(() => {
            style.opacity = (i/100.0);
        }, i*(duration/100.0));
    }
}

function hideIfVisible(element, duration = 1000) {
    if (element.style.opacity === '1') {
        hideElement(element, duration);
    }
    if (element === help) {
        setTimeout(() => help.remove(), duration);
    }
}

function isLandscape() {
    return window.innerHeight < window.innerWidth;
}

function eventIsInElement(event, element) {
    const bounds = element.getBoundingClientRect();
    return (event.clientX > bounds.left && event.clientX < bounds.right) &&
           (event.clientY > bounds.top && event.clientY < bounds.bottom);
}

addEventListener('mousedown', handleInteraction);
addEventListener('touchend', (event) => {
    const touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    event.clientX = touch.pageX;
    event.clientY = touch.pageY;
    handleInteraction(event);
})

// card flipping
function handleInteraction(event) {
    if (eventIsInElement(event, help)) {
        return; // cancels this triggering when user clicks help button
    }

    for (let i = playerDeck.length-1; i >= 0; i--) {
        let card = playerDeck[i];
        if (eventIsInElement(event, getCardFront(card.element))) {
            firstInteraction = false;
            if (isShown(card)) {
                hideCard(card);
            } else {
                showCard(card);

                // hide title & subtext if they are still shown
                if (state === GameState.IDLE) {
                    hideIfVisible(title);
                    hideIfVisible(subtext);
                    hideIfVisible(help);

                    if (calculateMaxValue(playerDeck) > 21) {
                        state = GameState.STAY;
                        revealHand(playerDeck, 200);
                        loop();
                    }
                }
            }
            return;
        }
    }
}