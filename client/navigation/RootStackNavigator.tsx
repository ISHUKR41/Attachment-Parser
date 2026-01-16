import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import DifficultySelectScreen from '@/screens/DifficultySelectScreen';
import GameScreen from '@/screens/GameScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { HeaderTitle } from '@/components/HeaderTitle';
import { Difficulty } from '@/lib/chessAI';
import { PieceColor } from '@/lib/chessLogic';

export type RootStackParamList = {
  Home: undefined;
  DifficultySelect: undefined;
  Game: {
    gameMode?: 'pvp' | 'ai';
    difficulty?: Difficulty;
    playerColor?: PieceColor;
    resumeGame?: boolean;
  };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DifficultySelect"
        component={DifficultySelectScreen}
        options={{
          headerTitle: 'New Game',
          ...opaqueScreenOptions,
        }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Chess Master" />,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
          ...opaqueScreenOptions,
        }}
      />
    </Stack.Navigator>
  );
}
