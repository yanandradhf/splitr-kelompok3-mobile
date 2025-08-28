import { create } from "zustand";
import type {
  BillDraft,
  BillItem,
  BillFees,
  SplitAssignment,
  Totals,
} from "@/types/bill";

const emptyTotals: Totals = { subTotal: 0, tax: 0, service: 0, discount: 0, grandTotal: 0 };

const newDraft = (): BillDraft => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  categoryId: null,
  categoryName: null,
  items: [],
  fees: { taxPct: 0, servicePct: 0, discountPct: 0, discountNominal: 0, orderFee: 0 },
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
  setHeader: (name: string, categoryId: string | null, categoryName?: string | null) => void;
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
  setHeader: (name, categoryId, categoryName) =>
    set((s) => ({ draft: { ...s.draft, name, categoryId, categoryName } })),
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
    
    // 1. Calculate items subtotal (line totals after item discounts)
    const itemsSubtotal = items.reduce((total, item) => {
      const lineTotal = item.qty * item.price;
      const itemDiscount = item.discount || 0;
      return total + (lineTotal - itemDiscount);
    }, 0);
    
    // 2. Add order fee
    const afterOrderFee = itemsSubtotal + (fees.orderFee || 0);
    
    // 3. Calculate total discount (global)
    let totalDiscount = 0;
    if (fees.discountPct > 0) {
      totalDiscount = Math.round(itemsSubtotal * (fees.discountPct / 100));
    } else if (fees.discountNominal > 0) {
      totalDiscount = fees.discountNominal;
    }
    
    // 4. Apply total discount
    const afterTotalDiscount = Math.max(0, afterOrderFee - totalDiscount);
    
    // 5. Calculate service charge and tax
    const service = Math.round(afterTotalDiscount * (fees.servicePct / 100));
    const tax = Math.round(afterTotalDiscount * (fees.taxPct / 100));
    
    // 6. Final grand total
    const grandTotal = afterTotalDiscount + service + tax;
    
    set((s) => ({ 
      draft: { 
        ...s.draft, 
        totals: { 
          subTotal: itemsSubtotal, 
          tax, 
          service, 
          discount: totalDiscount, 
          grandTotal 
        } 
      } 
    }));
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
    console.log('📦 Finalizing bill with receipt:', JSON.stringify({
      billName: draft.name,
      hasReceipt: !!draft.receiptImage,
      receiptImage: draft.receiptImage
    }));
    
    try {
      // Use createBillWithReceipt to handle receipt upload
      const { createBillWithReceipt } = require('@/services/billApi');
      const billResponse = await createBillWithReceipt(draft, categoryId, userMap, currentUser, categories);
      
      console.log('✅ Bill created successfully:', JSON.stringify(billResponse));
      
      // Save to created bills store
      const { addCreatedBill } = require('@/store/createdBillsStore').useCreatedBillsStore.getState();
      addCreatedBill(draft, memberNames);
      
      // Reset after successful submission
      set({ draft: newDraft() });
      
      return billResponse;
    } catch (error) {
      console.error('❌ Failed to create bill: ' + String(error));
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