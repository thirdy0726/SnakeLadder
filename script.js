var playerPositions = [1, 1, 1, 1];
var currentPlayer = 0;
var players = [];
var numPlayers = 0;
var avatars = ['avatar_fox.png', 'avatar_turtle.png', 'avatar_dog.png', 'avatar_cat.png'];
var finishedPlayers = [false, false, false, false]; // Track if players have finished

// Ladder Movement
const ladders = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    51: 67,
    71: 91,
    80: 99
};

// Snake Movement
const snakes = {
    17: 7,
    54: 34,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 79
};

players = [
    document.getElementById('player1'),
    document.getElementById('player2'),
    document.getElementById('player3'),
    document.getElementById('player4')
];

// Create the board
var disp = "";
for (var y = 10; y >= 1; y--) {
    disp += "<tr>\n";
    for (var x = 1; x <= 10; x++) {
        var number = (y % 2 === 0) ? (y - 1) * 10 + (10 - x) + 1 : (y - 1) * 10 + (x - 1) + 1;
        var divId = 'cell-' + number;
        disp += '<td id="' + divId + '" class="box"></td>\n';
    }
    disp += "</tr>\n";
}
document.getElementById('board').innerHTML = disp;
highlightCurrentPlayer();

//==================================== ROLL DICE ============================================//

function rollDice() {
    if (finishedPlayers.every(Boolean)) {
        console.log("All players have finished the game.");
        return;
    }

    if (finishedPlayers[currentPlayer]) {
        console.log(`Player ${currentPlayer + 1} has already finished the game. Skipping turn.`);
        currentPlayer = (currentPlayer + 1) % numPlayers;
        highlightCurrentPlayer();
        rollDice(); // Call rollDice again to skip finished players
        return;
    }

    var diceImages = ["d1.png", "d2.png", "d3.png", "d4.png", "d5.png", "d6.png"];
    var diceResult = Math.floor(Math.random() * 6) + 1;
    var diceImageSrc = 'image/' + diceImages[diceResult - 1];
    var diceElement = document.getElementById('dice-1');

    diceElement.style.display = 'inline';
    diceElement.classList.add('shake');

    setTimeout(() => {
        diceElement.src = diceImageSrc;
        diceElement.classList.remove('shake');

        var currentPlayerPosition = playerPositions[currentPlayer];
        var newPlayerPosition = currentPlayerPosition + diceResult;

        console.log("Player " + (currentPlayer + 1) + " rolls a " + diceResult + ". Moving from " + currentPlayerPosition + " to " + newPlayerPosition + ".");

        if (newPlayerPosition > 100) {
            newPlayerPosition = 100;
        }

        if (ladders[newPlayerPosition]) {
            console.log("Player " + (currentPlayer + 1) + " hits a ladder at " + newPlayerPosition + ". Climbing up to " + ladders[newPlayerPosition] + ".");
            newPlayerPosition = ladders[newPlayerPosition];
        } else if (snakes[newPlayerPosition]) {
            console.log("Player " + (currentPlayer + 1) + " hits a snake at " + newPlayerPosition + ". Sliding down to " + snakes[newPlayerPosition] + ".");
            newPlayerPosition = snakes[newPlayerPosition];
        }

        animateMove(currentPlayer, currentPlayerPosition, newPlayerPosition);

    }, 500);
}

//==================================== ROLL DICE ANIMATION ============================================//

function animateMove(playerIndex, start, end) {
    var currentTileId = 'cell-' + start;
    var newTileId = 'cell-' + end;

    var currentTile = document.getElementById(currentTileId);
    var newTile = document.getElementById(newTileId);

    if (currentTile) {
        var avatarToRemove = currentTile.querySelector(`img[src='image/${avatars[playerIndex]}']`);
        if (avatarToRemove) {
            currentTile.removeChild(avatarToRemove);
        }
    }

    var nextTile = document.getElementById(newTileId);

    if (nextTile) {
        var avatarImg = document.createElement('img');
        avatarImg.src = 'image/' + avatars[playerIndex];
        avatarImg.classList.add('player-avatar');
        nextTile.appendChild(avatarImg);
        adjustAvatarSizes(nextTile);
    }

    playerPositions[playerIndex] = end;

    if (end === 100) {
        console.log("Player " + (playerIndex + 1) + " has reached the finish line and won the game!");
        finishedPlayers[playerIndex] = true;
    }

    currentPlayer = (currentPlayer + 1) % numPlayers;
    highlightCurrentPlayer();

    // Ensure to skip players who have finished the game
    while (finishedPlayers[currentPlayer]) {
        currentPlayer = (currentPlayer + 1) % numPlayers;
    }

    // If the next player is a bot, make the bot move
    if (players[currentPlayer].classList.contains('bot')) {
        setTimeout(() => {
            rollDice();
        }, 1000); // Delay the bot's move for 1 second
    }
}

