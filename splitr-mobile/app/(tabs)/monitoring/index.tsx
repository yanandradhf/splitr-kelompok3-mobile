import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from "../../../constants/theme";
import { API_CONFIG } from "../../../constants/config";
import api from "../../../services/api";
import { formatRp } from "../../../lib/currency";
import { useTransactionStore } from "../../../store/transaction.store";
import { useMonitoringStore } from "../../../store/monitoring.store";
import { getBillNavigationPath } from "../../../utils/billEndpoints";
import {
  SkeletonMonitoringList,
  SkeletonHistoryList,
} from "../../../components/ui/Skeleton";

interface BillActivity {
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

type SortOption =
  | "date-newest"
  | "date-oldest"
  | "amount-highest"
  | "amount-lowest"
  | "deadline-nearest"
  | "deadline-farthest";
type CategoryFilter = "semua" | "dibuat" | "berjalan" | "selesai" | "expired";
type StatusFilter = "semua" | "selesai" | "terlambat" | "terjadwal";

export default function MonitoringIndex() {
  const [activeTab, setActiveTab] = useState<"tagihan" | "riwayat">("tagihan");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("semua");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: Set<string>;
  }>({
    tagihan: new Set(),
    riwayat: new Set(),
  });
  const {
    billActivities,
    paymentHistory: storePaymentHistory,
    loading,
    historyLoading,
    fetchMyActivity,
    fetchPaymentHistory,
  } = useMonitoringStore();

  useEffect(() => {
    fetchMyActivity();
  }, []);

  useEffect(() => {
    const unsubscribe = router.addListener?.("focus", () => {
      console.log("🔄 Monitoring screen focused - refreshing data");
      fetchMyActivity();
      if (activeTab === "riwayat") {
        fetchPaymentHistory();
      }
    });
    return unsubscribe;
  }, [activeTab]);

  const toggleExpanded = (id: string) => {
    const currentTabExpanded = new Set(expandedItems[activeTab]);
    if (currentTabExpanded.has(id)) {
      currentTabExpanded.delete(id);
    } else {
      currentTabExpanded.add(id);
    }
    setExpandedItems({
      ...expandedItems,
      [activeTab]: currentTabExpanded,
    });
  };

