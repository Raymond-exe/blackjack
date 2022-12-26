const SUITS = ['Club', 'Diamond', 'Heart', 'Spade'];
const SUIT_CHARS = { Club: '♣', Diamond: '♦', Heart: '♥', Spade: '♠',};

let playerDeck = [];
let dealerDeck = [];


// array to specify which card values use which spots
suitLayouts = [
    ['B3'], // A
    ['B2', 'B4'], // 2
    ['B1', 'B3', 'B5'], // 3
    ['A1', 'A5', 'C1', 'C5'], // 4
    ['A1', 'A5', 'B3', 'C1', 'C5'], // 5
    ['A1', 'A3', 'A5', 'C1', 'C3', 'C5'], // 6
    ['A1', 'A3', 'A5', 'B2', 'C1', 'C3', 'C5'], // 7
    ['A1', 'A3', 'A5', 'B2', 'B4', 'C1', 'C3', 'C5'], // 8
    ['A1', 'A2', 'A4', 'A5', 'B3', 'C1', 'C2', 'C4', 'C5'], // 9
    ['A1', 'A2', 'A4', 'A5', 'B2', 'B4', 'C1', 'C2', 'C4', 'C5'], // 10
    [], // J
    [], // Q
    [], // K
]


// TODO: remove this eventually
let promptMsg = '';
function log(txt) {
    promptMsg += txt;
}
function getPromptMsg(txt = '') {
    let temp = promptMsg + txt;
    promptMsg = '';
    return temp;
}

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


function stringifyDeck(deck, separator = ', ', firstSeparator = '') {
    let output = '';
    let isFirst = true;
    deck.forEach(card => {
        output += (isFirst && firstSeparator ? firstSeparator : separator) + stringifyCard(card);
        isFirst = false;
    });
    return output;
}




/* ======================================== */
/*	          GAME STATE MACHINE            */
/* ======================================== */


const GameState = {
    RESET:0,
    IDLE:1,
    HIT:2,
    STAND:3,
    GAMEOVER:4,
    LEAVE:5
};

let state = GameState.RESET;

function loop() {
    let stop = false;

    switch (state) {

        case GameState.RESET:
            log('\n[NEW GAME]\n\n');
            reshuffle();

            playerDeck.push(getRandomCard());
            playerDeck.push(getRandomCard());
            
            dealerDeck.push(getRandomCard());
            dealerDeck.push(getRandomCard());

            updatePlayerDeck();
            updateDealerDeck();

            log(`The dealer drew a ${stringifyCard(dealerDeck[0])}...\n`);
            log('The dealer drew another card...\n');

            state = GameState.IDLE;
            break;
        
        
        case GameState.IDLE:
            log('\nYour cards are:\n');
            log(stringifyDeck(playerDeck, '\n   - ', '   - '));

            console.log(getPromptMsg('\n\nWhat would you like to do? [1] Hit, [2] Stand, or [ESC] Leave: '));
            stop = true;
            break;


        case GameState.HIT:
            playerDeck.push(getRandomCard());
            updatePlayerDeck();
            state = GameState.IDLE;
            break;

        
        case GameState.STAND:
            if (calculateMaxValue(dealerDeck) <= 16) {
                dealerDeck.push(getRandomCard());
                updateDealerDeck();
                log(`The dealer drew a ${stringifyCard(dealerDeck[dealerDeck.length-1])}...\n`);
                setTimeout(loop, 750);
                return;
            }

            log('Your cards are:\n');
            log(stringifyDeck(playerDeck, '\n   - ', '   - '));
            log(`\nTotal: ${calculateMaxValue(playerDeck)}`);

            log('\n\nDealer\'s cards are:\n');
            log(stringifyDeck(dealerDeck, '\n   - ', '   - '));
            log(`\nTotal: ${calculateMaxValue(dealerDeck)}`);

            state = GameState.GAMEOVER;
            break;
        
        
        case GameState.GAMEOVER:

            let playerTotal = calculateMaxValue(playerDeck);
            let dealerTotal = calculateMaxValue(dealerDeck);

            let msg = 'Error: undefined winner';
            if (playerTotal > 21) {
                msg = 'You busted, dealer wins!';
            } else if (dealerTotal > 21) {
                msg = 'The dealer busted, you win!';
            } else if (playerTotal > dealerTotal) {
                msg = 'You win!';
            } else {
                msg = 'The dealer wins!';
            }

            revealDealerHand();

            log('\n\n' + msg);
            console.log(getPromptMsg('\n\nClick OK to play again'));
            stop = true;
            active = false;
            break;

        
        case GameState.LEAVE:
            log('You left the table...');
            return false;
        
    }

    return (stop ? true : loop());
}




