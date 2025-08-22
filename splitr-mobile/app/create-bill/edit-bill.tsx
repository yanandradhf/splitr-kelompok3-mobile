import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import type { BillItem } from "@/types/bill";
import { formatRp } from "@/lib/currency";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function EditBill() {
  const { draft, addItem, updateItem, removeItem, setFees, recalcTotals } = useBillStore();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [showTax, setShowTax] = useState(false);
  const [showService, setShowService] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editIsSharing, setEditIsSharing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => { recalcTotals(); }, [draft.items, draft.fees]);

  const isAddDisabled = !name.trim() || (!isSharing && !qty) || !price || Number(price) <= 0;

  const handlePriceChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setPrice(numericValue);
  };

  const onAdd = () => {
    if (isAddDisabled) return;
    
    const qtyNum = isSharing ? 1 : Math.max(1, Number(qty) || 1);
    const priceNum = Math.max(0, Number(price) || 0);
    
    const item: BillItem = {
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      qty: qtyNum,
      price: priceNum,
      isSharing: isSharing,
    };
    addItem(item);
    setName(""); setQty("1"); setPrice(""); setIsSharing(false);
  };

  const startEdit = (item: BillItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditQty(String(item.qty));
    setEditPrice(String(item.price));
    setEditIsSharing(item.isSharing || false);
  };

  const saveEdit = () => {
    if (!editingItem || !editName.trim() || (!editIsSharing && !editQty) || !editPrice) return;
    
    const updatedItem: BillItem = {
      id: editingItem,
      name: editName.trim(),
      qty: editIsSharing ? 1 : Math.max(1, Number(editQty) || 1),
      price: Math.max(0, Number(editPrice) || 0),
      isSharing: editIsSharing,
    };
    updateItem(updatedItem);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName("");
    setEditQty("");
    setEditPrice("");
    setEditIsSharing(false);
  };

  const handleEditPriceChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setEditPrice(numericValue);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Tagihan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Tambah Item</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nama Item</Text>
              <TextInput 
                placeholder="Contoh: Nasi Goreng, Ayam Bakar" 
                value={name} 
                onChangeText={setName} 
                style={styles.input} 
              />
            </View>
            
            <Pressable onPress={() => setIsSharing(!isSharing)} style={styles.sharingToggle}>
              <View style={styles.sharingToggleContent}>
                <View style={[styles.checkbox, isSharing && styles.checkboxActive]}>
                  {isSharing && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                </View>
                <Text style={styles.sharingLabel}>Item Sharing (platter, ayam utuh, dll)</Text>
              </View>
            </Pressable>
            
            {isSharing ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Harga Total</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput 
                    placeholder="80000" 
                    keyboardType="number-pad" 
                    value={price} 
                    onChangeText={handlePriceChange} 
                    style={styles.priceInput} 
                  />
                </View>
                <Text style={styles.inputHint}>Akan dibagi sesuai porsi masing-masing orang</Text>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Jumlah</Text>
                  <TextInput 
                    placeholder="1" 
                    keyboardType="number-pad" 
                    value={qty} 
                    onChangeText={setQty} 
                    style={[styles.input, { textAlign: "center" }]} 
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>Harga Satuan</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencyPrefix}>Rp</Text>
                    <TextInput 
                      placeholder="25000" 
                      keyboardType="number-pad" 
                      value={price} 
                      onChangeText={handlePriceChange} 
                      style={styles.priceInput} 
                    />
                  </View>
                </View>
              </View>
            )}
            
            <Pressable 
              onPress={onAdd} 
              style={[styles.addBtn, isAddDisabled && styles.addBtnDisabled]}
              disabled={isAddDisabled}
            >
              <Text style={[styles.addBtnText, isAddDisabled && styles.addBtnTextDisabled]}>+ Tambah Item</Text>
            </Pressable>

            {draft.items.length > 0 && (
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Daftar Item</Text>
                {draft.items.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    {editingItem === item.id ? (
                      // Edit Mode
                      <View style={styles.editMode}>
                        <View style={styles.editInputContainer}>
                          <Text style={styles.editLabel}>Nama Item</Text>
                          <TextInput 
                            value={editName} 
                            onChangeText={setEditName} 
                            style={styles.editInput} 
                          />
                        </View>
                        
                        <Pressable onPress={() => setEditIsSharing(!editIsSharing)} style={styles.editSharingToggle}>
                          <View style={styles.sharingToggleContent}>
                            <View style={[styles.checkbox, editIsSharing && styles.checkboxActive]}>
                              {editIsSharing && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                            </View>
                            <Text style={styles.sharingLabel}>Item Sharing</Text>
                          </View>
                        </Pressable>
                        
                        {editIsSharing ? (
                          <View style={styles.editInputContainer}>
                            <Text style={styles.editLabel}>Harga Total</Text>
                            <View style={styles.priceInputContainer}>
                              <Text style={styles.currencyPrefix}>Rp</Text>
                              <TextInput 
                                value={editPrice} 
                                onChangeText={handleEditPriceChange} 
                                keyboardType="number-pad"
                                style={styles.priceInput} 
                              />
                            </View>
                          </View>
                        ) : (
                          <View style={styles.editRow}>
                            <View style={[styles.editInputContainer, { flex: 1 }]}>
                              <Text style={styles.editLabel}>Qty</Text>
                              <TextInput 
                                value={editQty} 
                                onChangeText={setEditQty} 
                                keyboardType="number-pad"
                                style={[styles.editInput, { textAlign: "center" }]} 
                              />
                            </View>
                            <View style={[styles.editInputContainer, { flex: 2 }]}>
                              <Text style={styles.editLabel}>Harga</Text>
                              <View style={styles.priceInputContainer}>
                                <Text style={styles.currencyPrefix}>Rp</Text>
                                <TextInput 
                                  value={editPrice} 
                                  onChangeText={handleEditPriceChange} 
                                  keyboardType="number-pad"
                                  style={styles.priceInput} 
                                />
                              </View>
                            </View>
                          </View>
                        )}
                        
                        <View style={styles.editActions}>
                          <Pressable onPress={cancelEdit} style={styles.cancelBtn}>
                            <Text style={styles.cancelBtnText}>Batal</Text>
                          </Pressable>
                          <Pressable onPress={saveEdit} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Simpan</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      // View Mode
                      <View style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemDetails}>
                            {item.isSharing ? `Sharing - ${formatRp(item.price)}` : `${item.qty} × ${formatRp(item.price)}`}
                          </Text>
                        </View>
                        <View style={styles.itemActions}>
                          <Text style={styles.itemPrice}>{formatRp(item.isSharing ? item.price : item.qty * item.price)}</Text>
                          <Pressable onPress={() => startEdit(item)} style={styles.editBtn}>
                            <Ionicons name="create-outline" size={16} color={COLORS.teal} />
                          </Pressable>
                          <Pressable onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.feesContainer}>
              <Text style={styles.sectionTitle}>Biaya Tambahan (Opsional)</Text>
              <Text style={styles.sectionSubtitle}>Pilih biaya yang diperlukan</Text>
              
              <View style={styles.toggleContainer}>
                <Pressable 
                  onPress={() => setShowTax(!showTax)} 
                  style={[styles.toggleBtn, showTax && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, showTax && styles.toggleTextActive]}>+ Pajak (PPN)</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => setShowService(!showService)} 
                  style={[styles.toggleBtn, showService && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, showService && styles.toggleTextActive]}>+ Service Charge</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => setShowDiscount(!showDiscount)} 
                  style={[styles.toggleBtn, showDiscount && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, showDiscount && styles.toggleTextActive]}>+ Diskon/Promo</Text>
                </Pressable>
              </View>
              
              {showTax && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Pajak (PPN)</Text>
                  <TextInput 
                    placeholder="11" 
                    keyboardType="number-pad" 
                    value={String(draft.fees.taxPct || '')} 
                    onChangeText={(v) => setFees({ ...draft.fees, taxPct: Number(v) || 0 })} 
                    style={styles.input} 
                  />
                  <Text style={styles.inputHint}>Biasanya 10-11% dari subtotal + service</Text>
                </View>
              )}
              
              {showService && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Service Charge</Text>
                  <TextInput 
                    placeholder="5" 
                    keyboardType="number-pad" 
                    value={String(draft.fees.servicePct || '')} 
                    onChangeText={(v) => setFees({ ...draft.fees, servicePct: Number(v) || 0 })} 
                    style={styles.input} 
                  />
                  <Text style={styles.inputHint}>Jika ada, misalnya 5% dari subtotal</Text>
                </View>
              )}
              
              {showDiscount && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Diskon/Promo</Text>
                  
                  <View style={styles.discountTypeContainer}>
                    <Pressable 
                      onPress={() => setDiscountType('percent')} 
                      style={[styles.discountTypeBtn, discountType === 'percent' && styles.discountTypeBtnActive]}
                    >
                      <Text style={[styles.discountTypeText, discountType === 'percent' && styles.discountTypeTextActive]}>%</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => setDiscountType('nominal')} 
                      style={[styles.discountTypeBtn, discountType === 'nominal' && styles.discountTypeBtnActive]}
                    >
                      <Text style={[styles.discountTypeText, discountType === 'nominal' && styles.discountTypeTextActive]}>Rp</Text>
                    </Pressable>
                  </View>
                  
                  {discountType === 'percent' ? (
                    <View style={styles.percentInputContainer}>
                      <TextInput 
                        placeholder="10" 
                        keyboardType="number-pad" 
                        value={String(draft.fees.discountPct || '')} 
                        onChangeText={(v) => setFees({ ...draft.fees, discountPct: Number(v) || 0, discountNominal: 0 })} 
                        style={styles.percentInput} 
                      />
                      <Text style={styles.percentSuffix}>%</Text>
                    </View>
                  ) : (
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencyPrefix}>Rp</Text>
                      <TextInput 
                        placeholder="50000" 
                        keyboardType="number-pad" 
                        value={String(draft.fees.discountNominal || '')} 
                        onChangeText={(v) => setFees({ ...draft.fees, discountNominal: Number(v) || 0, discountPct: 0 })} 
                        style={styles.priceInput} 
                      />
                    </View>
                  )}
                  
                  <Text style={styles.inputHint}>
                    {discountType === 'percent' ? 'Diskon dalam persen dari subtotal' : 'Diskon dalam nominal rupiah'}
                  </Text>
                </View>
              )}
              
              <View style={styles.summaryContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>{formatRp(draft.totals.subTotal)}</Text>
                </View>
                {draft.totals.tax > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Pajak PPN ({draft.fees.taxPct}%)</Text>
                    <Text style={styles.totalValue}>{formatRp(draft.totals.tax)}</Text>
                  </View>
                )}
                {draft.totals.service > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Service Charge ({draft.fees.servicePct}%)</Text>
                    <Text style={styles.totalValue}>{formatRp(draft.totals.service)}</Text>
                  </View>
                )}
                {(draft.fees.discountPct > 0 || draft.fees.discountNominal > 0) && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Diskon {draft.fees.discountPct > 0 ? `(${draft.fees.discountPct}%)` : '(Nominal)'}
                    </Text>
                    <Text style={[styles.totalValue, { color: COLORS.success }]}>-{formatRp(draft.totals.discount)}</Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>Total Keseluruhan</Text>
                  <Text style={styles.grandTotalValue}>{formatRp(draft.totals.grandTotal)}</Text>
                </View>
              </View>
            </View>

            <Pressable onPress={() => router.back()} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Simpan Tagihan</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
        </View>
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
    width: 24,
  },
  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
    flex: 1,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.inputBg,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  inputHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
  },
  addBtnDisabled: {
    backgroundColor: COLORS.disabled,
  },
  addBtnTextDisabled: {
    color: COLORS.textSecondary,
  },
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  itemDetails: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemPrice: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  editBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  editMode: {
    padding: SPACING.md,
  },
  editInputContainer: {
    marginBottom: SPACING.sm,
  },
  editLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  editRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  saveBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.teal,
  },
  saveBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  feesContainer: {
    marginBottom: SPACING.lg,
  },

  summaryContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  toggleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  toggleText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.inputBg,
  },
  currencyPrefix: {
    paddingLeft: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  priceInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  discountTypeContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  discountTypeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    minWidth: 50,
    alignItems: 'center',
  },
  discountTypeBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  discountTypeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  discountTypeTextActive: {
    color: COLORS.white,
  },
  percentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.inputBg,
  },
  percentInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  percentSuffix: {
    paddingRight: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  sharingToggle: {
    marginBottom: SPACING.md,
  },
  sharingToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  sharingLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  editSharingToggle: {
    marginBottom: SPACING.sm,
  },
});