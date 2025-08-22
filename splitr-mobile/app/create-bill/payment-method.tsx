import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import { toISODate } from "@/lib/date";
import { Colors } from '../../constants/Colors';

export default function PaymentMethod() {
  const { draft, setPaymentMethod, setDueDate } = useBillStore();
  const [mode, setMode] = useState<"PAY_NOW" | "PAY_LATER">(draft.paymentMethod || "PAY_NOW");
  const [date, setDate] = useState<string>(draft.dueDate || toISODate(new Date()));

  const onConfirm = () => {
    setPaymentMethod(mode);
    if (mode === "PAY_LATER") setDueDate(date);
    router.push("/create-bill/member-bills");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Pilih Metode Tagihan</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.methodContainer}>
          {(["PAY_NOW", "PAY_LATER"] as const).map((m) => (
            <Pressable key={m} onPress={() => setMode(m)} style={[styles.pill, mode === m && styles.pillActive]}>
              <Text style={[styles.pillText, mode === m && styles.pillActiveText]}>
                {m === "PAY_NOW" ? "Bayar Sekarang" : "Bayar Nanti"}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === "PAY_LATER" && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Jatuh Tempo</Text>
            <Pressable onPress={() => setDate(toISODate(new Date()))} style={styles.dateButton}>
              <Text style={styles.dateText}>{date}</Text>
            </Pressable>
            <Text style={styles.dateNote}>(* Ganti dengan komponen kalender sesuai desain Anda)</Text>
          </View>
        )}

        <Pressable onPress={onConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmText}>Kirim ke Anggota</Text>
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
  methodContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  pillActive: {
    backgroundColor: '#E6FFF3',
    borderColor: '#20C997',
  },
  pillText: {
    fontSize: 14,
    color: Colors.text,
  },
  pillActiveText: {
    color: '#20C997',
  },
  dateContainer: {
    marginTop: 12,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: Colors.white,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
  },
  dateNote: {
    opacity: 0.7,
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
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