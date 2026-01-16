import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Move } from '@/lib/chessLogic';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing } from '@/constants/theme';

interface MoveHistoryProps {
  moves: Move[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={[styles.emptyText, { opacity: 0.5 }]}>
          No moves yet
        </ThemedText>
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
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <ThemedText type="small" style={[styles.label, { opacity: 0.6 }]}>
        Move History
      </ThemedText>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {movePairs.map((pair, index) => (
          <Animated.View
            key={pair.number}
            entering={FadeIn.delay(index * 30)}
            layout={Layout.springify()}
            style={styles.movePair}
          >
            <ThemedText style={[styles.moveNumber, { opacity: 0.4 }]}>
              {pair.number}.
            </ThemedText>
            <ThemedText
              style={[
                styles.move,
                index === movePairs.length - 1 && !pair.black && styles.currentMove,
                index === movePairs.length - 1 && !pair.black && { color: theme.link },
              ]}
            >
              {pair.white}
            </ThemedText>
            {pair.black ? (
              <ThemedText
                style={[
                  styles.move,
                  index === movePairs.length - 1 && styles.currentMove,
                  index === movePairs.length - 1 && { color: theme.link },
                ]}
              >
                {pair.black}
              </ThemedText>
            ) : null}
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 60,
  },
  label: {
    marginBottom: Spacing.xs,
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
  },
  moveNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  move: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentMove: {
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
  },
});
