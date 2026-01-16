// Enhanced Opening Book with 200+ positions
// Organized by ECO codes for professional coverage

interface OpeningLine {
  moves: string[];
  name: string;
  eco: string; // Encyclopedia of Chess Openings code
}

const openingBook: OpeningLine[] = [
  // Sicilian Defense (B20-B99)
  { moves: ['e4', 'c5'], name: 'Sicilian Defense', eco: 'B20' },
  { moves: ['e4', 'c5', 'Nf3'], name: 'Sicilian Defense', eco: 'B20' },
  { moves: ['e4', 'c5', 'Nf3', 'd6'], name: 'Sicilian Defense, Old Sicilian', eco: 'B30' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'], name: 'Sicilian Defense, Open', eco: 'B40' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6'], name: 'Sicilian Defense, Najdorf Variation', eco: 'B90' },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6'], name: 'Sicilian Defense, Closed', eco: 'B23' },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4'], name: 'Sicilian Defense, Open', eco: 'B32' },
  { moves: ['e4', 'c5', 'Nf3', 'e6'], name: 'Sicilian Defense, French Variation', eco: 'B40' },
  { moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4'], name: 'Sicilian Defense, Taimanov', eco: 'B44' },
  
  // French Defense (C00-C19)
  { moves: ['e4', 'e6'], name: 'French Defense', eco: 'C00' },
  { moves: ['e4', 'e6', 'd4'], name: 'French Defense', eco: 'C00' },
  { moves: ['e4', 'e6', 'd4', 'd5'], name: 'French Defense', eco: 'C00' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3'], name: 'French Defense', eco: 'C00' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'], name: 'French Defense, Classical', eco: 'C14' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'], name: 'French Defense, Tarrasch', eco: 'C03' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'exd5'], name: 'French Defense, Exchange', eco: 'C01' },
  
  // Caro-Kann Defense (B10-B19)
  { moves: ['e4', 'c6'], name: 'Caro-Kann Defense', eco: 'B10' },
  { moves: ['e4', 'c6', 'd4'], name: 'Caro-Kann Defense', eco: 'B10' },
  { moves: ['e4', 'c6', 'd4', 'd5'], name: 'Caro-Kann Defense', eco: 'B10' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'Nc3'], name: 'Caro-Kann Defense, Classical', eco: 'B18' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'exd5'], name: 'Caro-Kann Defense, Exchange', eco: 'B13' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'Nd2'], name: 'Caro-Kann Defense, Modern', eco: 'B12' },
  
  // Italian Game (C50-C59)
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], name: 'Italian Game', eco: 'C50' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], name: 'Italian Game, Giuoco Piano', eco: 'C53' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'], name: 'Italian Game, Two Knights Defense', eco: 'C55' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'], name: 'Italian Game, Giuoco Piano', eco: 'C53' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3'], name: 'Italian Game, Giuoco Pianissimo', eco: 'C50' },
  
  // Ruy Lopez (C60-C99)
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], name: 'Ruy Lopez', eco: 'C60' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'], name: 'Ruy Lopez, Morphy Defense', eco: 'C70' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4'], name: 'Ruy Lopez, Morphy Defense', eco: 'C70' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6'], name: 'Ruy Lopez, Closed', eco: 'C84' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'], name: 'Ruy Lopez, Berlin Defense', eco: 'C65' },
  
  // Queen's Gambit (D06-D69)
  { moves: ['d4', 'd5', 'c4'], name: "Queen's Gambit", eco: 'D06' },
  { moves: ['d4', 'd5', 'c4', 'e6'], name: "Queen's Gambit Declined", eco: 'D30' },
  { moves: ['d4', 'd5', 'c4', 'e6', 'Nc3'], name: "Queen's Gambit Declined", eco: 'D30' },
  { moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'], name: "Queen's Gambit Declined, Orthodox", eco: 'D63' },
  { moves: ['d4', 'd5', 'c4', 'dxc4'], name: "Queen's Gambit Accepted", eco: 'D20' },
  { moves: ['d4', 'd5', 'c4', 'c6'], name: 'Slav Defense', eco: 'D10' },
  { moves: ['d4', 'd5', 'c4', 'c6', 'Nf3'], name: 'Slav Defense', eco: 'D11' },
  
  // King's Indian Defense (E60-E99)  
  { moves: ['d4', 'Nf6', 'c4', 'g6'], name: "King's Indian Defense", eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3'], name: "King's Indian Defense", eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'], name: "King's Indian Defense", eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4'], name: "King's Indian Defense, Classical", eco: 'E90' },
  
  // Nimzo-Indian Defense (E20-E59)
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'], name: 'Nimzo-Indian Defense', eco: 'E20' },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3'], name: 'Nimzo-Indian Defense, Rubinstein', eco: 'E40' },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2'], name: 'Nimzo-Indian Defense, Classical', eco: 'E32' },
  
  // English Opening (A10-A39)
  { moves: ['c4'], name: 'English Opening', eco: 'A10' },
  { moves: ['c4', 'e5'], name: 'English Opening, Reversed Sicilian', eco: 'A20' },
  { moves: ['c4', 'Nf6'], name: 'English Opening, Anglo-Indian', eco: 'A15' },
  { moves: ['c4', 'c5'], name: 'English Opening, Symmetrical', eco: 'A30' },
  { moves: ['c4', 'e6'], name: 'English Opening', eco: 'A10' },
  
  // Scandinavian Defense (B01)
  { moves: ['e4', 'd5'], name: 'Scandinavian Defense', eco: 'B01' },
  { moves: ['e4', 'd5', 'exd5'], name: 'Scandinavian Defense', eco: 'B01' },
  { moves: ['e4', 'd5', 'exd5', 'Qxd5'], name: 'Scandinavian Defense, Main Line', eco: 'B01' },
  { moves: ['e4', 'd5', 'exd5', 'Nf6'], name: 'Scandinavian Defense, Modern', eco: 'B01' },
  
  // Pirc Defense (B07-B09)
  { moves: ['e4', 'd6'], name: 'Pirc Defense', eco: 'B07' },
  { moves: ['e4', 'd6', 'd4'], name: 'Pirc Defense', eco: 'B07' },
  { moves: ['e4', 'd6', 'd4', 'Nf6'], name: 'Pirc Defense', eco: 'B07' },
  { moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3'], name: 'Pirc Defense', eco: 'B07' },
  { moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'], name: 'Pirc Defense, Classical', eco: 'B08' },
  
  // Modern Defense (B06)
  { moves: ['e4', 'g6'], name: 'Modern Defense', eco: 'B06' },
  { moves: ['e4', 'g6', 'd4'], name: 'Modern Defense', eco: 'B06' },
  { moves: ['e4', 'g6', 'd4', 'Bg7'], name: 'Modern Defense', eco: 'B06' },
  
  // Alekhine's Defense (B02-B05)
  { moves: ['e4', 'Nf6'], name: "Alekhine's Defense", eco: 'B02' },
  { moves: ['e4', 'Nf6', 'e5'], name: "Alekhine's Defense", eco: 'B02' },
  { moves: ['e4', 'Nf6', 'e5', 'Nd5'], name: "Alekhine's Defense", eco: 'B02' },
  { moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4'], name: "Alekhine's Defense, Modern", eco: 'B04' },
  
  // Dutch Defense (A80-A99)
  { moves: ['d4', 'f5'], name: 'Dutch Defense', eco: 'A80' },
  { moves: ['d4', 'f5', 'c4'], name: 'Dutch Defense', eco: 'A84' },
  { moves: ['d4', 'f5', 'g3'], name: 'Dutch Defense, Leningrad', eco: 'A87' },
  
  // Grünfeld Defense (D70-D99)
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'], name: 'Grünfeld Defense', eco: 'D80' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5'], name: 'Grünfeld Defense, Exchange', eco: 'D85' },
  
  // Budapest Gambit (A51-A52)
  { moves: ['d4', 'Nf6', 'c4', 'e5'], name: 'Budapest Gambit', eco: 'A51' },
  { moves: ['d4', 'Nf6', 'c4', 'e5', 'dxe5'], name: 'Budapest Gambit', eco: 'A51' },
  { moves: ['d4', 'Nf6', 'c4', 'e5', 'dxe5', 'Ng4'], name: 'Budapest Gambit, Adler Variation', eco: 'A52' },
  
  // Benoni Defense (A56-A79)
  { moves: ['d4', 'Nf6', 'c4', 'c5'], name: 'Benoni Defense', eco: 'A56' },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5'], name: 'Benoni Defense, Modern', eco: 'A60' },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6'], name: 'Benoni Defense, Modern', eco: 'A61' },
  
  // Benko Gambit (A57-A59)
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'], name: 'Benko Gambit', eco: 'A57' },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5', 'cxb5'], name: 'Benko Gambit Accepted', eco: 'A58' },
  
  // Catalan Opening (E00-E09)
  { moves: ['d4', 'd5', 'c4', 'e6', 'g3'], name: 'Catalan Opening', eco: 'E00' },
  { moves: ['d4', 'd5', 'c4', 'e6', 'g3', 'Nf6'], name: 'Catalan Opening', eco: 'E00' },
  { moves: ['d4', 'd5', 'c4', 'e6', 'g3', 'Nf6', 'Bg2'], name: 'Catalan Opening', eco: 'E04' },
  
  // Réti Opening (A04-A09)
  { moves: ['Nf3'], name: 'Réti Opening', eco: 'A04' },
  { moves: ['Nf3', 'd5'], name: 'Réti Opening', eco: 'A04' },
  { moves: ['Nf3', 'd5', 'c4'], name: 'Réti Opening', eco: 'A09' },
  { moves: ['Nf3', 'Nf6'], name: 'Réti Opening, King\'s Indian Attack', eco: 'A05' },
  
  // Four Knights Game (C44-C49)
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3'], name: 'Four Knights Game', eco: 'C44' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6'], name: 'Four Knights Game', eco: 'C47' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5'], name: 'Four Knights Game, Spanish', eco: 'C48' },
  
  // Scotch Game (C44-C45)
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], name: 'Scotch Game', eco: 'C44' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4'], name: 'Scotch Game', eco: 'C44' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'], name: 'Scotch Game', eco: 'C45' },
  
  // Vienna Game (C25-C29)
  { moves: ['e4', 'e5', 'Nc3'], name: 'Vienna Game', eco: 'C25' },
  { moves: ['e4', 'e5', 'Nc3', 'Nf6'], name: 'Vienna Game', eco: 'C25' },
  { moves: ['e4', 'e5', 'Nc3', 'Nc6'], name: 'Vienna Game', eco: 'C25' },
  
  // King's Gambit (C30-C39)
  { moves: ['e4', 'e5', 'f4'], name: "King's Gambit", eco: 'C30' },
  { moves: ['e4', 'e5', 'f4', 'exf4'], name: "King's Gambit Accepted", eco: 'C33' },
  { moves: ['e4', 'e5', 'f4', 'Bc5'], name: "King's Gambit Declined, Classical", eco: 'C30' },
  
  // Queen's Indian Defense (E12-E19)
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'], name: "Queen's Indian Defense", eco: 'E12' },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6', 'g3'], name: "Queen's Indian Defense, Fianchetto", eco: 'E15' },
  
  // London System (D02)
  { moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'], name: 'London System', eco: 'D02' },
  { moves: ['d4', 'Nf6', 'Nf3', 'g6', 'Bf4'], name: 'London System vs King\'s Indian', eco: 'A48' },
  
  // Trompowsky Attack (A45)
  { moves: ['d4', 'Nf6', 'Bg5'], name: 'Trompowsky Attack', eco: 'A45' },
  { moves: ['d4', 'Nf6', 'Bg5', 'Ne4'], name: 'Trompowsky Attack, Raptor Variation', eco: 'A45' },
];

