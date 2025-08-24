import { create } from 'zustand';

interface Transaction {
  id: string;
  status: 'pengingat' | 'permintaan' | 'terlambat';
  title: string;
  from: string;
  dueDate: string;
  amount: {
    amount: number;
    currency: string;
    formatted: string;
  };
  actions: {
    payNow: boolean;
    payLater: boolean;
    overdue: boolean;
  };
}

interface CompletedPayment {
  id: string;
  hostName: string;
  title: string;
  method: 'bayar-sekarang' | 'auto-transfer';
  methodDate: string;
  amount: {
    amount: number;
    currency: string;
    formatted: string;
  };
  status: 'lunas';
  isExpanded: boolean;
  receiptUrl?: string;
  items?: {
    name: string;
    qty: number;
    price: {
      amount: number;
      currency: string;
      formatted: string;
    };
  }[];
}

interface TransactionStore {
  runningTransactions: Transaction[];
  completedPayments: CompletedPayment[];
  isInitialized: boolean;
  completeTransaction: (transactionId: string, paidAmount: string, paymentMethod?: string) => void;
  initializeTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  runningTransactions: [],
  completedPayments: [],
  isInitialized: false,

  initializeTransactions: () => {
    const { isInitialized } = get();
    if (isInitialized) {
      console.log('Store already initialized, skipping...');
      return;
    }
    
    console.log('Initializing transactions...');
    set({
      isInitialized: true,
      runningTransactions: [
        {
          id: "notif-001",
          status: "pengingat",
          title: "Trip to Dufan",
          from: "Nabil Hanif",
          dueDate: "2025-08-24",
          amount: {
            amount: 3500000,
            currency: "IDR",
            formatted: "Rp 3.500.000",
          },
          actions: { payNow: true, payLater: true, overdue: false },
        },
        {
          id: "notif-002",
          status: "permintaan",
          title: "Tiket Konser Coldplay",
          from: "Hans Sye",
          dueDate: "2025-08-22",
          amount: {
            amount: 7500000,
            currency: "IDR",
            formatted: "Rp 7.500.000",
          },
          actions: { payNow: true, payLater: false, overdue: false },
        },
        {
          id: "notif-003",
          status: "terlambat",
          title: "Makan Malam IBC",
          from: "Ivana Yanana",
          dueDate: "2025-08-20",
          amount: {
            amount: 500000,
            currency: "IDR",
            formatted: "Rp 500.000",
          },
          actions: { payNow: false, payLater: false, overdue: true },
        },
        {
          id: "notif-004",
          status: "pengingat",
          title: "Bioskop XXI",
          from: "Sarah Putri",
          dueDate: "2025-08-25",
          amount: {
            amount: 150000,
            currency: "IDR",
            formatted: "Rp 150.000",
          },
          actions: { payNow: true, payLater: true, overdue: false },
        },
        {
          id: "notif-005",
          status: "permintaan",
          title: "Karaoke Inul Vista",
          from: "Andi Pratama",
          dueDate: "2025-08-23",
          amount: {
            amount: 250000,
            currency: "IDR",
            formatted: "Rp 250.000",
          },
          actions: { payNow: true, payLater: true, overdue: false },
        },
        {
          id: "notif-006",
          status: "pengingat",
          title: "Makan di Padang Merdeka",
          from: "Dina Sari",
          dueDate: "2025-08-26",
          amount: {
            amount: 85000,
            currency: "IDR",
            formatted: "Rp 85.000",
          },
          actions: { payNow: true, payLater: true, overdue: false },
        },
      ],
      completedPayments: [
        {
          id: "pay-001",
          hostName: "Andi Wijaya",
          title: "Pizza Party",
          method: "bayar-sekarang",
          methodDate: "24 Agu • 05:09 WIB",
          amount: { amount: 198000, currency: "IDR", formatted: "Rp 198.000" },
          status: "lunas",
          isExpanded: false,
        },
        {
          id: "pay-002",
          hostName: "Aulia Rahman",
          title: "Lunch at Mall",
          method: "auto-transfer",
          methodDate: "24 Agu • 04:44 WIB",
          amount: { amount: 90000, currency: "IDR", formatted: "Rp 90.000" },
          status: "lunas",
          isExpanded: false,
        },
        {
          id: "pay-003",
          hostName: "Sarah Kim",
          title: "Coffee Meeting",
          method: "auto-transfer",
          methodDate: "23 Agu • 10:15 WIB",
          amount: { amount: 75000, currency: "IDR", formatted: "Rp 75.000" },
          status: "lunas",
          isExpanded: false,
        },
        {
          id: "pay-004",
          hostName: "Reza Ahmad",
          title: "Cafe Starbucks",
          method: "bayar-sekarang",
          methodDate: "22 Agu • 14:30 WIB",
          amount: { amount: 120000, currency: "IDR", formatted: "Rp 120.000" },
          status: "lunas",
          isExpanded: false,
        },
        {
          id: "pay-005",
          hostName: "Maya Sinta",
          title: "Bensin Motor",
          method: "auto-transfer",
          methodDate: "21 Agu • 08:45 WIB",
          amount: { amount: 50000, currency: "IDR", formatted: "Rp 50.000" },
          status: "lunas",
          isExpanded: false,
        },
      ],
    });
  },

  completeTransaction: (transactionId: string, paidAmount: string, paymentMethod?: string) => {
    console.log('=== STARTING TRANSACTION COMPLETION ===');
    const state = get();
    console.log('Current running transactions:', state.runningTransactions.map(t => ({ id: t.id, title: t.title })));
    console.log('Current completed payments:', state.completedPayments.length);
    
    // Find the transaction to complete
    const transactionToComplete = state.runningTransactions.find(t => t.id === transactionId);
    
    if (!transactionToComplete) {
      console.log('❌ Transaction not found:', transactionId);
      console.log('Available IDs:', state.runningTransactions.map(t => t.id));
      return;
    }

    console.log('✅ Found transaction to complete:', transactionToComplete.title);

    // Remove from running transactions
    const updatedRunningTransactions = state.runningTransactions.filter(t => t.id !== transactionId);
    
    // Determine method based on paymentMethod parameter
    const method = paymentMethod === 'nanti' ? 'auto-transfer' : 'bayar-sekarang';
    
    // Add to completed payments
    const newCompletedPayment: CompletedPayment = {
      id: `completed-${transactionId}-${Date.now()}`,
      hostName: transactionToComplete.from,
      title: transactionToComplete.title,
      method: method,
      methodDate: new Date().toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }),
      amount: transactionToComplete.amount,
      status: 'lunas',
      isExpanded: false,
    };

    const updatedCompletedPayments = [newCompletedPayment, ...state.completedPayments];

    console.log('📊 After update:');
    console.log('- Running transactions:', updatedRunningTransactions.length);
    console.log('- Completed payments:', updatedCompletedPayments.length);
    console.log('- New completed payment:', newCompletedPayment.title);
    console.log('- Payment method:', method);

    set({
      runningTransactions: updatedRunningTransactions,
      completedPayments: updatedCompletedPayments,
    });
    
    console.log('=== TRANSACTION COMPLETION FINISHED ===');
  },
}));