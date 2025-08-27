import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatRp } from "../../../lib/currency";
import {
  SkeletonMonitoringList,
  SkeletonHistoryList,
} from "../../../components/ui/Skeleton";

// Components
import { BillCard } from "./components/BillCard";
import { HistoryCard } from "./components/HistoryCard";
import { SummaryCard } from "./components/SummaryCard";
import { FilterModal } from "./components/FilterModal";

// Hooks & Utils
import { useMonitoringLogic } from "./hooks/useMonitoringLogic";

// Styles
import { monitoringStyles } from "./styles";
import { COLORS } from "../../../constants/theme";

export default function MonitoringIndex() {
  const {
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
    paymentHistory,

    // Computed
    filteredBills,
    dashboardInfo,
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
  } = useMonitoringLogic();

  const getSummaryData = () => {
    if (activeTab === "tagihan") {
      const totalToPay = dashboardInfo?.totalToPay || "Rp 0";
      const isZero = totalToPay === "Rp 0";
      return {
        totalAmount: totalToPay,
        label: isZero
          ? "Anda tidak memiliki tagihan untuk dibayar"
          : "Total Harus Dibayar",
      };
    } else {
      const totalPaid = paymentHistory.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );
      const formattedTotal = formatRp(totalPaid);
      const isZero = totalPaid === 0;
      return {
        totalAmount: formattedTotal,
        label: isZero ? "Belum ada riwayat pembayaran" : "Total Sudah Dibayar",
      };
    }
  };

  const summaryData = getSummaryData();

  return (
    <SafeAreaView style={monitoringStyles.container}>
      {/* Tab Navigation */}
      <View style={monitoringStyles.tabContainer}>
        <Pressable
          style={[
            monitoringStyles.tab,
            activeTab === "tagihan" && monitoringStyles.activeTab,
          ]}
          onPress={() => {
            setActiveTab("tagihan");
          }}
        >
          <Text
            style={[
              monitoringStyles.tabText,
              activeTab === "tagihan" && monitoringStyles.activeTabText,
            ]}
          >
            Tagihan
          </Text>
        </Pressable>
        <Pressable
          style={[
            monitoringStyles.tab,
            activeTab === "riwayat" && monitoringStyles.activeTab,
          ]}
          onPress={() => {
            setActiveTab("riwayat");
            fetchPaymentHistoryLocal();
          }}
        >
          <Text
            style={[
              monitoringStyles.tabText,
              activeTab === "riwayat" && monitoringStyles.activeTabText,
            ]}
          >
            Riwayat
          </Text>
        </Pressable>
      </View>

      {/* Summary Card */}
      <SummaryCard
        activeTab={activeTab}
        totalAmount={summaryData.totalAmount}
        label={summaryData.label}
        hasActiveFilters={hasActiveFilters}
        onFilterPress={() => setShowFilterModal(true)}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        activeTab={activeTab}
        sortBy={sortBy}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        onClose={() => setShowFilterModal(false)}
        onReset={resetFilters}
        onSortChange={setSortBy}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Content Container */}
      <View style={monitoringStyles.whiteModalContainer}>
        <ScrollView
          style={monitoringStyles.content}
          contentContainerStyle={monitoringStyles.scrollContent}
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
          {/* Tab Tagihan */}
          {activeTab === "tagihan" &&
            (loading ? (
              <SkeletonMonitoringList />
            ) : (
              filteredBills.map((bill) => {
                const statusBadge = getStatusBadgeActivity(bill);
                const isExpanded = expandedItems[activeTab].has(bill.billId);

                return (
                  <BillCard
                    key={bill.billId}
                    bill={bill}
                    statusBadge={statusBadge}
                    isExpanded={isExpanded}
                    onPress={handleBillPress}
                    onPaymentPress={handlePaymentPress}
                    onToggleExpanded={toggleExpanded}
                    isPaidStatus={isPaidStatus}
                    formatDate={formatDate}
                    getHostStatusText={getHostStatusText}
                  />
                );
              })
            ))}

          {/* Tab Riwayat */}
          {activeTab === "riwayat" &&
            (historyLoading ? (
              <SkeletonHistoryList />
            ) : (
              paymentHistory
                .filter((payment) => {
                  switch (statusFilter) {
                    case "terlambat":
                      return (
                        payment.isLate || payment.status === "completed_late"
                      );
                    case "terjadwal":
                      return (
                        payment.paymentType === "scheduled" ||
                        payment.status === "completed_scheduled"
                      );
                    case "selesai":
                      return (
                        payment.status === "completed" &&
                        !payment.isLate &&
                        payment.paymentType !== "scheduled"
                      );
                    default:
                      return true;
                  }
                })
                .map((payment) => {
                  const statusBadge = getStatusBadgeHistory(
                    payment.status,
                    payment.paymentType,
                    payment.isLate || false
                  );

                  return (
                    <HistoryCard
                      key={payment.paymentId}
                      payment={payment}
                      statusBadge={statusBadge}
                      onPress={handleHistoryCardPress}
                    />
                  );
                })
            ))}

          {/* Empty State */}
          {((activeTab === "tagihan" &&
            !loading &&
            filteredBills.length === 0) ||
            (activeTab === "riwayat" &&
              !historyLoading &&
              paymentHistory.length === 0)) && (
            <View style={monitoringStyles.emptyState}>
              <Ionicons
                name="receipt-outline"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={monitoringStyles.emptyText}>
                Tidak ada aktivitas
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
