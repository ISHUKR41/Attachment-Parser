import React from 'react';
import { View, StyleSheet, Pressable, Modal, Dimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { PieceType, PieceColor } from '@/lib/chessLogic';
import ChessPiece from './ChessPiece';
import { ThemedText } from './ThemedText';
import { BorderRadius, Spacing } from '@/constants/theme';

interface PromotionModalProps {
  visible: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
}

const PIECE_SIZE = 60;

const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export default function PromotionModal({ visible, color, onSelect }: PromotionModalProps) {
  const { theme, isDark } = useTheme();

  const handleSelect = (pieceType: PieceType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(pieceType);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          entering={ZoomIn.springify().damping(15)}
          style={[
            styles.container,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="h4" style={styles.title}>
            Promote Pawn
          </ThemedText>
          
          <View style={styles.piecesContainer}>
            {promotionPieces.map((pieceType, index) => (
              <Animated.View
                key={pieceType}
                entering={ZoomIn.delay(index * 50).springify()}
              >
                <Pressable
                  onPress={() => handleSelect(pieceType)}
                  style={({ pressed }) => [
                    styles.pieceButton,
                    {
                      backgroundColor: pressed
                        ? theme.backgroundTertiary
                        : theme.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <ChessPiece type={pieceType} color={color} size={PIECE_SIZE} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    margin: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  piecesContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pieceButton: {
    width: PIECE_SIZE + Spacing.lg,
    height: PIECE_SIZE + Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
