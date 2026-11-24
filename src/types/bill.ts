export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD';

export interface BillItem {
  id?: number;
  billId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Bill {
  id: number;
  vendor: string;
  invoiceNumber: string;
  billDate: string;
  billTime: string;
  category: string;
  currency: CurrencyCode;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  receiptUri: string | null;
  items: BillItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedBill {
  vendor: string;
  invoiceNumber: string;
  billDate: string;
  billTime: string;
  currency: CurrencyCode;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  items: BillItem[];
  rawText: string;
}
