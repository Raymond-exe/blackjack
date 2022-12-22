const FACES = ['Club', 'Diamond', 'Heart', 'Spade'];

let playerDeck = [];
let dealerDeck = [];


// selects a random element from a given array
function randomElement(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}


// returns true if the cards are the same
function compare(card1, card2) {
    return card1.face === card2.face && card1.value === card2.value;
}


// checks to see if either the player or dealer has the card
function cardExists(card) {
    return playerDeck.includes(card) || dealerDeck.includes(card);
    // for (other of playerDeck.concat(dealerDeck)) {
    //     if (compare(other, card)) {
    //         return true;
    //     }
    // }
    // return false;
}


// returns a new card that does not already exist
function getRandomCard() {
    let output = {
        face: randomElement(FACES),
        value: Math.ceil(Math.random()*13)
    }
    return (cardExists(output) ? getRandomCard() : output);
}


// calculates the maximum value of a given deck
function calculateMaxValue(deck) {
    let total = 0;
    let aceCount = 0;

    // adds up all card values, aces = 11
    deck.forEach(card => {
        total += Math.min(card.value, 10);
        if (card.value === 1) {
            total += 10;
            aceCount++;
        }
    });

    // if the deck busts, count aces as 1 one-at-a-time
    while (total > 21 && aceCount > 0) {
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
    return `${value} of ${card.face}s`;
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

    // keep updated running totals
    let playerTotal = calculateMaxValue(playerDeck);
    let dealerTotal = calculateMaxValue(dealerDeck);

    let input;

    switch (state) {

        case GameState.RESET:
            console.log('\n[NEW GAME]\n\n');

            playerDeck.push(getRandomCard());
            playerDeck.push(getRandomCard());
            
            dealerDeck.push(getRandomCard());
            dealerDeck.push(getRandomCard());

            console.log(`The dealer drew a ${stringifyCard(dealerDeck[0])}...\n`);
            console.log('The dealer drew another card...\n');

            state = GameState.IDLE;
            break;
        
        
        case GameState.IDLE:
            console.log('Your cards are:\n');
            console.log(stringifyDeck(playerDeck, '\n\t- ', '\t- '));

            if (calculateMaxValue(playerDeck) > 21) {
                state = GameState.GAMEOVER;
                break;
            }

            input = prompt('What would you like to do? [1] Hit, [2] Stand, or [0] Leave: ');
            switch (input) {
                case '1':
                    state = GameState.HIT;
                    break;
                case '2':
                    state = GameState.STAND;
                    break;
                case '0':
                    state = GameState.LEAVE;
                    break;
            }
            break;


        case GameState.HIT:
            playerDeck.push(getRandomCard());
            state = GameState.IDLE;
            break;

        
        case GameState.STAND:
            while (calculateMaxValue(dealerDeck) <= 16) {
                dealerDeck.push(getRandomCard());
                console.log(`The dealer drew a ${stringifyCard(dealerDeck[dealerDeck.length-1])}`);
            }

            console.log('Your cards are:\n');
            console.log(stringifyDeck(playerDeck, '\n\t- ', '\t- '));
            console.log(`Total: ${playerTotal}`);

            console.log('Dealer\'s cards are:\n');
            console.log(stringifyDeck(dealerDeck, '\n\t- ', '\t- '));
            console.log(`Total: ${dealerTotal}`);

            state = GameState.GAMEOVER;
            break;
        
        
        case GameState.GAMEOVER:
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

            console.log(msg);
            input = prompt('Would you like to play again? [1] Yes, or [2] No: ');
            switch (input) {
                case '1':
                    reshuffle();
                    state = GameState.RESET;
                    break;
                case '2':
                    state = GameState.LEAVE;
                    break;
            }
            break;

        
        case GameState.LEAVE:
            console.log('You left the table...');
            return false;
        
    }

    return true;
}


// a little hack to allow us to read the console inputs

setTimeout(() => {
    let repeat = true;
    while (repeat) {
        repeat = loop();
    }
}, 5000);

// for now it's just text-based, I plan on adding graphics soon!
// end of line, friend