  const getFilteredBills = () => {
    if (activeTab !== "tagihan") return [];

    // Force fresh data from store
    let filtered = [...billActivities];
    console.log("🔄 Using fresh bill data:", filtered.length, "bills");

    // Apply category filter with smart prioritization
    switch (categoryFilter) {
      case "berjalan":
        // Prioritas utama: tagihan yang harus dibayar
        filtered = filtered.filter((bill) => {
          const isPaid =
            bill.paymentStatus === "completed" ||
            bill.paymentStatus === "completed_scheduled" ||
            bill.paymentStatus === "paid" ||
            bill.actions?.isPaid;
          const isScheduled = bill.paymentStatus === "scheduled";
          return (!bill.isHost && !isPaid && !bill.isExpired) || isScheduled;
        });
        break;
      case "dibuat":
        filtered = filtered.filter((bill) => bill.isHost);
        break;
      case "selesai":
        filtered = filtered.filter((bill) => {
          const isPaid =
            bill.paymentStatus === "completed" ||
            bill.paymentStatus === "completed_scheduled" ||
            bill.paymentStatus === "paid" ||
            bill.actions?.isPaid;
          return isPaid;
        });
        break;
      case "expired":
        filtered = filtered.filter((bill) => {
          const isPaid =
            bill.paymentStatus === "completed" ||
            bill.paymentStatus === "completed_scheduled" ||
            bill.paymentStatus === "paid" ||
            bill.actions?.isPaid;
          return bill.isExpired && !isPaid;
        });
        break;
      case "semua":
      default:
        // When showing all, prioritize actionable bills first
        filtered = filtered.sort((a, b) => {
          // Prioritas 1: Tagihan yang harus dibayar (paling urgent)
          const aIsPaid =
            a.paymentStatus === "completed" ||
            a.paymentStatus === "completed_scheduled" ||
            a.paymentStatus === "paid" ||
            a.actions?.isPaid;
          const bIsPaid =
            b.paymentStatus === "completed" ||
            b.paymentStatus === "completed_scheduled" ||
            b.paymentStatus === "paid" ||
            b.actions?.isPaid;
          const aUrgent = !a.isHost && !aIsPaid && !a.isExpired;
          const bUrgent = !b.isHost && !bIsPaid && !b.isExpired;
          if (aUrgent && !bUrgent) return -1;
          if (!aUrgent && bUrgent) return 1;

          // Prioritas 2: Host bills (yang saya buat)
          if (a.isHost && !b.isHost) return -1;
          if (!a.isHost && b.isHost) return 1;

          return 0;
        });
        break;
    }

    // Apply user's sort preference
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-highest":
          return b.yourShare - a.yourShare;
        case "amount-lowest":
          return a.yourShare - b.yourShare;
        case "deadline-nearest":
          if (!a.paymentDeadline && !b.paymentDeadline) return 0;
          if (!a.paymentDeadline) return 1;
          if (!b.paymentDeadline) return -1;
          return (
            new Date(a.paymentDeadline).getTime() -
            new Date(b.paymentDeadline).getTime()
          );
        case "deadline-farthest":
          if (!a.paymentDeadline && !b.paymentDeadline) return 0;
          if (!a.paymentDeadline) return 1;
          if (!b.paymentDeadline) return -1;
          return (
            new Date(b.paymentDeadline).getTime() -
            new Date(a.paymentDeadline).getTime()
          );
        default:
          return 0;
      }
    });
  };

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState(storePaymentHistory);

  useEffect(() => {
    setPaymentHistory(storePaymentHistory);
  }, [storePaymentHistory]);

  const fetchPaymentHistoryLocal = async () => {
    if (activeTab !== "riwayat") return;
    await fetchPaymentHistory();
  };

  useEffect(() => {
    if (activeTab === "riwayat") {
      fetchPaymentHistoryLocal();
    }
  }, [activeTab]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMyActivity();
      if (activeTab === "riwayat") {
        await fetchPaymentHistory();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, fetchMyActivity, fetchPaymentHistory]);

  const getStatusBadgeHistory = (status, paymentType, isLate = false) => {
    if (isLate || status === "completed_late") {
      return { text: "Terlambat", color: "#D97706", bg: "#FEF3C7" };
    }
    if (status === "completed" && paymentType === "instant") {
      return { text: "Langsung", color: COLORS.success, bg: "#DCFCE7" };
    }
    if (status === "completed_scheduled") {
      return { text: "Terjadwal", color: COLORS.teal, bg: "#F0F9FF" };
    }
    if (status === "pending") {
      return { text: "Menunggu", color: COLORS.warning, bg: "#FEF3C7" };
    }
    return { text: "Selesai", color: COLORS.success, bg: "#DCFCE7" };
  };

  const getStatusBadgeActivity = (bill: BillActivity) => {
    // Check for late payment first
    if (bill.paymentStatus === "completed_late") {
      return { text: "Terlambat", color: "#D97706", bg: "#FEF3C7" };
    }

    // For host: check if all participants have paid
    if (bill.isHost && bill.paymentSummary) {
      const { paidCount, totalParticipants } = bill.paymentSummary;
      if (paidCount < totalParticipants) {
        return { text: "Belum selesai", color: COLORS.warning, bg: "#FFF7ED" };
      }
      return { text: "Selesai", color: COLORS.success, bg: "#DCFCE7" };
    }

    // For participants - check new API response format
    if (bill.paymentStatus === "scheduled") {
      return { text: "Dijadwalkan", color: COLORS.teal, bg: "#F0F9FF" };
    }
    if (bill.paymentStatus === "completed_scheduled") {
      return { text: "Terjadwal Selesai", color: COLORS.teal, bg: "#F0F9FF" };
    }
    if (
      bill.paymentStatus === "completed" ||
      bill.paymentStatus === "paid" ||
      bill.actions?.isPaid
    ) {
      return { text: "Selesai", color: COLORS.success, bg: "#DCFCE7" };
    }

    if (bill.isExpired) {
      return {
        text: "Kadaluarsa",
        color: COLORS.red,
        bg: "#FEF2F2",
      };
    }

    // Default pending status
    return { text: "Belum Bayar", color: "#EF4444", bg: "#FEF2F2" };
  };

  const handleHistoryCardPress = async (paymentId) => {
    try {
      const response = await api.get(
        `${API_CONFIG.ENDPOINTS.PAYMENT_RECEIPT.replace(
          ":paymentId",
          paymentId
        )}`
      );
      if (response.data.success) {
        router.push({
          pathname: "/payment-receipt",
          params: {
            receiptData: JSON.stringify(response.data.receipt),
          },
        });
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
    }
  };

  const handleBillPress = (bill: BillActivity, event?: any) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("🔍 Bill press - Role check:", {
      billId: bill.billId,
      billName: bill.billName,
      isHost: bill.isHost,
      role: bill.role,
    });

    // Use utility function for correct navigation
    const navigationPath = getBillNavigationPath(bill.billId, bill.isHost);
    console.log(
      `📍 Navigating to: ${navigationPath.pathname} (${
        bill.isHost ? "HOST" : "PARTICIPANT"
      })`
    );

    router.push(navigationPath);
  };

  const handlePaymentPress = (bill: BillActivity) => {
    router.push({
      pathname: "/payment-new",
      params: {
        billId: bill.billId,
        billName: bill.billName,
        amount: bill.yourShare.toString(),
        hostName: bill.hostName,
        hostAccount: bill.hostAccount || "",
        paymentDeadline: bill.paymentDeadline,
        canSchedule: bill.canSchedule ? "true" : "false",
        isOverdue: bill.isExpired.toString(),
      },
    });
  };

  const getStatusBadge = getStatusBadgeActivity;

  const getHostStatusText = (bill: BillActivity) => {
    if (!bill.paymentSummary) {
      // For bills without paymentSummary, calculate from participantsStatus
      if (bill.participantsStatus && bill.participantsStatus.length > 0) {
        const paidCount = bill.participantsStatus.filter(
          (p) => p.paymentStatus === "completed"
        ).length;
        return `${paidCount}/${bill.participantsStatus.length} bayar`;
      }
      return "0/0 bayar";
    }
    const { paidCount, totalParticipants } = bill.paymentSummary;
    return `${paidCount}/${totalParticipants} bayar`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "amount-highest":
        return "Nominal Terbesar";
      case "date-newest":
        return "Terbaru";
      case "amount-lowest":
        return "Nominal Terkecil";
      case "date-oldest":
        return "Terlama";
      case "deadline-nearest":
        return "Deadline Terdekat";
      case "deadline-farthest":
        return "Deadline Terjauh";
    }
  };

  const getCategoryLabel = (category: CategoryFilter) => {
    switch (category) {
      case "semua":
        return "Semua";
      case "dibuat":
        return "Saya Buat";
      case "berjalan":
        return "Berjalan";
      case "selesai":
        return "Selesai";
      case "expired":
        return "Kadaluarsa";
    }
  };

  const resetFilters = () => {
    setCategoryFilter("semua");
    setStatusFilter("semua");
    setSortBy("date-newest");
  };

  const hasActiveFilters =
    categoryFilter !== "semua" ||
    statusFilter !== "semua" ||
    sortBy !== "date-newest";

  const filteredBills = getFilteredBills();

  // Calculate comprehensive dashboard info
  const getDashboardInfo = () => {
    if (activeTab !== "tagihan") return null;

    const allBills = billActivities; // Use all bills, not filtered
    const now = new Date();

    // Participant bills (money I need to pay)
    const participantBills = allBills.filter((bill) => !bill.isHost);
    const ongoingParticipant = participantBills.filter((bill) => {
      const isPaid =
        bill.paymentStatus === "completed" ||
        bill.paymentStatus === "completed_scheduled" ||
        bill.paymentStatus === "paid" ||
        bill.actions?.isPaid;
      return !isPaid && !bill.isExpired;
    });
    const expiredParticipant = participantBills.filter((bill) => {
      const isPaid =
        bill.paymentStatus === "completed" ||
        bill.paymentStatus === "completed_scheduled" ||
        bill.paymentStatus === "paid" ||
        bill.actions?.isPaid;
      return bill.isExpired && !isPaid;
    });
    const completedParticipant = participantBills.filter((bill) => {
      const isPaid =
        bill.paymentStatus === "completed" ||
        bill.paymentStatus === "completed_scheduled" ||
        bill.paymentStatus === "paid" ||
        bill.actions?.isPaid;
      return isPaid;
    });

    // Host bills (money coming to me)
    const hostBills = allBills.filter((bill) => bill.isHost);
    console.log(
      "🏠 Host bills:",
      hostBills.map((b) => ({
        name: b.billName,
        paymentSummary: b.paymentSummary,
      }))
    );

    const ongoingHost = hostBills.filter((bill) => {
      if (bill.paymentSummary) {
        const isOngoing =
          bill.paymentSummary.paidCount < bill.paymentSummary.totalParticipants;
        console.log(
          `  📊 ${bill.billName}: ${bill.paymentSummary.paidCount}/${
            bill.paymentSummary.totalParticipants
          } = ${isOngoing ? "ongoing" : "completed"}`
        );
        return isOngoing;
      }
      console.log(`  ⚠️ ${bill.billName}: no paymentSummary, assuming ongoing`);
      return true; // Assume ongoing if no summary
    });

    const completedHost = hostBills.filter((bill) => {
      if (bill.paymentSummary) {
        return (
          bill.paymentSummary.paidCount >= bill.paymentSummary.totalParticipants
        );
      }
      return false;
    });

    console.log("📈 Stats:", {
      ongoingHost: ongoingHost.length,
      completedHost: completedHost.length,
      totalHost: hostBills.length,
    });

    // Calculate totals
    const totalToPay = ongoingParticipant.reduce(
      (sum, bill) => sum + bill.yourShare,
      0
    );
    const totalToReceive = ongoingHost.reduce((sum, bill) => {
      return sum + (bill.paymentSummary?.totalPending || 0);
    }, 0);

    // Urgent bills (deadline within 24 hours)
    const urgentBills = ongoingParticipant.filter((bill) => {
      if (!bill.paymentDeadline) return false;
      const deadline = new Date(bill.paymentDeadline);
      const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursLeft <= 24 && hoursLeft > 0;
    });

    // Always show dashboard card, even with empty data

    return {
      // Financial overview
      totalToPay: formatRp(totalToPay),
      totalToReceive: formatRp(totalToReceive),

      // Bill counts
      stats: {
        ongoingParticipant: ongoingParticipant.length,
        ongoingHost: ongoingHost.length,
        completedParticipant: completedParticipant.length,
        completedHost: completedHost.length,
        expiredParticipant: expiredParticipant.length,
        urgentCount: urgentBills.length,
      },

      // Show states
      hasData: allBills.length > 0,
      hasPayments: ongoingParticipant.length > 0,
      hasHost: hostBills.length > 0,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "tagihan" && styles.activeTab]}
          onPress={() => {
            setActiveTab("tagihan");
            fetchMyActivity();
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "tagihan" && styles.activeTabText,
            ]}
          >
            Tagihan
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "riwayat" && styles.activeTab]}
          onPress={() => {
            setActiveTab("riwayat");
            fetchPaymentHistoryLocal();
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "riwayat" && styles.activeTabText,
            ]}
          >
            Riwayat
          </Text>
        </Pressable>
      </View>

      {/* Compact Summary Card - Tagihan */}
      {activeTab === "tagihan" && (
        <View style={styles.compactCard}>
          {/* Complex Chart Effect */}
          <View style={styles.chartEffect}>
            {/* Grid Lines */}
            <View style={styles.gridLines}>
              <View style={styles.gridLine1} />
              <View style={styles.gridLine2} />
              <View style={styles.gridLine3} />
            </View>

            {/* Bar Chart */}
            <View style={styles.barChart}>
              <View style={styles.bar1} />
              <View style={styles.bar2} />
              <View style={styles.bar3} />
              <View style={styles.bar4} />
              <View style={styles.bar5} />
            </View>

            {/* Trend Line */}
            <View style={styles.trendLine} />
            <View style={styles.trendArrow} />

            {/* Data Points */}
            <View style={styles.dataPoints}>
              <View style={styles.point1} />
              <View style={styles.point2} />
              <View style={styles.point3} />
              <View style={styles.point4} />
              <View style={styles.point5} />
            </View>

            {/* Percentage Indicator */}
            <View style={styles.percentageUp}>
              <View style={styles.percentArrow} />
            </View>
          </View>

          {/* Filter Button - Top Right */}
          <View style={styles.filterContainer}>
            <Pressable
              style={[
                styles.compactFilter,
                hasActiveFilters && styles.compactFilterActive,
              ]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons
                name="funnel"
                size={16}
                color={hasActiveFilters ? COLORS.teal : COLORS.white}
              />
              {hasActiveFilters && <View style={styles.compactFilterDot} />}
            </Pressable>
          </View>

          {/* Main Content - Centered */}
          <View style={styles.compactContent}>
            {(() => {
              const totalToPay = getDashboardInfo()?.totalToPay || "Rp 0";
              const isZero = totalToPay === "Rp 0";
              return (
                <>
                  {!isZero && (
                    <Text style={styles.compactAmount}>{totalToPay}</Text>
                  )}
                  <View style={styles.compactLabelRow}>
                    <Text style={styles.compactLabel}>
                      {isZero
                        ? "Anda tidak memiliki tagihan untuk dibayar"
                        : "Total Harus Dibayar"}
                    </Text>
                    {!isZero &&
                      (getDashboardInfo()?.stats?.urgentCount || 0) > 0 && (
                        <View style={styles.compactUrgent}>
                          <Text style={styles.compactUrgentText}>
                            {getDashboardInfo()?.stats?.urgentCount} urgent
                          </Text>
                        </View>
                      )}
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      )}

      {/* Compact Summary Card - Riwayat */}
      {activeTab === "riwayat" && (
        <View style={styles.compactCard}>
          {/* Complex Chart Effect */}
          <View style={styles.chartEffect}>
            {/* Grid Lines */}
            <View style={styles.gridLines}>
              <View style={styles.gridLine1} />
              <View style={styles.gridLine2} />
              <View style={styles.gridLine3} />
            </View>

            {/* Bar Chart */}
            <View style={styles.barChart}>
              <View style={styles.bar1} />
              <View style={styles.bar2} />
              <View style={styles.bar3} />
              <View style={styles.bar4} />
              <View style={styles.bar5} />
            </View>

            {/* Trend Line */}
            <View style={styles.trendLine} />
            <View style={styles.trendArrow} />

            {/* Data Points */}
            <View style={styles.dataPoints}>
              <View style={styles.point1} />
              <View style={styles.point2} />
              <View style={styles.point3} />
              <View style={styles.point4} />
              <View style={styles.point5} />
            </View>

            {/* Percentage Indicator */}
            <View style={styles.percentageUp}>
              <View style={styles.percentArrow} />
            </View>
          </View>

          {/* Filter Button - Top Right */}
          <View style={styles.filterContainer}>
            <Pressable
              style={[
                styles.compactFilter,
                hasActiveFilters && styles.compactFilterActive,
              ]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons
                name="funnel"
                size={16}
                color={hasActiveFilters ? COLORS.teal : COLORS.white}
              />
              {hasActiveFilters && <View style={styles.compactFilterDot} />}
            </Pressable>
          </View>

          {/* Main Content - Centered */}
          <View style={styles.compactContent}>
            {(() => {
              const totalPaid = paymentHistory.reduce((sum, payment) => {
                return sum + (payment.amount || 0);
              }, 0);
              const formattedTotal = formatRp(totalPaid);
              const isZero = totalPaid === 0;
              const historyCount = paymentHistory.length;

              return (
                <>
                  {!isZero && (
                    <Text style={styles.compactAmount}>{formattedTotal}</Text>
                  )}
                  <View style={styles.compactLabelRow}>
                    <Text style={styles.compactLabel}>
                      {isZero
                        ? "Belum ada riwayat pembayaran"
                        : "Total Sudah Dibayar"}
                    </Text>
                    {!isZero && historyCount > 0 && (
                      <View style={styles.compactHistoryBadge}>
                        <Text style={styles.compactHistoryBadgeText}>
                          {historyCount} transaksi
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={COLORS.textPrimary}
                />
              </Pressable>
              <Text style={styles.filterTitle}>Filter</Text>
              <Pressable onPress={resetFilters}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>

            {/* Category Filter - Urutan berdasarkan prioritas kebutuhan:
                1. Harus Bayar (tagihan) - paling urgent
                2. Selesai - untuk tracking pembayaran
                3. Saya Buat (dibuat) - untuk host
                4. Semua - overview lengkap */}
            {activeTab === "tagihan" && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Kategori</Text>
                <View style={styles.filterOptions}>
                  {(
                    [
                      "berjalan",
                      "selesai",
                      "dibuat",
                      "semua",
                    ] as CategoryFilter[]
                  ).map((option) => (
                    <Pressable
                      key={option}
                      style={[
                        styles.filterChip,
                        categoryFilter === option && styles.filterChipActive,
                      ]}
                      onPress={() => setCategoryFilter(option)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          categoryFilter === option &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {getCategoryLabel(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Status Filter - Only for Riwayat */}
            {activeTab === "riwayat" && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  {(
                    [
                      "semua",
                      "selesai",
                      "terlambat",
                      "terjadwal",
                    ] as StatusFilter[]
                  ).map((option) => (
                    <Pressable
                      key={option}
                      style={[
                        styles.filterChip,
                        statusFilter === option && styles.filterChipActive,
                      ]}
                      onPress={() => setStatusFilter(option)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          statusFilter === option &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {option === "semua"
                          ? "Semua"
                          : option === "selesai"
                          ? "Langsung"
                          : option === "terlambat"
                          ? "Terlambat"
                          : "Terjadwal"}
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
                {(activeTab === "riwayat"
                  ? [
                      "amount-highest",
                      "amount-lowest",
                      "date-newest",
                      "date-oldest",
                    ]
                  : ([
                      "deadline-nearest",
                      "amount-highest",
                      "date-newest",
                      "amount-lowest",
                      "date-oldest",
                      "deadline-farthest",
                    ] as SortOption[])
                ).map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.filterChip,
                      sortBy === option && styles.filterChipActive,
                    ]}
                    onPress={() => setSortBy(option)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        sortBy === option && styles.filterChipTextActive,
                      ]}
                    >
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.teal}
            colors={[COLORS.teal]}
          />
        }
      >
        {/* Tab Tagihan - New API */}
        {activeTab === "tagihan" &&
          (loading ? (
            <SkeletonMonitoringList />
          ) : (
            filteredBills.map((bill) => {
              const statusBadge = getStatusBadge(bill);
              const isExpanded = expandedItems[activeTab].has(bill.billId);

              const getCardStyle = () => {
                const isPaid =
                  bill.paymentStatus === "completed" ||
                  bill.paymentStatus === "completed_scheduled" ||
                  bill.paymentStatus === "completed_late" ||
                  bill.paymentStatus === "paid" ||
                  bill.actions?.isPaid;

                // Late payment gets special styling
                if (bill.paymentStatus === "completed_late") {
                  return styles.lateCard;
                }

                if (bill.isExpired && !isPaid) {
                  return styles.expiredCard;
                }

                // For host: check if all participants have paid
                if (bill.isHost && bill.paymentSummary) {
                  const { paidCount, totalParticipants } = bill.paymentSummary;
                  if (paidCount >= totalParticipants) {
                    return styles.completedCard;
                  }
                  return styles.hostCard;
                }

                if (isPaid) {
                  return bill.paymentStatus === "completed_scheduled"
                    ? styles.scheduledCard
                    : styles.completedCard;
                }
                if (bill.paymentStatus === "scheduled") {
                  return styles.scheduledCard;
                }
                if (bill.isHost) {
                  return styles.hostCard;
                }
                return styles.participantCard;
              };

              return (
                <View
                  key={bill.billId}
                  style={[styles.billCard, getCardStyle()]}
                >
                  <Pressable
                    style={[
                      styles.billContent,
                      bill.isExpired &&
                        bill.paymentStatus !== "completed" &&
                        styles.expiredContent,
                    ]}
                    onPress={(event) => handleBillPress(bill, event)}
                    delayPressIn={0}
                    delayPressOut={100}
                  >
                    {/* Bill Header */}
                    <View style={styles.billHeader}>
                      <View style={styles.billInfo}>
                        <Text style={styles.billTitle}>{bill.billName}</Text>
                        <Text style={styles.billCode}>{bill.billCode}</Text>
                        {!bill.isHost ? (
                          <Text style={styles.hostName}>
                            dari {bill.hostName}
                          </Text>
                        ) : (
                          <View style={styles.hostBadge}>
                            <Ionicons
                              name="person"
                              size={10}
                              color={COLORS.white}
                            />
                            <Text style={styles.hostBadgeText}>Host</Text>
                          </View>
                        )}
                        {bill.isHost && (
                          <Text style={styles.statusText}>
                            Status: {getHostStatusText(bill)}
                          </Text>
                        )}
                      </View>

                      <View style={styles.billRight}>
                        {bill.isHost ? (
                          <View style={styles.hostAmountContainer}>
                            <Text style={styles.totalBillAmount}>
                              {formatRp(
                                bill.displayAmount || bill.totalBillAmount
                              )}
                            </Text>
                            <Text style={styles.hostShareAmount}>
                              Anda bayar: {formatRp(bill.yourShare)}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.billAmount}>
                            {formatRp(bill.yourShare)}
                          </Text>
                        )}
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusBadge.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: statusBadge.color },
                            ]}
                          >
                            {statusBadge.text}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Deadline for participants */}
                    {!bill.isHost &&
                      bill.paymentDeadline &&
                      !bill.isExpired && (
                        <Text style={styles.deadlineText}>
                          Jatuh tempo: {formatDate(bill.paymentDeadline)}
                        </Text>
                      )}

                    {/* Scheduled payment info */}
                    {(bill.paymentStatus === "scheduled" ||
                      bill.paymentStatus === "completed_scheduled") && (
                      <View style={styles.scheduledInfo}>
                        <Ionicons
                          name="calendar"
                          size={14}
                          color={COLORS.teal}
                        />
                        <Text style={styles.scheduledText}>
                          {bill.scheduledDate
                            ? bill.paymentStatus === "scheduled"
                              ? `Akan dibayar: ${formatDate(
                                  bill.scheduledDate
                                )}`
                              : `Dijadwalkan: ${formatDate(bill.scheduledDate)}`
                            : bill.paymentStatus === "scheduled"
                            ? "Pembayaran dijadwalkan"
                            : "Terjadwal selesai"}
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  {/* Payment Button for Participants */}
                  {(() => {
                    const shouldShowButton =
                      !bill.isHost &&
                      bill.paymentStatus !== "completed" &&
                      !bill.isExpired;
                    console.log(`🔍 Button Debug - ${bill.billName}:`, {
                      isHost: bill.isHost,
                      canPay: bill.actions?.canPay,
                      canSchedule: bill.canSchedule,
                      showPayNow: bill.showPayNow,
                      paymentStatus: bill.paymentStatus,
                      isExpired: bill.isExpired,
                      allowScheduledPayment: bill.allowScheduledPayment,
                      shouldShowButton: shouldShowButton,
                      actions: bill.actions,
                    });
                    return null;
                  })()}
                  {(() => {
                    const isPaid =
                      bill.paymentStatus === "completed" ||
                      bill.paymentStatus === "completed_scheduled" ||
                      bill.paymentStatus === "completed_late" ||
                      bill.paymentStatus === "paid" ||
                      bill.actions?.isPaid;
                    const isScheduled = bill.paymentStatus === "scheduled";
                    const canPay =
                      bill.actions?.canPay !== false && !isPaid && !isScheduled;
                    const canSchedule =
                      bill.actions?.canSchedule && !bill.isExpired;

                    return (
                      !bill.isHost &&
                      canPay && (
                        <View style={styles.paymentButtonContainer}>
                          <Pressable
                            style={[
                              styles.payButton,
                              bill.isExpired
                                ? styles.overdueButton
                                : canSchedule
                                ? styles.scheduledButton
                                : styles.instantButton,
                            ]}
                            onPress={() => handlePaymentPress(bill)}
                          >
                            <Ionicons
                              name="flash"
                              size={14}
                              color={
                                bill.isExpired
                                  ? COLORS.red
                                  : canSchedule
                                  ? "#0369A1"
                                  : COLORS.teal
                              }
                              style={styles.buttonIcon}
                            />
                            <Text
                              style={[
                                styles.payButtonText,
                                {
                                  color: bill.isExpired
                                    ? COLORS.red
                                    : canSchedule
                                    ? "#0369A1"
                                    : COLORS.teal,
                                },
                              ]}
                            >
                              {bill.isExpired
                                ? "Bayar Walau Terlambat"
                                : canSchedule
                                ? "Bayar atau Jadwalkan"
                                : "Bayar Sekarang"}
                            </Text>
                          </Pressable>
                        </View>
                      )
                    );
                  })()}

                  {/* Host Dropdown - Show participants status */}
                  {bill.isHost &&
                    bill.participantsStatus &&
                    bill.participantsStatus.length > 0 && (
                      <Pressable
                        style={styles.dropdownToggle}
                        onPress={() => toggleExpanded(bill.billId)}
                      >
                        <Text style={styles.dropdownText}>
                          Status Pembayaran
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color={COLORS.textSecondary}
                        />
                      </Pressable>
                    )}

                  {/* Expanded Content for Host */}
                  {bill.isHost && isExpanded && bill.participantsStatus && (
                    <View style={styles.expandedContent}>
                      {bill.participantsStatus.map((participant) => {
                        const getParticipantStatus = () => {
                          if (participant.paymentStatus === "completed_late") {
                            return {
                              text: "Terlambat",
                              color: "#D97706",
                              bg: "#FEF3C7",
                            };
                          }
                          if (participant.paymentStatus === "completed") {
                            return {
                              text: "Selesai",
                              color: COLORS.success,
                              bg: "#DCFCE7",
                            };
                          }
                          if (participant.paymentStatus === "scheduled") {
                            return {
                              text: "Dijadwalkan",
                              color: COLORS.teal,
                              bg: "#F0F9FF",
                            };
                          }
                          if (
                            participant.paymentStatus === "completed_scheduled"
                          ) {
                            return {
                              text: "Terjadwal Selesai",
                              color: COLORS.teal,
                              bg: "#F0F9FF",
                            };
                          }
                          return {
                            text: "Belum bayar",
                            color: "#EF4444",
                            bg: "#FEF2F2",
                          };
                        };

                        const participantStatus = getParticipantStatus();

                        return (
                          <View
                            key={participant.participantId}
                            style={styles.participantItem}
                          >
                            <View style={styles.participantInfo}>
                              <Text style={styles.participantName}>
                                {participant.name}
                              </Text>
                              <Text style={styles.participantAmount}>
                                {formatRp(participant.amountShare)}
                              </Text>
                              {(participant.paymentStatus === "scheduled" ||
                                participant.paymentStatus ===
                                  "completed_scheduled") &&
                                participant.scheduledDate && (
                                  <Text style={styles.scheduledDateText}>
                                    {participant.paymentStatus === "scheduled"
                                      ? `Akan dibayar: ${formatDate(
                                          participant.scheduledDate
                                        )}`
                                      : `Dijadwalkan: ${formatDate(
                                          participant.scheduledDate
                                        )}`}
                                  </Text>
                                )}
                            </View>
                            <View
                              style={[
                                styles.participantStatusBadge,
                                { backgroundColor: participantStatus.bg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.participantStatusText,
                                  { color: participantStatus.color },
                                ]}
                              >
                                {participantStatus.text}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          ))}

        {/* Tab Riwayat - Original Design */}
        {activeTab === "riwayat" &&
          (historyLoading ? (
            <SkeletonHistoryList />
          ) : (
            paymentHistory
              .filter((payment) => {
                if (statusFilter === "semua") return true;
                if (statusFilter === "terlambat")
                  return payment.isLate || payment.status === "completed_late";
                if (statusFilter === "terjadwal")
                  return (
                    payment.paymentType === "scheduled" ||
                    payment.status === "completed_scheduled"
                  );
                if (statusFilter === "selesai")
                  return (
                    payment.status === "completed" &&
                    !payment.isLate &&
                    payment.paymentType !== "scheduled"
                  );
                return true;
              })
              .map((payment) => {
                const statusBadge = getStatusBadgeHistory(
                  payment.status,
                  payment.paymentType,
                  payment.isLate
                );
                const paymentDate = new Date(payment.paidAt).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                  }
                );
                const paymentTime = new Date(payment.paidAt).toLocaleTimeString(
                  "id-ID",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <Pressable
                    key={payment.paymentId}
                    style={styles.newHistoryCard}
                    onPress={() => handleHistoryCardPress(payment.paymentId)}
                  >
                    <View style={styles.newHistoryHeader}>
                      <View style={styles.newHistoryLeft}>
                        <View style={styles.newHistoryIcon}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={COLORS.success}
                          />
                        </View>
                        <View style={styles.newHistoryInfo}>
                          <Text style={styles.newHistoryTitle}>
                            Pembayaran Berhasil
                          </Text>
                          <Text style={styles.newHistoryBill}>
                            {payment.billName}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.newHistoryAmount}>
                        <Text style={styles.newAmountText}>
                          {formatRp(payment.amount)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.newHistoryDetails}>
                      <View style={styles.newDetailRow}>
                        <Text style={styles.newDetailLabel}>Kode Tagihan</Text>
                        <Text style={styles.newDetailValue}>
                          #{payment.billCode || payment.paymentId}
                        </Text>
                      </View>
                      <View style={styles.newDetailRow}>
                        <Text style={styles.newDetailLabel}>Kepada</Text>
                        <Text style={styles.newDetailValue}>
                          {payment.hostName}
                        </Text>
                      </View>
                      <View style={styles.newDetailRow}>
                        <Text style={styles.newDetailLabel}>Waktu</Text>
                        <Text style={styles.newDetailValue}>
                          {paymentDate} • {paymentTime}
                        </Text>
                      </View>
                      <View style={styles.newDetailRow}>
                        <Text style={styles.newDetailLabel}>Status</Text>
                        <View
                          style={[
                            styles.newStatusBadge,
                            { backgroundColor: statusBadge.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.newStatusText,
                              { color: statusBadge.color },
                            ]}
                          >
                            {statusBadge.text}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })
          ))}

        {/* Empty State */}
        {((activeTab === "tagihan" && !loading && filteredBills.length === 0) ||
          (activeTab === "riwayat" &&
            !historyLoading &&
            paymentHistory.length === 0)) && (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>Tidak ada aktivitas</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },

  tabContainer: {
    flexDirection: "row",
    margin: SPACING.lg,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  filterContainer: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 2,
  },
  compactContent: {
    alignItems: "center",
    paddingTop: SPACING.sm,
  },

  compactAmount: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  compactLabelRow: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  compactLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    textAlign: "center",
  },
  compactUrgent: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  compactUrgentText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  compactHistoryBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  compactHistoryBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  compactFilter: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    position: "relative",
  },
  compactFilterActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  compactFilterDot: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  chartEffect: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    height: 60,
    opacity: 0.3,
  },
  gridLines: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  gridLine1: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#FFE4B5",
  },
  gridLine2: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#FFE4B5",
  },
  gridLine3: {
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#FFE4B5",
  },
  barChart: {
    position: "absolute",
    bottom: 0,
    left: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  bar1: {
    width: 6,
    height: 20,
    backgroundColor: "#FFE4B5",
    borderRadius: 3,
  },
  bar2: {
    width: 6,
    height: 28,
    backgroundColor: "#FFE4B5",
    borderRadius: 3,
  },
  bar3: {
    width: 6,
    height: 35,
    backgroundColor: "#FFE4B5",
    borderRadius: 3,
  },
  bar4: {
    width: 6,
    height: 42,
    backgroundColor: "#FFE4B5",
    borderRadius: 3,
  },
  bar5: {
    width: 6,
    height: 50,
    backgroundColor: "#FFE4B5",
    borderRadius: 3,
  },
  trendLine: {
    position: "absolute",
    bottom: 25,
    left: 20,
    width: 80,
    height: 2,
    backgroundColor: "#FFA500",
    transform: [{ rotate: "20deg" }],
  },
  trendArrow: {
    position: "absolute",
    bottom: 40,
    right: 15,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderTopWidth: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFA500",
    borderTopColor: "transparent",
  },
  dataPoints: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  point1: {
    position: "absolute",
    bottom: 18,
    left: 22,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFA500",
  },
  point2: {
    position: "absolute",
    bottom: 26,
    left: 36,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFA500",
  },
  point3: {
    position: "absolute",
    bottom: 33,
    left: 50,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFA500",
  },
  point4: {
    position: "absolute",
    bottom: 40,
    left: 64,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFA500",
  },
  point5: {
    position: "absolute",
    bottom: 48,
    left: 78,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFA500",
  },
  percentageUp: {
    position: "absolute",
    top: 5,
    right: 15,
  },
  percentArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderTopWidth: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#32CD32",
    borderTopColor: "transparent",
  },

  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.teal,
  },
  tabText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
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
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    flex: 1,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  resetText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal,
    fontFamily: FONTS.semiBold,
  },
  filterSection: {
    padding: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  filterChipText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  applyButton: {
    margin: SPACING.lg,
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
  },
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    position: "relative",
  },
  participantCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
  },
  hostCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    backgroundColor: "#F8FFFE",
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    backgroundColor: "#F0FDF4",
  },
  scheduledCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    backgroundColor: "#F0F9FF",
  },
  expiredCard: {
    borderColor: "#FCA5A5",
    borderWidth: 2,
    backgroundColor: "#FEF2F2",
    opacity: 0.8,
  },
  lateCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    backgroundColor: "#FFFBEB",
  },
  billContent: {
    padding: SPACING.lg,
  },
  expiredContent: {
    opacity: 0.7,
  },
  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.teal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    gap: 2,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  hostBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  billInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  billTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  billCode: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  hostName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  hostFinancialText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  billRight: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  billAmount: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  hostAmountContainer: {
    alignItems: "flex-end",
  },
  totalBillAmount: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  hostShareAmount: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
  deadlineText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
    marginTop: SPACING.xs,
  },
  scheduledInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  scheduledText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  scheduledDateText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.teal,
    marginTop: 2,
  },
  paymentButtonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  payButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instantButton: {
    backgroundColor: "#E0F2F1",
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  scheduledButton: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  overdueButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  buttonIcon: {
    marginRight: 6,
  },
  payButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  dropdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dropdownText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  expandedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  participantAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  participantStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  participantStatusText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
  oldTransactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 12,
  },
  oldTransactionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  oldIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#DCFCE7",
  },
  oldTransactionInfo: {
    flex: 1,
    justifyContent: "center",
  },
  oldTransactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  oldTransactionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  oldTransactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.success,
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  statusTextPending: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
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

  newHistoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  newHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  newHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  newHistoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  newHistoryInfo: {
    flex: 1,
  },
  newHistoryTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  newHistoryBill: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  newHistoryAmount: {
    alignItems: "flex-end",
  },
  newAmountText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  newHistoryDetails: {
    backgroundColor: "#F8F9FA",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  newDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newDetailLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  newDetailValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  newStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  newStatusText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
  createFab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
