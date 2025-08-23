import api from './api';
import { BillDraft } from '@/types/bill';

export interface CreateBillRequest {
  billName: string;
  categoryId: string;
  totalAmount: number;
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
  }[];
  participants: {
    userId: string;
    items: {
      tempItemId: string;
      quantity: number;
      amount: number;
    }[];
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
  totalAmount: number;
  inviteLink: string;
  qrCodeUrl: string;
  host: { name: string; account: string };
  items: any[];
  status: string;
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

export function transformDraftToCreateBillRequest(draft: BillDraft, categoryId: string, userMap?: Map<string, any>, currentUser?: any): CreateBillRequest {
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
        items: []
      });
    }
    
    const participant = participantMap.get(assignment.memberId)!;
    participant.items.push({
      tempItemId,
      quantity: assignment.shareQty,
      amount: item.isSharing ? assignment.shareQty : (item.price * assignment.shareQty)
    });
  });
  
  const participants = Array.from(participantMap.values());
  const hasSharedItems = draft.items.some(item => item.isSharing);
  const splitMethod = hasSharedItems ? 'custom' : 'equal';
  
  return {
    billName: draft.name,
    categoryId,
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

export async function createBill(draft: BillDraft, categoryId: string, userMap?: Map<string, any>, currentUser?: any): Promise<CreateBillResponse> {
  const requestData = transformDraftToCreateBillRequest(draft, categoryId, userMap, currentUser);
  console.log('🚀 Sending bill data to API:', JSON.stringify(requestData, null, 2));
  const response = await api.post('/api/mobile/bills/create', requestData);
  return response.data;
}