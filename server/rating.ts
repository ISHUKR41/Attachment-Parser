// ELO Rating System Implementation
// K-factor determines how much ratings change per game

const K_FACTOR = 32; // Standard chess K-factor
const K_FACTOR_NEW = 40; // Higher for new players (< 30 games)
const K_FACTOR_STRONG = 24; // Lower for strong players (>2400)

/**
 * Calculate expected score for a player
 * @param playerRating - Current rating of the player
 * @param opponentRating - Current rating of the opponent
 * @returns Expected score between 0 and 1
 */
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Determine K-factor based on player rating and games played
 * @param rating - Current rating
 * @param gamesPlayed - Number of games played
 * @returns Appropriate K-factor
 */
function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return K_FACTOR_NEW;
  if (rating >= 2400) return K_FACTOR_STRONG;
  return K_FACTOR;
}

/**
 * Calculate new rating after a game
 * @param currentRating - Player's current rating
 * @param opponentRating - Opponent's rating
 * @param score - Actual score (1 = win, 0.5 = draw, 0 = loss)
 * @param gamesPlayed - Number of games player has played
 * @returns New rating (rounded to nearest integer)
 */
export function calculateNewRating(
  currentRating: number,
  opponentRating: number,
  score: number, // 1 = win, 0.5 = draw, 0 = loss
  gamesPlayed: number = 100
): number {
  const expectedScore = calculateExpectedScore(currentRating, opponentRating);
  const kFactor = getKFactor(currentRating, gamesPlayed);
  const newRating = currentRating + kFactor * (score - expectedScore);
  
  // Minimum rating is 100, maximum is 3000
  return Math.max(100, Math.min(3000, Math.round(newRating)));
}

/**
 * Calculate rating changes for both players after a game
 * @param player1Rating - First player's rating
 * @param player2Rating - Second player's rating
 * @param result - Game result ('player1_win', 'player2_win', 'draw')
 * @param player1GamesPlayed - Number of games player 1 has played
 * @param player2GamesPlayed - Number of games player 2 has played
 * @returns Object with new ratings for both players
 */
export function calculateRatingChanges(
  player1Rating: number,
  player2Rating: number,
  result: 'player1_win' | 'player2_win' | 'draw',
  player1GamesPlayed: number = 100,
  player2GamesPlayed: number = 100
): {
  player1NewRating: number;
  player2NewRating: number;
  player1Change: number;
  player2Change: number;
} {
  let player1Score: number;
  let player2Score: number;

  switch (result) {
    case 'player1_win':
      player1Score = 1;
      player2Score = 0;
      break;
    case 'player2_win':
      player1Score = 0;
      player2Score = 1;
      break;
    case 'draw':
      player1Score = 0.5;
      player2Score = 0.5;
      break;
  }

  const player1NewRating = calculateNewRating(
    player1Rating,
    player2Rating,
    player1Score,
    player1GamesPlayed
  );
  const player2NewRating = calculateNewRating(
    player2Rating,
    player1Rating,
    player2Score,
    player2GamesPlayed
  );

  return {
    player1NewRating,
    player2NewRating,
    player1Change: player1NewRating - player1Rating,
    player2Change: player2NewRating - player2Rating,
  };
}

/**
 * Calculate AI opponent rating based on difficulty
 * @param difficulty - AI difficulty level
 * @returns Estimated ELO rating for that difficulty
 */
export function getAIRating(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): number {
  switch (difficulty) {
    case 'easy':
      return 800; // Beginner level
    case 'medium':
      return 1400; // Intermediate
    case 'hard':
      return 1900; // Advanced
    case 'expert':
      return 2400; // Expert level
    default:
      return 1200;
  }
}
