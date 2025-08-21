import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import type { BillItem } from "@/types/bill";
import { formatRp } from "@/lib/currency";
import { Colors } from '../../constants/Colors';

export default function EditBill() {
  const { draft, addItem, updateItem, removeItem, setFees, recalcTotals } = useBillStore();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");

  useEffect(() => { recalcTotals(); }, [draft.items, draft.fees]);

  const onAdd = () => {
    const item: BillItem = {
      id: Math.random().toString(36).slice(2),
      name: name.trim() || "Item",
      qty: Math.max(1, Number(qty) || 1),
      price: Math.max(0, Number(price) || 0),
    };
    addItem(item);
    setName(""); setQty("1"); setPrice("0");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Tagihan</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputRow}>
          <TextInput placeholder="Nama item" value={name} onChangeText={setName} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="Qty" keyboardType="number-pad" value={qty} onChangeText={setQty} style={[styles.input, { width: 64, textAlign: "center" }]} />
          <TextInput placeholder="Harga" keyboardType="number-pad" value={price} onChangeText={setPrice} style={[styles.input, { width: 120 }]} />
          <Pressable onPress={onAdd} style={styles.addBtn}><Text style={styles.addBtnText}>Tambah</Text></Pressable>
        </View>

        <View style={{ marginTop: 12 }}>
          {draft.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name} × {item.qty}</Text>
              <View style={styles.itemActions}>
                <Text style={styles.itemPrice}>{formatRp(item.qty * item.price)}</Text>
                <Pressable onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>Hapus</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.feesContainer}>
          <Text style={styles.feesTitle}>Pajak & Layanan</Text>
          <View style={styles.feeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.feeLabel}>Pajak (%)</Text>
              <TextInput keyboardType="number-pad" value={String(draft.fees.taxPct)} onChangeText={(v) => setFees({ ...draft.fees, taxPct: Number(v) || 0 })} style={styles.input} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feeLabel}>Layanan (%)</Text>
              <TextInput keyboardType="number-pad" value={String(draft.fees.servicePct)} onChangeText={(v) => setFees({ ...draft.fees, servicePct: Number(v) || 0 })} style={styles.input} />
            </View>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{formatRp(draft.totals.subTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Pajak</Text><Text style={styles.totalValue}>{formatRp(draft.totals.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Layanan</Text><Text style={styles.totalValue}>{formatRp(draft.totals.service)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text><Text style={styles.grandTotalValue}>{formatRp(draft.totals.grandTotal)}</Text>
          </View>
        </View>

        <Pressable onPress={() => router.back()} style={styles.confirmButton}>
          <Text style={styles.confirmText}>Konfirmasi</Text>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.white,
  },
  addBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addBtnText: {
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 14,
    color: Colors.text,
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    color: "#d33",
    fontSize: 14,
  },
  feesContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.white,
  },
  feesTitle: {
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 16,
  },
  feeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: Colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
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