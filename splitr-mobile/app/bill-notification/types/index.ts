export interface BillData {
  billId: string;
  billCode: string;
  billName: string;
  totalBillAmount: number;
  yourShare: number;
  paymentStatus: string;
  paidAt?: string;
  scheduledDate?: string;
  paymentType?: string;
  hostName: string;
  hostAccount: string;
  category: string;
  paymentDeadline?: string;
  isExpired?: boolean;
  allowScheduledPayment: boolean;
  createdAt?: string;
  participantCount?: number;
  myItems: Array<{
    itemName: string;
    price: number;
    quantity: number;
    amount: number;
    category: string;
    originalPrice?: number;
    isSharing?: boolean;
  }>;
  myBreakdown: {
    subtotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
    totalBeforeFees: number;
    totalAfterFees: number;
    sharePercentage: number;
  };
  billBreakdown: {
    subTotal: number;
    taxPct: number;
    taxAmount: number;
    servicePct: number;
    serviceAmount: number;
    discountPct: number;
    discountAmount: number;
    totalAmount: number;
  };
  allParticipants?: Array<{
    name: string;
    paymentStatus: string;
    amount: number;
    isHost?: boolean;
  }>;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
  actions?: {
    canPay: boolean;
    canSchedule: boolean;
    isOverdue: boolean;
    isPaid: boolean;
  };
}