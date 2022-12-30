## [> *Click here to play!* <](raymond-exe.github.io/blackjack)

# Simple Blackjack

> A Blackjack web application written with JavaScript, HTML and CSS. All graphics displayed are made with HTML elements (mostly divs and buttons).



### ***How do I play?***
In Blackjack, players compete against the dealer to attain the highest-valued deck without exceeding 21. Players start with 2 cards and may draw cards from the deck (known as "hit"). The first card in the dealer's hand is revealed to the player, with the cards following it remaining hidden until the end of the player's turn.

Numbered cards are valued according to their number, face cards have the value of 10, and Aces may be valued as 11 or 1 (up to the player).

Once satisfied with their hand, players can choose to "stay", and whoever has the hand with the greater value wins that round. If the dealer's hand exceeds 21, the player wins. If the player's hand (or both the player and dealer's hands) exceed 21, the dealer wins. 

For the purposes of keeping *Simple Blackjack* "simple", there is no splitting or doubling down in this version, and only 1 player may compete against the dealer.

###### See [Wikipedia](https://en.wikipedia.org/wiki/Blackjack) for an in-depth explanation of Blackjack.

---



### ***Why'd you make this?***
Originally, this was a text-based C++ project* written for a university course. Since I had a bit of spare time between academic semesters, I decided to rewrite the project as a browser-based mini-game for fun.

###### *You can view the original C++ program I wrote [here](https://gist.github.com/Raymond-exe/c1f67ab9dcc0088860e284afdab25b86).

---



### ***How does it work?***
The general structure consists of a 5-setting* [state machine](https://en.wikipedia.org/wiki/Finite-state_machine) which adds cards to two arrays representing the player's hand and the dealer's hand respectively. The cards in each array are then evaluated and (if new cards are detected) added as HTML elements to the screen. The program allows players to click "HIT" until their hand's value exceeds 21, after which it becomes the dealer's turn to hit or stay. Aces are counted as 11's until the hand's calculated value** exceeds 21, after which they are individually reduced in value to 1.
###### *There were originally 6 settings `[RESET, IDLE, HIT, STAY, GAMEOVER, LEAVE]`, but I figured out the web app wouldn't need the final state (`LEAVE`) allowing the original C++ program to exit.
###### **See the `calculateMaxValue()` function in [blackjack.js](https://github.com/Raymond-exe/blackjack/blob/master/blackjack.js).

---



### ***How long did this take?***
The original text-based C++ program took roughly 2 hours. This rewrite was done entirely in the last 10 days of 2022. Most of my time on the rewrite was spent figuring out how to fix the graphics for mobile browsers :(

---



### ***Will there be any future updates to this project?***
Probably not, as this project was intended to be a much smaller side-project to temporarily occupy my time. Anybody is free to fork this repo to build on top of it if they would like to.