import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowUpRight, ScanLine, Upload } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useBillStore } from '@/store/billStore';

export default function Dashboard() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { bills, load } = useBillStore();
  useEffect(() => { load(); }, [load]);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const total = bills.reduce((sum, bill) => sum + bill.total, 0);
  const monthBills = bills.filter((bill) => {
    const date = new Date(bill.billDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const monthTotal = monthBills.reduce((sum, bill) => sum + bill.total, 0);
  const highest = useMemo(() => bills.reduce((max, bill) => bill.total > max.total ? bill : max, bills[0]), [bills]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={bills.slice(0, 8)}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>SPENDLY</Text>
            <Text style={[styles.title, { color: theme.text }]}>Your spending</Text>
            <View style={[styles.hero, { backgroundColor: theme.primary }]}>
              <Text style={styles.heroLabel}>Total expenses</Text>
              <Text style={styles.heroAmount}>${total.toFixed(2)}</Text>
              <Text style={styles.heroMeta}>{bills.length} bills · This month ${monthTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/scan')}>
                <ScanLine color={theme.primary} /><Text style={{ color: theme.text }}>Scan bill</Text>
              </Pressable>
              <Pressable style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.push('/bill/new')}>
                <Upload color={theme.primary} /><Text style={{ color: theme.text }}>Manual entry</Text>
              </Pressable>
            </View>
            <View style={styles.stats}>
              <View style={[styles.stat, { backgroundColor: theme.surface }]}><Text style={[styles.statLabel, { color: theme.muted }]}>Average</Text><Text style={[styles.statValue, { color: theme.text }]}>${bills.length ? (total / bills.length).toFixed(2) : '0.00'}</Text></View>
              <View style={[styles.stat, { backgroundColor: theme.surface }]}><Text style={[styles.statLabel, { color: theme.muted }]}>Highest</Text><Text style={[styles.statValue, { color: theme.text }]}>${highest?.total.toFixed(2) || '0.00'}</Text></View>
            </View>
            <Text style={[styles.section, { color: theme.text }]}>Recent transactions</Text>
          </>
        }
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.muted }]}>No bills yet. Scan or enter your first expense.</Text>}
        renderItem={({ item }) => (
          <Pressable style={[styles.bill, { backgroundColor: theme.surface }]} onPress={() => router.push(`/bill/${item.id}`)}>
            <View style={[styles.billIcon, { backgroundColor: `${theme.primary}20` }]}><ArrowUpRight color={theme.primary} /></View>
            <View style={{ flex: 1 }}><Text style={[styles.vendor, { color: theme.text }]}>{item.vendor}</Text><Text style={{ color: theme.muted }}>{item.category} · {item.billDate}</Text></View>
            <Text style={[styles.billAmount, { color: theme.text }]}>-{item.currency} {item.total.toFixed(2)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { fontSize: 30, fontWeight: '800', marginTop: 4, marginBottom: 18 },
  hero: { borderRadius: 24, padding: 22 }, heroLabel: { color: '#D1FAE5', fontSize: 14 }, heroAmount: { color: 'white', fontSize: 38, fontWeight: '800', marginVertical: 6 }, heroMeta: { color: 'white', opacity: 0.85 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 14 }, action: { flex: 1, height: 72, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 12 }, stat: { flex: 1, borderRadius: 16, padding: 16 }, statLabel: { fontSize: 12 }, statValue: { fontSize: 20, fontWeight: '700', marginTop: 5 },
  section: { fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 10 }, bill: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 12, marginBottom: 8 },
  billIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, vendor: { fontWeight: '700', fontSize: 15 }, billAmount: { fontWeight: '800' }, empty: { textAlign: 'center', marginTop: 30 },
});
