import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { getDatabase, initializeDatabase } from '@/database/db';
import { useBillStore } from '@/store/billStore';

export default function Settings() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [category, setCategory] = useState('');
  const load = useBillStore((state) => state.load);

  async function addCategory() {
    if (!category.trim()) return;
    await initializeDatabase();
    const db = await getDatabase();
    await db.runAsync('INSERT OR IGNORE INTO categories(name) VALUES (?)', category.trim());
    setCategory('');
    Alert.alert('Category added', 'The new category is now available.');
  }

  async function deleteAll() {
    Alert.alert('Delete all app data?', 'All bills and custom categories will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete all', style: 'destructive', onPress: async () => {
        await initializeDatabase();
        const db = await getDatabase();
        await db.execAsync('DELETE FROM bill_items; DELETE FROM bills;');
        await load();
        Alert.alert('Data deleted', 'Spendly is now empty.');
      } },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Custom category</Text>
          <View style={styles.row}>
            <TextInput value={category} onChangeText={setCategory} placeholder="Category name" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
            <Pressable style={[styles.add, { backgroundColor: theme.primary }]} onPress={addCategory}><Text style={{ color: 'white', fontWeight: '800' }}>Add</Text></Pressable>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Privacy & data</Text>
          <Text style={[styles.copy, { color: theme.muted }]}>Spendly keeps receipt images and financial records on this device. It does not upload receipt data to a cloud service.</Text>
          <Pressable style={styles.delete} onPress={deleteAll}><Text style={{ color: theme.danger, fontWeight: '800' }}>Delete all data</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20 }, title: { fontSize: 30, fontWeight: '800', marginBottom: 16 },
  card: { borderRadius: 18, padding: 16, marginBottom: 12 }, cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 }, input: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  add: { height: 48, width: 70, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, copy: { lineHeight: 21 },
  delete: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
});
