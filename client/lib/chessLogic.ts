export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  promotion?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
  notation?: string;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  moveHistory: Move[];
  capturedPieces: { white: Piece[]; black: Piece[] };
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?: string;
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  positionHistory: string[];
}

export const INITIAL_BOARD: (Piece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'black' as PieceColor })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'white' as PieceColor })),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

export function createInitialGameState(): GameState {
  return {
    board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
    currentPlayer: 'white',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    positionHistory: [],
  };
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

export function findKing(board: (Piece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isSquareAttacked(
  board: (Piece | null)[][],
  position: Position,
  byColor: PieceColor
): boolean {
  const { row, col } = position;

  // Check for pawn attacks
  const pawnDir = byColor === 'white' ? 1 : -1;
  const pawnRow = row + pawnDir;
  if (pawnRow >= 0 && pawnRow < 8) {
    for (const dc of [-1, 1]) {
      const pawnCol = col + dc;
      if (pawnCol >= 0 && pawnCol < 8) {
        const piece = board[pawnRow][pawnCol];
        if (piece?.type === 'pawn' && piece.color === byColor) {
          return true;
        }
      }
    }
  }

  // Check for knight attacks
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const piece = board[nr][nc];
      if (piece?.type === 'knight' && piece.color === byColor) {
        return true;
      }
    }
  }

  // Check for king attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const piece = board[nr][nc];
        if (piece?.type === 'king' && piece.color === byColor) {
          return true;
        }
      }
    }
  }

  // Check for sliding piece attacks (rook, bishop, queen)
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // Rook directions
    [-1, -1], [-1, 1], [1, -1], [1, 1] // Bishop directions
  ];

  for (let i = 0; i < directions.length; i++) {
    const [dr, dc] = directions[i];
    let nr = row + dr;
    let nc = col + dc;

    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const piece = board[nr][nc];
      if (piece) {
        if (piece.color === byColor) {
          const isRookDir = i < 4;
          const isBishopDir = i >= 4;
          if (piece.type === 'queen' ||
              (piece.type === 'rook' && isRookDir) ||
              (piece.type === 'bishop' && isBishopDir)) {
            return true;
          }
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

export function isInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos, color === 'white' ? 'black' : 'white');
}

export function getRawMoves(
  board: (Piece | null)[][],
  from: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const { row, col } = from;

  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // Forward move
      if (row + dir >= 0 && row + dir < 8 && !board[row + dir][col]) {
        moves.push({ row: row + dir, col });
        // Double move from start
        if (row === startRow && !board[row + 2 * dir][col]) {
          moves.push({ row: row + 2 * dir, col });
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (nc >= 0 && nc < 8 && row + dir >= 0 && row + dir < 8) {
          const target = board[row + dir][nc];
          if (target && target.color !== piece.color) {
            moves.push({ row: row + dir, col: nc });
          }
          // En passant
          if (enPassantTarget && enPassantTarget.row === row + dir && enPassantTarget.col === nc) {
            moves.push({ row: row + dir, col: nc });
          }
        }
      }
      break;
    }

    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target || target.color !== piece.color) {
            moves.push({ row: nr, col: nc });
          }
        }
      }
      break;
    }

    case 'bishop': {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: nr, col: nc });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'rook': {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: nr, col: nc });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'queen': {
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];
      for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color !== piece.color) {
              moves.push({ row: nr, col: nc });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'king': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = board[nr][nc];
            if (!target || target.color !== piece.color) {
              moves.push({ row: nr, col: nc });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

export function getCastlingMoves(
  board: (Piece | null)[][],
  color: PieceColor
): { kingside: boolean; queenside: boolean } {
  const result = { kingside: false, queenside: false };
  const row = color === 'white' ? 7 : 0;
  const king = board[row][4];

  if (!king || king.type !== 'king' || king.hasMoved) return result;
  if (isInCheck(board, color)) return result;

  // Kingside castling
  const kingsideRook = board[row][7];
  if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
    if (!board[row][5] && !board[row][6]) {
      const enemy = color === 'white' ? 'black' : 'white';
      if (!isSquareAttacked(board, { row, col: 5 }, enemy) &&
          !isSquareAttacked(board, { row, col: 6 }, enemy)) {
        result.kingside = true;
      }
    }
  }

  // Queenside castling
  const queensideRook = board[row][0];
  if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
    if (!board[row][1] && !board[row][2] && !board[row][3]) {
      const enemy = color === 'white' ? 'black' : 'white';
      if (!isSquareAttacked(board, { row, col: 2 }, enemy) &&
          !isSquareAttacked(board, { row, col: 3 }, enemy)) {
        result.queenside = true;
      }
    }
  }

  return result;
}

