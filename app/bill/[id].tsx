import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getBill, deleteBill } from '@/database/repository';
import { Bill } from '@/types/bill';

export default function BillDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [bill, setBill] = useState<Bill | null>(null);
  useEffect(() => { getBill(Number(id)).then(setBill); }, [id]);
  async function remove() {
    Alert.alert('Delete bill?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteBill(Number(id)); router.back(); } },
    ]);
  }
  if (!bill) return <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} />;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{bill.vendor}</Text>
        <Text style={{ color: theme.muted, marginBottom: 16 }}>{bill.category} · {bill.billDate}</Text>
        {bill.receiptUri ? <Image source={{ uri: bill.receiptUri }} style={styles.receipt} resizeMode="contain" /> : null}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {[
            ['Invoice', bill.invoiceNumber || '—'], ['Subtotal', bill.subtotal.toFixed(2)],
            ['Tax', bill.tax.toFixed(2)], ['Discount', bill.discount.toFixed(2)],
            ['Payment', bill.paymentMethod || '—'], ['Total', `${bill.currency} ${bill.total.toFixed(2)}`],
          ].map(([label, value]) => <View key={label} style={styles.row}><Text style={{ color: theme.muted }}>{label}</Text><Text style={[styles.value, { color: theme.text }]}>{value}</Text></View>)}
        </View>
        <Pressable style={[styles.edit, { borderColor: theme.primary }]} onPress={() => router.push(`/bill/edit/${bill.id}`)}><Text style={{ color: theme.primary, fontWeight: '800' }}>Edit bill</Text></Pressable>
        <Pressable style={styles.delete} onPress={remove}><Text style={{ color: theme.danger, fontWeight: '800' }}>Delete bill</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20 }, title: { fontSize: 28, fontWeight: '800' }, receipt: { width: '100%', height: 260, borderRadius: 16, backgroundColor: '#111', marginBottom: 14 },
  card: { borderRadius: 16, padding: 16 }, row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }, value: { fontWeight: '800' },
  edit: { height: 52, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, delete: { height: 52, alignItems: 'center', justifyContent: 'center' },
});
