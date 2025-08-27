import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { useMonitoringStore } from "../../../../store/monitoring.store";
import { getBillNavigationPath } from "../../../../utils/billEndpoints";
import { formatRp } from "../../../../lib/currency";
import api from "../../../../services/api";
import { BillActivity, PaymentHistory, SortOption, CategoryFilter, StatusFilter, StatusBadge } from "../types";

export const useMonitoringLogic = () => {
  const [activeTab, setActiveTab] = useState<"tagihan" | "riwayat">("tagihan");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("semua");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: Set<string> }>({
    tagihan: new Set(),
    riwayat: new Set(),
  });
  const [refreshing, setRefreshing] = useState(false);

  const {
    billActivities,
    paymentHistory: storePaymentHistory,
    loading,
    historyLoading,
    fetchMyActivity,
    fetchPaymentHistory,
  } = useMonitoringStore();

  const paymentHistory = storePaymentHistory || [];

  useEffect(() => {
    fetchMyActivity();
  }, [fetchMyActivity]);

  useEffect(() => {
    const unsubscribe = router.addListener?.("focus", () => {
      console.log("🔄 Monitoring screen focused - refreshing data");
      fetchMyActivity();
      if (activeTab === "riwayat") {
        fetchPaymentHistory();
      }
    });
    return unsubscribe;
  }, [activeTab, fetchMyActivity, fetchPaymentHistory]);

  const fetchPaymentHistoryLocal = useCallback(async () => {
    if (activeTab !== "riwayat") return;
    await fetchPaymentHistory();
  }, [activeTab, fetchPaymentHistory]);

  useEffect(() => {
    if (activeTab === "riwayat") {
      fetchPaymentHistoryLocal();
    }
  }, [activeTab, fetchPaymentHistoryLocal]);

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

  const isPaidStatus = (bill: BillActivity) => {
    return bill.paymentStatus === "completed" ||
           bill.paymentStatus === "completed_scheduled" ||
           bill.paymentStatus === "completed_late" ||
           bill.paymentStatus === "paid" ||
           bill.actions?.isPaid;
  };

  const getStatusBadgeHistory = (status: string, paymentType: string, isLate: boolean = false): StatusBadge => {
    if (isLate || status === "completed_late") {
      return { text: "Terlambat", color: "#D97706", bg: "#FEF3C7" };
    }
    if (status === "completed" && paymentType === "instant") {
      return { text: "Langsung", color: "#10B981", bg: "#DCFCE7" };
    }
    if (status === "completed_scheduled") {
      return { text: "Terjadwal", color: "#0891B2", bg: "#F0F9FF" };
    }
    if (status === "pending") {
      return { text: "Menunggu", color: "#F59E0B", bg: "#FEF3C7" };
    }
    return { text: "Selesai", color: "#10B981", bg: "#DCFCE7" };
  };

  const getStatusBadgeActivity = (bill: BillActivity): StatusBadge => {
    if (bill.paymentStatus === "completed_late") {
      return { text: "Terlambat", color: "#D97706", bg: "#FEF3C7" };
    }

    if (bill.isHost && bill.paymentSummary) {
      const { paidCount, totalParticipants } = bill.paymentSummary;
      return paidCount < totalParticipants
        ? { text: "Belum selesai", color: "#F59E0B", bg: "#FFF7ED" }
        : { text: "Selesai", color: "#10B981", bg: "#DCFCE7" };
    }

    if (bill.paymentStatus === "scheduled") {
      return { text: "Dijadwalkan", color: "#0891B2", bg: "#F0F9FF" };
    }
    if (bill.paymentStatus === "completed_scheduled") {
      return { text: "Terjadwal Selesai", color: "#0891B2", bg: "#F0F9FF" };
    }
    if (isPaidStatus(bill)) {
      return { text: "Selesai", color: "#10B981", bg: "#DCFCE7" };
    }
    if (bill.isExpired) {
      return { text: "Kadaluarsa", color: "#EF4444", bg: "#FEF2F2" };
    }

    return { text: "Belum Bayar", color: "#EF4444", bg: "#FEF2F2" };
  };

  const getFilteredBills = () => {
    if (activeTab !== "tagihan") return [];

    let filtered = [...billActivities];
    console.log("🔄 Using fresh bill data:", filtered.length, "bills");

    switch (categoryFilter) {
      case "berjalan":
        filtered = filtered.filter((bill) => {
          const isScheduled = bill.paymentStatus === "scheduled";
          return (!bill.isHost && !isPaidStatus(bill) && !bill.isExpired) || isScheduled;
        });
        break;
      case "dibuat":
        filtered = filtered.filter((bill) => bill.isHost);
        break;
      case "selesai":
        filtered = filtered.filter((bill) => isPaidStatus(bill));
        break;
      case "expired":
        filtered = filtered.filter((bill) => bill.isExpired && !isPaidStatus(bill));
        break;
      case "semua":
      default:
        filtered = filtered.sort((a, b) => {
          const aIsPaid = isPaidStatus(a);
          const bIsPaid = isPaidStatus(b);
          const aUrgent = !a.isHost && !aIsPaid && !a.isExpired;
          const bUrgent = !b.isHost && !bIsPaid && !b.isExpired;
          if (aUrgent && !bUrgent) return -1;
          if (!aUrgent && bUrgent) return 1;

          if (a.isHost && !b.isHost) return -1;
          if (!a.isHost && b.isHost) return 1;

          return 0;
        });
        break;
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-highest":
          return b.yourShare - a.yourShare;
        case "amount-lowest":
          return a.yourShare - b.yourShare;
        case "deadline-nearest":
          if (!a.paymentDeadline && !b.paymentDeadline) return 0;
          if (!a.paymentDeadline) return 1;
          if (!b.paymentDeadline) return -1;
          return new Date(a.paymentDeadline).getTime() - new Date(b.paymentDeadline).getTime();
        case "deadline-farthest":
          if (!a.paymentDeadline && !b.paymentDeadline) return 0;
          if (!a.paymentDeadline) return 1;
          if (!b.paymentDeadline) return -1;
          return new Date(b.paymentDeadline).getTime() - new Date(a.paymentDeadline).getTime();
        default:
          return 0;
      }
    });
  };

  const getDashboardInfo = () => {
    if (activeTab !== "tagihan") return null;

    const allBills = billActivities;
    const participantBills = allBills.filter((bill) => !bill.isHost);
    const ongoingParticipant = participantBills.filter((bill) => !isPaidStatus(bill) && !bill.isExpired);
    const totalToPay = ongoingParticipant.reduce((sum, bill) => sum + bill.yourShare, 0);

    return {
      totalToPay: formatRp(totalToPay),
      hasData: allBills.length > 0,
    };
  };

  const handleHistoryCardPress = async (paymentId: string) => {
    try {
      const response = await api.get(`/payment/${paymentId}/receipt`);
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

    const navigationPath = getBillNavigationPath(bill.billId, bill.isHost);
    console.log(`📍 Navigating to: ${navigationPath.pathname} (${bill.isHost ? "HOST" : "PARTICIPANT"})`);

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

  const getHostStatusText = (bill: BillActivity) => {
    if (!bill.paymentSummary) {
      if (bill.participantsStatus && bill.participantsStatus.length > 0) {
        const paidCount = bill.participantsStatus.filter((p) => p.paymentStatus === "completed").length;
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

  const resetFilters = () => {
    setCategoryFilter("semua");
    setStatusFilter("semua");
    setSortBy("date-newest");
  };

  const hasActiveFilters = categoryFilter !== "semua" || statusFilter !== "semua" || sortBy !== "date-newest";

  return {
    // State
    activeTab,
    sortBy,
    categoryFilter,
    statusFilter,
    showFilterModal,
    expandedItems,
    refreshing,
    loading,
    historyLoading,
    billActivities,
    paymentHistory,
    
    // Computed
    filteredBills: getFilteredBills(),
    dashboardInfo: getDashboardInfo(),
    hasActiveFilters,
    
    // Actions
    setActiveTab,
    setSortBy,
    setCategoryFilter,
    setStatusFilter,
    setShowFilterModal,
    toggleExpanded,
    onRefresh,
    resetFilters,
    
    // Handlers
    handleHistoryCardPress,
    handleBillPress,
    handlePaymentPress,
    
    // Utils
    isPaidStatus,
    getStatusBadgeHistory,
    getStatusBadgeActivity,
    getHostStatusText,
    formatDate,
    fetchPaymentHistoryLocal,
  };
};