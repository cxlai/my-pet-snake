'use strict';

let Snake = function () {
	let snake = this;
	
	// Board, game states, and snake states as properties of class.
	snake.board = [];
	snake.boardWidth = 25;
	snake.boardHeight = 20;

	snake.gameActive = true;
	snake.currentScore = 0;
	
	snake.snakeX;
	snake.snakeY;
	snake.length;
	snake.direction;
	
	// When key pressed in document... 
	// Cases check for reversing direction (shouldn't crash).
	document.onkeydown = function (event) {
		switch (event.key) {
			case 'ArrowUp': 
				if (snake.direction != 'Down') {
					snake.direction = 'Up'; 
				}
				break;
			case 'ArrowDown': {
				if (snake.direction != 'Up') {
					snake.direction = 'Down'; 
				}
				break;
			}
			case 'ArrowLeft': {
				if (snake.direction != 'Right') {
					snake.direction = 'Left'; 
				}
				break;
			}
			case 'ArrowRight': {
				if (snake.direction != 'Left') {
					snake.direction = 'Right'; 
				}
				break;
			}
			case 'Escape': snake.pauseGame(); break;
			default: break;
		}
	}
}

Snake.prototype.initBoard = function() {
	// Hide modals for now!
	var modal = document.getElementById('startModal');
	modal.style.display = 'none';
	modal = document.getElementById('lostModal');
	modal.style.display = 'none';
	modal = document.getElementById('pauseModal');
	modal.style.display = 'none';
	
	// Initialize board cells.
	let snake = this;
	const boardElement = document.getElementById('board');

	for (var y = 0; y < snake.boardHeight; ++y) {
		var row = [];
		for (var x = 0; x < snake.boardWidth; ++x) {
			var cell = {};
			// Every cell is a div
			cell.element = document.createElement('div');
			// Add it to the board element and to the row.
			boardElement.appendChild(cell.element);
			row.push(cell);
		}

		// Add this row to the property of the game object.
		snake.board.push(row);
	}
	// Set current high score to 0.
	sessionStorage.setItem('highScore', (0).toString());
	
	// Prep for game.
	snake.toggleModal('newGame');
}

Snake.prototype.startGame = function() {
	// Initialize snake, game scores, and start game movement.
	let snake = this;
	var modal = document.getElementById('startModal');
	modal.style.display = 'none';
	modal = document.getElementById('lostModal');
	modal.style.display = 'none';
	modal = document.getElementById('pauseModal');
	modal.style.display = 'none';

	snake.currentScore = 0;
	sessionStorage.setItem('currentScore', snake.currentScore.toString());
	snake.updateCurrentScore();
	
	snake.gameActive = true;
	snake.initSnake();

	// Start the game loop (it will call itself with timeout)
	snake.gameLoop();
}
	
Snake.prototype.initSnake = function() {
	// Place snake and apple in board.
	let snake = this;
	sessionStorage.setItem('currentScore', snake.currentScore.toString());
	// Default position for the snake in the middle of the board.
	snake.snakeX = Math.floor(snake.boardWidth / 2);
	snake.snakeY = Math.floor(snake.boardHeight / 2);
	snake.length = 5;
	snake.direction = 'Up';

	// Clear the board
	for (var y = 0; y < snake.boardHeight; ++y) {
		for (var x = 0; x < snake.boardWidth; ++x) {
			snake.board[y][x].snake = 0;
			snake.board[y][x].apple = 0;
		}
	}

	// Set the center of the board to contain a snake
	snake.board[snake.snakeY][snake.snakeX].snake = snake.length;

	// Place the first apple on the board.
	snake.placeApple();
}

Snake.prototype.placeApple = function() {
	let snake = this;
	// A random coordinate for the apple.
	var appleX = Math.floor(Math.random() * snake.boardWidth);
	var appleY = Math.floor(Math.random() * snake.boardHeight);
	
	snake.board[appleY][appleX].apple = 1;
}

Snake.prototype.gameLoop = function() {
	// Updates and renders game board.
	let snake = this;

	if (snake.gameActive) {
		// Move snake head based on current snake.direction
		switch (snake.direction) {
			case 'Up':    snake.snakeY--; break;
			case 'Down':  snake.snakeY++; break;
			case 'Left':  snake.snakeX--; break;
			case 'Right': snake.snakeX++; break;
		}

		// Check for wall collisions
		if (snake.snakeX < 0 || snake.snakeY < 0 || snake.snakeX >= snake.boardWidth || snake.snakeY >= snake.boardHeight) {
			snake.lostGame();
		}

		// Check for tail collisions
		if (snake.board[snake.snakeY][snake.snakeX].snake > 0) {
			snake.lostGame();
		}

		// Check for successful apple eating
		if (snake.board[snake.snakeY][snake.snakeX].apple === 1) {
			snake.length++;
			snake.board[snake.snakeY][snake.snakeX].apple = 0;
			snake.currentScore += 100;
			snake.updateCurrentScore();
			
			snake.placeApple();
		}

		// Update the board cells where snake is.
		snake.board[snake.snakeY][snake.snakeX].snake = snake.length;

		// Update entire board and cell properties.
		for (var y = 0; y < snake.boardHeight; ++y) {
			for (var x = 0; x < snake.boardWidth; ++x) {
				var cell = snake.board[y][x];

				if (cell.snake > 0) {
					cell.element.className = 'snake';
					cell.snake -= 1;
				}
				else if (cell.apple === 1) {
					cell.element.className = 'apple';
				}
				else {
					cell.element.className = '';
				}
			}
		}
	}

	// Calls game update/render on timeout based on snake length, 
	// maxes out in difficulty.
	setTimeout(snake.gameLoop.bind(snake), Math.max(1000 / snake.length, 1000 / 15));
}

