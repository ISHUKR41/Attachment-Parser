import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';
import { getSettings, updateSettings, GameSettings, deleteSavedGame, getPlayerStats, PlayerStats } from '@/lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  delay: number;
}

function SettingRow({ icon, title, description, value, onValueChange, delay }: SettingRowProps) {
  const { theme } = useTheme();

  const handleChange = (newValue: boolean) => {
    if (newValue) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(newValue);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.settingIcon, { backgroundColor: ChessColors.emerald }]}>
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.settingText}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText style={[styles.settingDesc, { opacity: 0.6 }]}>{description}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: theme.backgroundTertiary, true: ChessColors.emerald }}
        thumbColor="#FFFFFF"
      />
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
    getPlayerStats().then(setStats);
  }, []);

  const handleSettingChange = async (key: keyof GameSettings, value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'This will reset all your game statistics. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@chess_player_stats');
            setStats({
              gamesPlayed: 0,
              gamesWon: 0,
              gamesLost: 0,
              gamesDrawn: 0,
              totalPoints: 0,
              highestPoints: 0,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleClearSavedGame = () => {
    Alert.alert(
      'Clear Saved Game',
      'This will delete your saved game progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await deleteSavedGame();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  if (!settings) return null;

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
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { opacity: 0.5 }]}>
            PREFERENCES
          </ThemedText>
        </Animated.View>

        <SettingRow
          icon="volume-2"
          title="Sound Effects"
          description="Play sounds for moves and captures"
          value={settings.soundEnabled}
          onValueChange={(v) => handleSettingChange('soundEnabled', v)}
          delay={200}
        />

        <SettingRow
          icon="smartphone"
          title="Haptic Feedback"
          description="Vibration on piece selection and moves"
          value={settings.hapticEnabled}
          onValueChange={(v) => handleSettingChange('hapticEnabled', v)}
          delay={300}
        />

        <Animated.View entering={FadeInDown.delay(400)} style={[styles.section, { marginTop: Spacing['2xl'] }]}>
          <ThemedText type="small" style={[styles.sectionLabel, { opacity: 0.5 }]}>
            STATISTICS
          </ThemedText>
        </Animated.View>

        {stats ? (
          <Animated.View
            entering={FadeInDown.delay(500)}
            style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <ThemedText style={styles.statValue}>{stats.gamesPlayed}</ThemedText>
                <ThemedText style={[styles.statLabel, { opacity: 0.5 }]}>Games</ThemedText>
              </View>
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: ChessColors.emerald }]}>
                  {stats.gamesWon}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { opacity: 0.5 }]}>Wins</ThemedText>
              </View>
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: '#DC3545' }]}>
                  {stats.gamesLost}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { opacity: 0.5 }]}>Losses</ThemedText>
              </View>
              <View style={styles.statCell}>
                <ThemedText style={styles.statValue}>{stats.gamesDrawn}</ThemedText>
                <ThemedText style={[styles.statLabel, { opacity: 0.5 }]}>Draws</ThemedText>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.backgroundTertiary }]} />
            <View style={styles.statsRow}>
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: ChessColors.gold }]}>
                  {stats.totalPoints}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { opacity: 0.5 }]}>Total Points</ThemedText>
              </View>
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: ChessColors.gold }]}>
                  {stats.highestPoints}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { opacity: 0.5 }]}>Best Game</ThemedText>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(600)} style={[styles.section, { marginTop: Spacing['2xl'] }]}>
          <ThemedText type="small" style={[styles.sectionLabel, { opacity: 0.5 }]}>
            DATA
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)} style={styles.buttonGroup}>
          <View
            style={[styles.dangerButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <ThemedText
              style={styles.dangerButtonText}
              onPress={handleClearSavedGame}
            >
              Clear Saved Game
            </ThemedText>
          </View>
          <View
            style={[styles.dangerButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <ThemedText
              style={[styles.dangerButtonText, { color: '#DC3545' }]}
              onPress={handleResetStats}
            >
              Reset Statistics
            </ThemedText>
          </View>
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
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
  },
  statsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  buttonGroup: {
    gap: Spacing.sm,
  },
  dangerButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
