export const API_CONFIG = {
  BASE_URL: "https://2cf65d03461e.ngrok-free.app",
  ENDPOINTS: {
    // Auth
    LOGIN: "/api/mobile/auth/login",
    REGISTER: "/api/mobile/auth/register",
    VALIDATE_BNI: "/api/mobile/auth/validate-bni",
    SEND_OTP: "/api/mobile/auth/send-otp",
    VERIFY_OTP: "/api/mobile/auth/verify-otp",
    ME: "/api/mobile/auth/me",
    LOGOUT: "/api/mobile/auth/logout",
    SEND_RESET_OTP: "/api/mobile/auth/send-reset-otp",
    VERIFY_RESET_OTP: "/api/mobile/auth/verify-reset-otp",
    RESET_PASSWORD: "/api/mobile/auth/reset-password",
    MY_ACCOUNT: "/api/mobile/auth/my-account",

    // Profile
    PROFILE: "/api/mobile/profile",
    CHANGE_PASSWORD: "/api/mobile/profile/change-password",
    CHANGE_PIN: "/api/mobile/profile/change-pin",

    // Friends
    FRIENDS: "/api/mobile/friends",
    ADD_FRIEND: "/api/mobile/friends/add",

    // Groups
    GROUPS: "/api/mobile/groups",
    CREATE_GROUP: "/api/mobile/groups/create",

    // Notifications
    NOTIFICATIONS: "/api/mobile/notifications",
    NOTIFICATION_ACTION: "/api/mobile/notifications/group-action",
    MARK_ALL_READ: "/api/mobile/notifications/read-all",

    // Bills
    BILL_DETAIL: "/api/mobile/bills",
    MY_ACTIVITY: "/api/mobile/bills/my-activity",
    PERSONAL: "/api/mobile/bills/personal",
    MASTER: "/api/mobile/bills/master",

    // Payment
    PAYMENT_CREATE: "/api/mobile/payments/create",
    PAYMENT_HISTORY: "/api/mobile/payments/history",
    PAYMENT_RECEIPT: "/api/mobile/payments/:paymentId/receipt",
  },
  TIMEOUT: 10000,
};

export const BUTTON_RULES = {
  buttonRules: [
    {
      when: { status: "pengingat" },
      setActions: { payNow: true, payLater: true, overdue: false },
    },
    {
      when: { status: "permintaan" },
      setActions: { payNow: true, payLater: false, overdue: false },
    },
    {
      when: { status: "terlambat" },
      setActions: { payNow: false, payLater: false, overdue: true },
    },
  ],
};

export const DEBOUNCE_DELAY = {
  API_CALLS: 5000, // 5 seconds between API calls
  USER_INPUT: 300, // 300ms for user input debouncing
};

