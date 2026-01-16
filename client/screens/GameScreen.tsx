import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Alert, Platform, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import ChessBoard from '@/components/ChessBoard';
import PromotionModal from '@/components/PromotionModal';
import GameStatusBanner from '@/components/GameStatusBanner';
import MoveHistory from '@/components/MoveHistory';
import PlayerInfo from '@/components/PlayerInfo';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';
import {
  GameState,
  Position,
  PieceType,
  PieceColor,
  createInitialGameState,
  getValidMoves,
  makeMove,
  findKing,
} from '@/lib/chessLogic';
import { getAIMove, calculatePoints, Difficulty } from '@/lib/chessAI';
import { saveGame, loadGame, deleteSavedGame, recordGameResult } from '@/lib/storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;
type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 700; // Phones smaller than iPhone 11

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameRouteProp>();

  const {
    gameMode = 'pvp',
    difficulty = 'medium',
    playerColor = 'white',
    resumeGame = false,
  } = route.params || {};

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [promotionPending, setPromotionPending] = useState<{
    from: Position;
    to: Position;
    color: PieceColor;
  } | null>(null);
  const [whitePoints, setWhitePoints] = useState(0);
  const [blackPoints, setBlackPoints] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const gameEndedRef = useRef(false);

  const isAIGame = gameMode === 'ai';
  const aiColor = isAIGame ? (playerColor === 'white' ? 'black' : 'white') : null;
  const isPlayerTurn = !isAIGame || gameState.currentPlayer === playerColor;

  useEffect(() => {
    if (resumeGame) {
      loadGame().then((saved) => {
        if (saved) {
          setGameState(saved.gameState);
          setWhitePoints(saved.whitePoints);
          setBlackPoints(saved.blackPoints);
        }
      });
    }
  }, [resumeGame]);

  useEffect(() => {
    if (!gameState.isCheckmate && !gameState.isDraw && !gameState.isStalemate) {
      saveGame({
        gameState,
        gameMode,
        difficulty: isAIGame ? difficulty : undefined,
        playerColor: isAIGame ? playerColor : undefined,
        whitePoints,
        blackPoints,
        savedAt: new Date().toISOString(),
      });
    }
  }, [gameState, whitePoints, blackPoints]);

  useEffect(() => {
    if (
      isAIGame &&
      aiColor &&
      gameState.currentPlayer === aiColor &&
      !gameState.isCheckmate &&
      !gameState.isDraw &&
      !gameState.isStalemate
    ) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const move = getAIMove(gameState, difficulty);
        if (move) {
          const newState = makeMove(gameState, move.from, move.to, move.promotion);
          if (newState) {
            setGameState(newState);
            setBlackPoints(calculatePoints(newState, 'black'));
            setWhitePoints(calculatePoints(newState, 'white'));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        setIsAIThinking(false);
      }, 600 + Math.random() * 600);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, isAIGame, aiColor, difficulty]);

  useEffect(() => {
    if (
      (gameState.isCheckmate || gameState.isDraw || gameState.isStalemate) &&
      !gameEndedRef.current
    ) {
      gameEndedRef.current = true;
      Haptics.notificationAsync(
        gameState.isCheckmate
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );

      deleteSavedGame();

      if (isAIGame) {
        let result: 'win' | 'loss' | 'draw' = 'draw';
        let points = 0;

        if (gameState.isCheckmate) {
          const winner = gameState.currentPlayer === 'white' ? 'black' : 'white';
          if (winner === playerColor) {
            result = 'win';
            points = playerColor === 'white' ? whitePoints : blackPoints;
            points += 20;
          } else {
            result = 'loss';
            points = playerColor === 'white' ? whitePoints : blackPoints;
          }
        } else {
          points = playerColor === 'white' ? whitePoints : blackPoints;
        }

        recordGameResult(result, points);
      }
    }
  }, [gameState.isCheckmate, gameState.isDraw, gameState.isStalemate]);

  const handleSquarePress = useCallback(
    (position: Position) => {
      if (!isPlayerTurn || isAIThinking) return;
      if (gameState.isCheckmate || gameState.isDraw || gameState.isStalemate) return;

      const piece = gameState.board[position.row][position.col];

      if (selectedSquare) {
        const isValidMove = validMoves.some(
          (m) => m.row === position.row && m.col === position.col
        );

        if (isValidMove) {
          const movingPiece = gameState.board[selectedSquare.row][selectedSquare.col];

          if (
            movingPiece?.type === 'pawn' &&
            (position.row === 0 || position.row === 7)
          ) {
            setPromotionPending({
              from: selectedSquare,
              to: position,
              color: movingPiece.color,
            });
            return;
          }

          const newState = makeMove(gameState, selectedSquare, position);
          if (newState) {
            setGameState(newState);
            setWhitePoints(calculatePoints(newState, 'white'));
            setBlackPoints(calculatePoints(newState, 'black'));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          setSelectedSquare(null);
          setValidMoves([]);
        } else if (piece && piece.color === gameState.currentPlayer) {
          setSelectedSquare(position);
          setValidMoves(getValidMoves(gameState.board, position, gameState.enPassantTarget));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      } else if (piece && piece.color === gameState.currentPlayer) {
        setSelectedSquare(position);
        setValidMoves(getValidMoves(gameState.board, position, gameState.enPassantTarget));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [gameState, selectedSquare, validMoves, isPlayerTurn, isAIThinking]
  );

  const handlePromotion = (pieceType: PieceType) => {
    if (!promotionPending) return;

    const newState = makeMove(
      gameState,
      promotionPending.from,
      promotionPending.to,
      pieceType
    );
    if (newState) {
      setGameState(newState);
      setWhitePoints(calculatePoints(newState, 'white'));
      setBlackPoints(calculatePoints(newState, 'black'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setPromotionPending(null);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const handleNewGame = () => {
    Alert.alert(
      'New Game',
      'Are you sure you want to start a new game? Current progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Game',
          style: 'destructive',
          onPress: () => {
            gameEndedRef.current = false;
            setGameState(createInitialGameState());
            setSelectedSquare(null);
            setValidMoves([]);
            setWhitePoints(0);
            setBlackPoints(0);
            deleteSavedGame();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleExit = () => {
    if (gameState.isCheckmate || gameState.isDraw || gameState.isStalemate) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Exit Game',
      'Your game will be saved. You can resume it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() },
      ]
    );
  };

  const kingInCheckPosition = gameState.isCheck
    ? findKing(gameState.board, gameState.currentPlayer)
    : null;

  const lastMove =
    gameState.moveHistory.length > 0
      ? gameState.moveHistory[gameState.moveHistory.length - 1]
      : null;

  const winner = gameState.isCheckmate
    ? gameState.currentPlayer === 'white'
      ? 'black'
      : 'white'
    : undefined;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark
          ? ['#0A1612', '#0D2820', '#0A1612']
          : ['#E8F5E9', '#C8E6C9', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + (isSmallScreen ? Spacing.xs : Spacing.sm),
            paddingBottom: insets.bottom + Spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View entering={FadeIn.delay(100)}>
          <PlayerInfo
            color={isAIGame && playerColor === 'white' ? 'black' : 'white'}
            name={isAIGame && playerColor === 'white' ? `AI (${difficulty})` : 'Player 1'}
            isCurrentTurn={
              gameState.currentPlayer === (isAIGame && playerColor === 'white' ? 'black' : 'white')
            }
            isAI={isAIGame && playerColor === 'white'}
            capturedPieces={gameState.capturedPieces}
            points={isAIGame && playerColor === 'white' ? blackPoints : whitePoints}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.boardContainer}>
          {gameState.isCheck || gameState.isCheckmate || gameState.isDraw || gameState.isStalemate ? (
            <View style={styles.statusBanner}>
              <GameStatusBanner
                isCheck={gameState.isCheck}
                isCheckmate={gameState.isCheckmate}
                isStalemate={gameState.isStalemate}
                isDraw={gameState.isDraw}
                drawReason={gameState.drawReason}
                winner={winner}
                currentPlayer={gameState.currentPlayer}
              />
            </View>
          ) : null}

          <ChessBoard
            board={gameState.board}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            isCheck={gameState.isCheck}
            kingInCheckPosition={kingInCheckPosition}
            onSquarePress={handleSquarePress}
            flipped={isAIGame && playerColor === 'black'}
          />

          {isAIThinking ? (
            <Animated.View style={styles.thinkingContainer}>
              <View style={[styles.thinkingDot, { backgroundColor: ChessColors.emerald }]} />
              <ThemedText style={[styles.thinkingText, { color: ChessColors.emerald }]}>
                AI is thinking...
              </ThemedText>
            </Animated.View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300)}>
          <PlayerInfo
            color={isAIGame && playerColor === 'black' ? 'white' : 'black'}
            name={isAIGame && playerColor === 'black' ? `AI (${difficulty})` : 'Player 2'}
            isCurrentTurn={
              gameState.currentPlayer === (isAIGame && playerColor === 'black' ? 'white' : 'black')
            }
            isAI={isAIGame && playerColor === 'black'}
            capturedPieces={gameState.capturedPieces}
            points={isAIGame && playerColor === 'black' ? whitePoints : blackPoints}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400)} style={styles.moveHistoryContainer}>
          <MoveHistory moves={gameState.moveHistory} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.controls}>
          <AnimatedPressable
            onPress={handleNewGame}
            style={({ pressed }) => [
              styles.controlButton,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="refresh-cw" size={20} color={theme.text} />
            <ThemedText style={styles.controlText}>New Game</ThemedText>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleExit}
            style={({ pressed }) => [
              styles.controlButton,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="home" size={20} color={theme.text} />
            <ThemedText style={styles.controlText}>Exit</ThemedText>
          </AnimatedPressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <PromotionModal
        visible={promotionPending !== null}
        color={promotionPending?.color || 'white'}
        onSelect={handlePromotion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    gap: isSmallScreen ? Spacing.xs : Spacing.sm,
  },
  boardContainer: {
    alignItems: 'center',
  },
  statusBanner: {
    marginBottom: Spacing.sm,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thinkingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moveHistoryContainer: {
    flex: 1,
    minHeight: 50,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  controlText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
