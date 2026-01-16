import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';
import { PieceColor } from '@/lib/chessLogic';

interface GameStatusBannerProps {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?: string;
  winner?: PieceColor;
  currentPlayer: PieceColor;
}

export default function GameStatusBanner({
  isCheck,
  isCheckmate,
  isStalemate,
  isDraw,
  drawReason,
  winner,
  currentPlayer,
}: GameStatusBannerProps) {
  const { theme } = useTheme();

  if (!isCheck && !isCheckmate && !isStalemate && !isDraw) {
    return null;
  }

  let message = '';
  let iconName: keyof typeof Feather.glyphMap = 'alert-circle';
  let backgroundColor = theme.link;

  if (isCheckmate) {
    message = `Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!`;
    iconName = 'award';
    backgroundColor = ChessColors.gold;
  } else if (isStalemate) {
    message = 'Stalemate! Game is a draw.';
    iconName = 'minus-circle';
    backgroundColor = theme.backgroundTertiary;
  } else if (isDraw) {
    message = `Draw: ${drawReason}`;
    iconName = 'minus-circle';
    backgroundColor = theme.backgroundTertiary;
  } else if (isCheck) {
    message = `${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    iconName = 'alert-triangle';
    backgroundColor = '#DC3545';
  }

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      exiting={FadeOutUp}
      style={[styles.container, { backgroundColor }]}
    >
      <Feather name={iconName} size={20} color="#FFFFFF" />
      <ThemedText style={styles.text}>{message}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