// Move this to a separate constants file if needed
export const UI_STATE_PAYLOAD = {
  theme: {
    colors: {
      backgroundMain: "#F7F7FB",
      cardBg: "#FFFFFF",
      textPrimary: "#0E0E10",
      textSecondary: "#6B7280",
      accent: "#008080",
      success: "#16A34A",
      warning: "#F59E0B",
      danger: "#EF4444",
      muted: "#E5E7EB",
    },
    radius: 20,
    elevation: 3,
  },
  segmentedControl: {
    activeKey: "running",
    items: [
      { key: "running", label: "Tagihan Berjalan" },
      { key: "completed", label: "Tagihan Selesai" },
    ],
  },
  screens: {
    running: {
      summary: [
        {
          title: "Pembayaran Tertunda",
          value: {
            amount: 11985000,
            currency: "IDR",
            formatted: "Rp 11.985.000",
          },
          subtitle: "Yang harus dibayar",
        },
        {
          title: "Tagihan yang Dibuat",
          value: {
            amount: 975000,
            currency: "IDR",
            formatted: "Rp 975.000",
          },
          subtitle: "Yang saya buat",
        },
      ],
      myBills: {
        title: "Tagihan yang Aku Buat",
        items: [
          {
            id: "bill-ibc-001",
            title: "Makan-Makan IBC",
            date: "2025-09-15",
            place: "IBC",
            total: { amount: 675000, currency: "IDR", formatted: "Rp 675.000" },
            receiptUrl: "https://example.com/struk/ibc-001.jpg",
            progress: { percent: 10, label: "10% Lunas" },
            isExpanded: true,
            people: [
              {
                name: "Nabilah Luthfianasari (You)",
                status: "lunas",
                subtotal: {
                  amount: 225000,
                  currency: "IDR",
                  formatted: "Rp 225.000",
                },
                orderItems: [
                  {
                    name: "Bawal Laut Goreng",
                    qty: 1,
                    price: {
                      amount: 100000,
                      currency: "IDR",
                      formatted: "Rp 100.000",
                    },
                  },
                  {
                    name: "Cumi-Cumi Asam Manis",
                    qty: 1,
                    price: {
                      amount: 100000,
                      currency: "IDR",
                      formatted: "Rp 100.000",
                    },
                  },
                  {
                    name: "Es Teh Tawar",
                    qty: 1,
                    price: {
                      amount: 10000,
                      currency: "IDR",
                      formatted: "Rp 10.000",
                    },
                  },
                ],
              },
              {
                name: "Yasin Hanif",
                status: "tertunda",
                subtotal: {
                  amount: 225000,
                  currency: "IDR",
                  formatted: "Rp 225.000",
                },
                orderItems: [
                  {
                    name: "Bawal Laut Goreng",
                    qty: 1,
                    price: {
                      amount: 100000,
                      currency: "IDR",
                      formatted: "Rp 100.000",
                    },
                  },
                  {
                    name: "Nasi Putih",
                    qty: 1,
                    price: {
                      amount: 15000,
                      currency: "IDR",
                      formatted: "Rp 15.000",
                    },
                  },
                  {
                    name: "Es Teh Tawar",
                    qty: 1,
                    price: {
                      amount: 10000,
                      currency: "IDR",
                      formatted: "Rp 10.000",
                    },
                  },
                ],
              },
              {
                name: "Yanina Yanna",
                status: "tertunda",
                subtotal: {
                  amount: 225000,
                  currency: "IDR",
                  formatted: "Rp 225.000",
                },
                orderItems: [
                  {
                    name: "Cumi-Cumi Asam Manis",
                    qty: 1,
                    price: {
                      amount: 100000,
                      currency: "IDR",
                      formatted: "Rp 100.000",
                    },
                  },
                  {
                    name: "Nasi Putih",
                    qty: 1,
                    price: {
                      amount: 15000,
                      currency: "IDR",
                      formatted: "Rp 15.000",
                    },
                  },
                  {
                    name: "Es Teh Tawar",
                    qty: 1,
                    price: {
                      amount: 10000,
                      currency: "IDR",
                      formatted: "Rp 10.000",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "bill-coffee-002",
            title: "Today Coffee",
            date: "2025-08-22",
            total: { amount: 300000, currency: "IDR", formatted: "Rp 300.000" },
            progress: { percent: 60, label: "60% terbayar" },
            people: [],
          },
        ],
      },
      payables: {
        title: "Tagihan yang Harus Dibayar",
        items: [
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
      },
    },
    completed: {
      hostBills: [
        {
          id: "done-host-coffee-001",
          icon: "coffee",
          title: "Kopi Pagi",
          dateDone: "2025-06-19",
          total: { amount: 78000, currency: "IDR", formatted: "Rp 78.000" },
          progress: { percent: 100, label: "100% terbayar" },
          receiptUrl: "https://example.com/struk/kopi-pagi-190625.jpg",
          isExpanded: true,
          people: [
            {
              name: "Nabilah Luthfianasari (You)",
              status: "lunas",
              method: "bayar-sekarang",
              paidAt: "2025-06-19",
              subtotal: {
                amount: 22000,
                currency: "IDR",
                formatted: "Rp 22.000",
              },
              orderItems: [
                {
                  name: "Americano",
                  qty: 1,
                  price: {
                    amount: 22000,
                    currency: "IDR",
                    formatted: "Rp 22.000",
                  },
                },
              ],
            },
            {
              name: "Ivana Yanana",
              status: "lunas",
              method: "auto-transfer",
              paidAt: "2025-06-19",
              subtotal: {
                amount: 28000,
                currency: "IDR",
                formatted: "Rp 28.000",
              },
              orderItems: [
                {
                  name: "Butter Croissant",
                  qty: 1,
                  price: {
                    amount: 28000,
                    currency: "IDR",
                    formatted: "Rp 28.000",
                  },
                },
              ],
            },
            {
              name: "Nabil Hanif",
              status: "lunas",
              method: "auto-transfer",
              paidAt: "2025-06-19",
              subtotal: {
                amount: 28000,
                currency: "IDR",
                formatted: "Rp 28.000",
              },
              orderItems: [
                {
                  name: "Caffè Latte",
                  qty: 1,
                  price: {
                    amount: 28000,
                    currency: "IDR",
                    formatted: "Rp 28.000",
                  },
                },
              ],
            },
          ],
        },
      ],
      payments: [
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
          isExpanded: true,
          receiptUrl: "https://example.com/struk/sushi-tei.jpg",
          items: [
            {
              name: "Sashimi",
              qty: 3,
              price: {
                amount: 100000,
                currency: "IDR",
                formatted: "Rp 100.000",
              },
            },
            {
              name: "Dragon Fire Roll",
              qty: 1,
              price: { amount: 70000, currency: "IDR", formatted: "Rp 70.000" },
            },
            {
              name: "Nigiri Tuna",
              qty: 1,
              price: { amount: 35000, currency: "IDR", formatted: "Rp 35.000" },
            },
            {
              name: "Nigiri Tamago",
              qty: 3,
              price: { amount: 25000, currency: "IDR", formatted: "Rp 25.000" },
            },
            {
              name: "Kanikama Nigiri",
              qty: 3,
              price: { amount: 40000, currency: "IDR", formatted: "Rp 40.000" },
            },
          ],
        },
      ],
    },
  },
};
