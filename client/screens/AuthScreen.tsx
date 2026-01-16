import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing, ChessColors } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'guest' | 'google' | 'phone'>('guest');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleGuestLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    // TODO: Implement guest login logic
    // Generate random username, create session, navigate to home
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    // TODO: Implement Google OAuth flow
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    // TODO: Implement phone auth with OTP
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={isDark
          ? ['#0A1612', '#0D2820', '#0A1612']
          : ['#E8F5E9', '#C8E6C9', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Feather name="award" size={72} color={ChessColors.gold} />
          <ThemedText type="h1" style={styles.title}>
            Chess Master
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Play, Compete & Improve
          </ThemedText>
        </Animated.View>

        <View style={styles.authOptions}>
          {/* Guest Login */}
          <AnimatedPressable
            entering={FadeInDown.delay(200)}
            onPress={handleGuestLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <LinearGradient
              colors={[ChessColors.emeraldLight, ChessColors.emerald]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Feather name="zap" size={24} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Play as Guest</ThemedText>
          </AnimatedPressable>

          {/* Google Login */}
          <AnimatedPressable
            entering={FadeInDown.delay(300)}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <LinearGradient
              colors={['#DB4437', '#C23321']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Feather name="globe" size={24} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Continue with Google</ThemedText>
          </AnimatedPressable>

          {/* Phone Login */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.phoneSection}>
            <ThemedText style={[styles.orText, { color: theme.textSecondary }]}>
              Or sign in with phone
            </ThemedText>
            
            <View style={[styles.phoneInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.backgroundTertiary }]}>
              <Feather name="phone" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter phone number"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!isLoading}
              />
            </View>

            <Pressable
              onPress={handlePhoneLogin}
              disabled={isLoading || !phoneNumber}
              style={({ pressed }) => [
                styles.phoneButton,
                { 
                  backgroundColor: ChessColors.gold,
                  opacity: (isLoading || !phoneNumber) ? 0.5 : pressed ? 0.9 : 1 
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>Send Code</ThemedText>
              )}
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  authOptions: {
    gap: Spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phoneSection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  orText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  phoneButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  footer: {
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
