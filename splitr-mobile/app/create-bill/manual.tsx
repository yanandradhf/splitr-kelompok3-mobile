// app/create-bill/manual.tsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';

type BillItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

const CATEGORIES = [
  'Makanan & Minuman',
  'Hiburan', 
  'Belanja',
  'Lainnya'
];

export default function ManualScreen() {
  const [merchantName, setMerchantName] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [items, setItems] = useState<BillItem[]>([
    { id: '1', name: '', qty: 1, price: 0 }
  ]);
  const [tax, setTax] = useState(0);
  const [service, setService] = useState(0);

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: '',
      qty: 1,
      price: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const total = subtotal + tax + service;
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  const handleConfirm = () => {
    // Save bill data and navigate
    router.push('/(tabs)/home');
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
            value={merchantName}
            onChangeText={setMerchantName}
            placeholder="Masukkan nama tagihan"
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
              {CATEGORIES.map((cat) => (
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
          <Text style={styles.sectionTitle}>Detail Tagihan</Text>
          
          <View style={styles.itemsContainer}>
            <View style={styles.itemHeader}>
              <Text style={[styles.headerText, { flex: 2 }]}>Nama Item</Text>
              <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Harga</Text>
              <View style={{ width: 32 }} />
            </View>

            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <TextInput
                  style={[styles.itemInput, { flex: 2 }]}
                  value={item.name}
                  onChangeText={(text) => updateItem(item.id, 'name', text)}
                  placeholder="Nama item"
                />
                <TextInput
                  style={[styles.itemInput, { flex: 1 }]}
                  value={item.qty.toString()}
                  onChangeText={(text) => updateItem(item.id, 'qty', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="1"
                />
                <TextInput
                  style={[styles.itemInput, { flex: 2 }]}
                  value={item.price.toString()}
                  onChangeText={(text) => updateItem(item.id, 'price', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Pressable 
                  onPress={() => removeItem(item.id)} 
                  style={[styles.removeButton, items.length === 1 && styles.disabledButton]}
                  disabled={items.length === 1}
                >
                  <Ionicons name="trash" size={16} color={items.length === 1 ? Colors.disabled : Colors.danger} />
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addButton} onPress={addItem}>
              <Ionicons name="add" size={20} color="#00897B" />
              <Text style={styles.addText}>Tambah Item</Text>
            </Pressable>
          </View>

          <View style={styles.additionalCosts}>
            <Text style={styles.costsTitle}>Biaya Tambahan</Text>
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Pajak</Text>
              <TextInput
                style={styles.costInput}
                value={tax.toString()}
                onChangeText={(text) => setTax(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Layanan</Text>
              <TextInput
                style={styles.costInput}
                value={service.toString()}
                onChangeText={(text) => setService(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Pajak</Text>
              <Text style={styles.totalValue}>Rp {tax.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Layanan</Text>
              <Text style={styles.totalValue}>Rp {service.toLocaleString('id-ID')}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>Rp {total.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
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
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  itemsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  itemInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  addText: {
    color: '#00897B',
    fontSize: 14,
    fontWeight: '600',
  },
  additionalCosts: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  costsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  costInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    width: 100,
    textAlign: 'right',
  },
  totalsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '700',
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