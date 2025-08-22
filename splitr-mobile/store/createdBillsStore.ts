import { create } from "zustand";
import type { BillDraft } from "@/types/bill";
import { formatRp } from "@/lib/currency";

export interface CreatedBillMember {
  id: string;
  name: string;
  subtotal: number;
  status: 'lunas' | 'tertunda';
  orderItems: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  paidAmount?: number;
}

export interface CreatedBill {
  id: string;
  title: string;
  date: string;
  total: {
    amount: number;
    currency: 'IDR';
    formatted: string;
  };
  people: CreatedBillMember[];
  progress: {
    percent: number;
    label: string;
  };
  category: string;
  paymentMethod: 'PAY_NOW' | 'PAY_LATER';
  dueDate?: string;
}

interface CreatedBillsState {
  createdBills: CreatedBill[];
  addCreatedBill: (draft: BillDraft, memberNames: {[id: string]: string}) => void;
}

export const useCreatedBillsStore = create<CreatedBillsState>((set, get) => ({
  createdBills: [],
  
  addCreatedBill: (draft: BillDraft, memberNames: {[id: string]: string}) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    // Group assignments by member
    const memberMap: {[memberId: string]: CreatedBillMember} = {};
    
    draft.assignments.forEach(assignment => {
      const item = draft.items.find(i => i.id === assignment.itemId);
      if (!item) return;
      
      if (!memberMap[assignment.memberId]) {
        memberMap[assignment.memberId] = {
          id: assignment.memberId,
          name: memberNames[assignment.memberId] || 'Unknown',
          subtotal: 0,
          status: 'tertunda',
          orderItems: [],
          paidAmount: 0
        };
      }
      
      const itemTotal = (item.price * assignment.shareQty);
      const itemTax = Math.floor(itemTotal * (draft.fees.taxPct / 100));
      const itemService = Math.floor(itemTotal * (draft.fees.servicePct / 100));
      const itemGrandTotal = itemTotal + itemTax + itemService;
      
      memberMap[assignment.memberId].subtotal += itemGrandTotal;
      memberMap[assignment.memberId].orderItems.push({
        name: item.name,
        qty: assignment.shareQty,
        price: item.price
      });
      
      if (assignment.isPaidUpfront) {
        memberMap[assignment.memberId].status = 'lunas';
        memberMap[assignment.memberId].paidAmount = memberMap[assignment.memberId].subtotal;
      }
    });

    const people = Object.values(memberMap);
    const totalPaid = people.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const progressPercent = draft.totals.grandTotal > 0 
      ? Math.round((totalPaid / draft.totals.grandTotal) * 100) 
      : 0;

    const createdBill: CreatedBill = {
      id: draft.id,
      title: draft.name,
      date: dateStr,
      total: {
        amount: draft.totals.grandTotal,
        currency: 'IDR',
        formatted: formatRp(draft.totals.grandTotal)
      },
      people,
      progress: {
        percent: progressPercent,
        label: `${progressPercent}% terbayar`
      },
      category: draft.category || 'Lainnya',
      paymentMethod: draft.paymentMethod || 'PAY_NOW',
      dueDate: draft.dueDate
    };

    set(state => ({
      createdBills: [createdBill, ...state.createdBills]
    }));
  }
}));