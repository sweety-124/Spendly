import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { unparse } from 'papaparse';
import type { Bill } from '@/types/bill';

function safeCsvText(value: string) {
  return /^[\s\u0000-\u001F]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

export function generateCsv(bills: Bill[]) {
  return unparse(bills.map((bill) => ({
    'Invoice Number': safeCsvText(bill.invoiceNumber),
    'Vendor Name': safeCsvText(bill.vendor),
    'Bill Date': safeCsvText(bill.billDate),
    Category: safeCsvText(bill.category),
    Currency: safeCsvText(bill.currency),
    Subtotal: bill.subtotal,
    Tax: bill.tax,
    Discount: bill.discount,
    'Total Amount': bill.total,
    'Payment Method': safeCsvText(bill.paymentMethod),
  })));
}

export async function shareCsv(bills: Bill[]) {
  const csv = generateCsv(bills);
  const uri = `${FileSystem.cacheDirectory}spendly-report.csv`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { UTI: 'public.comma-separated-text', mimeType: 'text/csv' });
}

export async function sharePdf(bills: Bill[], title = 'Spendly Expense Report') {
  const total = bills.reduce((sum, bill) => sum + bill.total, 0);
  const categories = bills.reduce<Record<string, number>>((result, bill) => {
    result[bill.category] = (result[bill.category] || 0) + bill.total;
    return result;
  }, {});
  const rows = bills.map((bill) => `
    <tr><td>${escapeHtml(bill.billDate)}</td><td>${escapeHtml(bill.vendor)}</td><td>${escapeHtml(bill.category)}</td>
    <td style="text-align:right">${escapeHtml(bill.currency)} ${bill.total.toFixed(2)}</td></tr>`).join('');
  const html = `<html><body style="font-family:-apple-system,Arial;color:#102A43;padding:32px">
    <h1 style="color:#10B981">Spendly</h1><h2>${escapeHtml(title)}</h2>
    <p>${bills.length} transactions &nbsp; <strong>Total: ${total.toFixed(2)}</strong></p>
    <h3>Category breakdown</h3><table style="width:100%">${Object.entries(categories).map(([name, amount]) =>
      `<tr><td>${escapeHtml(name)}</td><td style="text-align:right">${amount.toFixed(2)}</td></tr>`).join('')}</table>
    <h3>Transactions</h3><table style="width:100%;border-collapse:collapse" border="1">
    <tr><th>Date</th><th>Vendor</th><th>Category</th><th>Total</th></tr>${rows}</table>
  </body></html>`;
  const file = await Print.printToFileAsync({ html, width: 612, height: 792 });
  await Sharing.shareAsync(file.uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
}
