class ChessAI {
    constructor(difficulty) {
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
    }

    getBestMove(board) {
        switch (this.difficulty) {
            case 'easy':
                return this.getRandomMove(board);
            case 'medium':
                return this.getMediumMove(board);
            case 'hard':
                return this.getHardMove(board);
            default:
                return this.getRandomMove(board);
        }
    }

    getRandomMove(board) {
        const moves = this.getAllPossibleMoves(board);
        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getMediumMove(board) {
        const moves = this.getAllPossibleMoves(board);
        if (moves.length === 0) return null;

        // Оцениваем каждый ход
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (const move of moves) {
            const score = this.evaluateMove(board, move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getHardMove(board) {
        // Простой минимакс с глубиной 2
        return this.minimax(board, 2, true).move;
    }

    getAllPossibleMoves(board) {
        const moves = [];
        const color = board.currentTurn;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.board[row][col];
                if (piece && piece.color === color) {
                    const possibleMoves = piece.getPossibleMoves(board.board, row, col);
                    for (const [toRow, toCol] of possibleMoves) {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: toRow,
                            toCol: toCol,
                            piece: piece
                        });
                    }
                }
            }
        }

        return moves;
    }

    evaluateMove(board, move) {
        let score = 0;
        const targetPiece = board.board[move.toRow][move.toCol];

        // Бонус за взятие фигуры
        if (targetPiece) {
            const pieceValues = {
                [PIECE_TYPES.PAWN]: 1,
                [PIECE_TYPES.KNIGHT]: 3,
                [PIECE_TYPES.BISHOP]: 3,
                [PIECE_TYPES.ROOK]: 5,
                [PIECE_TYPES.QUEEN]: 9,
                [PIECE_TYPES.KING]: 100
            };
            score += pieceValues[targetPiece.type] * 10;
        }

        // Бонус за развитие в центре
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        for (const [r, c] of centerSquares) {
            if (move.toRow === r && move.toCol === c) {
                score += 2;
            }
        }

        // Случайный фактор для разнообразия
        score += Math.random() * 2;

        return score;
    }

    minimax(board, depth, isMaximizing) {
        if (depth === 0) {
            return { score: this.evaluatePosition(board) };
        }

        const moves = this.getAllPossibleMoves(board);
        if (moves.length === 0) {
            return { score: isMaximizing ? -1000 : 1000 };
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = null;

            for (const move of moves) {
                // Создаем копию доски и делаем ход
                const boardCopy = this.copyBoard(board);
                boardCopy.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
                
                const result = this.minimax(boardCopy, depth - 1, false);
                
                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
            }

            return { move: bestMove, score: bestScore };
        } else {
            let bestScore = Infinity;
            let bestMove = null;

            for (const move of moves) {
                const boardCopy = this.copyBoard(board);
                boardCopy.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
                
                const result = this.minimax(boardCopy, depth - 1, true);
                
                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
            }

            return { move: bestMove, score: bestScore };
        }
    }

    evaluatePosition(board) {
        let score = 0;
        const pieceValues = {
            [PIECE_TYPES.PAWN]: 1,
            [PIECE_TYPES.KNIGHT]: 3,
            [PIECE_TYPES.BISHOP]: 3,
            [PIECE_TYPES.ROOK]: 5,
            [PIECE_TYPES.QUEEN]: 9,
            [PIECE_TYPES.KING]: 0
        };

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    if (piece.color === board.currentTurn) {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }

        return score;
    }

    copyBoard(board) {
        const newBoard = new ChessBoard();
        newBoard.board = board.board.map(row => 
            row.map(piece => piece ? new Piece(piece.color, piece.type) : null)
        );
        newBoard.currentTurn = board.currentTurn;
        return newBoard;
    }
}