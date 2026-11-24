import { Platform } from 'react-native';
import { ExtractedBill } from '@/types/bill';

const money = (value: string) => {
  const match = value.replace(/,/g, '').match(/-?\d+(?:\.\d{1,2})?/);
  return match ? Number(match[0]) : 0;
};

function parseText(rawText: string): ExtractedBill {
  const lines = rawText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const joined = lines.join('\n');
  const dateMatch = joined.match(/\b(\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/);
  const timeMatch = joined.match(/\b(\d{1,2}:\d{2}(?:\s?[APap][Mm])?)\b/);
  const totalMatch = joined.match(/(?:grand\s*total|total|amount\s*due)\s*:?\s*([£$€₹]?\s*\d[\d,]*(?:\.\d{1,2})?)/i);
  const subtotalMatch = joined.match(/(?:sub[- ]?total)\s*:?\s*([£$€₹]?\s*\d[\d,]*(?:\.\d{1,2})?)/i);
  const taxMatch = joined.match(/(?:tax|vat|gst)\s*:?\s*([£$€₹]?\s*\d[\d,]*(?:\.\d{1,2})?)/i);
  const invoiceMatch = joined.match(/(?:invoice|receipt|bill)\s*(?:no\.?|number|#)?\s*:?\s*([A-Z0-Z0]{3,}?[-A-Z0-9]*)/i);
  const currency = rawText.includes('€') ? 'EUR' : rawText.includes('£') ? 'GBP'
    : rawText.includes('₹') ? 'INR' : rawText.includes('AED') ? 'AED' : 'USD';

  let billDate = new Date().toISOString().slice(0, 10);
  if (dateMatch) {
    const parts = dateMatch[1].replace(/[.]/g, '-').split(/[-/]/);
    if (parts[0].length === 4) billDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    else if (parts[2].length === 4) billDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  return {
    vendor: lines[0]?.slice(0, 80) || '',
    invoiceNumber: invoiceMatch?.[1] || '',
    billDate,
    billTime: timeMatch?.[1] || '',
    currency: currency as ExtractedBill['currency'],
    subtotal: subtotalMatch ? money(subtotalMatch[1]) : 0,
    tax: taxMatch ? money(taxMatch[1]) : 0,
    discount: 0,
    total: totalMatch ? money(totalMatch[1]) : 0,
    paymentMethod: /cash/i.test(joined) ? 'Cash' : /card/i.test(joined) ? 'Card' : '',
    items: [],
    rawText,
  };
}

export async function recognizeReceipt(imageUri: string): Promise<ExtractedBill> {
  if (Platform.OS === 'web') throw new Error('Offline OCR is available in the iOS and Android development build.');
  try {
    const MlkitOcr = (await import('react-native-mlkit-ocr')).default;
    const blocks = await MlkitOcr.detectFromUri(imageUri);
    const text = Array.isArray(blocks)
      ? blocks.map((block: { text?: string }) => block.text || '').join('\n')
      : '';
    if (!text.trim()) throw new Error('No readable text was found in this image.');
    return parseText(text);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'OCR could not process this image.');
  }
}
