export type BillCategory =
  | "Makanan dan Minuman"
  | "Hiburan"
  | "Belanja"
  | "Lainnya";

export interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount?: number;
  isSharing?: boolean;
}

export interface BillFees {
  taxPct: number;
  servicePct: number;
  discountPct?: number;
  discountNominal?: number;
  orderFee?: number;
}

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  groupIds?: string[];
}

export interface SplitAssignment {
  itemId: string;
  memberId: string;
  shareQty: number;
  isPaidUpfront?: boolean;
}

export interface Totals {
  subTotal: number;
  tax: number;
  service: number;
  discount: number;
  grandTotal: number;
}

export interface BillDraft {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  items: BillItem[];
  fees: BillFees;
  assignments: SplitAssignment[];
  selectedMemberIds: string[];
  paymentMethod?: "PAY_NOW" | "PAY_LATER";
  dueDate?: string;
  totals: Totals;
  receiptImage?: string;
}