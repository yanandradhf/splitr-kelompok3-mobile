import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import { formatRp } from "@/lib/currency";
import { Colors } from '../../constants/Colors';

export default function BillDetail() {
  const { draft, recalcTotals } = useBillStore();
  
  useEffect(() => {
    recalcTotals();
  }, [draft.items, draft.fees]);
  
  const canConfirm = draft.name.trim().length > 0 && !!draft.category && draft.items.length > 0;
  
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Tagihan</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.billName}>Nama: <Text style={styles.boldText}>{draft.name}</Text></Text>
            <Text style={styles.billCategory}>Kategori: {draft.category ?? "-"}</Text>
          </View>
          <Pressable onPress={() => router.push("/create-bill/edit-bill")} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>
        
        <View style={styles.itemsContainer}>
          {draft.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{it.name} × {it.qty}</Text>
              <Text style={styles.itemPrice}>{formatRp(it.qty * it.price)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.subTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Pajak</Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Layanan</Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.service)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatRp(draft.totals.grandTotal)}</Text>
          </View>
        </View>

        <Pressable 
          onPress={() => router.push("/create-bill/payment-method")} 
          disabled={!canConfirm}
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
  billName: {
    fontSize: 16,
    marginBottom: 4,
    color: Colors.text,
  },
  billCategory: {
    fontSize: 16,
    color: Colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#00897B',
    fontSize: 14,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '600',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemText: {
    fontSize: 14,
    color: Colors.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  totalsContainer: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  grandTotalLabel: {
    fontWeight: "700",
    fontSize: 16,
    color: Colors.text,
  },
  grandTotalValue: {
    fontWeight: "700",
    fontSize: 16,
    color: '#00897B',
  },
  confirmButton: {
    backgroundColor: '#00897B',
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  confirmText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});