export function getValidMoves(
  board: (Piece | null)[][],
  from: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, from, enPassantTarget);
  const validMoves: Position[] = [];

  for (const to of rawMoves) {
    const testBoard = cloneBoard(board);
    testBoard[to.row][to.col] = testBoard[from.row][from.col];
    testBoard[from.row][from.col] = null;

    // Handle en passant capture
    if (piece.type === 'pawn' && enPassantTarget &&
        to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
      const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      testBoard[capturedRow][to.col] = null;
    }

    if (!isInCheck(testBoard, piece.color)) {
      validMoves.push(to);
    }
  }

  // Add castling moves for king
  if (piece.type === 'king' && !piece.hasMoved) {
    const castling = getCastlingMoves(board, piece.color);
    const row = piece.color === 'white' ? 7 : 0;
    if (castling.kingside) {
      validMoves.push({ row, col: 6 });
    }
    if (castling.queenside) {
      validMoves.push({ row, col: 2 });
    }
  }

  return validMoves;
}

export function hasAnyValidMoves(
  board: (Piece | null)[][],
  color: PieceColor,
  enPassantTarget: Position | null
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, enPassantTarget);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function boardToFEN(board: (Piece | null)[][]): string {
  const pieceToChar = (piece: Piece): string => {
    const chars: Record<PieceType, string> = {
      king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p'
    };
    const char = chars[piece.type];
    return piece.color === 'white' ? char.toUpperCase() : char;
  };

  let fen = '';
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += pieceToChar(piece);
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) fen += emptyCount;
    if (row < 7) fen += '/';
  }
  return fen;
}

export function checkThreefoldRepetition(positionHistory: string[]): boolean {
  const counts: Record<string, number> = {};
  for (const pos of positionHistory) {
    counts[pos] = (counts[pos] || 0) + 1;
    if (counts[pos] >= 3) return true;
  }
  return false;
}

export function hasInsufficientMaterial(board: (Piece | null)[][]): boolean {
  const pieces: Piece[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]) {
        pieces.push(board[row][col]!);
      }
    }
  }

  // King vs King
  if (pieces.length === 2) return true;

  // King + Bishop vs King or King + Knight vs King
  if (pieces.length === 3) {
    const nonKings = pieces.filter(p => p.type !== 'king');
    if (nonKings.length === 1) {
      if (nonKings[0].type === 'bishop' || nonKings[0].type === 'knight') {
        return true;
      }
    }
  }

  // King + Bishop vs King + Bishop (same color squares)
  if (pieces.length === 4) {
    const bishops = pieces.filter(p => p.type === 'bishop');
    if (bishops.length === 2) {
      // Simplified: consider it draw if both are bishops
      // Full implementation would check square colors
      return true;
    }
  }

  return false;
}

export function getMoveNotation(move: Move, board: (Piece | null)[][]): string {
  const files = 'abcdefgh';
  const ranks = '87654321';

  if (move.isCastling === 'kingside') return 'O-O';
  if (move.isCastling === 'queenside') return 'O-O-O';

  let notation = '';

  if (move.piece.type !== 'pawn') {
    const pieceChars: Record<PieceType, string> = {
      king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: ''
    };
    notation += pieceChars[move.piece.type];
  }

  if (move.captured || move.isEnPassant) {
    if (move.piece.type === 'pawn') {
      notation += files[move.from.col];
    }
    notation += 'x';
  }

  notation += files[move.to.col] + ranks[move.to.row];

  if (move.promotion) {
    const promoChars: Record<PieceType, string> = {
      queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', king: '', pawn: ''
    };
    notation += '=' + promoChars[move.promotion];
  }

  if (move.isCheckmate) {
    notation += '#';
  } else if (move.isCheck) {
    notation += '+';
  }

  return notation;
}

