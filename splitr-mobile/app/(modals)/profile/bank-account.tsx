import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../constants/theme";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { SkeletonProfile } from "../../../components/ui/Skeleton";
import { authAPI } from "../../../services/api";

export default function BankAccountScreen() {
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceLoading, setForceLoading] = useState(true);

  useEffect(() => {
    fetchAccountData();
    setTimeout(() => setForceLoading(false), 1300);
  }, []);

  const fetchAccountData = async () => {
    try {
      const response = await authAPI.getMyAccount();
      setAccountData(response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  if (isLoading || forceLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Rekening</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.content}>
            {/* Bank Card Skeleton */}
            <View style={styles.bankCard}>
              <View style={styles.bankHeader}>
                <View style={styles.bankTitleRow}>
                  <View style={{ width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 14 }} />
                  <View style={{ width: 40, height: 18, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                </View>
                <View style={styles.defaultBadge}>
                  <View style={{ width: 40, height: 11, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                </View>
              </View>
              <View style={{ width: 200, height: 20, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: 150, height: 14, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 12 }} />
              <View style={styles.balanceSection}>
                <View style={{ width: 30, height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 2 }} />
                <View style={{ width: 120, height: 22, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
              </View>
            </View>
            
            {/* Details Card Skeleton */}
            <View style={styles.detailsCard}>
              <View style={{ width: 140, height: 18, backgroundColor: '#E1E5E9', borderRadius: 4, marginBottom: 20 }} />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.detailItem}>
                  <View style={{ width: 100, height: 14, backgroundColor: '#E1E5E9', borderRadius: 4, marginBottom: 4 }} />
                  <View style={{ width: 160, height: 16, backgroundColor: '#E1E5E9', borderRadius: 4 }} />
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="light-content"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Rekening</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Bank Card */}
          <View style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <View style={styles.bankTitleRow}>
                <Ionicons
                  name="card-outline"
                  size={28}
                  color={COLORS.white}
                />
                <Text style={styles.bankTitle}>BNI</Text>
              </View>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Splitr</Text>
              </View>
            </View>
            
            <Text style={styles.bankNumber}>
              {accountData?.accountNumber || "-"}
            </Text>
            
            <Text style={styles.accountHolderName}>
              {accountData?.accountName || "Nama Pemegang Rekening"}
            </Text>
            
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Saldo</Text>
              <Text style={styles.balanceAmount}>
                {accountData?.balance ? formatCurrency(accountData.balance) : "Rp 0"}
              </Text>
            </View>
          </View>

          {/* Account Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Informasi Rekening</Text>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nomor Rekening</Text>
              <Text style={styles.detailValue}>
                {accountData?.accountNumber || "-"}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nama Pemegang</Text>
              <Text style={styles.detailValue}>
                {accountData?.accountName || "-"}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Kode Cabang</Text>
              <Text style={styles.detailValue}>
                {accountData?.branchCode || "-"}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nama Cabang</Text>
              <Text style={styles.detailValue}>
                {accountData?.branch?.branchName || "-"}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Kota</Text>
              <Text style={styles.detailValue}>
                {accountData?.branch?.city || "-"}
              </Text>
            </View>
            
            <View style={[styles.detailItem, styles.lastItem]}>
              <Text style={styles.detailLabel}>Alamat Cabang</Text>
              <Text style={styles.detailValue}>
                {accountData?.branch?.address || "-"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.backgroundMain,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  
  // Bank Card
  bankCard: {
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bankTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bankTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  defaultBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  bankNumber: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: 1,
  },
  accountHolderName: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 12,
  },
  balanceSection: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  
  // Details Card
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  detailItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
});