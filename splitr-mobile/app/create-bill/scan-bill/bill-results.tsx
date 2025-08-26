
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBillStore } from "../../../store/billStore";
import { formatRp } from "../../../lib/currency";
import { getCategories, Category } from "../../../services/categoryApi";
import type { BillCategory } from "../../../types/bill";
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
  const { draft, recalcTotals, reset, addItem, setFees, setHeader, setReceiptImage } = useBillStore();
  
  const [scanResults, setScanResults] = React.useState<ScanResults | null>(null);
  const [name, setName] = React.useState(draft.name || "");
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  React.useEffect(() => {
    if (results) {
      try {
        const parsed = JSON.parse(results);
        setScanResults(parsed);
        
        // Integrate OCR results into bill store if items exist
        if (parsed.items && parsed.items.length > 0) {
          // Clear existing items first
          reset();
          
          // Add OCR items to store with enhanced data
          parsed.items.forEach((item: any) => {
            const billItem = {
              id: Math.random().toString(36).slice(2),
              name: item.name,
              qty: item.quantity || 1,
              price: item.unitPrice || item.price || 0,
              discount: item.itemDiscount || item.discount || 0,
              isSharing: false
            };
            addItem(billItem);
          });
          
          // Set fees from OCR including order fee and total discount
          const fees = {
            taxPct: parsed.taxPercentage || 0,
            servicePct: parsed.serviceChargePercentage || 0,
            discountPct: 0,
            discountNominal: parsed.totalDiscount || 0,
            orderFee: parsed.orderFee || 0
          };
          setFees(fees);
        }
        
        // Store receipt image URI
        if (uri) {
          console.log('📸 Setting receipt image URI: ' + uri);
          setReceiptImage(uri);
        } else {
          console.log('⚠️ No receipt image URI provided');
        }
      } catch (error) {
        console.error("Failed to parse scan results: " + String(error));
      }
    }
  }, [results, uri]);

  useEffect(() => {
    recalcTotals();
  }, [draft.items, draft.fees]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories: ' + String(error));
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const canConfirm =
    name.trim().length > 0 && !!category && draft.items.length > 0;
    
  const handleNameChange = (newName: string) => {
    setName(newName);
    setHeader(newName, category as any);
  };
  
  const handleConfirm = () => {
    if (canConfirm) {
      setHeader(name.trim(), category ? category.categoryName as BillCategory : null);
      router.push("/create-bill/bill-detail");
    }
  };

  const retake = () => router.replace("/create-bill/scan-bill/camera");

  const openPreview = () => {
    if (uri) {
      setShowImageModal(true);
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
          <View style={styles.placeholder} />
        </View>

        {/* Panel putih dengan sudut atas melengkung */}
        <View style={styles.sheet}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Nama Tagihan */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Nama Tagihan</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder="Masukkan nama tagihan"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>

            {/* Kategori Tagihan */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Kategori Tagihan</Text>
              <TouchableOpacity 
                style={styles.selectLike}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <View style={styles.dropdownContent}>
                  {category ? <Text style={styles.categoryIcon}>{category.categoryIcon}</Text> : null}
                  <Text style={[styles.selectText, !category && styles.placeholderText]}>
                    {category ? category.categoryName : (loading ? 'Loading...' : 'Pilih kategori')}
                  </Text>
                </View>
                <Ionicons 
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <View style={styles.dropdownList}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.categoryId}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryIcon}>{cat.categoryIcon}</Text>
                      <Text style={styles.dropdownItemText}>{cat.categoryName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Kartu hasil scan + thumbnail */}
            <View style={styles.scanCard}>
              <Text style={styles.scanTitle}>Struk berhasil di-scan</Text>
              <Text style={styles.scanHint}>
                Klik gambar di bawah untuk melihat foto struk lebih jelas.
              </Text>
              
              <View style={styles.imageButtonRow}>
                {uri ? (
                  <Pressable style={styles.thumbWrap} onPress={openPreview}>
                    <Image
                      source={{ uri }}
                      style={styles.thumb}
                      resizeMode="contain"
                    />
                  </Pressable>
                ) : null}
                
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
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQtyPrice}>
                        <Text>{item.qty}</Text>
                        <Text> x </Text>
                        <Text>{formatRp(item.price)}</Text>
                      </Text>
                      {(item.discount || 0) > 0 && (
                        <Text style={styles.discountText}>
                          <Text>Diskon item: -</Text>
                          <Text>{formatRp(item.discount || 0)}</Text>
                        </Text>
                      )}
                    </View>
                    <Text style={styles.itemAmount}>
                      {formatRp((item.qty * item.price) - (item.discount || 0))}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-outline" size={48} color={COLORS.placeholder} />
                  <Text style={styles.emptyText}>Tidak ada item terdeteksi</Text>
                  <Text style={styles.emptySubtext}>OCR gagal membaca item dari struk</Text>
                  <Pressable 
                    style={styles.addManualBtn}
                    onPress={() => router.push({
                      pathname: "/create-bill/edit-bill",
                      params: { returnTo: "scan-results" }
                    })}
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

              {/* Order Fee - only show if detected by OCR */}
              {draft.fees.orderFee && draft.fees.orderFee > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.metaLabel}>Biaya Order</Text>
                  <Text style={styles.metaAmount}>
                    {formatRp(draft.fees.orderFee)}
                  </Text>
                </View>
              )}

              {/* Service Charge - only show if detected by OCR */}
              {draft.totals.service > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.metaLabel}>
                    Layanan
                    {draft.fees.servicePct > 0 && (
                      <Text> ({draft.fees.servicePct}%)</Text>
                    )}
                  </Text>
                  <Text style={styles.metaAmount}>
                    {formatRp(draft.totals.service)}
                  </Text>
                </View>
              )}

              {/* Pajak - only show if detected by OCR */}
              {draft.totals.tax > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.metaLabel}>
                    Pajak
                    {draft.fees.taxPct > 0 && (
                      <Text> ({draft.fees.taxPct}%)</Text>
                    )}
                  </Text>
                  <Text style={styles.metaAmount}>
                    {formatRp(draft.totals.tax)}
                  </Text>
                </View>
              )}

              {/* Diskon total - only show if detected by OCR */}
              {draft.totals.discount > 0 && (
                <View style={styles.itemRow}>
                  <Text style={[styles.metaLabel, styles.discountLabel]}>Diskon Total</Text>
                  <Text style={[styles.metaAmount, styles.discountAmount]}>
                    <Text>-</Text>
                    <Text>{formatRp(draft.totals.discount)}</Text>
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
                  onPress={() => router.push({
                    pathname: "/create-bill/edit-bill",
                    params: { returnTo: "scan-results" }
                  })}
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
                !canConfirm && styles.disabledBtn,
              ]}
            >
              <Text style={styles.confirmText}>Konfirmasi</Text>
            </Pressable>
          </ScrollView>
        </View>
        
        {/* Image Preview Modal */}
        <Modal
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowImageModal(false)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={COLORS.white} />
            </TouchableOpacity>
            
            {uri && (
              <Image
                source={{ uri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
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
  placeholder: { width: 22 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
  itemInfo: { flex: 1 },

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
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
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
    marginTop: 2,
  },

  discountLabel: {
    color: COLORS.red,
    fontFamily: FONTS.medium,
  },
  discountAmount: {
    color: COLORS.red,
    fontFamily: FONTS.bold,
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
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  disabledBtn: {
    backgroundColor: COLORS.disabled,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
});
