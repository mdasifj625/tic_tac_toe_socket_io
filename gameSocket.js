import {
	joinGame,
	playerSymbol,
	isOpponentJoined,
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
} from './gameCondition.js';
const gameSocket = (io) => {
	io.on('connection', (socket) => {
		const socketId = socket.id;
		console.log(`New user connected`, socketId);
		//join game for the players
		joinGame(socket);

		// If opponent exists start the game or wait for the opponent to join the game.
		if (isOpponentJoined(socketId)) {
			const opponentSocket = getOpponentSocket(socketId);
			//Players symbol
			const player_symbol = playerSymbol(socketId); //Player 2
			const opponent_symbol = playerSymbol(opponentSocket.id); //Player 1
			//Emit the event to start Player 2 game
			socket.emit('startGame', {
				symbol: player_symbol,
				player: 2,
			});
			//Emit the event to start Player 1 game for opponent connection
			opponentSocket.emit('startGame', {
				symbol: opponent_symbol,
				player: 1,
			});
		}

		// Wait till opponent joins
		else {
			socket.emit('waitingForJoining');
		}
		//when user enters any Number in command line then Emit events
		socket.on('message', ({ enteredValue, player }) => {
			const opponentSocket = getOpponentSocket(socketId);
			if (gameOver(socketId)) {
				return socket.emit('gameOver');
			}
			const turn = isYourTurn(socketId);
			//Right player move
			if (turn) {
				const move = enteredValue;
				//Check whether user is entering a valid key or move
				const { validMove, msg } = checkValidMove(socketId, move);

				// When user enters the valid key or move
				if (validMove) {
					//Set the move in players data
					setPlayerMove(socketId, move);
					//check whether the move played is the winning move

					if (isWinningMove(socketId)) {
						socket.emit('gameStatus', playerDetails(socketId));
						opponentSocket.emit(
							'gameStatus',
							playerDetails(opponentSocket.id)
						);
						socket.emit('gameWon', { player });
						return opponentSocket.emit('gameWon', { player });
					}

					//Check whether the move played is drawing the match
					if (isMatchDraw(socketId)) {
						socket.emit('gameStatus', playerDetails(socketId));
						opponentSocket.emit(
							'gameStatus',
							playerDetails(opponentSocket.id)
						);
						socket.emit('gameDraw');
						return opponentSocket.emit('gameDraw');
					}
					//Show status of game to both the players
					socket.emit('gameStatus', playerDetails(socketId));
					opponentSocket.emit(
						'gameStatus',
						playerDetails(opponentSocket.id)
					);
					const symbol = playerSymbol(opponentSocket.id);
					//Display message to both the users letting them know who have the next turn
					opponentSocket.emit('gameMove', {
						player,
						turn,
						symbol,
					});
					socket.emit('waitingGame');
					//Change Turn of the player
					return changeTurn(socketId);
				}

				//Check whether player has entered r key to resign
				if (checkAndSetResign(socketId, move)) {
					socket.emit('gameLeft');
					return opponentSocket.emit('gameOpponentLeft');
				}
				return socket.emit('gameWrongMove', msg);
			}

			//Wrong player move
			socket.emit('gameMove', { turn });
		});
		//When users disconnects
		socket.on('disconnect', () => {
			const opponent_socket = getOpponentSocket(socketId);
			opponent_socket.emit('gameOpponentLeftBetween', () => {
				console.log('Opponent Player has left the game');
			});
			//Make winner to the opponent of player who left
			makeWinner(socketId);
		});
	});
};

export { gameSocket as default };
