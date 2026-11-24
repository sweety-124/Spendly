import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, CATEGORIES } from '@/constants/theme';
import { useBillStore } from '@/store/billStore';

export default function ManualBill() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const save = useBillStore((state) => state.save);
  const [vendor, setVendor] = useState('');
  const [invoice, setInvoice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Others');
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [discount, setDiscount] = useState('');
  const [total, setTotal] = useState('');
  const [payment, setPayment] = useState('');

  async function submit() {
    if (!vendor.trim()) return Alert.alert('Vendor required', 'Enter the store or vendor name.');
    if (!total || !Number.isFinite(Number(total))) return Alert.alert('Invalid amount', 'Enter a valid total.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return Alert.alert('Invalid date', 'Use YYYY-MM-DD.');
    await save({
      vendor: vendor.trim(), invoiceNumber: invoice.trim(), billDate: date, billTime: '',
      category, currency: 'USD', subtotal: Number(subtotal || 0), tax: Number(tax || 0),
      discount: Number(discount || 0), total: Number(total), paymentMethod: payment.trim(),
      receiptUri: null, items: [],
    });
    router.replace('/(tabs)/bills');
  }

  const field = (label: string, value: string, setter: (v: string) => void, numeric = false) => (
    <View style={styles.field}><Text style={[styles.label, { color: theme.muted }]}>{label}</Text><TextInput value={value} onChangeText={setter} keyboardType={numeric ? 'numeric' : 'default'} style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]} /></View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Add bill</Text>
        {field('Vendor', vendor, setVendor)}
        {field('Invoice number', invoice, setInvoice)}
        {field('Bill date (YYYY-MM-DD)', date, setDate)}
        <Text style={[styles.label, { color: theme.muted }]}>Category</Text>
        <View style={styles.categories}>{CATEGORIES.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, { backgroundColor: category === item ? theme.primary : theme.surface, borderColor: theme.border }]}><Text style={{ color: category === item ? '#fff' : theme.text }}>{item}</Text></Pressable>)}</View>
        {field('Subtotal', subtotal, setSubtotal, true)}
        {field('Tax', tax, setTax, true)}
        {field('Discount', discount, setDiscount, true)}
        {field('Total', total, setTotal, true)}
        {field('Payment method', payment, setPayment)}
        <Pressable style={[styles.save, { backgroundColor: theme.primary }]} onPress={submit}><Text style={styles.saveText}>Save bill</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 40 }, title: { fontSize: 28, fontWeight: '800', marginBottom: 18 },
  field: { marginBottom: 12 }, label: { fontSize: 12, marginBottom: 6, fontWeight: '700' }, input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, chip: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  save: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, saveText: { color: 'white', fontWeight: '800', fontSize: 16 },
});
