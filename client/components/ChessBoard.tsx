import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeIn,
  ZoomIn,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Position, Piece, Move } from '@/lib/chessLogic';
import ChessPiece from './ChessPiece';
import { BorderRadius, ChessColors } from '@/constants/theme';

interface ChessBoardProps {
  board: (Piece | null)[][];
  selectedSquare: Position | null;
  validMoves: Position[];
  lastMove: Move | null;
  isCheck: boolean;
  kingInCheckPosition: Position | null;
  onSquarePress: (position: Position) => void;
  flipped?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_PADDING = 12;
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 40, 380);
const SQUARE_SIZE = (BOARD_SIZE - BOARD_PADDING * 2) / 8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LIGHT_SQUARE_COLORS = ['#F0E4D4', '#E8D8C4'];
const DARK_SQUARE_COLORS = ['#1B7A5C', '#166B50'];
const SELECTED_COLORS = ['#FFD700', '#DAA520'];
const LAST_MOVE_COLORS = ['rgba(27, 122, 92, 0.4)', 'rgba(27, 122, 92, 0.3)'];
const CHECK_COLORS = ['#FF4444', '#CC0000'];
const VALID_MOVE_COLOR = 'rgba(46, 204, 155, 0.7)';

function Square({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  isCheck,
  onPress,
}: {
  row: number;
  col: number;
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onPress: () => void;
}) {
  const handlePress = () => {
    if (piece || isValidMove) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getSquareColors = () => {
    if (isCheck) return CHECK_COLORS;
    if (isSelected) return SELECTED_COLORS;
    if (isLastMove) return isLight ? ['#A8D5BA', '#98C8AB'] : ['#2A8A6A', '#1F7A5A'];
    return isLight ? LIGHT_SQUARE_COLORS : DARK_SQUARE_COLORS;
  };

  const squareColors = getSquareColors();

  return (
    <AnimatedPressable
      entering={FadeIn.delay((row * 8 + col) * 8).duration(150)}
      onPress={handlePress}
      style={[styles.square, { width: SQUARE_SIZE, height: SQUARE_SIZE }]}
    >
      <LinearGradient
        colors={squareColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {isValidMove ? (
        <Animated.View
          entering={ZoomIn.duration(150)}
          style={[
            styles.validMoveIndicator,
            {
              backgroundColor: piece ? 'transparent' : VALID_MOVE_COLOR,
              borderColor: piece ? VALID_MOVE_COLOR : 'transparent',
              borderWidth: piece ? 4 : 0,
              width: piece ? SQUARE_SIZE - 4 : SQUARE_SIZE * 0.38,
              height: piece ? SQUARE_SIZE - 4 : SQUARE_SIZE * 0.38,
              borderRadius: piece ? BorderRadius.xs : SQUARE_SIZE * 0.19,
            },
          ]}
        />
      ) : null}

      {piece ? (
        <ChessPiece
          type={piece.type}
          color={piece.color}
          size={SQUARE_SIZE * 0.88}
          isSelected={isSelected}
        />
      ) : null}
    </AnimatedPressable>
  );
}

export default function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  lastMove,
  isCheck,
  kingInCheckPosition,
  onSquarePress,
  flipped = false,
}: ChessBoardProps) {
  const { theme, isDark } = useTheme();

  const renderBoard = useMemo(() => {
    const rows = [];
    const rowOrder = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    for (const row of rowOrder) {
      const squares = [];
      for (const col of colOrder) {
        const isLight = (row + col) % 2 === 0;
        const piece = board[row][col];
        const position = { row, col };
        const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
        const isValidMove = validMoves.some(m => m.row === row && m.col === col);
        const isLastMove =
          (lastMove?.from.row === row && lastMove?.from.col === col) ||
          (lastMove?.to.row === row && lastMove?.to.col === col);
        const isCheckSquare =
          isCheck &&
          kingInCheckPosition?.row === row &&
          kingInCheckPosition?.col === col;

        squares.push(
          <Square
            key={`${row}-${col}`}
            row={row}
            col={col}
            piece={piece}
            isLight={isLight}
            isSelected={isSelected}
            isValidMove={isValidMove}
            isLastMove={isLastMove}
            isCheck={isCheckSquare}
            onPress={() => onSquarePress(position)}
          />
        );
      }
      rows.push(
        <View key={row} style={styles.row}>
          {squares}
        </View>
      );
    }
    return rows;
  }, [board, selectedSquare, validMoves, lastMove, isCheck, kingInCheckPosition, flipped, onSquarePress]);

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={isDark ? ['#2A4A3A', '#1A3A2A', '#0A2A1A'] : ['#8B7355', '#6B5344', '#5B4334']}
        style={styles.boardFrame}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.innerBorder}>
          <View style={styles.board}>{renderBoard}</View>
        </View>

        <View style={styles.fileLabels}>
          {(flipped ? 'hgfedcba' : 'abcdefgh').split('').map((file, i) => (
            <View key={file} style={[styles.label, { width: SQUARE_SIZE }]}>
              <Animated.Text
                entering={FadeIn.delay(i * 30)}
                style={styles.labelText}
              >
                {file}
              </Animated.Text>
            </View>
          ))}
        </View>

        <View style={styles.rankLabels}>
          {(flipped ? '12345678' : '87654321').split('').map((rank, i) => (
            <View key={rank} style={[styles.label, { height: SQUARE_SIZE }]}>
              <Animated.Text
                entering={FadeIn.delay(i * 30)}
                style={styles.labelText}
              >
                {rank}
              </Animated.Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  boardFrame: {
    padding: BOARD_PADDING,
    borderRadius: BorderRadius.xl,
  },
  innerBorder: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  board: {
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  validMoveIndicator: {
    position: 'absolute',
    zIndex: 1,
  },
  fileLabels: {
    flexDirection: 'row',
    marginTop: 6,
    marginLeft: 0,
  },
  rankLabels: {
    position: 'absolute',
    left: -2,
    top: BOARD_PADDING,
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
});
