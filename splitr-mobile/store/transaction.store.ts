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
  completeTransaction: (transactionId: string, paidAmount: string) => void;
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
      ],
      completedPayments: [
        {
          id: "pay-001",
          hostName: "Hans Sye",
          title: "Tiket Kereta Surabaya",
          method: "bayar-sekarang",
          methodDate: "2025-08-22",
          amount: { amount: 800000, currency: "IDR", formatted: "Rp 800.000" },
          status: "lunas",
          isExpanded: false,
        },
        {
          id: "pay-002",
          hostName: "Timomu",
          title: "Shopping Zara",
          method: "auto-transfer",
          methodDate: "2025-08-20",
          amount: { amount: 800000, currency: "IDR", formatted: "Rp 800.000" },
          status: "lunas",
          isExpanded: false,
        },
        {
          id: "pay-003",
          hostName: "Ivana Yanana",
          title: "Sushi Tei",
          method: "auto-transfer",
          methodDate: "2025-08-19",
          amount: { amount: 270000, currency: "IDR", formatted: "Rp 270.000" },
          status: "lunas",
          isExpanded: false,
        },
      ],
    });
  },

  completeTransaction: (transactionId: string, paidAmount: string) => {
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
    
    // Add to completed payments
    const newCompletedPayment: CompletedPayment = {
      id: `completed-${transactionId}-${Date.now()}`,
      hostName: transactionToComplete.from,
      title: transactionToComplete.title,
      method: 'bayar-sekarang',
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

    set({
      runningTransactions: updatedRunningTransactions,
      completedPayments: updatedCompletedPayments,
    });
    
    console.log('=== TRANSACTION COMPLETION FINISHED ===');
  },
}));