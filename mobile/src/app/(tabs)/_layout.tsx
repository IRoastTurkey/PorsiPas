import { Tabs } from 'expo-router';
import { ColorValue, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';

type TabIconProps = {
  color: ColorValue;
  symbol: string;
};

function TabIcon({ color, symbol }: TabIconProps) {
  return <Text style={[styles.tabIcon, { color }]}>{symbol}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        sceneStyle: styles.scene,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="☄" />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="＋" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="●" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.background },
  tabBar: {
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  tabLabel: { fontSize: 12, fontWeight: '700' },
  tabIcon: { fontSize: 22, fontWeight: '800', lineHeight: 24 },
});