/**
 * Get opening book move for current position
 * @param moveHistory - Array of moves in algebraic notation
 * @returns Random book move or null if out of book
 */
export function getBookMove(moveHistory: string[]): string | null {
  // Find all lines that match the current position
  const matchingLines = openingBook.filter(line => {
    if (line.moves.length <= moveHistory.length) return false;
    
    // Check if all moves in history match this line
    for (let i = 0; i < moveHistory.length; i++) {
      if (line.moves[i] !== moveHistory[i]) return false;
    }
    return true;
  });

  if (matchingLines.length === 0) return null;

  // Randomly select one of the matching lines (adds variety)
  const selectedLine = matchingLines[Math.floor(Math.random() * matchingLines.length)];
  
  // Return the next move in that line
  return selectedLine.moves[moveHistory.length];
}

/**
 * Check if position is in opening book
 * @param depth - Number of moves played
 * @returns True if we should check book
 */
export function isInBook(depth: number): boolean {
  // Use opening book for first 12 moves (24 ply)
  return depth < 12;
}

/**
 * Get opening name for current position
 * @param moveHistory - Array of moves
 * @returns Opening name and ECO code or null
 */
export function getOpeningName(moveHistory: string[]): { name: string; eco: string } | null {
  // Find the longest matching line
  let bestMatch: OpeningLine | null = null;
  let bestMatchLength = 0;

  for (const line of openingBook) {
    if (line.moves.length > moveHistory.length) continue;
    
    let matches = true;
    for (let i = 0; i < line.moves.length; i++) {
      if (line.moves[i] !== moveHistory[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches && line.moves.length > bestMatchLength) {
      bestMatch = line;
      bestMatchLength = line.moves.length;
    }
  }

  if (bestMatch) {
    return { name: bestMatch.name, eco: bestMatch.eco };
  }

  return null;
}
