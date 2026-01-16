import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { theme, isDark } = useTheme();

  return (
    <Animated.View entering={FadeIn} style={styles.outerContainer}>
      <LinearGradient
        colors={
          isCurrentTurn
            ? isDark
              ? ['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.08)']
              : ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']
            : isDark
            ? [theme.backgroundDefault, theme.backgroundSecondary]
            : [theme.backgroundDefault, theme.backgroundSecondary]
        }
        style={[
          styles.container,
          {
            borderColor: isCurrentTurn ? ChessColors.gold : 'transparent',
            borderWidth: isCurrentTurn ? 2 : 0,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.leftSection}>
          <LinearGradient
            colors={color === 'white' ? ['#FFFFFF', '#E8E8E8'] : ['#3A3A3A', '#1A1A1A']}
            style={[
              styles.colorIndicator,
              { borderColor: color === 'white' ? '#CCCCCC' : '#444444' },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.name}>{name}</ThemedText>
              {isAI ? (
                <View style={[styles.aiBadge, { backgroundColor: `${ChessColors.emerald}20` }]}>
                  <Feather name="cpu" size={12} color={ChessColors.emerald} />
                </View>
              ) : null}
            </View>
            <CapturedPieces capturedPieces={capturedPieces} playerColor={color} />
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.pointsContainer}>
            <Feather name="award" size={14} color={ChessColors.gold} />
            <ThemedText style={[styles.points, { color: ChessColors.gold }]}>
              {points}
            </ThemedText>
          </View>
          {isCurrentTurn ? (
            <LinearGradient
              colors={[ChessColors.emerald, ChessColors.emeraldDark]}
              style={styles.turnIndicator}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.turnText}>Your Turn</ThemedText>
            </LinearGradient>
          ) : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  colorIndicator: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  points: {
    fontSize: 16,
    fontWeight: '800',
  },
  turnIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  turnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
