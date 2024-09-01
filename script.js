let deck, playerHand, dealerHand, playerChips = 100, currentBet = 10;

const uniqueKey = btoa(Math.random().toString(36).substring(2, 15));

function xorEncodeDecode(value, key) {
    return value.split('').map((char, index) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
    ).join('');
}


//document load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('hitButton').style.display = 'none';
    document.getElementById('standButton').style.display = 'none';
    document.getElementById('table').style.display = 'none';
    //check if a cookie called 'chips' exists else make a set it
    if (!getCookie('chips')) {
        setCookie('chips', playerChips);
    } else {
        playerChips = parseInt(getCookie('chips'));
        document.getElementById('chips').textContent = `Chips: ${playerChips}`;
    }

    if (playerChips <= 0) { 
        playerChips = 100;
        updateChips();
    }
      
});

function newGame() {
    document.getElementById('table').style.display = 'flex';
    document.getElementById('hitButton').style.display = 'display';
    document.getElementById('standButton').style.display = 'display';
    document.getElementById('betDiv').style.display = 'none';

    const betInput = document.getElementById('betAmount');
    currentBet = parseInt(betInput.value, 10);

    if (currentBet > playerChips) {
        document.getElementById('result').textContent = 'You cannot bet more than you have!';
        document.getElementById('betDiv').style.display = '';
        return;
    }

    playerChips -= currentBet;
    document.getElementById('chips').textContent = `Chips: ${playerChips}`;
    setCookie('chips', playerChips.toString(), 365 * 5);

    addAlert('Game Started, Bet ' + currentBet, 3000);

    deck = createDeck();
    playerHand = [];
    dealerHand = [];

    playerHand.push(drawCard(), drawCard());
    dealerHand.push(drawCard(), drawCard());

    document.getElementById('player-cards').innerHTML = renderHand(playerHand);
    document.getElementById('dealer-cards').innerHTML = renderHand([dealerHand[0], {suit: 'back', rank: ''}]);
    document.getElementById('player-score').textContent = `Score: ${calculateScore(playerHand)}`;
    document.getElementById('dealer-score').textContent = 'Score: ?';

    document.getElementById('hitButton').style.display = 'inline-block';
    document.getElementById('standButton').style.display = 'inline-block';
    document.getElementById('result').textContent = '';

    setTimeout(() => {
        document.getElementById('player-cards').innerHTML = renderHand(playerHand);
        document.getElementById('dealer-cards').innerHTML = renderHand([dealerHand[0], {suit: 'back', rank: ''}]);
    }, 100);  // Delay to allow animation class to be applied
}

function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];

    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });

    return deck.sort(() => Math.random() - 0.5);
}

function drawCard() {
    return deck.pop();
}

function renderHand(hand) {
    return hand.map((card, index) => 
        `<img src="cards/${card.rank}_of_${card.suit}.svg" alt="${card.rank} of ${card.suit}" class="card animate" style="animation-delay: ${index * 0.3}s;">`
    ).join('');
}

function calculateScore(hand) {
    let score = 0, aces = 0;

    hand.forEach(card => {
        if (card.rank === 'A') {
            aces++;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.rank)) {
            score += 10;
        } else {
            score += parseInt(card.rank);
        }
    });

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function hit() {
    playerHand.push(drawCard());
    document.getElementById('player-cards').innerHTML = renderHand(playerHand);
    document.getElementById('player-score').textContent = `Score: ${calculateScore(playerHand)}`;

    if (calculateScore(playerHand) > 21) {
        addAlert('Bust!', 3000);
        endGame('Bust! Dealer Wins!');
    }
}

function stand() {
    document.getElementById('dealer-cards').innerHTML = renderHand(dealerHand);
    document.getElementById('dealer-score').textContent = `Score: ${calculateScore(dealerHand)}`;

    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(drawCard());
        document.getElementById('dealer-cards').innerHTML = renderHand(dealerHand);
        document.getElementById('dealer-score').textContent = `Score: ${calculateScore(dealerHand)}`;
    }

    if (calculateScore(dealerHand) > 21 || calculateScore(playerHand) > calculateScore(dealerHand)) {
        endGame('You Win!');
        addAlert('Win, ' + currentBet*2 + "!", 3000);
    } else if (calculateScore(playerHand) < calculateScore(dealerHand)) {
        endGame('Dealer Wins!');
        addAlert('Win, ' + currentBet*2 + "!", 3000);
    } else {
        endGame('Push!');
        addAlert('Push, ' + currentBet + "!", 3000);
    }
}

function endGame(result) {
    if (playerChips <= 0) { 
        playerChips = 100;
        updateChips();
    }
    if (result.includes('Push!')) { 
        playerChips += currentBet;
    }
    document.getElementById('result').textContent = result;
    document.getElementById('hitButton').style.display = 'none';
    document.getElementById('standButton').style.display = 'none';
    document.getElementById('betDiv').style.display = '';
    updateChips(result);
}

function updateChips(result) {
    if (result.includes('You Win!')) {
        playerChips += currentBet * 2;
    }

    document.getElementById('chips').textContent = `Chips: ${playerChips}`;
    setCookie('chips', playerChips.toString(), 365 * 5);
}

function createConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    const confettiCount = 100;
    const colors = ['#FF5E5E', '#FFD700', '#3CB371', '#6495ED', '#FF69B4'];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Randomize the confetti's initial position and size
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = Math.random() * -20 + 'vh';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        // Randomize the falling duration
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';

        confettiContainer.appendChild(confetti);
    }
}

function startConfetti() {
    createConfetti();

    // Remove the confetti after the animation completes to prevent buildup
    setTimeout(() => {
        document.getElementById('confetti-container').innerHTML = '';
    }, 5000);
}

function setCookie(name, value) {
    const encodedValue = btoa(value); // Encode the value
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 5); // Set expiration for 5 years
    document.cookie = `${name}=${encodedValue}; expires=${expires.toUTCString()}; path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const encodedValue = parts.pop().split(';').shift();
        return atob(encodedValue); // Decode the value
    }
    return null;
}


function addAlert(msg, timeMs) {
    var alertContainer = document.getElementById('alert');
    
    var newAlert = document.createElement('div');
    newAlert.className = 'alert-container'; 
    var alertText = document.createElement('p');
    alertText.textContent = msg;

    newAlert.appendChild(alertText);
    alertContainer.appendChild(newAlert);

    if (!timeMs) {
        timeMs = 2000;
    }
    
    setTimeout(function() {
        newAlert.remove();
    }, timeMs);
}