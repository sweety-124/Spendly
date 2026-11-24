import { create } from 'zustand';
import { Bill } from '@/types/bill';
import { deleteBill, listBills, saveBill } from '@/database/repository';

type BillStore = {
  bills: Bill[];
  loading: boolean;
  load: () => Promise<void>;
  save: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'items'> & { items: Bill['items'] }, id?: number) => Promise<number>;
  remove: (id: number) => Promise<void>;
};

export const useBillStore = create<BillStore>((set, get) => ({
  bills: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      set({ bills: await listBills(), loading: false });
    } catch {
      set({ loading: false });
    }
  },
  save: async (bill, id) => {
    const billId = await saveBill(bill, id);
    await get().load();
    return billId;
  },
  remove: async (id) => {
    await deleteBill(id);
    await get().load();
  },
}));
