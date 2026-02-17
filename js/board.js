class ChessBoard {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentTurn = COLORS.WHITE;
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.setupBoard();
    }

    setupBoard() {
        // Очищаем доску
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = null;
            }
        }

        // Расставляем пешки
        for (let i = 0; i < 8; i++) {
            this.board[1][i] = new Piece(COLORS.BLACK, PIECE_TYPES.PAWN);
            this.board[6][i] = new Piece(COLORS.WHITE, PIECE_TYPES.PAWN);
        }

        // Расставляем ладьи
        this.board[0][0] = new Piece(COLORS.BLACK, PIECE_TYPES.ROOK);
        this.board[0][7] = new Piece(COLORS.BLACK, PIECE_TYPES.ROOK);
        this.board[7][0] = new Piece(COLORS.WHITE, PIECE_TYPES.ROOK);
        this.board[7][7] = new Piece(COLORS.WHITE, PIECE_TYPES.ROOK);

        // Расставляем кони
        this.board[0][1] = new Piece(COLORS.BLACK, PIECE_TYPES.KNIGHT);
        this.board[0][6] = new Piece(COLORS.BLACK, PIECE_TYPES.KNIGHT);
        this.board[7][1] = new Piece(COLORS.WHITE, PIECE_TYPES.KNIGHT);
        this.board[7][6] = new Piece(COLORS.WHITE, PIECE_TYPES.KNIGHT);

        // Расставляем слоны
        this.board[0][2] = new Piece(COLORS.BLACK, PIECE_TYPES.BISHOP);
        this.board[0][5] = new Piece(COLORS.BLACK, PIECE_TYPES.BISHOP);
        this.board[7][2] = new Piece(COLORS.WHITE, PIECE_TYPES.BISHOP);
        this.board[7][5] = new Piece(COLORS.WHITE, PIECE_TYPES.BISHOP);

        // Расставляем ферзей
        this.board[0][3] = new Piece(COLORS.BLACK, PIECE_TYPES.QUEEN);
        this.board[7][3] = new Piece(COLORS.WHITE, PIECE_TYPES.QUEEN);

        // Расставляем королей
        this.board[0][4] = new Piece(COLORS.BLACK, PIECE_TYPES.KING);
        this.board[7][4] = new Piece(COLORS.WHITE, PIECE_TYPES.KING);
    }

    selectSquare(row, col) {
        if (this.gameOver) return [];

        const piece = this.board[row][col];
        
        // Если клетка уже выбрана, снимаем выделение
        if (this.selectedSquare && this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
            this.selectedSquare = null;
            this.validMoves = [];
            return [];
        }

        // Если выбранная фигура принадлежит текущему игроку
        if (piece && piece.color === this.currentTurn) {
            this.selectedSquare = [row, col];
            this.validMoves = piece.getPossibleMoves(this.board, row, col);
            return this.validMoves;
        }

        // Если выбрана пустая клетка или фигура противника, пытаемся сделать ход
        if (this.selectedSquare) {
            const [fromRow, fromCol] = this.selectedSquare;
            const isValidMove = this.validMoves.some(([r, c]) => r === row && c === col);
            
            if (isValidMove) {
                this.movePiece(fromRow, fromCol, row, col);
            }
            
            this.selectedSquare = null;
            this.validMoves = [];
        }

        return [];
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.hasMoved = true;

        // Проверка на превращение пешки
        if (piece.type === PIECE_TYPES.PAWN) {
            if ((piece.color === COLORS.WHITE && toRow === 0) || 
                (piece.color === COLORS.BLACK && toRow === 7)) {
                // Автоматически превращаем в ферзя для простоты
                this.board[toRow][toCol] = new Piece(piece.color, PIECE_TYPES.QUEEN);
            }
        }

        // Проверка на мат
        this.checkGameOver();

        // Смена хода
        this.currentTurn = this.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    }

    checkGameOver() {
        // Проверяем, есть ли король у текущего игрока
        let kingFound = false;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.type === PIECE_TYPES.KING && piece.color === this.currentTurn) {
                    kingFound = true;
                    
                    // Проверяем, есть ли у короля ходы
                    const kingMoves = piece.getPossibleMoves(this.board, i, j);
                    if (kingMoves.length === 0) {
                        // Проверяем, может ли какая-то другая фигура походить
                        let anyMove = false;
                        for (let r = 0; r < 8; r++) {
                            for (let c = 0; c < 8; c++) {
                                const p = this.board[r][c];
                                if (p && p.color === this.currentTurn) {
                                    const moves = p.getPossibleMoves(this.board, r, c);
                                    if (moves.length > 0) {
                                        anyMove = true;
                                        break;
                                    }
                                }
                            }
                            if (anyMove) break;
                        }
                        
                        if (!anyMove) {
                            this.gameOver = true;
                            this.winner = this.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
                        }
                    }
                    break;
                }
            }
        }
        
        if (!kingFound) {
            this.gameOver = true;
            this.winner = this.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        }
    }

    makeAIMove(ai) {
        if (this.gameOver) return false;
        
        const move = ai.getBestMove(this);
        if (move) {
            this.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
            return true;
        }
        return false;
    }
}