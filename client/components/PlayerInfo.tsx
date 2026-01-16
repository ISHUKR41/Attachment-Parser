import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { PieceColor, Piece } from '@/lib/chessLogic';
import { ThemedText } from './ThemedText';
import CapturedPieces from './CapturedPieces';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';

interface PlayerInfoProps {
  color: PieceColor;
  name: string;
  isCurrentTurn: boolean;
  isAI?: boolean;
  capturedPieces: { white: Piece[]; black: Piece[] };
  points: number;
}

export default function PlayerInfo({
  color,
  name,
  isCurrentTurn,
  isAI,
  capturedPieces,
  points,
}: PlayerInfoProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.container,
        {
          backgroundColor: isCurrentTurn
            ? theme.backgroundSecondary
            : theme.backgroundDefault,
          borderColor: isCurrentTurn ? ChessColors.gold : 'transparent',
          borderWidth: isCurrentTurn ? 2 : 0,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.colorIndicator,
            {
              backgroundColor: color === 'white' ? '#FEFEFE' : '#2A2A2A',
              borderColor: color === 'white' ? '#2A2A2A' : '#4A4A4A',
            },
          ]}
        />
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.name}>{name}</ThemedText>
            {isAI ? (
              <Feather name="cpu" size={14} color={theme.text} style={{ opacity: 0.5 }} />
            ) : null}
          </View>
          <CapturedPieces capturedPieces={capturedPieces} playerColor={color} />
        </View>
      </View>

      <View style={styles.rightSection}>
        <ThemedText style={[styles.points, { color: ChessColors.gold }]}>
          {points} pts
        </ThemedText>
        {isCurrentTurn ? (
          <View style={[styles.turnIndicator, { backgroundColor: ChessColors.emerald }]}>
            <ThemedText style={styles.turnText}>Your Turn</ThemedText>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
  },
  turnIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  turnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