//==================================== HIGHLIGHT PLAYERS TURN ============================================//

function highlightCurrentPlayer() {
    // Remove highlight from all players
    var playerInfos = document.querySelectorAll('.player-info');
    playerInfos.forEach(function(playerInfo) {
        playerInfo.style.backgroundColor = 'white';
    });

    // Highlight current player
    var currentPlayerInfo = document.getElementById('player' + (currentPlayer + 1));
    if (currentPlayerInfo) {
        currentPlayerInfo.style.backgroundColor = '#FFFF80';
    }
}

//==================================== NUMBER OF PLAYERS ============================================//

function submitPlayer() {
    var submit = document.getElementById('submitPlayer');
    var selectElement = document.getElementById('playerNum');
    var selectedValue = selectElement.value;

    if (!selectedValue) {
        alert('Please choose the number of players.');
        return;
    }

    numPlayers = parseInt(selectedValue);

    // Initialize player positions and display their avatars
    for (var i = 0; i < numPlayers; i++) {
        players[i].style.display = 'flex';
        playerPositions[i] = 1;

        var startTile = document.getElementById('startTile');
        if (startTile) {
            var avatarImg = document.createElement('img');
            avatarImg.src = 'image/' + avatars[i];
            avatarImg.classList.add('player-avatar');
            avatarImg.classList.add('player-box');

            startTile.appendChild(avatarImg);
            console.log(`Placed player ${i + 1}'s avatar on the start tile.`);
            adjustAvatarSizes(startTile);
        }
    }

    selectElement.style.display = "none";
    submit.style.display = "none";

    // Unhide the buttons
    var buttonsDiv = document.querySelector('.buttons');
    buttonsDiv.style.display = "flex";

    // Highlight the first player
    highlightCurrentPlayer();

    if (numPlayers === 1 || numPlayers === 2 || numPlayers === 3) {
        popupBot("Would you like to add bots?");
    } else {
        closeBotPopup();
    }
}

//==================================== AVATAR SIZE ============================================//

function adjustAvatarSizes(tile) {
    var avatars = tile.getElementsByClassName('player-avatar');
    var size = 100 / Math.sqrt(avatars.length); // Calculate the size based on the square root of the number of avatars
    var positions = [
        { top: '30%', left: '25%' },
        { top: '30%', left: '70%' },
        { top: '80%', left: '25%' },
        { top: '80%', left: '70%' }
    ];

    for (var i = 0; i < avatars.length; i++) {
        avatars[i].style.width = size + '%'; // Set the width and height of each avatar
        avatars[i].style.height = size + '%';
        avatars[i].style.position = 'absolute';
        avatars[i].style.transform = 'translate(-50%, -50%)';
        if (avatars.length === 1) {
            avatars[i].style.top = '50%';
            avatars[i].style.left = '50%';
        } else {
            avatars[i].style.top = positions[i].top;
            avatars[i].style.left = positions[i].left;
        }
    }
}

//==================================== BOTS ============================================//

// Get the modal
var modal = document.getElementById('botPopup');

// Function to open the modal
function popupBot(text) {
    var modalText = document.getElementById("botText");
    modalText.innerText = text;

    var modalButtons = document.getElementById("botButtons");
    modalButtons.innerHTML = '<button onclick="addBot()">Yes</button><button onclick="closeBotPopup()">No</button>';

    modal.style.display = "block";
}

// Function to close the modal
function closeBotPopup() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function addBot() {
    if (numPlayers < 4) {
        var botIndex = numPlayers;
        players[botIndex].classList.add('bot');
        players[botIndex].style.display = 'flex';
        playerPositions[botIndex] = 1;

        var startTile = document.getElementById('startTile');
        if (startTile) {
            var botAvatarImg = document.createElement('img');
            botAvatarImg.src = 'image/' + avatars[botIndex];
            botAvatarImg.classList.add('player-avatar');
            startTile.appendChild(botAvatarImg);
            console.log(`Added bot ${botIndex + 1}`);
            adjustAvatarSizes(startTile);
        }

        numPlayers++;
        closeBotPopup();
    } else {
        alert("Maximum number of players (4) already added.");
        closeBotPopup();
    }
}

//==================================== BOTS ============================================//
