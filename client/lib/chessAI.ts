import {
  GameState,
  Position,
  PieceColor,
  PieceType,
  getValidMoves,
  makeMove,
  evaluateBoard,
  cloneBoard,
} from './chessLogic';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface AIMove {
  from: Position;
  to: Position;
  promotion?: PieceType;
  score: number;
}

function getAllMoves(state: GameState, color: PieceColor): AIMove[] {
  const moves: AIMove[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(state.board, { row, col }, state.enPassantTarget);
        for (const to of validMoves) {
          // Handle pawn promotion
          if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
            for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
              moves.push({ from: { row, col }, to, promotion: promo, score: 0 });
            }
          } else {
            moves.push({ from: { row, col }, to, score: 0 });
          }
        }
      }
    }
  }

  return moves;
}

function orderMoves(moves: AIMove[], state: GameState): AIMove[] {
  return moves.sort((a, b) => {
    const captureA = state.board[a.to.row][a.to.col];
    const captureB = state.board[b.to.row][b.to.col];
    
    let scoreA = 0;
    let scoreB = 0;

    if (captureA) scoreA += 10;
    if (captureB) scoreB += 10;

    if (a.promotion === 'queen') scoreA += 9;
    if (b.promotion === 'queen') scoreB += 9;

    return scoreB - scoreA;
  });
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  color: PieceColor
): number {
  if (depth === 0 || state.isCheckmate || state.isDraw || state.isStalemate) {
    if (state.isCheckmate) {
      return maximizingPlayer ? -100000 + (10 - depth) : 100000 - (10 - depth);
    }
    if (state.isDraw || state.isStalemate) {
      return 0;
    }
    const eval_ = evaluateBoard(state.board);
    return color === 'white' ? eval_ : -eval_;
  }

  const moves = getAllMoves(state, maximizingPlayer ? color : (color === 'white' ? 'black' : 'white'));

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to, move.promotion);
      if (newState) {
        const eval_ = minimax(newState, depth - 1, alpha, beta, false, color);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to, move.promotion);
      if (newState) {
        const eval_ = minimax(newState, depth - 1, alpha, beta, true, color);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

export function getAIMove(state: GameState, difficulty: Difficulty): AIMove | null {
  const color = state.currentPlayer;
  let moves = getAllMoves(state, color);

  if (moves.length === 0) return null;

  // Order moves for better alpha-beta pruning
  moves = orderMoves(moves, state);

  const depthMap: Record<Difficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3
  };

  const depth = depthMap[difficulty];

  // Add randomness for easy difficulty
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove: AIMove | null = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const newState = makeMove(state, move.from, move.to, move.promotion);
    if (newState) {
      const score = minimax(newState, depth - 1, -Infinity, Infinity, false, color);
      
      // Add small random factor for medium difficulty
      const randomFactor = difficulty === 'medium' ? (Math.random() - 0.5) * 20 : 0;
      const adjustedScore = score + randomFactor;

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestMove = { ...move, score };
      }
    }
  }

  return bestMove;
}

export function calculatePoints(state: GameState, playerColor: PieceColor): number {
  let points = 0;

  // Points for captured pieces
  const capturedByPlayer = state.capturedPieces[playerColor];
  for (const piece of capturedByPlayer) {
    const values: Record<PieceType, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
    };
    points += values[piece.type];
  }

  // Bonus for check
  if (state.isCheck && state.currentPlayer !== playerColor) {
    points += 1;
  }

  // Bonus for checkmate
  if (state.isCheckmate && state.currentPlayer !== playerColor) {
    points += 20;
  }

  return points;
}
