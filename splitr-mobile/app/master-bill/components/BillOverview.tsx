import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatRp } from "../../../lib/currency";
import { COLORS } from "../../../constants/theme";
import { billOverviewStyles } from "../styles";
import { MasterBillData } from "../types";

interface BillOverviewProps {
  billData: MasterBillData;
  onReceiptPress: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const BillOverview: React.FC<BillOverviewProps> = ({
  billData,
  onReceiptPress,
  getStatusColor,
  getStatusText,
}) => {
  return (
    <>
      {billData.receiptImageUrl && (
        <TouchableOpacity
          style={billOverviewStyles.receiptInfoCard}
          onPress={onReceiptPress}
        >
          <View style={billOverviewStyles.receiptInfoContent}>
            <Ionicons
              name="receipt-outline"
              size={24}
              color={COLORS.teal}
            />
            <View style={billOverviewStyles.receiptInfoText}>
              <Text style={billOverviewStyles.receiptInfoTitle}>
                Struk Tersedia
              </Text>
              <Text style={billOverviewStyles.receiptInfoSubtitle}>
                Tap untuk melihat struk pembayaran
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </View>
        </TouchableOpacity>
      )}

      <View style={billOverviewStyles.overviewCard}>
        <View style={billOverviewStyles.billHeader}>
          <View style={billOverviewStyles.billInfo}>
            <Text style={billOverviewStyles.billCode}>{billData.billCode}</Text>
            <Text style={billOverviewStyles.billName}>{billData.billName}</Text>
            <Text style={billOverviewStyles.hostName}>
              Host: {billData.host.name}
            </Text>
          </View>
          <View style={billOverviewStyles.statusContainer}>
            <View
              style={[
                billOverviewStyles.statusBadge,
                {
                  backgroundColor:
                    getStatusColor(billData.status) === COLORS.teal
                      ? "#E6FFFA"
                      : getStatusColor(billData.status) === COLORS.success
                      ? "#F0FDF4"
                      : getStatusColor(billData.status) === COLORS.red
                      ? "#FEF2F2"
                      : getStatusColor(billData.status) === COLORS.warning
                      ? "#FFFBEB"
                      : getStatusColor(billData.status) === "#D97706"
                      ? "#FEF3C7"
                      : "#F8F9FA",
                  borderColor:
                    getStatusColor(billData.status) === COLORS.teal
                      ? "#B2F5EA"
                      : getStatusColor(billData.status) === COLORS.success
                      ? "#BBF7D0"
                      : getStatusColor(billData.status) === COLORS.red
                      ? "#FECACA"
                      : getStatusColor(billData.status) === COLORS.warning
                      ? "#FDE68A"
                      : getStatusColor(billData.status) === "#D97706"
                      ? "#FDE68A"
                      : "#E5E7EB",
                },
              ]}
            >
              <Text
                style={[
                  billOverviewStyles.statusText,
                  { color: getStatusColor(billData.status) },
                ]}
              >
                {getStatusText(billData.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={billOverviewStyles.amountContainer}>
          <Text style={billOverviewStyles.totalAmountLabel}>Total Tagihan</Text>
          <Text style={billOverviewStyles.totalAmountValue}>
            {formatRp(billData.totalAmount)}
          </Text>
        </View>
      </View>
    </>
  );
};