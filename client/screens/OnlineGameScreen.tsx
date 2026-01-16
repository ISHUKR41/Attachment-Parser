import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebSocket } from '@/hooks/useWebSocket';
import ChessBoard from '@/components/ChessBoard';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import {
  GameState,
  createInitialGameState,
  makeMove,
  Position,
  PieceType,
} from '@/lib/chessLogic';
import { Spacing } from '@/constants/theme';
import Constants from 'expo-constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnlineGame'>;
type OnlineGameRouteProp = RouteProp<RootStackParamList, 'OnlineGame'>;

export default function OnlineGameScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OnlineGameRouteProp>();

  const { roomId, playerColor, opponent } = route.params;

  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(true);

  // WebSocket connection
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 
                `ws://${Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost'}:5000`;

  const { isConnected, send, subscribe } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  });

  // Subscribe to opponent moves
  useEffect(() => {
    const unsubscribeMove = subscribe('move', (data) => {
      if (data.move) {
        const { from, to, promotion } = data.move;
        const newState = makeMove(gameState, from, to, promotion);
        if (newState) {
          setGameState(newState);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    });

    const unsubscribeDisconnect = subscribe('opponent_disconnected', () => {
      setOpponentConnected(false);
      Alert.alert(
        'Opponent Disconnected',
        'Your opponent has left the game.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    });

    const unsubscribeGameOver = subscribe('game_over', (data) => {
      Alert.alert(
        'Game Over',
        `Result: ${data.result}\nWinner: ${data.winner || 'Draw'}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    });

    return () => {
      unsubscribeMove();
      unsubscribeDisconnect();
      unsubscribeGameOver();
    };
  }, [subscribe, gameState, navigation]);

  // Handle game end
  useEffect(() => {
    if (gameState.isCheckmate || gameState.isDraw) {
      const winner = gameState.isCheckmate
        ? gameState.currentPlayer === 'white' ? 'black' : 'white'
        : null;

      send({
        type: 'game_over',
        roomId,
        result: gameState.isCheckmate ? 'checkmate' : 'draw',
        winner,
      });

      setTimeout(() => {
        Alert.alert(
          'Game Over',
          gameState.isCheckmate
            ? `Checkmate! ${winner === playerColor ? 'You' : opponent.username} won!`
            : `Draw! ${gameState.drawReason || 'Game ended in a draw'}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 500);
    }
  }, [gameState.isCheckmate, gameState.isDraw]);

  const handleSquarePress = useCallback(
    (row: number, col: number) => {
      // Only allow moves when it's the player's turn
      if (gameState.currentPlayer !== playerColor) {
        return;
      }

      const position: Position = { row, col };
      const piece = gameState.board[row][col];

      // If no square is selected
      if (!selectedSquare) {
        // Select square if it has player's piece
        if (piece && piece.color === playerColor) {
          setSelectedSquare(position);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return;
      }

      // If clicking the same square, deselect
      if (selectedSquare.row === row && selectedSquare.col === col) {
        setSelectedSquare(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }

      // If selecting another piece of the same color
      if (piece && piece.color === playerColor) {
        setSelectedSquare(position);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }

      // Try to make a move
      const selectedPiece = gameState.board[selectedSquare.row][selectedSquare.col];
      
      // Check for pawn promotion
      let promotion: PieceType | undefined;
      if (selectedPiece?.type === 'pawn' && (row === 0 || row === 7)) {
        promotion = 'queen'; // Auto-promote to queen for online games
      }

      const newState = makeMove(gameState, selectedSquare, position, promotion);

      if (newState) {
        setGameState(newState);
        setSelectedSquare(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Send move to opponent
        send({
          type: 'move',
          roomId,
          moveData: {
            from: selectedSquare,
            to: position,
            promotion,
          },
          gameState: newState,
        });
      } else {
        // Invalid move
        setSelectedSquare(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [gameState, selectedSquare, playerColor, send, roomId]
  );

  const handleResign = () => {
    Alert.alert(
      'Resign Game',
      'Are you sure you want to resign?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resign',
          style: 'destructive',
          onPress: () => {
            send({
              type: 'game_over',
              roomId,
              result: 'resignation',
              winner: playerColor === 'white' ? 'black' : 'white',
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark
          ? ['#0C1A15', '#15312A', '#0C1A15']
          : ['#E8F5E9', '#C8E6C9', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.md }]}>
        {/* Opponent Info */}
        <Animated.View entering={FadeIn} style={styles.playerInfo}>
          <View style={styles.playerCard}>
            <ThemedText style={styles.playerName}>
              {opponent.username}
            </ThemedText>
            <ThemedText style={[styles.playerRating, { color: theme.textSecondary }]}>
              Rating: {opponent.rating}
            </ThemedText>
            {!opponentConnected && (
              <ThemedText style={[styles.disconnected, { color: theme.error }]}>
                Disconnected
              </ThemedText>
            )}
          </View>
          {gameState.currentPlayer !== playerColor && (
            <ThemedText style={[styles.turnIndicator, { color: theme.accent }]}>
              Opponent's Turn
            </ThemedText>
          )}
        </Animated.View>

        {/* Chess Board */}
        <View style={styles.boardContainer}>
          <ChessBoard
            board={gameState.board}
            onSquarePress={handleSquarePress}
            selectedSquare={selectedSquare}
            lastMove={gameState.moveHistory[gameState.moveHistory.length - 1]}
            playerColor={playerColor}
            isCheck={gameState.isCheck}
          />
        </View>

        {/* Player Info */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.playerInfo}>
          {gameState.currentPlayer === playerColor && (
            <ThemedText style={[styles.turnIndicator, { color: theme.success }]}>
              Your Turn
            </ThemedText>
          )}
          <View style={styles.playerCard}>
            <ThemedText style={styles.playerName}>You</ThemedText>
            <ThemedText style={[styles.playerRating, { color: theme.textSecondary }]}>
              Playing as {playerColor}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.buttonRow}>
            <View
              style={[
                styles.resignButton,
                { backgroundColor: theme.error },
              ]}
            >
              <ThemedText
                style={styles.resignButtonText}
                onPress={handleResign}
              >
                Resign
              </ThemedText>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.connectionBanner, { backgroundColor: theme.error }]}
        >
          <ThemedText style={styles.connectionText}>
            Connection lost... Reconnecting
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  playerInfo: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
  },
  playerRating: {
    fontSize: 14,
  },
  disconnected: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  turnIndicator: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  resignButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  resignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  connectionBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
