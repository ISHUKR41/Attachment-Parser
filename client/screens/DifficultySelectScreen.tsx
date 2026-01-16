import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  gradientColors: string[];
}

const difficulties: DifficultyOption[] = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Perfect for beginners. AI makes occasional mistakes.',
    icon: 'smile',
    color: '#4CAF50',
    gradientColors: ['#4CAF50', '#388E3C'],
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'A balanced challenge. AI plays strategically.',
    icon: 'target',
    color: '#FF9800',
    gradientColors: ['#FF9800', '#F57C00'],
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'For experienced players. AI thinks multiple moves ahead.',
    icon: 'zap',
    color: '#F44336',
    gradientColors: ['#F44336', '#D32F2F'],
  },
];

export default function DifficultySelectScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
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
      <LinearGradient
        colors={isDark
          ? ['#0A1612', '#0D2820', '#0A1612']
          : ['#F5F8F7', '#E8EFED', '#F5F8F7']}
        style={StyleSheet.absoluteFill}
      />

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
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Select your challenge level
          </ThemedText>

          <View style={styles.difficultyContainer}>
            {difficulties.map((diff, index) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <AnimatedPressable
                  key={diff.id}
                  entering={FadeInDown.delay(200 + index * 100).springify()}
                  onPress={() => handleDifficultySelect(diff.id)}
                  style={[
                    styles.difficultyCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: isSelected ? diff.color : 'transparent',
                      borderWidth: isSelected ? 2 : 0,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={diff.gradientColors as string[]}
                    style={styles.difficultyIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Feather name={diff.icon} size={26} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.difficultyText}>
                    <ThemedText style={styles.difficultyName}>{diff.name}</ThemedText>
                    <ThemedText style={[styles.difficultyDesc, { color: theme.textSecondary }]}>
                      {diff.description}
                    </ThemedText>
                  </View>
                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: diff.color }]}>
                      <Feather name="check" size={16} color="#FFFFFF" />
                    </View>
                  ) : null}
                </AnimatedPressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Your Color
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose which side you play
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
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.colorCircle}
              >
                <View style={styles.colorInner} />
              </LinearGradient>
              <ThemedText style={styles.colorLabel}>White</ThemedText>
              <ThemedText style={[styles.colorHint, { color: theme.textSecondary }]}>
                Move first
              </ThemedText>
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
              <LinearGradient
                colors={['#3A3A3A', '#1A1A1A']}
                style={styles.colorCircle}
              >
                <View style={[styles.colorInner, { backgroundColor: '#2A2A2A' }]} />
              </LinearGradient>
              <ThemedText style={styles.colorLabel}>Black</ThemedText>
              <ThemedText style={[styles.colorHint, { color: theme.textSecondary }]}>
                Move second
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View entering={FadeIn.delay(600)}>
          <Pressable
            onPress={handleStartGame}
            style={({ pressed }) => [
              styles.startButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={[ChessColors.emerald, ChessColors.emeraldDark]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Feather name="play" size={22} color="#FFFFFF" />
            <ThemedText style={styles.startButtonText}>Start Game</ThemedText>
          </Pressable>
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
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
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
  difficultyIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyText: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  difficultyDesc: {
    fontSize: 13,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  colorInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  colorLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  colorHint: {
    fontSize: 13,
  },
  spacer: {
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: ChessColors.emerald,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
