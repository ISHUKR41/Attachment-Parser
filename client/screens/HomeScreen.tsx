import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';
import { loadGame, getPlayerStats, PlayerStats, SavedGame } from '@/lib/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuButtonProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  delay: number;
  color?: string;
}

function MenuButton({ icon, title, subtitle, onPress, delay, color }: MenuButtonProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(delay).springify().damping(15)}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.menuButton,
        {
          backgroundColor: theme.backgroundDefault,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color || ChessColors.emerald }]}>
        <Feather name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.buttonTextContainer}>
        <ThemedText style={styles.buttonTitle}>{title}</ThemedText>
        <ThemedText style={[styles.buttonSubtitle, { opacity: 0.6 }]}>{subtitle}</ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.text} style={{ opacity: 0.4 }} />
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    loadGame().then(setSavedGame);
    getPlayerStats().then(setStats);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark ? ['#0A1612', '#122A22', '#0A1612'] : ['#F5F8F7', '#E8EFED', '#F5F8F7']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glowCircle, glowStyle]} />

      <View style={[styles.content, { paddingTop: insets.top + Spacing['3xl'] }]}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText type="h1" style={styles.title}>
              Chess Master
            </ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(300)}>
            <ThemedText style={[styles.subtitle, { opacity: 0.7 }]}>
              Master the game of kings
            </ThemedText>
          </Animated.View>
        </Animated.View>

        {stats ? (
          <Animated.View
            entering={FadeIn.delay(400)}
            style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: ChessColors.gold }]}>
                {stats.totalPoints}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { opacity: 0.6 }]}>Points</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.backgroundTertiary }]} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: ChessColors.emerald }]}>
                {stats.gamesWon}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { opacity: 0.6 }]}>Wins</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.backgroundTertiary }]} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {stats.gamesPlayed}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { opacity: 0.6 }]}>Games</ThemedText>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.menuContainer}>
          {savedGame ? (
            <MenuButton
              icon="play"
              title="Resume Game"
              subtitle={`${savedGame.gameMode === 'ai' ? 'vs AI' : 'vs Player'} - ${savedGame.gameState.moveHistory.length} moves`}
              onPress={() => navigation.navigate('Game', { resumeGame: true })}
              delay={500}
              color={ChessColors.gold}
            />
          ) : null}

          <MenuButton
            icon="cpu"
            title="Play vs AI"
            subtitle="Challenge the computer"
            onPress={() => navigation.navigate('DifficultySelect')}
            delay={600}
          />

          <MenuButton
            icon="users"
            title="Play vs Player"
            subtitle="Local multiplayer on same device"
            onPress={() => navigation.navigate('Game', { gameMode: 'pvp' })}
            delay={700}
          />

          <MenuButton
            icon="settings"
            title="Settings"
            subtitle="Sound, haptics, and more"
            onPress={() => navigation.navigate('Settings')}
            delay={800}
            color={theme.backgroundTertiary}
          />
        </View>
      </View>

      <Animated.View
        entering={FadeIn.delay(900)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <ThemedText style={[styles.footerText, { opacity: 0.4 }]}>
          Complete chess rules with castling, en passant, and promotion
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowCircle: {
    position: 'absolute',
    top: -100,
    left: SCREEN_WIDTH / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: ChessColors.emerald,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  menuContainer: {
    gap: Spacing.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
