export interface BillActivity {
  billId: string;
  billCode: string;
  billName: string;
  totalBillAmount: number;
  yourShare: number;
  displayAmount?: number;
  paymentStatus: string;
  paidAt?: string;
  scheduledDate?: string;
  paymentType?: string;
  hostName: string;
  hostAccount?: string;
  paymentDeadline?: string;
  isExpired?: boolean;
  canSchedule?: boolean;
  showPayNow?: boolean;
  isHost: boolean;
  role: string;
  participantCount?: number;
  participantsStatus?: Array<{
    participantId?: string;
    userId?: string;
    name: string;
    account?: string;
    amountShare: number;
    paymentStatus: string;
    paidAt?: string;
    scheduledDate?: string;
    paymentType?: string;
  }>;
  paymentSummary?: {
    totalParticipants: number;
    paidCount: number;
    pendingCount: number;
    totalPaid: number;
    totalPending: number;
  };
  hostFinancialSummary?: {
    hostAdvanced: number;
    totalOwedByOthers: number;
    totalPaidByOthers: number;
    stillOwedToHost: number;
  };
  actions?: {
    canPay: boolean;
    canSchedule?: boolean;
    showDeadline?: boolean;
    isPaid: boolean;
    isFailed?: boolean;
  };
  status: string;
  createdAt: string;
}

export interface PaymentHistory {
  paymentId: string;
  amount: number;
  status: string;
  paymentType: string;
  isLate?: boolean;
  paidAt: string;
  billName: string;
  billCode?: string;
  hostName: string;
}

export type SortOption =
  | "date-newest"
  | "date-oldest"
  | "amount-highest"
  | "amount-lowest"
  | "deadline-nearest"
  | "deadline-farthest";

export type CategoryFilter = "semua" | "dibuat" | "berjalan" | "selesai" | "expired";
export type StatusFilter = "semua" | "selesai" | "terlambat" | "terjadwal";

export interface StatusBadge {
  text: string;
  color: string;
  bg: string;
}