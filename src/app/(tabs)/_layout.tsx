import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components';
import { haptic } from '@/lib/motion';
import { colors, fonts, shadows } from '@/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'discover', title: 'Discover', icon: 'local_fire_department' },
  { name: 'matches', title: 'Matches', icon: 'forum' },
  { name: 'likes', title: 'Likes', icon: 'favorite' },
  { name: 'profile', title: 'Profile', icon: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.select() }}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 0.44 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, boxShadow: shadows.tabBar, height: 64 + 20, paddingTop: 8 },
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => <Icon name={t.icon} size={24} color={focused ? 'primary' : 'onSurfaceVariant'} filled={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
