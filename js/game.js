class ChessGame {
    constructor() {
        this.board = null;
        this.ai = null;
        this.mode = null; // 'vsHuman' или 'vsAI'
        this.difficulty = null;
    }

    init(mode, difficulty = null) {
        this.mode = mode;
        this.difficulty = difficulty;
        this.board = new ChessBoard();
        
        if (mode === 'vsAI' && difficulty) {
            this.ai = new ChessAI(difficulty);
        }

        this.renderBoard();
        this.updateTurnIndicator();
        
        // Скрываем модальное окно, если оно было открыто
        document.getElementById('gameOverModal').classList.add('hidden');
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board.board[row][col];
                if (piece) {
                    square.textContent = piece.getSymbol();
                }

                // Подсветка выбранной клетки
                if (this.board.selectedSquare && 
                    this.board.selectedSquare[0] === row && 
                    this.board.selectedSquare[1] === col) {
                    square.classList.add('selected');
                }

                // Подсветка возможных ходов
                if (this.board.validMoves.some(([r, c]) => r === row && c === col)) {
                    square.classList.add('valid-move');
                    if (this.board.board[row][col]) {
                        square.classList.add('has-piece');
                    }
                }

                // Подсветка шаха
                const kingPos = this.board.findKing(this.board.currentTurn);
                if (kingPos && kingPos.row === row && kingPos.col === col) {
                    const isInCheck = this.board.currentTurn === COLORS.WHITE ? 
                        this.board.checkStatus.white : this.board.checkStatus.black;
                    if (isInCheck) {
                        square.style.backgroundColor = '#ff6b6b';
                    }
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }

        // Проверка на конец игры
        if (this.board.gameOver) {
            this.showGameOverModal();
        }
    }

    handleSquareClick(row, col) {
        if (this.board.gameOver) return;

        this.board.selectSquare(row, col);
        this.renderBoard();
        this.updateTurnIndicator();

        // Проверка на окончание игры после хода
        if (this.board.gameOver) {
            this.showGameOverModal();
            return;
        }

        // Если режим против ИИ и сейчас ход черных (ИИ)
        if (this.mode === 'vsAI' && this.board.currentTurn === COLORS.BLACK && !this.board.gameOver) {
            setTimeout(() => this.makeAIMove(), 300);
        }
    }

    makeAIMove() {
        if (this.board.gameOver) return;

        const moveMade = this.board.makeAIMove(this.ai);
        if (moveMade) {
            this.renderBoard();
            this.updateTurnIndicator();
            
            // Проверка на окончание игры после хода ИИ
            if (this.board.gameOver) {
                this.showGameOverModal();
            }
        }
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        const isInCheck = this.board.currentTurn === COLORS.WHITE ? 
            this.board.checkStatus.white : this.board.checkStatus.black;
        
        let turnText = this.board.currentTurn === COLORS.WHITE ? 'Белые' : 'Черные';
        
        if (this.board.gameOver) {
            const winner = this.board.winner === COLORS.WHITE ? 'Белые' : 'Черные';
            indicator.textContent = `Победили ${winner}!`;
        } else {
            indicator.textContent = `Ход ${turnText}`;
            if (isInCheck) {
                indicator.textContent += ' (ШАХ!)';
                indicator.style.backgroundColor = '#ff6b6b';
                indicator.style.color = 'white';
            } else {
                indicator.style.backgroundColor = '';
                indicator.style.color = '';
            }
        }
    }

    showGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        const message = document.getElementById('gameOverMessage');
        const title = document.getElementById('gameOverTitle');
        
        let winnerText = '';
        let emoji = '';
        
        if (this.board.winner === COLORS.WHITE) {
            winnerText = 'Белые';
            emoji = '👑';
        } else if (this.board.winner === COLORS.BLACK) {
            winnerText = 'Черные';
            emoji = '👑';
        } else {
            winnerText = 'Ничья';
            emoji = '🤝';
        }
        
        title.textContent = winnerText === 'Ничья' ? 'Ничья!' : 'Победа!';
        message.innerHTML = `${emoji} <strong>${winnerText}</strong> ${winnerText === 'Ничья' ? '' : 'одержали победу!'}`;
        
        modal.classList.remove('hidden');
    }

    reset() {
        this.init(this.mode, this.difficulty);
    }
}

// Глобальный экземпляр игры
let game = null;