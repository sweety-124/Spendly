import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { House, ReceiptText, ScanLine, ChartPie, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.primary,
      tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border, height: 68, paddingBottom: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <House size={22} color={color} /> }} />
      <Tabs.Screen name="bills" options={{ title: 'Bills', tabBarIcon: ({ color }) => <ReceiptText size={22} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color }) => <ScanLine size={25} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color }) => <ChartPie size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Settings size={22} color={color} /> }} />
    </Tabs>
  );
}
