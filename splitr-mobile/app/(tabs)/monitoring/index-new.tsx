// app/(tabs)/monitoring/index-new.tsx - Modern design based on reference
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { COLORS } from "../../../constants/theme";
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

export default function ModernMonitoringIndex() {
  const [activeTab, setActiveTab] = useState<"semua" | "dibuat" | "tertunda">("semua");
  const { runningTransactions, completedPayments } = useTransactionStore();

  // Process data into simple format
  const processTransactions = (): SimpleTransaction[] => {
    const pending: SimpleTransaction[] = runningTransactions.map(t => ({
      id: t.id,
      title: t.title,
      amount: t.amount.formatted,
      type: "expense",
      status: "pending",
      from: t.from,
      method: "Menunggu",
      date: new Date().toLocaleDateString("id-ID")
    }));

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

    // Mock some income transactions for demo
    const income: SimpleTransaction[] = [
      {
        id: "income-1",
        title: "Today Coffee",
        amount: "Rp 180.000",
        type: "income",
        status: "completed",
        method: "Bayar Nanti • 60% terbayar",
        date: new Date().toLocaleDateString("id-ID")
      }
    ];

    return [...income, ...pending, ...completed];
  };

  const allTransactions = processTransactions();
  
  // Calculate total balance
  const totalBalance = allTransactions.reduce((sum, t) => {
    const amount = parseInt(t.amount.replace(/[^\d]/g, ''));
    return t.type === "income" ? sum + amount : sum - amount;
  }, 975000);

  // Calculate summary data
  const summary = {
    totalPending: totalBalance
  };

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case "dibuat":
        return allTransactions.filter(t => t.type === "income");
      case "tertunda":
        return allTransactions.filter(t => t.status === "pending");
      default:
        return allTransactions;
    }
  };

  // Helper functions for styling
  const getIconBgColor = (type: TransactionType) => {
    return type === "income" ? "#FEF3C7" : "#FFEBEE";
  };

  const getIconColor = (type: TransactionType) => {
    return type === "income" ? COLORS.orange : COLORS.red;
  };

  const getTransactionIcon = (type: TransactionType) => {
    return type === "income" ? "restaurant-outline" : "card-outline";
  };

  const getAmountColor = (type: TransactionType) => {
    return type === "income" ? COLORS.success : COLORS.red;
  };

  const handleTransactionPress = (transaction: SimpleTransaction) => {
    if (transaction.status === "pending") {
      router.push({
        pathname: "/payment-new",
        params: {
          billId: transaction.id,
          billName: transaction.title,
          amount: transaction.amount.replace(/[^\d]/g, ''),
          hostName: transaction.from || 'Host',
          hostAccount: '1234567890',
          canSchedule: 'true',
          isOverdue: 'false'
        },
      });
    }
  };

  const todayTransactions = getFilteredTransactions().slice(0, 1);
  const yesterdayTransactions = getFilteredTransactions().slice(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Balance Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroAmount}>Rp {totalBalance.toLocaleString("id-ID")}</Text>
        <Text style={styles.heroLabel}>Total Saldo Kamu</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "semua" && styles.activeTab]}
          onPress={() => setActiveTab("semua")}
        >
          <Text style={[styles.tabText, activeTab === "semua" && styles.activeTabText]}>
            Semua
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "dibuat" && styles.activeTab]}
          onPress={() => setActiveTab("dibuat")}
        >
          <Text style={[styles.tabText, activeTab === "dibuat" && styles.activeTabText]}>
            Dibuat
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "tertunda" && styles.activeTab]}
          onPress={() => setActiveTab("tertunda")}
        >
          <Text style={[styles.tabText, activeTab === "tertunda" && styles.activeTabText]}>
            Tertunda
          </Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Section */}
        {todayTransactions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Hari Ini</Text>
            {todayTransactions.map((transaction) => (
              <Pressable
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => handleTransactionPress(transaction)}
              >
                <View style={[styles.iconContainer, { backgroundColor: getIconBgColor(transaction.type) }]}>
                  <Ionicons 
                    name={getTransactionIcon(transaction.type)} 
                    size={20} 
                    color={getIconColor(transaction.type)} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionSubtitle}>
                    {transaction.from && `${transaction.from} • `}
                    {transaction.method}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: getAmountColor(transaction.type) }]}>
                  {transaction.type === "income" ? "+" : "-"}{transaction.amount}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {/* Yesterday Section */}
        {yesterdayTransactions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Kemarin</Text>
            {yesterdayTransactions.map((transaction) => (
              <Pressable
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => handleTransactionPress(transaction)}
              >
                <View style={[styles.iconContainer, { backgroundColor: getIconBgColor(transaction.type) }]}>
                  <Ionicons 
                    name={getTransactionIcon(transaction.type)} 
                    size={20} 
                    color={getIconColor(transaction.type)} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionSubtitle}>
                    {transaction.from && `${transaction.from} • `}
                    {transaction.method}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: getAmountColor(transaction.type) }]}>
                  {transaction.type === "income" ? "+" : "-"}{transaction.amount}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {/* Empty State */}
        {getFilteredTransactions().length === 0 && (
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
  heroCard: {
    margin: 16,
    marginBottom: 8,
    padding: 24,
    backgroundColor: COLORS.teal,
    borderRadius: 20,
    alignItems: "center",
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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