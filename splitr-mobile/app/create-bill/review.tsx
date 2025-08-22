// app/create-bill/review.tsx
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';

type BillItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

type BillData = {
  merchantName: string;
  items: BillItem[];
  tax: number;
  service: number;
  subtotal: number;
  total: number;
};

export default function ReviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState<BillData>({
    merchantName: '',
    items: [],
    tax: 0,
    service: 0,
    subtotal: 0,
    total: 0,
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (imageUri) {
      processOCR();
    }
  }, [imageUri]);

  const processOCR = async () => {
    setLoading(true);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      // Call OCR API
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'K87899142388957', // Free OCR.space API key
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.ParsedResults && result.ParsedResults[0]) {
        const text = result.ParsedResults[0].ParsedText;
        const parsedData = parseReceiptText(text);
        setBillData(parsedData);
      } else {
        // Fallback to mock data if OCR fails
        setBillData({
          merchantName: 'Tagihan Baru',
          items: [{ id: '1', name: 'Item 1', qty: 1, price: 0 }],
          tax: 0,
          service: 0,
          subtotal: 0,
          total: 0,
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      // Fallback to empty form
      setBillData({
        merchantName: 'Tagihan Baru',
        items: [{ id: '1', name: 'Item 1', qty: 1, price: 0 }],
        tax: 0,
        service: 0,
        subtotal: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const parseReceiptText = (text: string): BillData => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: BillItem[] = [];
    let merchantName = 'Tagihan Baru';
    let tax = 0;
    let service = 0;
    
    // Extract merchant name (usually first few lines)
    if (lines.length > 0) {
      merchantName = lines[0].trim() || 'Tagihan Baru';
    }
    
    // Parse items and costs
    lines.forEach((line, index) => {
      const cleanLine = line.trim().toLowerCase();
      
      // Look for price patterns (numbers with dots/commas)
      const priceMatch = line.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g);
      
      if (priceMatch && !cleanLine.includes('total') && !cleanLine.includes('tax') && !cleanLine.includes('service')) {
        const price = parseInt(priceMatch[priceMatch.length - 1].replace(/[.,]/g, ''));
        if (price > 1000) { // Filter out small numbers that aren't prices
          const itemName = line.replace(/\d+[.,\d]*\s*$/g, '').trim() || `Item ${items.length + 1}`;
          items.push({
            id: (items.length + 1).toString(),
            name: itemName,
            qty: 1,
            price: price,
          });
        }
      }
      
      // Extract tax
      if (cleanLine.includes('tax') || cleanLine.includes('pajak') || cleanLine.includes('ppn')) {
        const taxMatch = line.match(/(\d{1,3}(?:[.,]\d{3})*)/g);
        if (taxMatch) {
          tax = parseInt(taxMatch[taxMatch.length - 1].replace(/[.,]/g, ''));
        }
      }
      
      // Extract service charge
      if (cleanLine.includes('service') || cleanLine.includes('layanan') || cleanLine.includes('svc')) {
        const serviceMatch = line.match(/(\d{1,3}(?:[.,]\d{3})*)/g);
        if (serviceMatch) {
          service = parseInt(serviceMatch[serviceMatch.length - 1].replace(/[.,]/g, ''));
        }
      }
    });
    
    // If no items found, add default item
    if (items.length === 0) {
      items.push({ id: '1', name: 'Item 1', qty: 1, price: 0 });
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const total = subtotal + tax + service;
    
    return {
      merchantName,
      items,
      tax,
      service,
      subtotal,
      total,
    };
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: '',
      qty: 1,
      price: 0,
    };
    setBillData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculateTotals = () => {
    const subtotal = billData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const total = subtotal + billData.tax + billData.service;
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  const handleConfirm = () => {
    // Save bill data and navigate
    router.push('/(tabs)/home');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00897B" />
          <Text style={styles.loadingText}>Memindai struk...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Review & Edit</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nama Tagihan</Text>
          <TextInput
            style={styles.input}
            value={billData.merchantName}
            onChangeText={(text) => setBillData(prev => ({ ...prev, merchantName: text }))}
            placeholder="Masukkan nama tagihan"
          />
        </View>

        {imageUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto Struk</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.receiptImage} />
              <Pressable style={styles.retakeButton} onPress={() => router.back()}>
                <Text style={styles.retakeText}>Foto Ulang</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detail Tagihan</Text>
            <Pressable onPress={() => setEditMode(!editMode)}>
              <Text style={styles.editButton}>{editMode ? 'Selesai' : 'Edit'}</Text>
            </Pressable>
          </View>

          <View style={styles.itemsContainer}>
            {billData.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {editMode ? (
                  <>
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
                      placeholder="Qty"
                    />
                    <TextInput
                      style={[styles.itemInput, { flex: 2 }]}
                      value={item.price.toString()}
                      onChangeText={(text) => updateItem(item.id, 'price', parseInt(text) || 0)}
                      keyboardType="numeric"
                      placeholder="Harga"
                    />
                    <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
                      <Ionicons name="trash" size={16} color={Colors.danger} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={[styles.itemText, { flex: 2 }]}>{item.name}</Text>
                    <Text style={[styles.itemText, { flex: 1, textAlign: 'center' }]}>{item.qty}x</Text>
                    <Text style={[styles.itemText, { flex: 2, textAlign: 'right' }]}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                  </>
                )}
              </View>
            ))}

            {editMode && (
              <Pressable style={styles.addButton} onPress={addItem}>
                <Ionicons name="add" size={20} color="#00897B" />
                <Text style={styles.addText}>Tambah Item</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Pajak</Text>
              <Text style={styles.totalValue}>Rp {billData.tax.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Layanan</Text>
              <Text style={styles.totalValue}>Rp {billData.service.toLocaleString('id-ID')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  editButton: {
    color: '#00897B',
    fontSize: 16,
    fontWeight: '600',
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
  imageContainer: {
    alignItems: 'center',
    gap: 12,
  },
  receiptImage: {
    width: 200,
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  retakeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.border,
    borderRadius: 6,
  },
  retakeText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  itemsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
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
  itemText: {
    fontSize: 14,
    color: Colors.text,
  },
  removeButton: {
    padding: 4,
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