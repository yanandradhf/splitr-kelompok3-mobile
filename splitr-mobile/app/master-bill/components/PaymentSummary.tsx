import React from "react";
import { View, Text } from "react-native";
import { formatRp } from "../../../lib/currency";
import { summaryStyles, masterBillStyles } from "../styles";
import { MasterBillData } from "../types";

interface PaymentSummaryProps {
  billData: MasterBillData;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ billData }) => {
  return (
    <View style={summaryStyles.summaryCard}>
      <Text style={masterBillStyles.sectionTitle}>Ringkasan Pembayaran</Text>
      <View style={summaryStyles.summaryGrid}>
        <View style={summaryStyles.summaryItem}>
          <Text style={summaryStyles.summaryValue}>
            {billData.paymentSummary.completedCount}
          </Text>
          <Text style={summaryStyles.summaryLabel}>Selesai</Text>
        </View>
        <View style={summaryStyles.summaryItem}>
          <Text style={summaryStyles.summaryValue}>
            {billData.paymentSummary.pendingCount}
          </Text>
          <Text style={summaryStyles.summaryLabel}>Belum Bayar</Text>
        </View>
        <View style={summaryStyles.summaryItem}>
          <Text style={summaryStyles.summaryValueGreen}>
            {formatRp(billData.paymentSummary.totalPaid)}
          </Text>
          <Text style={summaryStyles.summaryLabel}>Terkumpul</Text>
        </View>
        <View style={summaryStyles.summaryItem}>
          <Text style={summaryStyles.summaryValueOrange}>
            {formatRp(billData.paymentSummary.totalPending)}
          </Text>
          <Text style={summaryStyles.summaryLabel}>Tertunggak</Text>
        </View>
      </View>
      <View style={summaryStyles.progressContainer}>
        <View style={summaryStyles.progressBar}>
          <View
            style={[
              summaryStyles.progressFill,
              {
                width: `${billData.paymentSummary.completionPercentage}%`,
              },
            ]}
          />
        </View>
        <Text style={summaryStyles.progressText}>
          {billData.paymentSummary.completionPercentage}% selesai
        </Text>
      </View>
    </View>
  );
};