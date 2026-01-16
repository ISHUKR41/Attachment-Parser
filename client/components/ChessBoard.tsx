import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Position, Piece, Move } from '@/lib/chessLogic';
import ChessPiece from './ChessPiece';
import { BorderRadius } from '@/constants/theme';

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
const BOARD_PADDING = 8;
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 400);
const SQUARE_SIZE = (BOARD_SIZE - BOARD_PADDING * 2) / 8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const { theme } = useTheme();

  const handlePress = () => {
    if (piece || isValidMove) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const baseColor = isLight ? theme.boardLight : theme.boardDark;
  
  let overlayColor = 'transparent';
  if (isCheck) {
    overlayColor = theme.check;
  } else if (isSelected) {
    overlayColor = theme.highlight;
  } else if (isLastMove) {
    overlayColor = theme.lastMove;
  }

  return (
    <AnimatedPressable
      entering={FadeIn.delay((row * 8 + col) * 10).duration(200)}
      onPress={handlePress}
      style={[
        styles.square,
        {
          backgroundColor: baseColor,
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
        },
      ]}
    >
      {overlayColor !== 'transparent' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: overlayColor },
          ]}
        />
      ) : null}
      
      {isValidMove ? (
        <Animated.View
          entering={ZoomIn.duration(150)}
          style={[
            styles.validMoveIndicator,
            {
              backgroundColor: piece ? 'transparent' : theme.validMove,
              borderColor: piece ? theme.validMove : 'transparent',
              borderWidth: piece ? 3 : 0,
              width: piece ? SQUARE_SIZE - 4 : SQUARE_SIZE * 0.35,
              height: piece ? SQUARE_SIZE - 4 : SQUARE_SIZE * 0.35,
              borderRadius: piece ? BorderRadius.xs : SQUARE_SIZE * 0.175,
            },
          ]}
        />
      ) : null}

      {piece ? (
        <ChessPiece
          type={piece.type}
          color={piece.color}
          size={SQUARE_SIZE * 0.85}
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
  const { theme } = useTheme();

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
    <View
      style={[
        styles.boardContainer,
        { backgroundColor: theme.backgroundSecondary },
      ]}
    >
      <View style={styles.board}>{renderBoard}</View>
      
      <View style={styles.fileLabels}>
        {(flipped ? 'hgfedcba' : 'abcdefgh').split('').map((file, i) => (
          <View key={file} style={[styles.label, { width: SQUARE_SIZE }]}>
            <Animated.Text
              entering={FadeIn.delay(i * 30)}
              style={[styles.labelText, { color: theme.text, opacity: 0.5 }]}
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
              style={[styles.labelText, { color: theme.text, opacity: 0.5 }]}
            >
              {rank}
            </Animated.Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    width: BOARD_SIZE,
    padding: BOARD_PADDING,
    borderRadius: BorderRadius.lg,
    alignSelf: 'center',
  },
  board: {
    borderRadius: BorderRadius.sm,
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
  },
  fileLabels: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 0,
  },
  rankLabels: {
    position: 'absolute',
    left: -16,
    top: BOARD_PADDING,
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
