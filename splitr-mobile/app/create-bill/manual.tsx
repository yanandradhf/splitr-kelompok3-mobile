// app/create-bill/manual.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';
import { useBillStore } from '@/store/billStore';
import type { BillCategory, BillItem } from '@/types/bill';
import { formatRp } from '@/lib/currency';

const categories: BillCategory[] = [
  "Makanan dan Minuman",
  "Hiburan",
  "Belanja",
  "Lainnya",
];

export default function ManualScreen() {
  const { draft, setHeader, addItem, updateItem, removeItem, setFees, recalcTotals } = useBillStore();
  const [name, setName] = useState(draft.name);
  const [category, setCategory] = useState<BillCategory | null>(draft.category);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => { recalcTotals(); }, [draft.items, draft.fees]);

  const canConfirm = useMemo(() => name.trim().length > 0 && !!category && draft.items.length > 0, [name, category, draft.items.length]);

  const onAddItem = () => {
    const item: BillItem = {
      id: Math.random().toString(36).slice(2),
      name: "Item Baru",
      qty: 1,
      price: 0,
    };
    addItem(item);
  };

  const handleConfirm = () => {
    setHeader(name.trim(), category);
    router.push('/create-bill/bill-detail');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Buat Tagihan Manual</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nama Tagihan</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Warung Cak Ilhem"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Tagihan</Text>
          <Pressable 
            style={styles.dropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
              {category || 'Pilih kategori'}
            </Text>
            <Ionicons 
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={Colors.textSecondary} 
            />
          </Pressable>
          
          {showCategoryDropdown && (
            <View style={styles.dropdownList}>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cat}</Text>
                </Pressable>
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
            <Pressable onPress={() => router.push('/create-bill/edit-bill')} style={styles.addButton}>
              <Text style={styles.addText}>+ Tambah Item</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          disabled={!canConfirm}
          onPress={handleConfirm}
          style={[styles.confirmButton, { opacity: canConfirm ? 1 : 0.5 }]}
        >
          <Text style={styles.confirmText}>Konfirmasi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  header: {
    backgroundColor: '#00897B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  dropdownList: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#E6FFF3',
    borderColor: '#20C997',
  },
  pillText: {
    fontSize: 14,
    color: Colors.text,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  dropdownList: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  billContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    marginVertical: 8,
  },
  itemSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: Colors.text,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  addButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  addText: {
    fontWeight: '600',
    color: '#00897B',
  },
  footer: {
    padding: 16,
  },
  confirmButton: {
    backgroundColor: '#00897B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});