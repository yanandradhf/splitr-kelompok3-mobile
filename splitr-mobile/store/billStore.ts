import { create } from "zustand";
import type {
  BillDraft,
  BillItem,
  BillFees,
  SplitAssignment,
  Totals,
  BillCategory,
} from "@/types/bill";

const emptyTotals: Totals = { subTotal: 0, tax: 0, service: 0, discount: 0, grandTotal: 0 };

const newDraft = (): BillDraft => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  category: null,
  items: [],
  fees: { taxPct: 0, servicePct: 0, discountPct: 0, discountNominal: 0 },
  assignments: [],
  selectedMemberIds: [],
  paymentMethod: undefined,
  dueDate: undefined,
  totals: emptyTotals,
  receiptImage: undefined,
});

interface BillState {
  draft: BillDraft;
  reset: () => void;
  setHeader: (name: string, category: BillCategory | null) => void;
  addItem: (item: BillItem) => void;
  updateItem: (item: BillItem) => void;
  removeItem: (id: string) => void;
  setFees: (fees: BillFees) => void;
  recalcTotals: () => void;
  setSelectedMembers: (ids: string[]) => void;
  assignShare: (a: SplitAssignment) => void;
  clearAssignmentsForItem: (itemId: string) => void;
  markPaidUpfront: (itemId: string, memberId: string | null) => void;
  setPaymentMethod: (p: "PAY_NOW" | "PAY_LATER") => void;
  setDueDate: (iso: string) => void;
  setReceiptImage: (uri: string) => void;
  finalize: (memberNames: {[id: string]: string}, categoryId: string, userMap?: Map<string, any>, currentUser?: any, categories?: any[]) => void;
}

export const useBillStore = create<BillState>((set, get) => ({
  draft: newDraft(),
  reset: () => set({ draft: newDraft() }),
  setHeader: (name, category) =>
    set((s) => ({ draft: { ...s.draft, name, category } })),
  addItem: (item) =>
    set((s) => ({ draft: { ...s.draft, items: [...s.draft.items, item] } })),
  updateItem: (item) =>
    set((s) => ({
      draft: {
        ...s.draft,
        items: s.draft.items.map((it) => (it.id === item.id ? item : it)),
      },
    })),
  removeItem: (id) =>
    set((s) => ({
      draft: {
        ...s.draft,
        items: s.draft.items.filter((it) => it.id !== id),
        assignments: s.draft.assignments.filter((a) => a.itemId !== id),
      },
    })),
  setFees: (fees) => set((s) => ({ draft: { ...s.draft, fees } })),
  recalcTotals: () => {
    const { items, fees } = get().draft;
    const subTotal = items.reduce((t, it) => {
      return t + (it.isSharing ? it.price : it.qty * it.price);
    }, 0);
    
    // 1. Hitung diskon dulu dari subtotal
    let discount = 0;
    if (fees.discountPct > 0) {
      discount = Math.floor(subTotal * (fees.discountPct / 100));
    } else if (fees.discountNominal > 0) {
      discount = fees.discountNominal;
    }
    
    // 2. Harga setelah diskon
    const afterDiscount = Math.max(0, subTotal - discount);
    
    // 3. Hitung service dari harga setelah diskon
    const service = Math.floor(afterDiscount * (fees.servicePct / 100));
    
    // 4. Hitung pajak dari harga setelah diskon
    const tax = Math.floor(afterDiscount * (fees.taxPct / 100));
    
    // 5. Total akhir
    const grandTotal = afterDiscount + service + tax;
    
    set((s) => ({ draft: { ...s.draft, totals: { subTotal, tax, service, discount, grandTotal } } }));
  },
  setSelectedMembers: (ids) =>
    set((s) => ({ draft: { ...s.draft, selectedMemberIds: ids } })),
  assignShare: (a) =>
    set((s) => ({ draft: { ...s.draft, assignments: upsertAssign(s.draft.assignments, a) } })),
  clearAssignmentsForItem: (itemId) =>
    set((s) => ({ draft: { ...s.draft, assignments: s.draft.assignments.filter((x) => x.itemId !== itemId) } })),
  markPaidUpfront: (itemId, memberId) =>
    set((s) => ({
      draft: {
        ...s.draft,
        assignments: s.draft.assignments.map((x) =>
          x.itemId === itemId
            ? { ...x, isPaidUpfront: memberId ? x.memberId === memberId : false }
            : x
        ),
      },
    })),
  setPaymentMethod: (p) => set((s) => ({ draft: { ...s.draft, paymentMethod: p } })),
  setDueDate: (iso) => set((s) => ({ draft: { ...s.draft, dueDate: iso } })),
  setReceiptImage: (uri) => set((s) => ({ draft: { ...s.draft, receiptImage: uri } })),
  finalize: async (memberNames: {[id: string]: string}, categoryId: string, userMap?: Map<string, any>, currentUser?: any, categories?: any[]) => {
    const { draft } = get();
    console.log('📦 Finalizing bill with receipt:', {
      billName: draft.name,
      hasReceipt: !!draft.receiptImage,
      receiptImage: draft.receiptImage
    });
    
    try {
      // Use createBillWithReceipt to handle receipt upload
      const { createBillWithReceipt } = require('@/services/billApi');
      const billResponse = await createBillWithReceipt(draft, categoryId, userMap, currentUser, categories);
      
      console.log('✅ Bill created successfully:', billResponse);
      
      // Save to created bills store
      const { addCreatedBill } = require('@/store/createdBillsStore').useCreatedBillsStore.getState();
      addCreatedBill(draft, memberNames);
      
      // Reset after successful submission
      set({ draft: newDraft() });
      
      return billResponse;
    } catch (error) {
      console.error('❌ Failed to create bill:', error);
      throw error;
    }
  },
}));

function upsertAssign(list: SplitAssignment[], a: SplitAssignment) {
  const idx = list.findIndex((x) => x.itemId === a.itemId && x.memberId === a.memberId);
  if (idx === -1) return [...list, a];
  const copy = [...list];
  copy[idx] = a;
  return copy;
}