let players = {},
	unmatched;
// Function to join the game
const joinGame = (socket) => {
	players[socket.id] = {
		socket,
		opponent: unmatched,
		symbol: 'X',
		turn: true,
		playerMoves: [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
		],
		playerOpponentMoves: [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
		],
		win: false,
		draw: false,
		left: false,
	};
	if (unmatched) {
		players[socket.id].symbol = 'O';
		players[unmatched].opponent = socket.id;
		players[socket.id].turn = false;
		unmatched = null;
	} else {
		unmatched = socket.id;
	}
};

// Function to join opponent to play game
const isOpponentJoined = (socketId) => {
	return !!players[socketId].opponent;
};

// Function to get player symbol
const playerSymbol = (socketId) => {
	return players[socketId].symbol;
};

// Function to get player socket
const getOpponentSocket = (socketId) => {
	return players[players[socketId].opponent].socket;
};

// Function to return player turn
const isYourTurn = (socketId) => {
	return players[socketId].turn;
};

// Function to change the turn of player
const changeTurn = (socketId) => {
	players[socketId].turn = false;
	players[players[socketId].opponent].turn = true;
};

// Function to set particular move is played
const setPlayerMove = (socketId, move) => {
	players[socketId].playerMoves[move - 1] = true;
	players[players[socketId].opponent].playerOpponentMoves[move - 1] = true;
};

// Function to get all the details of players
const playerDetails = (socketId) => {
	const { playerMoves, playerOpponentMoves, symbol, opponent } =
		players[socketId];
	const opponentSymbol = players[opponent].symbol;
	return { playerMoves, playerOpponentMoves, symbol, opponentSymbol };
};

// Function to check if the move is valid or not
const checkValidMove = (socketId, move) => {
	const playerMoves = players[socketId].playerMoves;
	const playerOpponentMoves = players[socketId].playerOpponentMoves;

	if (move < 1 || move > 9) {
		return { validMove: false, msg: 'Enter any number between 1-9' };
	}

	if (playerMoves[move - 1] || playerOpponentMoves[move - 1]) {
		return { validMove: false, msg: 'This move is already played' };
	}

	return { validMove: true, msg: 'Valid move' };
};

// Function to handle if any player resigns the game
const checkAndSetResign = (socketId, move) => {
	let isResigned = false;
	if (move === 'r') {
		players[players[socketId].opponent].win = true;
		isResigned = true;
	}
	return isResigned;
};

// Function for the winning logic of game
const isWinningMove = (socketId) => {
	const [x1, x2, x3, y1, y2, y3, z1, z2, z3] = players[socketId].playerMoves;

	const winCombinations = [
		[x1, x2, x3],

		[y1, y2, y3],

		[z1, z2, z3],

		[x1, y1, z1],

		[x2, y2, z2],

		[x3, y3, z3],

		[x1, y2, z3],

		[x3, y2, z1],
	];

	for (const combination of winCombinations) {
		if (combination.every((cell) => cell)) {
			players[socketId].win = true;
			return true;
		}
	}

	return false;
};

// Function to handle game draw
const isMatchDraw = (socketId) => {
	const { playerMoves, playerOpponentMoves, opponent } = players[socketId];
	let isDraw = false;
	if (
		playerMoves.every((move) => move) &&
		playerOpponentMoves.every((move) => move)
	) {
		players[opponent].draw = true;
		players[socketId].draw = true;

		isDraw = true;
	}

	return isDraw;
};

// Function to set the winner
const makeWinner = (socketId) => {
	players[players[socketId].opponent].win = true;
};

// Function to stop the game after win, draw or if someone left the game
const gameOver = (socketId) => {
	const opponent = players[players[socketId].opponent];
	const player = players[socketId];
	return [
		opponent.win,
		player.win,
		opponent.draw,
		player.draw,
		opponent.left,
		player.left,
	].some(Boolean);
};

export {
	joinGame,
	playerSymbol,
	isYourTurn,
	changeTurn,
	setPlayerMove,
	playerDetails,
	checkValidMove,
	checkAndSetResign,
	isWinningMove,
	isMatchDraw,
	makeWinner,
	gameOver,
	getOpponentSocket,
	isOpponentJoined,
};