/* ======================================== */
/*	            CARD FUNCTIONS              */
/* ======================================== */


// TODO: on the update functions below, show a movement animation when a card is added
function updatePlayerDeck(container = document.getElementById('player')) {
    for (let card of playerDeck) {
        if (!container.contains(card.element)) {
            hideCard(card);
            container.appendChild(card.element);
        }
    }
}

function updateDealerDeck() {
    const dealerElement = document.getElementById('dealer');
    for (let i = 0; i < dealerDeck.length; i++) {
        let card = dealerDeck[i];
        if (!dealerElement.contains(card.element)) {
            dealerElement.appendChild(card.element);
        }
        if (i == 0) {
            showCard(card);
        } else {
            hideCard(card);
        }
    }
}

function revealDealerHand() {
    for (let i = 1; i < dealerDeck.length; i++) {
        setTimeout(() => {
            let card = dealerDeck[i];
            if (isHidden(card)) {
                showCard(card);
            }
        }, (i-1)*150);
    }
}

let deckLocation;
function getDeckLocation() {
    if (!deckLocation) {
        const {top, bottom, left, right} = document.getElementById('deck').getBoundingClientRect();
        deckLocation = {x: Math.round((left+right)/2.0), y: Math.round((top+bottom)/2.0)};
    }
    return deckLocation;
}

function createCardDiv(suit, value, hidden = false) {
    const asciiSuit = SUIT_CHARS[suit];
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
        const aceSuit = document.createElement('div');
        aceSuit.className = 'ace';
        aceSuit.textContent = asciiSuit;
        front.appendChild(aceSuit);
        switch (value) { // TODO the face cards
            case 1:
                break;
            case 11:
                break;
            case 12:
                break;
            case 13:
                break;
        }
        return cardDiv;
    }

    for (spot of suitLayouts[value-1]) {
        const spotDiv = document.createElement('div');
        spotDiv.className = `spot${spot}`;
        spotDiv.textContent = asciiSuit;
        front.appendChild(spotDiv);
    }

    return cardDiv;
}

function getCardFront(card) {
    if (!card.front) {
        card.front = card.element.getElementsByClassName('front')[0]
    }
    return card.front;
}

function hideCard(card) {
    card = (card.element ? card.element : card);
    if (isShown(card) && !card.classList.contains('no-flip')) {
        getCardFront(card).className += ' hidden';
    }
}

function showCard(card) {
    card = (card.element ? card.element : card);
    if (isHidden(card) && !card.classList.contains('no-flip')) {
        getCardFront(card).classList.remove('hidden');
    }
}

function isHidden(card) {
    card = (card.element ? card.element : card);
    return card.classList.contains('no-flip') || getCardFront(card).classList.contains('hidden');
}

function isShown(card) {
    card = (card.element ? card.element : card);
    return !isHidden(card);
}

function lerpMovement(element, to, lerpAlpha) {
    const {top, bottom, left, right} = element.getBoundingClientRect();
    const currentX = Math.round((left+right)/2.0);
    const currentY = Math.round((top+bottom)/2.0);

    const {x, y} = to;

    const lerpX = lerp(currentX, x, lerpAlpha);
    const lerpY = lerp(currentY, y, lerpAlpha);
    
    return {x: lerpX, y: lerpY};
}

// TODO: TEMP for testing phase
let active = false;
setTimeout(() => {
    loop();
    active = true;
}, 1);
function hitBtn() {
    if (active) {
        if (calculateMaxValue(playerDeck) > 21) {
            console.log('You cannot hit once your deck has busted!');
        } else {
            state = GameState.HIT;
            loop();
        }
    }
}
function standBtn() {
    if (active) {
        state = GameState.STAND;
        loop();
    }
}

addEventListener('mousedown', (event) => {
    let card;

    // only allow player to flip cards in their own hand
    if (!document.getElementById('player').contains(event.target)) return;

    if (event.target.classList.contains('card')) {
        card = event.target;
    } else if (event.target.classList.contains('front')) {
        card = event.target.parentElement;
    } else if (event.target.parentElement && event.target.parentElement.classList.contains('front')) {
        card = event.target.parentElement.parentElement;
    }

    if (!card) return;

    if (isHidden(card)) {
        showCard(card);
    } else {
        hideCard(card);
    }
});
