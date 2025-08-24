
import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBillStore } from "../../../store/billStore";
import { formatRp } from "../../../lib/currency";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from "../../../constants/theme";

interface ScanResults {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    discount?: number;
  }>;
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

export default function BillResult() {
  const { uri, results } = useLocalSearchParams<{ uri?: string; results?: string }>();
  const { draft, recalcTotals, reset, addItem, setFees, setHeader } = useBillStore();
  
  const [scanResults, setScanResults] = React.useState<ScanResults | null>(null);
  const [name, setName] = React.useState(draft.name || "");
  const [category, setCategory] = React.useState<string | null>(draft.category);
  
  React.useEffect(() => {
    if (results) {
      try {
        const parsed = JSON.parse(results);
        setScanResults(parsed);
        
        // Integrate OCR results into bill store if items exist
        if (parsed.items && parsed.items.length > 0) {
          // Clear existing items first
          reset();
          
          // Add OCR items to store
          parsed.items.forEach((item: any) => {
            const billItem = {
              id: Math.random().toString(36).slice(2),
              name: item.name,
              qty: item.quantity,
              price: item.price,
              isSharing: false
            };
            addItem(billItem);
          });
          
          // Set fees from OCR
          const fees = {
            taxPct: parsed.taxPercentage || 0,
            servicePct: parsed.serviceChargePercentage || 0,
            discountPct: 0,
            discountNominal: parsed.discount || 0
          };
          setFees(fees);
        }
      } catch (error) {
        console.error("Failed to parse scan results:", error);
      }
    }
  }, [results]);

  useEffect(() => {
    recalcTotals();
  }, [draft.items, draft.fees]);

  const canConfirm =
    name.trim().length > 0 && !!category && draft.items.length > 0;
    
  const handleNameChange = (newName: string) => {
    setName(newName);
    setHeader(newName, category as any);
  };
  
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setHeader(name, newCategory as any);
  };
  
  const handleConfirm = () => {
    if (canConfirm) {
      setHeader(name.trim(), category as any);
      router.push("/create-bill/bill-detail");
    }
  };

  const retake = () => router.replace("/create-bill/scan-bill/camera");

  const openPreview = () => {
    if (uri) {
      router.push({
        pathname: "/create-bill/scan-bill/preview",
        params: { uri },
      });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Buat Tagihan</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Panel putih dengan sudut atas melengkung */}
        <View style={styles.sheet}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
            showsVerticalScrollIndicator={false}
          >
            {/* Nama Tagihan */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Nama Tagihan</Text>
              <Pressable 
                style={styles.inputLike}
                onPress={() => {
                  // Navigate to edit mode or show input
                  router.push({
                    pathname: "/create-bill/edit-bill",
                    params: { returnTo: "scan-results" }
                  });
                }}
              >
                <Text
                  style={[
                    styles.inputText,
                    !name && { color: COLORS.placeholder },
                  ]}
                  numberOfLines={1}
                >
                  {name || "Masukkan nama tagihan"}
                </Text>
                <Ionicons name="create-outline" size={16} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            {/* Kategori Tagihan */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Kategori Tagihan</Text>
              <Pressable 
                style={styles.selectLike}
                onPress={() => {
                  // Navigate to category selection
                  router.push({
                    pathname: "/create-bill/edit-bill",
                    params: { returnTo: "scan-results" }
                  });
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !category && { color: COLORS.placeholder },
                  ]}
                  numberOfLines={1}
                >
                  {category || "Pilih kategori tagihan"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>

            {/* Kartu hasil scan + thumbnail */}
            <View style={styles.scanCard}>
              <Text style={styles.scanTitle}>Struk berhasil di-scan</Text>
              <Text style={styles.scanHint}>
                Klik gambar di bawah untuk melihat foto struk lebih jelas.
              </Text>
              
              <View style={styles.imageButtonRow}>
                {!!uri && (
                  <Pressable style={styles.thumbWrap} onPress={openPreview}>
                    <Image
                      source={{ uri }}
                      style={styles.thumb}
                      resizeMode="contain"
                    />
                  </Pressable>
                )}
                
                <Pressable style={styles.retakeBtn} onPress={retake}>
                  <Ionicons name="camera" size={18} color={COLORS.black} />
                  <Text style={styles.retakeText}>Foto Ulang</Text>
                </Pressable>
              </View>
            </View>

            {/* Detail Tagihan (header hijau) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Detail Tagihan</Text>
            </View>

            {/* Daftar item + ringkasan */}
            <View style={styles.card}>
              {/* Items from bill store (integrated from OCR) */}
              {draft.items && draft.items.length > 0 ? (
                draft.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQtyPrice}>
                        x{item.qty} {formatRp(item.price)}
                      </Text>
                    </View>
                    <Text style={styles.itemAmount}>
                      {formatRp(item.qty * item.price)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Tidak ada item terdeteksi</Text>
                  <Text style={styles.emptySubtext}>OCR gagal membaca item dari struk</Text>
                  <Pressable 
                    style={styles.addManualBtn}
                    onPress={() => router.push("/create-bill/edit-bill")}
                  >
                    <Text style={styles.addManualText}>+ Tambah Item Manual</Text>
                  </Pressable>
                </View>
              )}

              {/* Subtotal */}
              <View style={styles.itemRow}>
                <Text style={styles.metaLabel}>Subtotal</Text>
                <Text style={styles.metaAmount}>
                  {formatRp(draft.totals.subTotal)}
                </Text>
              </View>

              {/* Diskon total */}
              {draft.totals.discount > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.metaLabel}>Diskon</Text>
                  <Text style={[styles.metaAmount, { color: COLORS.red }]}>
                    -{formatRp(draft.totals.discount)}
                  </Text>
                </View>
              )}

              {/* Pajak */}
              {draft.totals.tax > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.metaLabel}>
                    Pajak {draft.fees.taxPct > 0 ? `(${draft.fees.taxPct}%)` : ''}
                  </Text>
                  <Text style={styles.metaAmount}>
                    {formatRp(draft.totals.tax)}
                  </Text>
                </View>
              )}

              {/* Service Charge */}
              {draft.totals.service > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.metaLabel}>
                    Layanan {draft.fees.servicePct > 0 ? `(${draft.fees.servicePct}%)` : ''}
                  </Text>
                  <Text style={styles.metaAmount}>
                    {formatRp(draft.totals.service)}
                  </Text>
                </View>
              )}

              {/* Box Total + tombol kecil Edit */}
              <View style={styles.totalBox}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatRp(draft.totals.grandTotal)}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push("/create-bill/edit-bill")}
                  style={styles.smallEditBtn}
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={COLORS.teal}
                  />
                  <Text style={styles.smallEditText}>Edit Tagihan</Text>
                </Pressable>
              </View>
            </View>

            {/* Konfirmasi */}
            <Pressable
              onPress={handleConfirm}
              disabled={!canConfirm}
              style={[
                styles.confirmBtn,
                !canConfirm && { backgroundColor: COLORS.disabled },
              ]}
            >
              <Text style={styles.confirmText}>Konfirmasi</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ===================== styles ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain, // hijau muda di header
  },
  safeArea: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: 6 },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },

  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  /* Fields */
  fieldBlock: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputLike: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },

  selectLike: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },

  /* Scan card */
  scanCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  scanTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  scanHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  imageButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  thumbWrap: {
    flex: 1,
    height: 100,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
    backgroundColor: COLORS.backgroundLight,
  },
  thumb: { 
    width: "100%", 
    height: "100%" 
  },
  retakeBtn: {
    backgroundColor: "#00897B",
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 100,
    justifyContent: "center",
  },
  retakeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },

  /* Section header hijau */
  sectionHeader: {
    backgroundColor: COLORS.teal,
    height: 36,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },

  /* Card items + total */
  card: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  itemQtyPrice: {
    marginTop: 2,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  itemAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },

  metaLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  metaAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },

  totalBox: {
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  smallEditBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.backgroundLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  smallEditText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.placeholder,
    marginTop: 4,
    textAlign: "center",
  },
  discountText: {
    color: COLORS.red,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },

  /* Add manual button */
  addManualBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  addManualText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    textAlign: "center",
  },

  /* Confirm */
  confirmBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
});
