import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { Difficulty } from '@/lib/chessAI';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DifficultyOption {
  id: Difficulty;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

const difficulties: DifficultyOption[] = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Perfect for beginners. AI makes occasional mistakes.',
    icon: 'smile',
    color: '#4CAF50',
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'A balanced challenge. AI plays strategically.',
    icon: 'target',
    color: '#FF9800',
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'For experienced players. AI thinks ahead.',
    icon: 'zap',
    color: '#F44336',
  },
];

export default function DifficultySelectScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');

  const handleDifficultySelect = (difficulty: Difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDifficulty(difficulty);
  };

  const handleColorSelect = (color: 'white' | 'black') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayerColor(color);
  };

  const handleStartGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Game', {
      gameMode: 'ai',
      difficulty: selectedDifficulty,
      playerColor,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Choose Difficulty
          </ThemedText>

          <View style={styles.difficultyContainer}>
            {difficulties.map((diff, index) => (
              <AnimatedPressable
                key={diff.id}
                entering={FadeInDown.delay(200 + index * 100).springify()}
                onPress={() => handleDifficultySelect(diff.id)}
                style={[
                  styles.difficultyCard,
                  {
                    backgroundColor:
                      selectedDifficulty === diff.id
                        ? theme.backgroundSecondary
                        : theme.backgroundDefault,
                    borderColor:
                      selectedDifficulty === diff.id ? diff.color : 'transparent',
                    borderWidth: selectedDifficulty === diff.id ? 2 : 0,
                  },
                ]}
              >
                <View style={[styles.difficultyIcon, { backgroundColor: diff.color }]}>
                  <Feather name={diff.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.difficultyText}>
                  <ThemedText style={styles.difficultyName}>{diff.name}</ThemedText>
                  <ThemedText style={[styles.difficultyDesc, { opacity: 0.6 }]}>
                    {diff.description}
                  </ThemedText>
                </View>
                {selectedDifficulty === diff.id ? (
                  <Feather name="check-circle" size={24} color={diff.color} />
                ) : null}
              </AnimatedPressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Your Color
          </ThemedText>

          <View style={styles.colorContainer}>
            <Pressable
              onPress={() => handleColorSelect('white')}
              style={[
                styles.colorOption,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: playerColor === 'white' ? ChessColors.gold : 'transparent',
                  borderWidth: playerColor === 'white' ? 2 : 0,
                },
              ]}
            >
              <View style={[styles.colorCircle, { backgroundColor: '#FEFEFE', borderColor: '#2A2A2A' }]} />
              <ThemedText style={styles.colorLabel}>White</ThemedText>
              <ThemedText style={[styles.colorHint, { opacity: 0.5 }]}>Move first</ThemedText>
            </Pressable>

            <Pressable
              onPress={() => handleColorSelect('black')}
              style={[
                styles.colorOption,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: playerColor === 'black' ? ChessColors.gold : 'transparent',
                  borderWidth: playerColor === 'black' ? 2 : 0,
                },
              ]}
            >
              <View style={[styles.colorCircle, { backgroundColor: '#2A2A2A', borderColor: '#4A4A4A' }]} />
              <ThemedText style={styles.colorLabel}>Black</ThemedText>
              <ThemedText style={[styles.colorHint, { opacity: 0.5 }]}>Move second</ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View entering={FadeIn.delay(600)}>
          <Button onPress={handleStartGame}>Start Game</Button>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  difficultyContainer: {
    gap: Spacing.md,
  },
  difficultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  difficultyIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyText: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  difficultyDesc: {
    fontSize: 13,
  },
  colorContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    marginBottom: Spacing.xs,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorHint: {
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
});
