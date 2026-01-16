import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebSocket } from '@/hooks/useWebSocket';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';
import Constants from 'expo-constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Matchmaking'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MatchmakingScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [playerRating, setPlayerRating] = useState(1200);

  // Get WebSocket URL from environment or use default
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 
                `ws://${Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost'}:5000`;

  const { isConnected, isConnecting, send, subscribe } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  });

  useEffect(() => {
    // Register player when connected
    if (isConnected && !isSearching) {
      send({
        type: 'register',
        username: `Player${Math.floor(Math.random() * 10000)}`,
        rating: playerRating,
      });
    }
  }, [isConnected]);

  useEffect(() => {
    // Subscribe to game start messages
    const unsubscribe = subscribe('game_start', (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSearching(false);
      
      // Navigate to online game with matched opponent
      navigation.replace('OnlineGame', {
        roomId: data.roomId,
        playerColor: data.playerColor,
        opponent: data.opponent,
      });
    });

    return unsubscribe;
  }, [subscribe, navigation]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  const handleStartSearch = () => {
    if (!isConnected) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSearching(true);
    send({ type: 'find_match' });
  };

  const handleCancelSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearching(false);
    send({ type: 'cancel_search' });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark
          ? ['#0C1A15', '#15312A', '#0C1A15']
          : ['#E8F5E9', '#C8E6C9', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing['3xl'] }]}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Feather name="globe" size={64} color={ChessColors.emeraldLight} />
          <ThemedText type="h1" style={styles.title}>
            Online Matchmaking
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Find an opponent to play against
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.ratingCard}>
          <LinearGradient
            colors={isDark
              ? ['rgba(56, 229, 167, 0.15)', 'rgba(56, 229, 167, 0.08)']
              : ['rgba(31, 122, 95, 0.15)', 'rgba(31, 122, 95, 0.08)']}
            style={styles.rateingGradient}
          >
            <ThemedText style={styles.ratingLabel}>Your Rating</ThemedText>
            <ThemedText style={[styles.ratingValue, { color: ChessColors.emeraldLight }]}>
              {playerRating}
            </ThemedText>
            <ThemedText style={[styles.ratingDesc, { color: theme.textSecondary }]}>
              Matching with ±100 rating
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        {!isConnected && (
          <Animated.View entering={FadeIn} style={styles.statusContainer}>
            <ActivityIndicator size="large" color={ChessColors.emeraldLight} />
            <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>
              {isConnecting ? 'Connecting to server...' : 'Connection lost'}
            </ThemedText>
          </Animated.View>
        )}

        {isSearching && (
          <Animated.View entering={FadeIn} style={styles.searchingContainer}>
            <ActivityIndicator size="large" color={ChessColors.gold} />
            <ThemedText style={[styles.searchingText, { color: ChessColors.gold }]}>
              Searching for opponent...
            </ThemedText>
            <ThemedText style={[styles.searchTime, { color: theme.textSecondary }]}>
              {formatTime(searchTime)}
            </ThemedText>
          </Animated.View>
        )}

        <View style={styles.buttonContainer}>
          {!isSearching ? (
            <AnimatedPressable
              entering={FadeInDown.delay(300)}
              onPress={handleStartSearch}
              disabled={!isConnected}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: ChessColors.emeraldLight,
                  opacity: !isConnected ? 0.5 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={[ChessColors.emeraldLight, ChessColors.emerald]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Feather name="search" size={24} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Find Match</ThemedText>
            </AnimatedPressable>
          ) : (
            <AnimatedPressable
              entering={FadeIn}
              onPress={handleCancelSearch}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.error,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Feather name="x-circle" size={24} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Cancel Search</ThemedText>
            </AnimatedPressable>
          )}

          <AnimatedPressable
            entering={FadeInDown.delay(400)}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText style={styles.backButtonText}>Back to Menu</ThemedText>
          </AnimatedPressable>
        </View>
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
    justifyContent: 'space-between',
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  ratingCard: {
    marginBottom: Spacing['3xl'],
  },
  ratingGradient: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 229, 167, 0.3)',
  },
  ratingLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  ratingDesc: {
    fontSize: 13,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  statusText: {
    fontSize: 16,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchTime: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
