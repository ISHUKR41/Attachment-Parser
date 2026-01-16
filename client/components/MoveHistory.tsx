import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Move } from '@/lib/chessLogic';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';

interface MoveHistoryProps {
  moves: Move[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const { theme, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <View style={styles.outerContainer}>
        <LinearGradient
          colors={isDark
            ? [theme.backgroundDefault, theme.backgroundSecondary]
            : [theme.backgroundDefault, theme.backgroundSecondary]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.emptyContainer}>
            <Feather name="list" size={18} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No moves yet - start playing!
            </ThemedText>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const movePairs: { number: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i]?.notation,
      black: moves[i + 1]?.notation,
    });
  }

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={isDark
          ? [theme.backgroundDefault, theme.backgroundSecondary]
          : [theme.backgroundDefault, theme.backgroundSecondary]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Feather name="list" size={14} color={theme.textSecondary} />
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Move History
          </ThemedText>
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {movePairs.map((pair, index) => {
            const isLatest = index === movePairs.length - 1;
            return (
              <Animated.View
                key={pair.number}
                entering={FadeIn.delay(index * 30)}
                layout={Layout.springify()}
                style={[
                  styles.movePair,
                  isLatest && { backgroundColor: `${ChessColors.emerald}15`, borderRadius: BorderRadius.sm },
                  isLatest && { paddingHorizontal: Spacing.sm },
                ]}
              >
                <ThemedText style={[styles.moveNumber, { color: theme.textSecondary }]}>
                  {pair.number}.
                </ThemedText>
                <ThemedText
                  style={[
                    styles.move,
                    isLatest && !pair.black && { color: ChessColors.emerald, fontWeight: '700' },
                  ]}
                >
                  {pair.white}
                </ThemedText>
                {pair.black ? (
                  <ThemedText
                    style={[
                      styles.move,
                      isLatest && { color: ChessColors.emerald, fontWeight: '700' },
                    ]}
                  >
                    {pair.black}
                  </ThemedText>
                ) : null}
              </Animated.View>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  movePair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  moveNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  move: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
