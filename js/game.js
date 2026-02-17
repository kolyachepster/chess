class ChessGame {
    constructor() {
        this.board = null;
        this.ai = null;
        this.mode = null; // 'vsHuman' или 'vsAI'
        this.renderer = null;
    }

    init(mode, difficulty = null) {
        this.mode = mode;
        this.board = new ChessBoard();
        
        if (mode === 'vsAI' && difficulty) {
            this.ai = new ChessAI(difficulty);
        }

        this.renderBoard();
        this.updateTurnIndicator();
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

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }

        // Проверка на конец игры
        if (this.board.gameOver) {
            const winner = this.board.winner === COLORS.WHITE ? 'Белые' : 'Черные';
            document.getElementById('gameStatus').textContent = `Игра окончена! Победили ${winner}`;
        } else {
            document.getElementById('gameStatus').textContent = '';
        }
    }

    handleSquareClick(row, col) {
        if (this.board.gameOver) return;

        this.board.selectSquare(row, col);
        this.renderBoard();

        // Если режим против ИИ и сейчас ход черных (ИИ)
        if (this.mode === 'vsAI' && this.board.currentTurn === COLORS.BLACK && !this.board.gameOver) {
            setTimeout(() => this.makeAIMove(), 100);
        }
    }

    makeAIMove() {
        if (this.board.gameOver) return;

        const moveMade = this.board.makeAIMove(this.ai);
        if (moveMade) {
            this.renderBoard();
            this.updateTurnIndicator();
        }
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (this.board.gameOver) {
            const winner = this.board.winner === COLORS.WHITE ? 'Белые' : 'Черные';
            indicator.textContent = `Победили ${winner}!`;
        } else {
            indicator.textContent = `Ход ${this.board.currentTurn === COLORS.WHITE ? 'белых' : 'черных'}`;
        }
    }

    reset() {
        this.board = new ChessBoard();
        this.renderBoard();
        this.updateTurnIndicator();
    }
}

// Глобальный экземпляр игры
let game = null;