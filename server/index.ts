import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Store active game rooms and waiting players
interface Player {
  id: string;
  ws: WebSocket;
  username: string;
  rating: number;
  isSearching: boolean;
}

interface GameRoom {
  id: string;
  whitePlayer: Player;
  blackPlayer: Player;
  gameState: any;
  createdAt: number;
}

const players = new Map<string, Player>();
const gameRooms = new Map<string, GameRoom>();
const matchmakingQueue: Player[] = [];

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Find a match within rating range
function findMatch(player: Player): Player | null {
  const ratingRange = 100; // ±100 rating points
  
  for (let i = 0; i < matchmakingQueue.length; i++) {
    const opponent = matchmakingQueue[i];
    if (opponent.id !== player.id) {
      const ratingDiff = Math.abs(player.rating - opponent.rating);
      if (ratingDiff <= ratingRange) {
        matchmakingQueue.splice(i, 1); // Remove from queue
        return opponent;
      }
    }
  }
  return null;
}

// Create a new game room
function createGameRoom(player1: Player, player2: Player): GameRoom {
  const roomId = generateId();
  
  // Randomly assign colors
  const isPlayer1White = Math.random() < 0.5;
  const whitePlayer = isPlayer1White ? player1 : player2;
  const blackPlayer = isPlayer1White ? player2 : player1;

  const room: GameRoom = {
    id: roomId,
    whitePlayer,
    blackPlayer,
    gameState: null,
    createdAt: Date.now(),
  };

  gameRooms.set(roomId, room);
  
  // Notify both players
  const gameStartMessage = {
    type: 'game_start',
    roomId,
    playerColor: isPlayer1White ? 'white' : 'black',
    opponent: {
      username: player2.username,
      rating: player2.rating,
    },
  };

  const gameStartMessage2 = {
    type: 'game_start',
    roomId,
    playerColor: isPlayer1White ? 'black' : 'white',
    opponent: {
      username: player1.username,
      rating: player1.rating,
    },
  };

  player1.ws.send(JSON.stringify(gameStartMessage));
  player2.ws.send(JSON.stringify(gameStartMessage2));

  return room;
}

// Broadcast move to opponent
function broadcastMove(roomId: string, senderId: string, moveData: any) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const opponent = room.whitePlayer.id === senderId ? room.blackPlayer : room.whitePlayer;
  
  const message = {
    type: 'move',
    move: moveData,
  };

  if (opponent.ws.readyState === WebSocket.OPEN) {
    opponent.ws.send(JSON.stringify(message));
  }
}

// Handle WebSocket connections
wss.on('connection', (ws: WebSocket) => {
  const playerId = generateId();
  console.log(`Player connected: ${playerId}`);

  let currentPlayer: Player | null = null;

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'register':
          // Register new player
          currentPlayer = {
            id: playerId,
            ws,
            username: message.username || `Player${playerId.substring(0, 6)}`,
            rating: message.rating || 1200,
            isSearching: false,
          };
          players.set(playerId, currentPlayer);
          
          ws.send(JSON.stringify({
            type: 'registered',
            playerId,
            username: currentPlayer.username,
            rating: currentPlayer.rating,
          }));
          break;

        case 'find_match':
          // Join matchmaking queue
          if (!currentPlayer) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not registered' }));
            return;
          }

          currentPlayer.isSearching = true;
          
          // Try to find immediate match
          const opponent = findMatch(currentPlayer);
          
          if (opponent) {
            // Match found!
            createGameRoom(currentPlayer, opponent);
          } else {
            // Add to queue
            matchmakingQueue.push(currentPlayer);
            ws.send(JSON.stringify({ type: 'searching' }));
          }
          break;

        case 'cancel_search':
          if (currentPlayer) {
            currentPlayer.isSearching = false;
            const queueIndex = matchmakingQueue.findIndex(p => p.id === playerId);
            if (queueIndex !== -1) {
              matchmakingQueue.splice(queueIndex, 1);
            }
            ws.send(JSON.stringify({ type: 'search_cancelled' }));
          }
          break;

        case 'move':
          // Broadcast move to opponent
          if (message.roomId) {
            broadcastMove(message.roomId, playerId, message.moveData);
            
            // Update game state
            const room = gameRooms.get(message.roomId);
            if (room) {
              room.gameState = message.gameState;
            }
          }
          break;

        case 'game_over':
          // Handle game end
          if (message.roomId) {
            const room = gameRooms.get(message.roomId);
            if (room) {
              const opponent = room.whitePlayer.id === playerId ? room.blackPlayer : room.whitePlayer;
              
              if (opponent.ws.readyState === WebSocket.OPEN) {
                opponent.ws.send(JSON.stringify({
                  type: 'game_over',
                  result: message.result,
                  winner: message.winner,
                }));
              }
              
              // Clean up room
              gameRooms.delete(message.roomId);
            }
          }
          break;

        case 'chat':
          // Send chat message to opponent
          if (message.roomId) {
            const room = gameRooms.get(message.roomId);
            if (room) {
              const opponent = room.whitePlayer.id === playerId ? room.blackPlayer : room.whitePlayer;
              
              if (opponent.ws.readyState === WebSocket.OPEN) {
                opponent.ws.send(JSON.stringify({
                  type: 'chat',
                  message: message.text,
                  sender: currentPlayer?.username,
                }));
              }
            }
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log(`Player disconnected: ${playerId}`);
    
    // Remove from matchmaking queue
    const queueIndex = matchmakingQueue.findIndex(p => p.id === playerId);
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1);
    }

    // Notify opponent if in game
    gameRooms.forEach((room, roomId) => {
      if (room.whitePlayer.id === playerId || room.blackPlayer.id === playerId) {
        const opponent = room.whitePlayer.id === playerId ? room.blackPlayer : room.whitePlayer;
        
        if (opponent.ws.readyState === WebSocket.OPEN) {
          opponent.ws.send(JSON.stringify({
            type: 'opponent_disconnected',
          }));
        }
        
        gameRooms.delete(roomId);
      }
    });

    players.delete(playerId);
  });

  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
  });
});

// Proxy requests to Expo dev server (for development)
if (process.env.NODE_ENV === 'development') {
  const EXPO_PORT = 8081;
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${EXPO_PORT}`,
    changeOrigin: true,
    ws: false, // Don't proxy WebSocket, we handle it separately
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    players: players.size,
    activeGames: gameRooms.size,
    queueLength: matchmakingQueue.length,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Chess server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Cleanup old game rooms (after 2 hours of inactivity)
setInterval(() => {
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  
  gameRooms.forEach((room, roomId) => {
    if (now - room.createdAt > TWO_HOURS) {
      console.log(`Cleaning up old game room: ${roomId}`);
      gameRooms.delete(roomId);
    }
  });
}, 30 * 60 * 1000); // Check every 30 minutes
