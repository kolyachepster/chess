// Константы для типов фигур
const PIECE_TYPES = {
    PAWN: 'pawn',
    ROOK: 'rook',
    KNIGHT: 'knight',
    BISHOP: 'bishop',
    QUEEN: 'queen',
    KING: 'king'
};

// Цвета фигур
const COLORS = {
    WHITE: 'white',
    BLACK: 'black'
};

// Unicode символы для фигур
const PIECE_SYMBOLS = {
    [COLORS.WHITE]: {
        [PIECE_TYPES.KING]: '♔',
        [PIECE_TYPES.QUEEN]: '♕',
        [PIECE_TYPES.ROOK]: '♖',
        [PIECE_TYPES.BISHOP]: '♗',
        [PIECE_TYPES.KNIGHT]: '♘',
        [PIECE_TYPES.PAWN]: '♙'
    },
    [COLORS.BLACK]: {
        [PIECE_TYPES.KING]: '♚',
        [PIECE_TYPES.QUEEN]: '♛',
        [PIECE_TYPES.ROOK]: '♜',
        [PIECE_TYPES.BISHOP]: '♝',
        [PIECE_TYPES.KNIGHT]: '♞',
        [PIECE_TYPES.PAWN]: '♟'
    }
};

class Piece {
    constructor(color, type) {
        this.color = color;
        this.type = type;
        this.hasMoved = false;
    }

    getSymbol() {
        return PIECE_SYMBOLS[this.color][this.type];
    }

    getPossibleMoves(board, row, col, checkKing = true) {
        let moves = [];

        switch (this.type) {
            case PIECE_TYPES.PAWN:
                moves = this.getPawnMoves(board, row, col);
                break;
            case PIECE_TYPES.ROOK:
                moves = this.getRookMoves(board, row, col);
                break;
            case PIECE_TYPES.KNIGHT:
                moves = this.getKnightMoves(board, row, col);
                break;
            case PIECE_TYPES.BISHOP:
                moves = this.getBishopMoves(board, row, col);
                break;
            case PIECE_TYPES.QUEEN:
                moves = this.getQueenMoves(board, row, col);
                break;
            case PIECE_TYPES.KING:
                moves = this.getKingMoves(board, row, col);
                break;
        }

        // Фильтруем ходы, которые оставляют своего короля под шахом
        if (checkKing) {
            moves = moves.filter(([newRow, newCol]) => 
                !this.wouldLeaveKingInCheck(board, row, col, newRow, newCol)
            );
        }

        return moves;
    }

    wouldLeaveKingInCheck(board, fromRow, fromCol, toRow, toCol) {
        // Создаем копию доски и делаем ход
        const boardCopy = board.map(row => [...row]);
        boardCopy[toRow][toCol] = boardCopy[fromRow][fromCol];
        boardCopy[fromRow][fromCol] = null;

        // Находим позицию короля
        let kingRow, kingCol;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = boardCopy[i][j];
                if (piece && piece.type === PIECE_TYPES.KING && piece.color === this.color) {
                    kingRow = i;
                    kingCol = j;
                    break;
                }
            }
        }

        // Проверяем, атакован ли король
        return this.isSquareAttacked(boardCopy, kingRow, kingCol, this.color);
    }

    isSquareAttacked(board, row, col, defendingColor) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.color !== defendingColor) {
                    const moves = piece.getPossibleMoves(board, i, j, false);
                    if (moves.some(([r, c]) => r === row && c === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPawnMoves(board, row, col) {
        const moves = [];
        const direction = this.color === COLORS.WHITE ? -1 : 1;
        const startRow = this.color === COLORS.WHITE ? 6 : 1;

        // Движение вперед на 1 клетку
        if (this.isInBounds(row + direction, col) && !board[row + direction][col]) {
            moves.push([row + direction, col]);

            // Движение вперед на 2 клетки с начальной позиции
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Взятие фигур
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (this.isInBounds(row + direction, newCol)) {
                const target = board[row + direction][newCol];
                if (target && target.color !== this.color) {
                    moves.push([row + direction, newCol]);
                }
            }
        }

        return moves;
    }

    getRookMoves(board, row, col) {
        return this.getSlidingMoves(board, row, col, [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ]);
    }

    getKnightMoves(board, row, col) {
        const moves = [];
        const knightJumps = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of knightJumps) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target || target.color !== this.color) {
                    moves.push([newRow, newCol]);
                }
            }
        }

        return moves;
    }

    getBishopMoves(board, row, col) {
        return this.getSlidingMoves(board, row, col, [
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]);
    }

    getQueenMoves(board, row, col) {
        return [
            ...this.getSlidingMoves(board, row, col, [
                [0, 1], [1, 0], [0, -1], [-1, 0]
            ]),
            ...this.getSlidingMoves(board, row, col, [
                [1, 1], [1, -1], [-1, 1], [-1, -1]
            ])
        ];
    }

    getKingMoves(board, row, col) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.isInBounds(newRow, newCol)) {
                    const target = board[newRow][newCol];
                    if (!target || target.color !== this.color) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        }
        return moves;
    }

    getSlidingMoves(board, row, col, directions) {
        const moves = [];
        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!this.isInBounds(newRow, newCol)) break;

                const target = board[newRow][newCol];
                if (!target) {
                    moves.push([newRow, newCol]);
                } else {
                    if (target.color !== this.color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
            }
        }
        return moves;
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
}