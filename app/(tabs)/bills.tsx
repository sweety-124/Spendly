import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { Colors, CATEGORIES } from '@/constants/theme';
import { useBillStore } from '@/store/billStore';

export default function Bills() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { bills, load } = useBillStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => bills.filter((bill) =>
    (category === 'All' || bill.category === category) &&
    `${bill.vendor} ${bill.invoiceNumber}`.toLowerCase().includes(search.toLowerCase())
  ), [bills, search, category]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>All bills</Text>
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={18} color={theme.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search vendor or invoice" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.text }]} />
        </View>
        <FlatList horizontal data={['All', ...CATEGORIES]} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}
          renderItem={({ item }) => <Pressable onPress={() => setCategory(item)} style={[styles.chip, { backgroundColor: category === item ? theme.primary : theme.surface, borderColor: theme.border }]}><Text style={{ color: category === item ? '#fff' : theme.text, fontWeight: '600' }}>{item}</Text></Pressable>} />
      </View>
      <FlatList data={filtered} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.muted }]}>No bills match your filters.</Text>}
        renderItem={({ item }) => (
          <Pressable style={[styles.bill, { backgroundColor: theme.surface }]} onPress={() => router.push(`/bill/${item.id}`)}>
            <View style={{ flex: 1 }}><Text style={[styles.vendor, { color: theme.text }]}>{item.vendor}</Text><Text style={{ color: theme.muted }}>{item.category} · {item.billDate}</Text></View>
            <Text style={[styles.amount, { color: theme.text }]}>{item.currency} {item.total.toFixed(2)}</Text>
          </Pressable>
        )} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { paddingHorizontal: 20, paddingTop: 8 }, title: { fontSize: 30, fontWeight: '800', marginBottom: 14 },
  search: { height: 48, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  input: { flex: 1 }, categories: { gap: 8, paddingVertical: 12 }, chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 30 }, bill: { borderRadius: 16, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  vendor: { fontWeight: '700', fontSize: 16 }, amount: { fontWeight: '800' }, empty: { textAlign: 'center', marginTop: 40 },
});