Snake.prototype.pauseGame = function() {
	let snake = this;
	snake.gameActive = false;
	sessionStorage.setItem('currentScore', snake.currentScore.toString());
	snake.toggleModal('paused');
}

Snake.prototype.lostGame = function() {
	let snake = this;
	snake.gameActive = false;
	sessionStorage.setItem('currentScore', snake.currentScore.toString());
	snake.toggleModal('lost');
}

Snake.prototype.toggleModal = function(type) {
	// Handles the modal dialogues for starting, pausing, and losing the game.
	// Can be extended with more options.
	let snake = this;
	switch (type) {
		case 'newGame': {
			var modal = document.getElementById('startModal');
			modal.style.display = "inherit";

			var para = document.createElement('p');
			var node = document.createTextNode('Use your arrow keys to control the snake and collect apples. Press ESC to pause.');
			para.appendChild(node);
			modal.appendChild(para);

			var startButton = document.createElement('button');
			var t = document.createTextNode('Start Game!');
			startButton.appendChild(t);                 
			startButton.addEventListener("click",function(e){
				modal.style.display = "none";
				modal.innerHTML = '';
				snake.startGame();
			},false);
			modal.appendChild(startButton);
		}; break;
		case 'paused': {
			// stop game, offer to continue, offer to restart (doesn't save high score)
			var modal = document.getElementById('pauseModal');
			modal.style.display = "inherit";

			var para = document.createElement('p');
			var highScore = sessionStorage.getItem('highScore');
			var current = sessionStorage.getItem('currentScore');
			var node = document.createTextNode('Your game is paused. Your current score is '+current+' and the high score is '+highScore+'.');
			para.appendChild(node);
			modal.appendChild(para);

			var continueButton = document.createElement('button');
			var continue_t = document.createTextNode('Continue Game');
			continueButton.appendChild(continue_t);                 
			continueButton.addEventListener("click",function(e){
				modal.style.display = "none";
				modal.innerHTML = '';
				snake.gameActive = true;
			},false);
			modal.appendChild(continueButton);

			var restartButton = document.createElement('button');
			var restart_t = document.createTextNode('Restart Game');
			restartButton.appendChild(restart_t);                 
			restartButton.addEventListener("click",function(e){
				modal.style.display = "none";
				snake.currentScore = 0;
				modal.innerHTML = '';
				snake.startGame();
			},false);
			modal.appendChild(restartButton);
        }; break;
	case 'lost': {
		// stop game, show high score comparison, option to restart
		var modal = document.getElementById('lostModal');
		modal.style.display = "inherit";

		var para = document.createElement('p');
		var curHigh = sessionStorage.getItem('highScore');
		var node = document.createTextNode('Game over! Your current score is '+snake.currentScore.toString()+' and the high score is '+curHigh+'.');
		var beatScore = document.createTextNode('Congratulations, you beat the high score!');
		var didntBeatScore = document.createTextNode('You didn\'t beat the high score. Try again?');
		para.appendChild(node);
		modal.appendChild(para);
		if (snake.currentScore > Number(curHigh)) {
			modal.appendChild(beatScore);
			sessionStorage.setItem('highScore', snake.currentScore.toString());
		} else { 
			modal.appendChild(didntBeatScore);
		}
		
		modal.appendChild(document.createElement('br'));
		modal.appendChild(document.createElement('br'));

		var restartButton = document.createElement('button');
		var restart_t = document.createTextNode('Restart Game');
		restartButton.appendChild(restart_t);                 
		restartButton.addEventListener("click",function(e){
			modal.style.display = "none";
			snake.currentScore = 0;
			snake.updateHighScore();
			modal.innerHTML = '';
			snake.startGame();
		},false);
		modal.appendChild(restartButton);
	}; break;
		}
}

Snake.prototype.updateCurrentScore = function() {
	// Updates score display, not in session storage.
	let snake = this;
	var scorePanel = document.getElementById('current-score');
	scorePanel.innerHTML = '';
	var updatedScore = document.createTextNode('Current Score: '+snake.currentScore.toString());
	scorePanel.appendChild(updatedScore);
}

Snake.prototype.updateHighScore = function() {
	// Updates score display, with session storage.
	var scorePanel = document.getElementById('high-score');
	scorePanel.innerHTML = '';
	var highScore = sessionStorage.getItem('highScore');
	var updatedScore = document.createTextNode('High Score: '+highScore.toString());
	scorePanel.appendChild(updatedScore);
}

