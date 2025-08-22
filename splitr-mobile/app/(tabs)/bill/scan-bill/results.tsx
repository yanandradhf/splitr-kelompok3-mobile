import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const ORANGE = "#FF9A56";
const TOSCA = "#73E0D1";
const BG = "#FFFFFF";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface ScanResults {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxPercentage: number;
  serviceCharge: number;
  serviceChargePercentage: number;
  total: number;
  confidence?: number;
  provider?: string;
}

export default function ResultsScreen() {
  const { uri, results } = useLocalSearchParams<{ uri?: string; results?: string }>();
  const navigation = useNavigation<any>();
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);

  // Hide tab bar
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  React.useEffect(() => {
    console.log('Results screen - received params:', { uri, results });
    
    if (results) {
      try {
        const parsed = JSON.parse(results);
        console.log('Results screen - parsed data:', parsed);
        setScanResults(parsed);
      } catch (error) {
        console.error("Failed to parse results:", error);
        console.log('Raw results string:', results);
      }
    } else {
      console.log('No results received');
    }
  }, [results]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleScanAgain = () => {
    router.replace("/(tabs)/bill/scan-bill/camera");
  };

  const handleCreateBill = () => {
    Alert.alert(
      "Buat Tagihan",
      "Fitur pembuatan tagihan akan diimplementasikan",
      [{ text: "OK" }]
    );
  };

  const subtotal = scanResults?.subtotal || 0;
  const discount = scanResults?.discount || 0;
  const tax = scanResults?.tax || 0;
  const taxPercentage = scanResults?.taxPercentage || 0;
  const serviceCharge = scanResults?.serviceCharge || 0;
  const serviceChargePercentage = scanResults?.serviceChargePercentage || 0;
  const total = scanResults?.total || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hasil Scan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={24} color={TOSCA} />
          <View style={styles.successContent}>
            <Text style={styles.successText}>
              {scanResults ? 'Struk berhasil dipindai dengan AI!' : 'Memuat hasil scan...'}
            </Text>
            <Text style={styles.providerText}>
              Diproses dengan: {scanResults?.provider === 'fixed-groq' ? 'Groq AI Vision' : 
                              scanResults?.provider === 'fixed-groq-fallback' ? 'Groq AI (Fallback)' :
                              'Groq AI'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Pesanan</Text>
          
          {scanResults?.items && scanResults.items.length > 0 ? (
            scanResults.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity}x {formatCurrency(item.price)}
                    {item.discount && item.discount > 0 && (
                      <Text style={styles.discountText}> • Diskon -{formatCurrency(item.discount)}</Text>
                    )}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency((item.price * item.quantity) - (item.discount || 0))}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Tidak ada pesanan terdeteksi</Text>
              <Text style={styles.emptySubtext}>OCR gagal membaca struk atau struk tidak jelas</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Diskon</Text>
              <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pajak {taxPercentage > 0 ? `(${taxPercentage}%)` : ''}</Text>
            <Text style={[styles.summaryValue, tax === 0 && { color: '#999' }]}>
              {tax > 0 ? formatCurrency(tax) : "Tidak ada pajak"}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Layanan {serviceChargePercentage > 0 ? `(${serviceChargePercentage}%)` : ''}</Text>
            <Text style={[styles.summaryValue, serviceCharge === 0 && { color: '#999' }]}>
              {serviceCharge > 0 ? formatCurrency(serviceCharge) : "Tidak ada layanan"}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>


      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={handleScanAgain}
        >
          <Ionicons name="camera-outline" size={18} color={ORANGE} />
          <Text style={styles.secondaryBtnText}>Scan Ulang</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={handleCreateBill}
        >
          <Text style={styles.primaryBtnText}>Buat Tagihan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 0, android: 8 }),
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${TOSCA}15`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  successContent: {
    flex: 1,
  },
  successText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 4,
  },
  providerText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: "#666",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: TOSCA,
  },

  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: Platform.select({ ios: 34, android: 16 }),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ORANGE,
    backgroundColor: "#fff",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: ORANGE,
  },
  primaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: TOSCA,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  discountText: {
    color: '#e74c3c',
    fontWeight: '500',
    fontSize: 11,
  },
});