import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useBillStore } from "@/store/billStore";
import { toISODate } from "@/lib/date";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function PaymentMethod() {
  const { draft, setPaymentMethod, setDueDate } = useBillStore();
  const [mode, setMode] = useState<"PAY_NOW" | "PAY_LATER">(draft.paymentMethod || "PAY_NOW");
  const [date, setDate] = useState<Date>(draft.dueDate ? new Date(draft.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(draft.paymentMethod === "PAY_LATER");

  const onConfirm = () => {
    setPaymentMethod(mode);
    if (mode === "PAY_LATER") setDueDate(toISODate(date));
    router.push("/create-bill/member-bills");
  };

  const onDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const onDateCancel = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Pilih Metode Tagihan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            <Text style={styles.sectionSubtitle}>Pilih kapan tagihan harus dibayar</Text>
            <View style={styles.methodContainer}>
              <Pressable 
                onPress={() => setMode("PAY_NOW")} 
                style={[styles.methodCard, mode === "PAY_NOW" && styles.methodCardActive]}
              >
                <View style={styles.methodIcon}>
                  <Ionicons 
                    name="flash" 
                    size={24} 
                    color={mode === "PAY_NOW" ? COLORS.white : COLORS.teal} 
                  />
                </View>
                <Text style={[styles.methodTitle, mode === "PAY_NOW" && styles.methodTitleActive]}>
                  Bayar Sekarang
                </Text>
                <Text style={[styles.methodDesc, mode === "PAY_NOW" && styles.methodDescActive]}>
                  Maksimal 24 jam setelah undangan
                </Text>
              </Pressable>

              <Pressable 
                onPress={() => setMode("PAY_LATER")} 
                style={[styles.methodCard, mode === "PAY_LATER" && styles.methodCardActive]}
              >
                <View style={styles.methodIcon}>
                  <Ionicons 
                    name="calendar" 
                    size={24} 
                    color={mode === "PAY_LATER" ? COLORS.white : COLORS.teal} 
                  />
                </View>
                <Text style={[styles.methodTitle, mode === "PAY_LATER" && styles.methodTitleActive]}>
                  Bayar Nanti
                </Text>
                <Text style={[styles.methodDesc, mode === "PAY_LATER" && styles.methodDescActive]}>
                  Atur tanggal jatuh tempo
                </Text>
              </Pressable>
            </View>

            {mode === "PAY_NOW" && (
              <View style={styles.infoSection}>
                <View style={styles.infoBox}>
                  <Ionicons name="time" size={16} color={COLORS.warning} />
                  <Text style={styles.infoText}>
                    Tagihan akan expired dalam 24 jam setelah dikirim ke anggota
                  </Text>
                </View>
              </View>
            )}

            {mode === "PAY_LATER" && (
              <View style={styles.dateSection}>
                <Text style={styles.sectionTitle}>Tanggal Jatuh Tempo</Text>
                <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateInputContainer}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.teal} style={styles.dateIcon} />
                  <Text style={styles.dateInputText}>
                    {formatDate(date)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                </Pressable>
                
                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={onDateConfirm}
                  onCancel={onDateCancel}
                  minimumDate={new Date()}
                  date={date}
                />
              </View>
            )}

            <Pressable onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Kirim ke Anggota</Text>
            </Pressable>
          </ScrollView>
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
    marginBottom: SPACING.lg,
  },
  methodContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  methodCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodCardActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  methodIcon: {
    marginBottom: SPACING.md,
  },
  methodTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  methodTitleActive: {
    color: COLORS.white,
  },
  methodDesc: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  methodDescActive: {
    color: COLORS.white,
  },
  dateSection: {
    marginBottom: SPACING.lg,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dateIcon: {
    marginRight: SPACING.sm,
  },
  dateInputText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  dateHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: '#92400E',
    lineHeight: 18,
  },
});