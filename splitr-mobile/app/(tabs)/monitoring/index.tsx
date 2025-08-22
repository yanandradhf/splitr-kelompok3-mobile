// app/(tabs)/monitoring/index-final.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { COLORS } from "../../../constants/theme";
import { UI_STATE_PAYLOAD } from "../../../constants/config";
import { useTransactionStore } from "../../../store/transaction.store";

type TransactionType = "income" | "expense";
type TransactionStatus = "completed" | "pending";

type SimpleTransaction = {
  id: string;
  title: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  from?: string;
  method?: string;
  date: string;
};

type SortOption = "date-newest" | "date-oldest" | "amount-highest" | "amount-lowest";
type CategoryFilter = "semua" | "dibuat" | "tagihan";

export default function MonitoringIndex() {
  const [activeTab, setActiveTab] = useState<"tagihan" | "riwayat">("tagihan");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("semua");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: Set<string>}>({
    tagihan: new Set(),
    riwayat: new Set()
  });
  const { runningTransactions, completedPayments, initializeTransactions, isInitialized } = useTransactionStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeTransactions();
    }
  }, [isInitialized, initializeTransactions]);

  const toggleExpanded = (id: string) => {
    const currentTabExpanded = new Set(expandedItems[activeTab]);
    if (currentTabExpanded.has(id)) {
      currentTabExpanded.delete(id);
    } else {
      currentTabExpanded.add(id);
    }
    setExpandedItems({
      ...expandedItems,
      [activeTab]: currentTabExpanded
    });
  };

  // Process data into simple format
  const processTransactions = (): SimpleTransaction[] => {
    // Pending transactions (tagihan yang harus dibayar)
    const pending: SimpleTransaction[] = runningTransactions.map(t => ({
      id: t.id,
      title: t.title,
      amount: t.amount.formatted,
      type: "expense",
      status: "pending",
      from: t.from,
      method: `${t.status.charAt(0).toUpperCase() + t.status.slice(1)}`,
      date: t.dueDate
    }));

    // Completed transactions (pembayaran selesai)
    const completed: SimpleTransaction[] = completedPayments.map(p => ({
      id: p.id,
      title: p.title,
      amount: p.amount.formatted,
      type: "expense",
      status: "completed",
      from: p.hostName,
      method: p.method === "bayar-sekarang" ? "Bayar Sekarang" : "Auto-Transfer",
      date: p.methodDate || new Date().toLocaleDateString("id-ID")
    }));

    // Created bills (tagihan yang dibuat) from mock data
    const createdBills: SimpleTransaction[] = UI_STATE_PAYLOAD.screens.running.myBills.items.map(bill => ({
      id: bill.id,
      title: bill.title,
      amount: bill.total.formatted,
      type: "income",
      status: bill.progress.percent === 100 ? "completed" : "pending",
      method: bill.progress.label,
      date: bill.date
    }));

    return [...createdBills, ...pending, ...completed];
  };

  const allTransactions = processTransactions();
  
  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = allTransactions;
    
    // Filter by tab
    switch (activeTab) {
      case "tagihan":
        // Show created bills (income) and pending payments (expense + pending)
        filtered = allTransactions.filter(t => 
          t.type === "income" || (t.type === "expense" && t.status === "pending")
        );
        break;
      case "riwayat":
        // Show only completed transactions
        filtered = allTransactions.filter(t => t.status === "completed");
        break;
    }
    
    // Apply category filter (only for tagihan tab)
    if (activeTab === "tagihan" && categoryFilter !== "semua") {
      switch (categoryFilter) {
        case "dibuat":
          filtered = filtered.filter(t => t.type === "income");
          break;
        case "tagihan":
          filtered = filtered.filter(t => t.type === "expense" && t.status === "pending");
          break;
      }
    }
    
    // Sort transactions
    return filtered.sort((a, b) => {
      // For tagihan tab with default sorting, prioritize by due date (closest first)
      if (activeTab === "tagihan" && sortBy === "date-newest") {
        // Pending payments (with due dates) should come first, sorted by due date
        if (a.status === "pending" && b.status === "pending") {
          return new Date(a.date).getTime() - new Date(b.date).getTime(); // Closest due date first
        }
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        // For created bills, sort by creation date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      // Regular sorting for other cases
      switch (sortBy) {
        case "date-newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-highest":
          return parseInt(b.amount.replace(/[^\d]/g, '')) - parseInt(a.amount.replace(/[^\d]/g, ''));
        case "amount-lowest":
          return parseInt(a.amount.replace(/[^\d]/g, '')) - parseInt(b.amount.replace(/[^\d]/g, ''));
        default:
          return 0;
      }
    });
  };

  // Helper functions for styling
  const getIconBgColor = (transaction: SimpleTransaction) => {
    // Tagihan dibuat (created bills) - yellow/orange
    if (transaction.type === "income") {
      return "#FEF3C7"; // Always yellow for created bills
    }
    // Pembayaran selesai (completed payments) - green
    if (transaction.status === "completed") {
      return "#DCFCE7"; // Green for completed payments
    }
    // Pending payments - red
    return "#FFEBEE";
  };

  const getIconColor = (transaction: SimpleTransaction) => {
    // Tagihan dibuat (created bills) - orange
    if (transaction.type === "income") {
      return COLORS.orange; // Always orange for created bills
    }
    // Pembayaran selesai (completed payments) - green
    if (transaction.status === "completed") {
      return COLORS.success; // Green for completed payments
    }
    // Pending payments - red
    return COLORS.red;
  };

  const getTransactionIcon = (transaction: SimpleTransaction) => {
    // Tagihan dibuat (created bills) - restaurant icon
    if (transaction.type === "income") {
      return "restaurant-outline"; // Always restaurant icon for created bills
    }
    // Pembayaran selesai (completed payments) - checkmark
    if (transaction.status === "completed") {
      return "checkmark-circle"; // Checkmark for completed payments
    }
    // Pending payments - card icon
    return "card-outline";
  };

  const getAmountColor = (transaction: SimpleTransaction) => {
    // Match amount color with card/icon color
    if (transaction.type === "income") {
      return COLORS.orange; // Orange for created bills
    }
    if (transaction.status === "completed") {
      return COLORS.success; // Green for completed payments
    }
    return COLORS.red; // Red for pending payments
  };

  const handleTransactionPress = (transaction: SimpleTransaction) => {
    if (transaction.status === "pending") {
      router.push({
        pathname: "/monitoring/transaction/pembayaran",
        params: {
          transactionId: transaction.id,
          title: transaction.title,
          amount: transaction.amount,
        },
      });
    }
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "date-newest": return "Terbaru";
      case "date-oldest": return "Terlama";
      case "amount-highest": return "Terbesar";
      case "amount-lowest": return "Terkecil";
    }
  };

  const getCategoryLabel = (category: CategoryFilter) => {
    switch (category) {
      case "semua": return "Semua";
      case "dibuat": return "Dibuat";
      case "tagihan": return "Tagihan";
    }
  };

  const resetFilters = () => {
    setCategoryFilter("semua");
    setSortBy("date-newest");
  };

  const hasActiveFilters = categoryFilter !== "semua" || sortBy !== "date-newest";

  const sortedTransactions = getFilteredAndSortedTransactions();

  // Calculate total based on currently filtered and displayed transactions
  const getTabTotal = () => {
    if (activeTab !== "tagihan") return null;
    
    // Only calculate total for pending payments (red cards) that are currently displayed
    const displayedPendingPayments = sortedTransactions
      .filter(t => t.status === "pending" && t.type === "expense");
    
    if (displayedPendingPayments.length === 0) return null;
    
    const total = displayedPendingPayments
      .reduce((sum, t) => sum + parseInt(t.amount.replace(/[^\d]/g, '')), 0);
    
    return `Rp ${total.toLocaleString("id-ID")}`;
  };

  const getTotalLabel = () => {
    return "Total Tagihan Tertunda";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Aktivitas</Text>
        <Pressable 
          style={[styles.headerFilterButton, hasActiveFilters && styles.headerFilterButtonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons 
            name="options-outline" 
            size={20} 
            color={hasActiveFilters ? COLORS.white : COLORS.textPrimary} 
          />
          {hasActiveFilters && (
            <View style={styles.headerFilterBadge} />
          )}
        </Pressable>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "tagihan" && styles.activeTab]}
          onPress={() => setActiveTab("tagihan")}
        >
          <Text style={[styles.tabText, activeTab === "tagihan" && styles.activeTabText]}>
            Tagihan
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "riwayat" && styles.activeTab]}
          onPress={() => setActiveTab("riwayat")}
        >
          <Text style={[styles.tabText, activeTab === "riwayat" && styles.activeTabText]}>
            Riwayat
          </Text>
        </Pressable>
      </View>

      {/* Conditional Total Card */}
      {getTabTotal() && (
        <View style={styles.totalCard}>
          <Text style={styles.totalAmount}>{getTabTotal()}</Text>
          <Text style={styles.totalLabel}>{getTotalLabel()}</Text>
        </View>
      )}



      {/* Filter Modal */}
      {showFilterModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </Pressable>
              <Text style={styles.filterTitle}>Filter</Text>
              <Pressable onPress={resetFilters}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>
            
            {/* Category Filter (only for tagihan tab) */}
            {activeTab === "tagihan" && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Kategori</Text>
                <View style={styles.filterOptions}>
                  {(["semua", "dibuat", "tagihan"] as CategoryFilter[]).map((option) => (
                    <Pressable
                      key={option}
                      style={[styles.filterChip, categoryFilter === option && styles.filterChipActive]}
                      onPress={() => setCategoryFilter(option)}
                    >
                      <Text style={[styles.filterChipText, categoryFilter === option && styles.filterChipTextActive]}>
                        {getCategoryLabel(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            
            {/* Sort Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Urutkan</Text>
              <View style={styles.filterOptions}>
                {(["date-newest", "date-oldest", "amount-highest", "amount-lowest"] as SortOption[]).map((option) => (
                  <Pressable
                    key={option}
                    style={[styles.filterChip, sortBy === option && styles.filterChipActive]}
                    onPress={() => setSortBy(option)}
                  >
                    <Text style={[styles.filterChipText, sortBy === option && styles.filterChipTextActive]}>
                      {getSortLabel(option)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <Pressable 
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Terapkan Filter</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction List */}
        {sortedTransactions.map((transaction) => (
          <View key={transaction.id} style={[styles.transactionCard, { borderLeftColor: getIconColor(transaction) }]}>
            <View style={styles.transactionItem}>
              <Pressable
                style={styles.transactionContent}
                onPress={() => (transaction.type === "income" && activeTab === "tagihan") ? toggleExpanded(transaction.id) : null}
              >
                <View style={[styles.iconContainer, { backgroundColor: getIconBgColor(transaction) }]}>
                  <Ionicons 
                    name={getTransactionIcon(transaction)} 
                    size={20} 
                    color={getIconColor(transaction)} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionSubtitle}>
                    {transaction.from && `${transaction.from} • `}
                    {transaction.method}
                  </Text>
                  {transaction.status === "pending" && (
                    <Text style={styles.dueDateText}>
                      Jatuh tempo: {transaction.date}
                    </Text>
                  )}
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: getAmountColor(transaction) }]}>
                    {transaction.amount}
                  </Text>
                  {transaction.type === "income" && activeTab === "tagihan" && (
                    <Pressable onPress={() => toggleExpanded(transaction.id)}>
                      <Ionicons
                        name={expandedItems[activeTab].has(transaction.id) ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  )}
                </View>
              </Pressable>
              
              {/* Payment Button for Pending Transactions */}
              {transaction.status === "pending" && (
                <View style={styles.paymentButtonContainer}>
                  <Pressable 
                    style={styles.payTagihanButton}
                    onPress={() => handleTransactionPress(transaction)}
                  >
                    <Text style={styles.payTagihanText}>Bayar Tagihan</Text>
                  </Pressable>
                </View>
              )}
            </View>
            
            {/* Expanded Content for Income (Created Bills) */}
            {transaction.type === "income" && expandedItems[activeTab].has(transaction.id) && activeTab === "tagihan" && (
              <View style={styles.expandedContent}>
                <Text style={styles.expandedTitle}>Detail Pembayaran</Text>
                <View style={styles.payerItem}>
                  <Text style={styles.payerName}>John Doe</Text>
                  <View style={styles.payerRight}>
                    <Text style={styles.payerAmount}>Rp 90.000</Text>
                    <View style={styles.statusBadgeSuccess}>
                      <Text style={styles.statusTextSuccess}>Lunas</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.payerItem, styles.lastPayerItem]}>
                  <Text style={styles.payerName}>Jane Smith</Text>
                  <View style={styles.payerRight}>
                    <Text style={styles.payerAmount}>Rp 90.000</Text>
                    <View style={styles.statusBadgePending}>
                      <Text style={styles.statusTextPending}>Tertunda</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Empty State */}
        {sortedTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Tidak ada transaksi</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable style={styles.fab} onPress={() => router.push("/create-bill")}>
        <Ionicons name="add" size={24} color={COLORS.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  headerFilterButton: {
    padding: 8,
    borderRadius: 20,
    position: "relative",
  },
  headerFilterButtonActive: {
    backgroundColor: COLORS.teal,
  },
  headerFilterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.orange,
  },
  tabContainer: {
    flexDirection: "row",
    margin: 16,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.teal,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  filterModal: {
    backgroundColor: COLORS.white,
    margin: 0,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  resetText: {
    fontSize: 14,
    color: COLORS.teal,
    fontWeight: "600",
  },
  filterSection: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  applyButton: {
    margin: 16,
    backgroundColor: COLORS.teal,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  transactionItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  transactionInfo: {
    flex: 1,
    justifyContent: "center",
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 0,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  dueDateText: {
    fontSize: 12,
    color: COLORS.orange,
    fontWeight: "bold",
    lineHeight: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  payerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  payerName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  payerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  lastPayerItem: {
    borderBottomWidth: 0,
  },
  statusBadgeSuccess: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
  },
  statusTextSuccess: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16A34A",
  },
  statusBadgePending: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
  },
  statusTextPending: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
  },
  paymentButtonContainer: {
    marginTop: 8,
  },
  payTagihanButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  payTagihanText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});