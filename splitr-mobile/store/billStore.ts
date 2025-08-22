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
  finalize: (memberNames: {[id: string]: string}, categoryId: string, userMap?: Map<string, any>, currentUser?: any) => void;
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
    const service = Math.floor(subTotal * (fees.servicePct / 100));
    const tax = Math.floor((subTotal + service) * (fees.taxPct / 100));
    
    // Calculate discount
    let discount = 0;
    if (fees.discountPct > 0) {
      discount = Math.floor((subTotal + service + tax) * (fees.discountPct / 100));
    } else if (fees.discountNominal > 0) {
      discount = fees.discountNominal;
    }
    
    const grandTotal = Math.max(0, subTotal + service + tax - discount);
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
  finalize: async (memberNames: {[id: string]: string}, categoryId: string, userMap?: Map<string, any>, currentUser?: any) => {
    const { draft } = get();
    console.log('Finalizing bill:', draft);
    
    try {
      // Create bill via API
      const { createBill } = require('@/services/billApi');
      const billResponse = await createBill(draft, categoryId, userMap, currentUser);
      
      console.log('Bill created:', billResponse);
      
      // Save to created bills store
      const { addCreatedBill } = require('@/store/createdBillsStore').useCreatedBillsStore.getState();
      addCreatedBill(draft, memberNames);
      
      // Reset after successful submission
      set({ draft: newDraft() });
      
      return billResponse;
    } catch (error) {
      console.error('Failed to create bill:', error);
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