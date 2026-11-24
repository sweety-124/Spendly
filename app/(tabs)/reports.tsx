import { useEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { useBillStore } from '@/store/billStore';
import { shareCsv, sharePdf } from '@/services/export/reportService';

export default function Reports() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { bills, load } = useBillStore();
  useEffect(() => { load(); }, [load]);
  const categoryTotals = useMemo(() => {
    const map = bills.reduce<Record<string, number>>((result, bill) => {
      result[bill.category] = (result[bill.category] || 0) + bill.total;
      return result;
    }, {});
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [bills]);
  const total = bills.reduce((sum, bill) => sum + bill.total, 0);
  const totalBills = bills.length;
  const highestCategory = categoryTotals[0];
  const pieColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
        <View style={[styles.insight, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Expense breakdown</Text>
          {total ? (
            <View style={styles.pieWrap}>
              <Svg width={180} height={180} viewBox="0 0 180 180">
                {categoryTotals.map(([name, amount], index) => {
                  const before = categoryTotals.slice(0, index).reduce((sum, [, value]) => sum + value, 0);
                  const circumference = 2 * Math.PI * 70;
                  return <Circle key={name} cx={90} cy={90} r={70} fill="none" stroke={pieColors[index % pieColors.length]} strokeWidth={24}
                    strokeDasharray={`${(amount / total) * circumference} ${circumference}`} strokeDashoffset={-(before / total) * circumference} transform="rotate(-90 90 90)" />;
                })}
              </Svg>
              <Text style={[styles.pieTotal, { color: theme.text }]}>{total.toFixed(0)}</Text>
            </View>
          ) : <Text style={{ color: theme.muted, textAlign: 'center', padding: 30 }}>Add bills to see category analytics.</Text>}
          {categoryTotals.map(([name, amount], index) => (
            <View key={name} style={styles.legend}><View style={[styles.dot, { backgroundColor: pieColors[index % pieColors.length] }]} /><Text style={[styles.legendName, { color: theme.text }]}>{name}</Text><Text style={{ color: theme.muted }}>{((amount / total) * 100).toFixed(1)}%</Text></View>
          ))}
        </View>
        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: theme.surface }]}><Text style={[styles.statLabel, { color: theme.muted }]}>Transactions</Text><Text style={[styles.statValue, { color: theme.text }]}>{totalBills}</Text></View>
          <View style={[styles.stat, { backgroundColor: theme.surface }]}><Text style={[styles.statLabel, { color: theme.muted }]}>Top category</Text><Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>{highestCategory?.[0] || '—'}</Text></View>
        </View>
        <Pressable style={[styles.export, { backgroundColor: theme.primary }]} onPress={() => sharePdf(bills).catch((e) => Alert.alert('Export failed', String(e)))}><Text style={styles.exportText}>Share PDF report</Text></Pressable>
        <Pressable style={[styles.export, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]} onPress={() => shareCsv(bills).catch((e) => Alert.alert('Export failed', String(e)))}><Text style={[styles.exportText, { color: theme.text }]}>Export CSV</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 40 }, title: { fontSize: 30, fontWeight: '800', marginBottom: 16 },
  insight: { borderRadius: 20, padding: 16 }, cardTitle: { fontSize: 17, fontWeight: '800' }, pieWrap: { height: 190, alignItems: 'center', justifyContent: 'center' },
  pieTotal: { position: 'absolute', fontSize: 22, fontWeight: '800' }, legend: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 }, legendName: { flex: 1, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 12, marginTop: 12 }, stat: { flex: 1, borderRadius: 16, padding: 16 }, statLabel: { fontSize: 12 }, statValue: { fontSize: 18, fontWeight: '800', marginTop: 5 },
  export: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, exportText: { color: 'white', fontWeight: '800' },
});
