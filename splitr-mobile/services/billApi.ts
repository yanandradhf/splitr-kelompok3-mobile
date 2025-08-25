import api from './api';
import { BillDraft } from '../types/bill';

export interface CreateBillRequest {
  billName: string;
  categoryId: string | null;
  groupId?: string | null;
  totalAmount: number;
  receiptImageUrl?: string;
  maxPaymentDate: string;
  allowScheduledPayment: boolean;
  splitMethod: 'custom' | 'equal';
  currency: string;
  items: {
    tempItemId: string;
    itemName: string;
    price: number;
    quantity: number;
    category: string;
    isSharing: boolean;
    isVerified: boolean;
    ocrConfidence?: number;
  }[];
  participants: {
    userId: string;
    items: {
      tempItemId: string;
      quantity: number;
      amount: number;
    }[];
    breakdown: {
      subtotal: number;
      taxAmount: number;
      serviceAmount: number;
      discountAmount: number;
      totalAmount: number;
    };
  }[];
  fees: {
    taxPct: number;
    servicePct: number;
    discountPct: number;
    discountNominal: number;
    subTotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
  };
}

export interface CreateBillResponse {
  success: boolean;
  billId: string;
  billCode: string;
  billName: string;
  totalAmount: string;
  maxPaymentDate: string;
  allowScheduledPayment: boolean;
  splitMethod: string;
  currency: string;
  status: string;
  items: {
    itemId: string;
    tempItemId: string;
    itemName: string;
    price: number;
    quantity: number;
    category: string;
    isSharing: boolean;
    isVerified: boolean;
  }[];
  host: { name: string; account: string };
  inviteLink: string;
  qrCodeUrl: string;
  fees: {
    taxPct: number;
    servicePct: number;
    discountPct: number;
    discountNominal: number;
    subTotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
  };
  calculatedByFrontend: boolean;
  participantsAdded: number;
  notificationsSent: number;
  participantBreakdowns: {
    userId: string;
    breakdown: {
      subtotal: number;
      taxAmount: number;
      serviceAmount: number;
      discountAmount: number;
      totalAmount: number;
    };
  }[];
}

function generateTempItemId(itemName: string, index: number): string {
  const cleanName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${cleanName}_${String(index + 1).padStart(3, '0')}`;
}

function detectItemCategory(itemName: string): string {
  const beverageKeywords = ['teh', 'es', 'jus', 'kopi', 'minuman', 'drink', 'juice', 'coffee', 'tea'];
  const lowerName = itemName.toLowerCase();
  return beverageKeywords.some(keyword => lowerName.includes(keyword)) ? 'beverage' : 'food_item';
}

function getUserIdFromMemberId(memberId: string, userMap: Map<string, any>, currentUser?: any): string {
  if (memberId === 'host') {
    return currentUser?.userId || currentUser?.id || 'host';
  }
  const user = userMap.get(memberId);
  return user?.userId || user?.id || memberId;
}

export function transformDraftToCreateBillRequest(draft: BillDraft, categoryId: string, userMap?: Map<string, any>, currentUser?: any, categories?: any[]): CreateBillRequest {
  const now = new Date();
  const maxPaymentDate = draft.paymentMethod === 'PAY_NOW' 
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    : draft.dueDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const items = draft.items.map((item, index) => ({
    tempItemId: generateTempItemId(item.name, index),
    itemName: item.name,
    price: item.price,
    quantity: item.qty,
    category: detectItemCategory(item.name),
    isSharing: item.isSharing || false,
    isVerified: true
  }));
  
  const participantMap = new Map<string, { userId: string; items: any[] }>();
  
  draft.assignments.forEach(assignment => {
    const item = draft.items.find(i => i.id === assignment.itemId);
    const itemIndex = draft.items.findIndex(i => i.id === assignment.itemId);
    if (!item || itemIndex === -1) return;
    
    const userId = getUserIdFromMemberId(assignment.memberId, userMap || new Map(), currentUser);
    const tempItemId = generateTempItemId(item.name, itemIndex);
    
    if (!participantMap.has(assignment.memberId)) {
      participantMap.set(assignment.memberId, {
        userId,
        items: [],
        breakdown: { subtotal: 0, taxAmount: 0, serviceAmount: 0, discountAmount: 0, totalAmount: 0 }
      });
    }
    
    const participant = participantMap.get(assignment.memberId)!;
    const itemTotal = item.isSharing ? assignment.shareQty : (item.price * assignment.shareQty);
    
    // 1. Hitung diskon per item dulu
    let itemDiscount = 0;
    if (draft.fees.discountPct > 0) {
      itemDiscount = Math.floor(itemTotal * (draft.fees.discountPct / 100));
    } else if (draft.fees.discountNominal > 0) {
      const memberShareRatio = itemTotal / draft.totals.subTotal;
      itemDiscount = Math.floor(draft.fees.discountNominal * memberShareRatio);
    }
    
    // 2. Harga setelah diskon
    const itemAfterDiscount = Math.max(0, itemTotal - itemDiscount);
    
    // 3. Hitung service dari harga setelah diskon
    const itemService = Math.floor(itemAfterDiscount * (draft.fees.servicePct / 100));
    
    // 4. Hitung pajak dari harga setelah diskon
    const itemTax = Math.floor(itemAfterDiscount * (draft.fees.taxPct / 100));
    
    participant.items.push({
      tempItemId,
      quantity: assignment.shareQty,
      amount: itemTotal
    });
    
    participant.breakdown.subtotal += itemTotal;
    participant.breakdown.taxAmount += itemTax;
    participant.breakdown.serviceAmount += itemService;
    participant.breakdown.discountAmount += itemDiscount;
    participant.breakdown.totalAmount += itemAfterDiscount + itemService + itemTax;
  });
  
  const participants = Array.from(participantMap.values());
  const hasSharedItems = draft.items.some(item => item.isSharing);
  const splitMethod = hasSharedItems ? 'custom' : 'equal';
  
  // Find category ID from categories list based on selected category
  const selectedCategory = categories?.find(cat => cat.categoryName === draft.category);
  const finalCategoryId = selectedCategory?.categoryId || categoryId;
  
  return {
    billName: draft.name,
    categoryId: finalCategoryId,
    totalAmount: draft.totals.grandTotal,
    maxPaymentDate,
    allowScheduledPayment: draft.paymentMethod === 'PAY_LATER',
    splitMethod,
    currency: 'IDR',
    items,
    participants,
    fees: {
      taxPct: draft.fees.taxPct,
      servicePct: draft.fees.servicePct,
      discountPct: draft.fees.discountPct || 0,
      discountNominal: draft.fees.discountNominal || 0,
      subTotal: draft.totals.subTotal,
      taxAmount: draft.totals.tax,
      serviceAmount: draft.totals.service,
      discountAmount: draft.totals.discount
    }
  };
}

