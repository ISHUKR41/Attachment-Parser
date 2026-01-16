import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Dimensions, Platform } from 'react-native';
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
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { BorderRadius, Spacing, ChessColors, Shadows } from '@/constants/theme';
import { loadGame, getPlayerStats, PlayerStats, SavedGame } from '@/lib/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuButtonProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  delay: number;
  color?: string;
  gradientColors?: string[];
}

function MenuButton({ icon, title, subtitle, onPress, delay, color, gradientColors }: MenuButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const defaultGradient = isDark
    ? [theme.backgroundSecondary, theme.backgroundDefault]
    : [theme.backgroundDefault, theme.backgroundSecondary];

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(delay).springify().damping(15)}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.menuButton, animatedStyle]}
    >
      <LinearGradient
        colors={(gradientColors || defaultGradient) as string[]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.iconContainer, { backgroundColor: color || ChessColors.emerald }]}>
        <Feather name={icon} size={32} color="#FFFFFF" />
      </View>
      <View style={styles.buttonTextContainer}>
        <ThemedText style={styles.buttonTitle}>{title}</ThemedText>
        <ThemedText style={[styles.buttonSubtitle, { color: theme.textSecondary }]}>{subtitle}</ThemedText>
      </View>
      <View style={[styles.arrowContainer, { backgroundColor: `${color || ChessColors.emerald}20` }]}>
        <Feather name="chevron-right" size={24} color={color || ChessColors.emerald} />
      </View>
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  const glowOpacity = useSharedValue(0.3);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
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

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark
          ? ['#0A1612', '#0D2820', '#0A1612']
          : ['#E8F5E9', '#C8E6C9', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.glowCircle, styles.glowCircle1, glowStyle]} />
      <Animated.View style={[styles.glowCircle, styles.glowCircle2, glowStyle]} />

      <View style={[styles.content, { paddingTop: insets.top + Spacing['3xl'] }]}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <LinearGradient
              colors={[ChessColors.gold, ChessColors.goldDark]}
              style={styles.logoBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </LinearGradient>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText type="h1" style={styles.title}>
              Chess Master
            </ThemedText>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(300)}>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Master the game of kings
            </ThemedText>
          </Animated.View>
        </Animated.View>

        {stats ? (
          <Animated.View
            entering={FadeIn.delay(400)}
            style={styles.statsContainer}
          >
            <LinearGradient
              colors={isDark
                ? ['rgba(27, 122, 92, 0.2)', 'rgba(27, 122, 92, 0.1)']
                : ['rgba(27, 122, 92, 0.15)', 'rgba(27, 122, 92, 0.08)']}
              style={styles.statsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: ChessColors.gold }]}>
                  {stats.totalPoints}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Points</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: `${theme.text}15` }]} />
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: ChessColors.emerald }]}>
                  {stats.gamesWon}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Wins</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: `${theme.text}15` }]} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {stats.gamesPlayed}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Games</ThemedText>
              </View>
            </LinearGradient>
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
              gradientColors={isDark
                ? ['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.08)']
                : ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
            />
          ) : null}

          <MenuButton
            icon="cpu"
            title="Play vs AI"
            subtitle="Challenge the computer opponent"
            onPress={() => navigation.navigate('DifficultySelect')}
            delay={600}
            color={ChessColors.emerald}
          />

          <MenuButton
            icon="users"
            title="Play vs Player"
            subtitle="Local multiplayer on same device"
            onPress={() => navigation.navigate('Game', { gameMode: 'pvp' })}
            delay={700}
            color={ChessColors.emeraldLight}
          />

          <MenuButton
            icon="globe"
            title="Online Multiplayer"
            subtitle="Play against players worldwide"
            onPress={() => navigation.navigate('Matchmaking')}
            delay={750}
            color={ChessColors.gold}
          />

          <MenuButton
            icon="settings"
            title="Settings"
            subtitle="Sound, haptics, and statistics"
            onPress={() => navigation.navigate('Settings')}
            delay={850}
            color={theme.textSecondary}
          />
        </View>
      </View>

      <Animated.View
        entering={FadeIn.delay(900)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <View style={styles.featureBadges}>
          <View style={[styles.badge, { backgroundColor: `${ChessColors.emerald}20` }]}>
            <Feather name="check-circle" size={14} color={ChessColors.emerald} />
            <ThemedText style={[styles.badgeText, { color: ChessColors.emerald }]}>Full Rules</ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: `${ChessColors.gold}20` }]}>
            <Feather name="award" size={14} color={ChessColors.gold} />
            <ThemedText style={[styles.badgeText, { color: ChessColors.gold }]}>Points System</ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: `${theme.link}20` }]}>
            <Feather name="cpu" size={14} color={theme.link} />
            <ThemedText style={[styles.badgeText, { color: theme.link }]}>Smart AI</ThemedText>
          </View>
        </View>
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
    borderRadius: 9999,
    backgroundColor: ChessColors.emerald,
  },
  glowCircle1: {
    top: -80,
    left: SCREEN_WIDTH / 2 - 120,
    width: 240,
    height: 240,
  },
  glowCircle2: {
    bottom: SCREEN_HEIGHT * 0.3,
    right: -60,
    width: 180,
    height: 180,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoBorder: {
    padding: 4,
    borderRadius: BorderRadius['2xl'],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: Spacing['2xl'],
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(27, 122, 92, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    marginTop: Spacing.xs,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  buttonSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  featureBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
