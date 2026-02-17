class ChessAI {
    constructor(difficulty) {
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
        this.pieceValues = {
            [PIECE_TYPES.PAWN]: 100,
            [PIECE_TYPES.KNIGHT]: 320,
            [PIECE_TYPES.BISHOP]: 330,
            [PIECE_TYPES.ROOK]: 500,
            [PIECE_TYPES.QUEEN]: 900,
            [PIECE_TYPES.KING]: 20000
        };

        // Позиционные бонусы для пешек
        this.pawnPositionBonus = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        // Позиционные бонусы для коней
        this.knightPositionBonus = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];
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
        // Минимакс с глубиной 3
        return this.minimax(board, 3, true, -Infinity, Infinity).move;
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
            score += this.pieceValues[targetPiece.type] * 10;
            
            // Дополнительный бонус за взятие более ценной фигуры
            if (this.pieceValues[targetPiece.type] > this.pieceValues[move.piece.type]) {
                score += 50;
            }
        }

        // Бонус за развитие в центре
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        for (const [r, c] of centerSquares) {
            if (move.toRow === r && move.toCol === c) {
                score += 15;
            }
        }

        // Бонус за продвижение пешек
        if (move.piece.type === PIECE_TYPES.PAWN) {
            const direction = move.piece.color === COLORS.WHITE ? -1 : 1;
            const advancement = move.piece.color === COLORS.WHITE ? 
                7 - move.toRow : move.toRow;
            score += advancement * 5;
        }

        // Штраф за небезопасные ходы
        const boardCopy = this.copyBoard(board);
        boardCopy.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
        
        // Проверяем, не подставляем ли мы фигуру под удар
        if (this.isPieceUnderAttack(boardCopy, move.toRow, move.toCol, move.piece.color)) {
            score -= this.pieceValues[move.piece.type] * 5;
        }

        // Случайный фактор для разнообразия
        score += Math.random() * 10;

        return score;
    }

    isPieceUnderAttack(board, row, col, color) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board.board[i][j];
                if (piece && piece.color !== color) {
                    const moves = piece.getPossibleMoves(board.board, i, j, false);
                    if (moves.some(([r, c]) => r === row && c === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        if (depth === 0) {
            return { score: this.evaluatePosition(board) };
        }

        const moves = this.getAllPossibleMoves(board);
        if (moves.length === 0) {
            // Проверяем, мат это или пат
            const isInCheck = board.currentTurn === COLORS.WHITE ? 
                board.checkStatus.white : board.checkStatus.black;
            return { score: isInCheck ? (isMaximizing ? -10000 : 10000) : 0 };
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = null;

            // Сортируем ходы для лучшего отсечения (захваты в первую очередь)
            moves.sort((a, b) => {
                const aCapture = board.board[a.toRow][a.toCol] ? 1 : 0;
                const bCapture = board.board[b.toRow][b.toCol] ? 1 : 0;
                return bCapture - aCapture;
            });

            for (const move of moves) {
                const boardCopy = this.copyBoard(board);
                boardCopy.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
                
                const result = this.minimax(boardCopy, depth - 1, false, alpha, beta);
                
                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break; // Альфа-бета отсечение
            }

            return { move: bestMove, score: bestScore };
        } else {
            let bestScore = Infinity;
            let bestMove = null;

            moves.sort((a, b) => {
                const aCapture = board.board[a.toRow][a.toCol] ? 1 : 0;
                const bCapture = board.board[b.toRow][b.toCol] ? 1 : 0;
                return bCapture - aCapture;
            });

            for (const move of moves) {
                const boardCopy = this.copyBoard(board);
                boardCopy.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
                
                const result = this.minimax(boardCopy, depth - 1, true, alpha, beta);
                
                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break; // Альфа-бета отсечение
            }

            return { move: bestMove, score: bestScore };
        }
    }

    evaluatePosition(board) {
        let score = 0;
        const color = board.currentTurn;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.board[row][col];
                if (piece) {
                    let value = this.pieceValues[piece.type];
                    
                    // Добавляем позиционные бонусы
                    if (piece.type === PIECE_TYPES.PAWN) {
                        const bonus = piece.color === COLORS.WHITE ? 
                            this.pawnPositionBonus[row][col] : 
                            this.pawnPositionBonus[7 - row][col];
                        value += bonus;
                    } else if (piece.type === PIECE_TYPES.KNIGHT) {
                        const bonus = piece.color === COLORS.WHITE ? 
                            this.knightPositionBonus[row][col] : 
                            this.knightPositionBonus[7 - row][col];
                        value += bonus;
                    }
                    
                    if (piece.color === color) {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }

        // Бонус за контроль центра
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        for (const [r, c] of centerSquares) {
            const piece = board.board[r][c];
            if (piece) {
                if (piece.color === color) {
                    score += 20;
                } else {
                    score -= 20;
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
        newBoard.checkStatus = { ...board.checkStatus };
        return newBoard;
    }
}