import { getDatabase, initializeDatabase } from './db';
import { Bill, BillItem } from '@/types/bill';

type BillRow = {
  id: number; vendor: string; invoice_number: string; bill_date: string;
  bill_time: string; category: string; currency: Bill['currency'];
  subtotal: number; tax: number; discount: number; total: number;
  payment_method: string; receipt_uri: string | null;
  created_at: string; updated_at: string;
};

function mapBill(row: BillRow): Bill {
  return {
    id: row.id, vendor: row.vendor, invoiceNumber: row.invoice_number,
    billDate: row.bill_date, billTime: row.bill_time, category: row.category,
    currency: row.currency, subtotal: row.subtotal, tax: row.tax,
    discount: row.discount, total: row.total, paymentMethod: row.payment_method,
    receiptUri: row.receipt_uri, createdAt: row.created_at, updatedAt: row.updated_at,
    items: [],
  };
}

export async function listBills(): Promise<Bill[]> {
  await initializeDatabase();
  const db = await getDatabase();
  const rows = await db.getAllAsync<BillRow>('SELECT * FROM bills ORDER BY bill_date DESC, id DESC');
  const bills = rows.map(mapBill);
  for (const bill of bills) {
    bill.items = await db.getAllAsync<BillItem>(
      'SELECT id, bill_id as billId, name, quantity, unit_price as unitPrice FROM bill_items WHERE bill_id = ?',
      bill.id,
    );
  }
  return bills;
}

export async function getBill(id: number): Promise<Bill | null> {
  await initializeDatabase();
  const db = await getDatabase();
  const row = await db.getFirstAsync<BillRow>('SELECT * FROM bills WHERE id = ?', id);
  if (!row) return null;
  const bill = mapBill(row);
  bill.items = await db.getAllAsync<BillItem>(
    'SELECT id, bill_id as billId, name, quantity, unit_price as unitPrice FROM bill_items WHERE bill_id = ?',
    id,
  );
  return bill;
}

export async function saveBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'items'> & { items: BillItem[] }, id?: number) {
  await initializeDatabase();
  const db = await getDatabase();
  const now = new Date().toISOString();
  let billId = id;
  await db.withTransactionAsync(async () => {
    if (id) {
      await db.runAsync(
        `UPDATE bills SET vendor=?, invoice_number=?, bill_date=?, bill_time=?, category=?, currency=?, subtotal=?, tax=?, discount=?, total=?, payment_method=?, receipt_uri=?, updated_at=? WHERE id=?`,
        bill.vendor, bill.invoiceNumber, bill.billDate, bill.billTime, bill.category, bill.currency,
        bill.subtotal, bill.tax, bill.discount, bill.total, bill.paymentMethod, bill.receiptUri, now, id,
      );
      await db.runAsync('DELETE FROM bill_items WHERE bill_id = ?', id);
    } else {
      const result = await db.runAsync(
        `INSERT INTO bills(vendor, invoice_number, bill_date, bill_time, category, currency, subtotal, tax, discount, total, payment_method, receipt_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        bill.vendor, bill.invoiceNumber, bill.billDate, bill.billTime, bill.category, bill.currency,
        bill.subtotal, bill.tax, bill.discount, bill.total, bill.paymentMethod, bill.receiptUri, now, now,
      );
      billId = result.lastInsertRowId;
    }
    for (const item of bill.items) {
      await db.runAsync(
        'INSERT INTO bill_items(bill_id, name, quantity, unit_price) VALUES (?, ?, ?, ?)',
        billId!, item.name, item.quantity, item.unitPrice,
      );
    }
  });
  return billId!;
}

export async function deleteBill(id: number) {
  await initializeDatabase();
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bills WHERE id = ?', id);
}
