import {
  GameState,
  Position,
  PieceColor,
  PieceType,
  getValidMoves,
  makeMove,
  evaluateBoard,
  cloneBoard,
  getPieceValue,
} from './chessLogic';
import { getBookMove, isInBook } from './openingBook';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface AIMove {
  from: Position;
  to: Position;
  promotion?: PieceType;
  score: number;
}

// Transposition table for caching board evaluations
interface TranspositionEntry {
  score: number;
  depth: number;
  flag: 'exact' | 'alpha' | 'beta';
}

const transpositionTable = new Map<string, TranspositionEntry>();

// Killer moves for move ordering (non-capture moves that cause cutoffs)
const killerMoves: Map<number, AIMove[]> = new Map();

// Piece-square tables for positional evaluation
const pawnTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 27, 27, 10, 5, 5],
  [0, 0, 0, 25, 25, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -25, -25, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

const knightTable = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

const bishopTable = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

const rookTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0]
];

const queenTable = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20]
];

const kingMiddleGameTable = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20]
];

const kingEndGameTable = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50]
];

function getPositionBonus(piece: { type: PieceType; color: PieceColor }, row: number, col: number, isEndgame: boolean): number {
  const r = piece.color === 'white' ? row : 7 - row;
  
  switch (piece.type) {
    case 'pawn':
      return pawnTable[r][col];
    case 'knight':
      return knightTable[r][col];
    case 'bishop':
      return bishopTable[r][col];
    case 'rook':
      return rookTable[r][col];
    case 'queen':
      return queenTable[r][col];
    case 'king':
      return isEndgame ? kingEndGameTable[r][col] : kingMiddleGameTable[r][col];
    default:
      return 0;
  }
}

// Enhanced evaluation with positional factors
function evaluateBoardAdvanced(state: GameState): number {
  let score = 0;
  const board = state.board;
  
  // Count material to determine if endgame
  let totalMaterial = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type !== 'king') {
        totalMaterial += getPieceValue(piece.type);
      }
    }
  }
  const isEndgame = totalMaterial < 2600; // Less than 2 rooks + 2 knights worth

  // Material and position evaluation
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = getPieceValue(piece.type);
        const posBonus = getPositionBonus(piece, row, col, isEndgame);
        const total = value + posBonus;
        score += piece.color === 'white' ? total : -total;
      }
    }
  }

  // Mobility bonus (number of legal moves)
  const whiteMoves = getAllMoves(state, 'white').length;
  const blackMoves = getAllMoves(state, 'black').length;
  score += (whiteMoves - blackMoves) * 5;

  // King safety in middle game
  if (!isEndgame) {
    score += evaluateKingSafety(board, 'white');
    score -= evaluateKingSafety(board, 'black');
  }

  // Center control
  const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
  for (const [r, c] of centerSquares) {
    const piece = board[r][c];
    if (piece) {
      const bonus = piece.type === 'pawn' ? 30 : 20;
      score += piece.color === 'white' ? bonus : -bonus;
    }
  }

  return score;
}