export function makeMove(
  state: GameState,
  from: Position,
  to: Position,
  promotion?: PieceType
): GameState | null {
  const piece = state.board[from.row][from.col];
  if (!piece || piece.color !== state.currentPlayer) return null;

  const validMoves = getValidMoves(state.board, from, state.enPassantTarget);
  if (!validMoves.some(m => m.row === to.row && m.col === to.col)) return null;

  const newBoard = cloneBoard(state.board);
  const captured = newBoard[to.row][to.col];
  let isEnPassant = false;
  let isCastling: 'kingside' | 'queenside' | undefined;

  // Handle en passant
  if (piece.type === 'pawn' && state.enPassantTarget &&
      to.row === state.enPassantTarget.row && to.col === state.enPassantTarget.col) {
    isEnPassant = true;
    const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    newBoard[capturedRow][to.col] = null;
  }

  // Handle castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      isCastling = 'kingside';
      newBoard[to.row][5] = newBoard[to.row][7];
      newBoard[to.row][7] = null;
      if (newBoard[to.row][5]) newBoard[to.row][5]!.hasMoved = true;
    } else if (to.col === 2) {
      isCastling = 'queenside';
      newBoard[to.row][3] = newBoard[to.row][0];
      newBoard[to.row][0] = null;
      if (newBoard[to.row][3]) newBoard[to.row][3]!.hasMoved = true;
    }
  }

  // Move the piece
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  newBoard[from.row][from.col] = null;

  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = {
      type: promotion || 'queen',
      color: piece.color,
      hasMoved: true
    };
  }

  // Update en passant target
  let newEnPassantTarget: Position | null = null;
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassantTarget = {
      row: (from.row + to.row) / 2,
      col: from.col
    };
  }

  const nextPlayer = state.currentPlayer === 'white' ? 'black' : 'white';
  const isCheck = isInCheck(newBoard, nextPlayer);
  const hasValidMoves = hasAnyValidMoves(newBoard, nextPlayer, newEnPassantTarget);
  const isCheckmate = isCheck && !hasValidMoves;
  const isStalemate = !isCheck && !hasValidMoves;

  // Update position history
  const newPositionHistory = [...state.positionHistory, boardToFEN(newBoard)];

  // Check draw conditions
  let isDraw = false;
  let drawReason: string | undefined;

  if (isStalemate) {
    isDraw = true;
    drawReason = 'Stalemate';
  } else if (checkThreefoldRepetition(newPositionHistory)) {
    isDraw = true;
    drawReason = 'Threefold repetition';
  } else if (hasInsufficientMaterial(newBoard)) {
    isDraw = true;
    drawReason = 'Insufficient material';
  }

  // Update half move clock (for 50 move rule)
  let newHalfMoveClock = state.halfMoveClock + 1;
  if (piece.type === 'pawn' || captured || isEnPassant) {
    newHalfMoveClock = 0;
  }
  if (newHalfMoveClock >= 100) {
    isDraw = true;
    drawReason = 'Fifty-move rule';
  }

  const move: Move = {
    from,
    to,
    piece,
    captured: captured || (isEnPassant ? { type: 'pawn', color: nextPlayer } : undefined),
    isEnPassant,
    isCastling,
    promotion: piece.type === 'pawn' && (to.row === 0 || to.row === 7) ? (promotion || 'queen') : undefined,
    isCheck,
    isCheckmate,
  };
  move.notation = getMoveNotation(move, state.board);

  const newCapturedPieces = { ...state.capturedPieces };
  if (move.captured) {
    const capturedBy = state.currentPlayer;
    newCapturedPieces[capturedBy] = [...newCapturedPieces[capturedBy], move.captured];
  }

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    moveHistory: [...state.moveHistory, move],
    capturedPieces: newCapturedPieces,
    isCheck,
    isCheckmate,
    isStalemate,
    isDraw,
    drawReason,
    enPassantTarget: newEnPassantTarget,
    halfMoveClock: newHalfMoveClock,
    fullMoveNumber: state.currentPlayer === 'black' ? state.fullMoveNumber + 1 : state.fullMoveNumber,
    positionHistory: newPositionHistory,
  };
}

export function getPieceValue(type: PieceType): number {
  const values: Record<PieceType, number> = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  };
  return values[type];
}

export function evaluateBoard(board: (Piece | null)[][]): number {
  let score = 0;

  const pawnTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
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

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        let value = getPieceValue(piece.type);
        let posBonus = 0;

        if (piece.type === 'pawn') {
          posBonus = piece.color === 'white' ? pawnTable[row][col] : pawnTable[7 - row][col];
        } else if (piece.type === 'knight') {
          posBonus = piece.color === 'white' ? knightTable[row][col] : knightTable[7 - row][col];
        }

        const total = value + posBonus;
        score += piece.color === 'white' ? total : -total;
      }
    }
  }

  return score;
}
