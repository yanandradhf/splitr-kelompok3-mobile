export interface MasterBillData {
  billId: string;
  billCode: string;
  billName: string;
  totalAmount: number;
  status: string;
  receiptImageUrl?: string;
  host: {
    name: string;
    account: string;
  };
  category: any;
  paymentDeadline?: string;
  isExpired?: boolean;
  items: Array<{
    itemId: string;
    itemName: string;
    price: number;
    quantity: number;
    totalAssigned: number;
    isSharing: boolean;
    assignments: Array<{
      participantName: string;
      participantAccount: string;
      quantity: number;
      amount: number;
      isSharedPortion: boolean;
    }>;
  }>;
  participants: Array<{
    participantId: string;
    name: string;
    account: string;
    amountShare: number;
    paymentStatus: string;
    paidAt?: string;
    scheduledDate?: string;
    paymentType?: string;
    isHost: boolean;
    breakdown: {
      subtotal: number;
      taxAmount: number;
      serviceAmount: number;
      discountAmount: number;
      totalAmount: number;
    };
  }>;
  paymentSummary: {
    totalParticipants: number;
    completedCount: number;
    pendingCount: number;
    totalPaid: number;
    totalPending: number;
    completionPercentage: number;
  };
  fees: {
    subTotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
  };
}

export interface CommentData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  message: string;
  timestamp: string;
  createdAt?: string;
  isCurrentUser: boolean;
}