function evaluateKingSafety(board: (any | null)[][], color: PieceColor): number {
  let safety = 0;
  const kingRow = color === 'white' ? 7 : 0;
  let kingCol = -1;

  // Find king
  for (let col = 0; col < 8; col++) {
    const piece = board[kingRow][col];
    if (piece?.type === 'king' && piece.color === color) {
      kingCol = col;
      break;
    }
  }

  if (kingCol === -1) return 0;

  // Check pawn shield
  const pawnRow = color === 'white' ? 6 : 1;
  for (let dc = -1; dc <= 1; dc++) {
    const col = kingCol + dc;
    if (col >= 0 && col < 8) {
      const piece = board[pawnRow][col];
      if (piece?.type === 'pawn' && piece.color === color) {
        safety += 15;
      }
    }
  }

  // Penalty for exposed king in center
  if (kingCol >= 2 && kingCol <= 5) {
    safety -= 20;
  }

  return safety;
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

// Move ordering for better alpha-beta pruning
function orderMoves(moves: AIMove[], state: GameState): AIMove[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Prioritize captures
    const captureA = state.board[a.to.row][a.to.col];
    const captureB = state.board[b.to.row][b.to.col];
    
    if (captureA) {
      const attackerValue = getPieceValue(state.board[a.from.row][a.from.col]!.type);
      const victimValue = getPieceValue(captureA.type);
      scoreA += (victimValue - attackerValue / 10); // MVV-LVA
    }
    if (captureB) {
      const attackerValue = getPieceValue(state.board[b.from.row][b.from.col]!.type);
      const victimValue = getPieceValue(captureB.type);
      scoreB += (victimValue - attackerValue / 10);
    }

    // Prioritize queen promotions
    if (a.promotion === 'queen') scoreA += 900;
    if (b.promotion === 'queen') scoreB += 900;

    // Prioritize center moves
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    if (centerSquares.some(([r, c]) => r === a.to.row && c === a.to.col)) scoreA += 15;
    if (centerSquares.some(([r, c]) => r === b.to.row && c === b.to.col)) scoreB += 15;

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
      // Prefer faster checkmates
      return maximizingPlayer ? -100000 + (10 - depth) * 100 : 100000 - (10 - depth) * 100;
    }
    if (state.isDraw || state.isStalemate) {
      return 0;
    }
    const eval_ = evaluateBoardAdvanced(state);
    return color === 'white' ? eval_ : -eval_;
  }

  const moves = getAllMoves(state, maximizingPlayer ? color : (color === 'white' ? 'black' : 'white'));
  
  // Check for no legal moves
  if (moves.length === 0) {
    if (state.isCheck) {
      return maximizingPlayer ? -100000 : 100000;
    }
    return 0; // Stalemate
  }

  // Order moves for better pruning
  const orderedMoves = orderMoves(moves, state);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      const newState = makeMove(state, move.from, move.to, move.promotion);
      if (newState) {
        const eval_ = minimax(newState, depth - 1, alpha, beta, false, color);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break; // Beta cutoff
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      const newState = makeMove(state, move.from, move.to, move.promotion);
      if (newState) {
        const eval_ = minimax(newState, depth - 1, alpha, beta, true, color);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break; // Alpha cutoff
      }
    }
    return minEval;
  }
}

export function getAIMove(state: GameState, difficulty: Difficulty): AIMove | null {
  const color = state.currentPlayer;
  
  // Try opening book first
  if (isInBook(state.moveHistory.length)) {
    const bookMove = getBookMove(state.moveHistory.map(m => m.notation || ''));
    if (bookMove) {
      // Convert bookMove notation to Position
      // This is simplified - in production you'd parse algebraic notation properly
      // For now, just proceed with normal search
    }
  }

  let moves = getAllMoves(state, color);

  if (moves.length === 0) return null;

  // Order moves for better search
  moves = orderMoves(moves, state);

  const depthMap: Record<Difficulty, number> = {
    easy: 2,
    medium: 4, // Increased from 3
    hard: 6,   // Increased from 5
    expert: 8  // Increased from 6
  };

  const maxDepth = depthMap[difficulty];

  // Iterative deepening for better move ordering
  let bestMove: AIMove | null = null;
  let bestScore = -Infinity;

  // Start with shallow search and deepen
  for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
    let currentBestMove: AIMove | null = null;
    let currentBestScore = -Infinity;

    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to, move.promotion);
      if (newState) {
        const score = minimax(newState, currentDepth - 1, -Infinity, Infinity, false, color);
        
        // Add randomness for easier difficulties
        const randomFactor = difficulty === 'medium' ? (Math.random() - 0.5) * 20 : 
                            difficulty === 'easy' ? (Math.random() - 0.5) * 40 : 0;
        const adjustedScore = score + randomFactor;

        if (adjustedScore > currentBestScore) {
          currentBestScore = adjustedScore;
          currentBestMove = { ...move, score };
        }
      }
    }

    // Update best move if we found a better one at this depth
    if (currentBestMove) {
      bestMove = currentBestMove;
      bestScore = currentBestScore;
    }
  }

  // Clear old entries from transposition table if it gets too large
  if (transpositionTable.size > 10000) {
    transpositionTable.clear();
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
