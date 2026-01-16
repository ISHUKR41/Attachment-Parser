import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Piece, PieceColor } from '@/lib/chessLogic';
import ChessPiece from './ChessPiece';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing } from '@/constants/theme';

interface CapturedPiecesProps {
  capturedPieces: { white: Piece[]; black: Piece[] };
  playerColor: PieceColor;
}

const PIECE_SIZE = 24;

function calculateMaterialAdvantage(capturedPieces: { white: Piece[]; black: Piece[] }): number {
  const values: Record<string, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0,
  };

  let whiteCaptures = 0;
  let blackCaptures = 0;

  for (const piece of capturedPieces.white) {
    whiteCaptures += values[piece.type];
  }
  for (const piece of capturedPieces.black) {
    blackCaptures += values[piece.type];
  }

  return whiteCaptures - blackCaptures;
}

function sortPieces(pieces: Piece[]): Piece[] {
  const order = ['queen', 'rook', 'bishop', 'knight', 'pawn'];
  return [...pieces].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
}

export default function CapturedPieces({ capturedPieces, playerColor }: CapturedPiecesProps) {
  const { theme } = useTheme();
  const advantage = calculateMaterialAdvantage(capturedPieces);
  const displayAdvantage = playerColor === 'white' ? advantage : -advantage;

  const myCaptures = sortPieces(capturedPieces[playerColor]);
  const opponentCaptures = sortPieces(capturedPieces[playerColor === 'white' ? 'black' : 'white']);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.piecesRow}>
          {myCaptures.map((piece, index) => (
            <Animated.View
              key={`${piece.type}-${index}`}
              entering={FadeIn.delay(index * 50)}
              layout={Layout.springify()}
              style={[styles.piece, index > 0 && styles.overlapping]}
            >
              <ChessPiece
                type={piece.type}
                color={piece.color}
                size={PIECE_SIZE}
              />
            </Animated.View>
          ))}
        </View>
        {displayAdvantage > 0 ? (
          <Animated.View entering={FadeIn}>
            <ThemedText style={[styles.advantage, { color: theme.link }]}>
              +{displayAdvantage}
            </ThemedText>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  piecesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: PIECE_SIZE,
  },
  piece: {
    marginLeft: 0,
  },
  overlapping: {
    marginLeft: -8,
  },
  advantage: {
    fontSize: 14,
    fontWeight: '700',
  },
});
