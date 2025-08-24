import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS } from '../../constants/theme';
import { useBillStore } from '../../store/billStore';
import { getCategories, Category } from '../../services/categoryApi';

export default function ManualScreen() {
  const { draft, setHeader, addItem, updateItem, removeItem, setFees, recalcTotals, reset } = useBillStore();
  const [name, setName] = useState(draft.name);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Only reset store on first entry to manual bill creation
  useEffect(() => {
    // Only reset if coming from outside the create-bill flow
    if (!draft.name && !draft.items.length) {
      reset();
    }
  }, []);

  useEffect(() => { recalcTotals(); }, [draft.items, draft.fees]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to default categories
        setCategories([
          { categoryId: '1', categoryName: 'Food and Beverage', categoryIcon: '🍽️', createdAt: '' },
          { categoryId: '2', categoryName: 'Entertainment', categoryIcon: '🎬', createdAt: '' },
          { categoryId: '3', categoryName: 'Shopping', categoryIcon: '🛍️', createdAt: '' },
          { categoryId: '4', categoryName: 'Transport', categoryIcon: '🚗', createdAt: '' },
          { categoryId: '5', categoryName: 'Other', categoryIcon: '📦', createdAt: '' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const canConfirm = useMemo(() => name.trim().length > 0 && !!category && draft.items.length > 0, [name, category, draft.items.length]);

  const onAddItem = () => {
    const item = {
      id: Math.random().toString(36).slice(2),
      name: "Item Baru",
      qty: 1,
      price: 0,
    };
    addItem(item);
  };

  const handleConfirm = () => {
    setHeader(name.trim(), category?.categoryName || null);
    router.push('/create-bill/bill-detail');
  };

  const formatRp = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Tagihan Manual</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nama Tagihan</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Masukkan Nama Tagihan"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori Tagihan</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <View style={styles.dropdownContent}>
                  {category && <Text style={styles.categoryIcon}>{category.categoryIcon}</Text>}
                  <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
                    {category ? category.categoryName : (loading ? 'Loading...' : 'Pilih kategori')}
                  </Text>
                </View>
                <Ionicons 
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
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

            <View style={styles.section}>
              <View style={styles.billContainer}>
                <Text style={styles.sectionTitle}>Detail Tagihan</Text>
                {draft.items.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada item. Tekan "+ Tambah Item" untuk mulai.</Text>
                ) : (
                  draft.items.map((it) => (
                    <View key={it.id} style={styles.itemSummary}>
                      <Text style={styles.itemName}>{it.name} × {it.qty}</Text>
                      <Text style={styles.itemPrice}>{formatRp(it.qty * it.price)}</Text>
                    </View>
                  ))
                )}
                <TouchableOpacity onPress={() => router.push('/create-bill/edit-bill')} style={styles.addButton} activeOpacity={0.7}>
                  <Text style={styles.addText}>+ Tambah Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              disabled={!canConfirm}
              onPress={handleConfirm}
              style={[styles.confirmButton, { opacity: canConfirm ? 1 : 0.5 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Konfirmasi</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  dropdown: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
    gap: 12,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  billContainer: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.inputBg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    marginVertical: 12,
    textAlign: 'center',
  },
  itemSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  itemName: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  addButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(0, 137, 123, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});