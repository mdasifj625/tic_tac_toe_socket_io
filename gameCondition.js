let players = {},
    unmatched;
// Function to join the game
exports.joinGame = socket => {
    players[socket.id] = {
        socket,
        opponent: unmatched,
        symbol: "X",
        turn: true,
        playerMoves: [false, false, false, false, false, false, false, false, false],
        playerOpponentMoves: [false, false, false, false, false, false, false, false, false],
        win: false,
        draw: false,
        left: false,
    };
    if (!unmatched) {
        unmatched = socket.id;
    } else {
        players[socket.id].symbol = "O";
        players[unmatched].opponent = socket.id;
        players[socket.id].turn = false;
        unmatched = null;
    }
};

// Function to join openent to play game
exports.joinOppenent = socket => {
    if (!players[socket.id].opponent) {
        return;
    } else {
        return players[players[socket.id].opponent].socket;
    }
};

// Function to get player symbol
exports.playerSymbol = socket => {
    return players[socket.id].symbol;
};

// Functio to get player socket
exports.playerSocket = id => {
    return players[id].socket;
};

// Function to return player turn
exports.playerTurn = socket => {
    //Send player turn
    return players[socket.id].turn;
};

// Function to change the turn of player
exports.changeTurn = socket => {
    players[socket.id].turn = false;
    players[players[socket.id].opponent].turn = true;
};

// Function to set particular move is played
exports.PlayerMoves = (socket, move) => {
    players[socket.id].playerMoves[move - 1] = true;
    players[players[socket.id].opponent].playerOpponentMoves[move - 1] = true;
};

// Function to get all the details of players
exports.playerDetails = socket => {
    const { playerMoves, playerOpponentMoves, symbol } = players[socket.id];
    const opponentSymbol = players[players[socket.id].opponent].symbol;
    return { playerMoves, playerOpponentMoves, symbol, opponentSymbol };
};

// Function to check if the move is valid or not
exports.checkValidMove = (socket, move) => {
    if (move > 9 || move < 1) {
        return { status: true, msg: "Enter any number between 1-9 " };
    } else if (
        players[socket.id].playerMoves[move - 1] === true ||
        players[socket.id].playerOpponentMoves[move - 1] === true
    ) {
        return { status: true, msg: "You have already played, please select another number" };
    } else if (move <= 9 && move >= 1) {
        return { status: false, msg: "Valid move" };
    } else {
        return { status: true, msg: "Please Enter number between 1 - 9 " };
    }
};

// Function to handle if any player resigns the game
exports.hasResigned = (socket, move) => {
    if (move === "r") {
        players[players[socket.id].opponent].win = true;
        return { status: true, msg: "You won the game!: Openent left the game." };
    }
};

// Function for the winning logic of game
exports.winningMove = socket => {
    const x1 = players[socket.id].playerMoves[0];
    const x2 = players[socket.id].playerMoves[1];
    const x3 = players[socket.id].playerMoves[2];
    const y1 = players[socket.id].playerMoves[3];
    const y2 = players[socket.id].playerMoves[4];
    const y3 = players[socket.id].playerMoves[5];
    const z1 = players[socket.id].playerMoves[6];
    const z2 = players[socket.id].playerMoves[7];
    const z3 = players[socket.id].playerMoves[8];
    if (x1 === true && x2 === true && x3 === true) {
        players[socket.id].win = true;
        return true;
    } else if (y1 === true && y2 === true && y3 === true) {
        players[socket.id].win = true;
        return true;
    } else if (z1 === true && z2 === true && z3 === true) {
        players[socket.id].win = true;
        return true;
    } else if (x1 === true && y1 === true && z1 === true) {
        players[socket.id].win = true;
        return true;
    } else if (x2 === true && y2 === true && z2 === true) {
        players[socket.id].win = true;
        return true;
    } else if (x3 === true && y3 === true && z3 === true) {
        players[socket.id].win = true;
        return true;
    } else if (x1 === true && y2 === true && z3 === true) {
        players[socket.id].win = true;
        return true;
    } else if (x3 === true && y2 === true && z1 === true) {
        players[socket.id].win = true;
        return true;
    } else {
        return false;
    }
};

// Function to handle game draw
exports.matchDraw = socket => {
    const { playerMoves, playerOpponentMoves } = players[socket.id];
    let flag = true;
    playerMoves.map((move, index) => {
        if (move !== true && playerOpponentMoves[index] !== true) flag = false;
    });
    if (flag) {
        players[players[socket.id].opponent].draw = true;
        players[socket.id].draw = true;
    }
    return flag;
};

// Function to set the winner
exports.makeWinner = socket => {
    players[players[socket.id].opponent].win = true;
};

// Function to stop the game after win, draw or if someone left the game
exports.gameOver = socket => {
    if (players[players[socket.id].opponent].win === true || players[socket.id].win === true) {
        return true;
    }
    if (players[players[socket.id].opponent].draw === true || players[socket.id].draw === true) {
        return true;
    }
    if (players[players[socket.id].opponent].left === true || players[socket.id].left === true) {
        return true;
    } else {
        return false;
    }
};
