import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "../../store/billStore";
import { useFriends, useGroups } from "../../hooks/useApi";
import { useAuthStore } from "../../features/auth/auth.store";
import { formatRp } from "../../lib/currency";
import { getCategories, Category } from "../../services/categoryApi";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function BillSummary() {
  const { draft, finalize } = useBillStore();
  const { friends } = useFriends();
  const { groups } = useGroups(false);
  const { user } = useAuthStore();
  const currentUserId = user?.userId;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Create a map of all users (friends + group members) by userId
  const userMap = new Map();
  
  // Add current user to map
  if (currentUserId) {
    userMap.set('host', { userId: currentUserId, id: currentUserId, name: user?.name || 'You' });
  }
  
  // Add friends to map
  friends.forEach(f => {
    if (f.friend?.userId) {
      userMap.set(f.friend.userId, { userId: f.friend.userId, id: f.friend.userId, name: f.friend.name });
    }
  });
  
  // Add group members to map
  groups.forEach(group => {
    group.members?.forEach(member => {
      userMap.set(member.userId, { userId: member.userId, id: member.userId, name: member.name });
    });
  });
  
  // Get member names
  const getMemberName = (memberId: string) => {
    if (memberId === 'host') return 'You';
    const user = userMap.get(memberId);
    return user?.name || 'Unknown';
  };

  // Group assignments by member
  const memberSummary: {[memberId: string]: {name: string, items: any[], total: number, totalDiscount: number, isPaid: boolean}} = {};
  
  draft.assignments.forEach(assignment => {
    const item = draft.items.find(i => i.id === assignment.itemId);
    if (!item) return;
    
    if (!memberSummary[assignment.memberId]) {
      memberSummary[assignment.memberId] = {
        name: getMemberName(assignment.memberId),
        items: [],
        total: 0,
        totalDiscount: 0,
        isPaid: false
      };
    }
    
    const itemTotal = item.isSharing ? assignment.shareQty : (item.price * assignment.shareQty);
    
    // 1. Hitung diskon per item dulu
    let itemDiscount = 0;
    if (draft.fees.discountPct > 0) {
      itemDiscount = Math.floor(itemTotal * (draft.fees.discountPct / 100));
    } else if (draft.fees.discountNominal > 0) {
      // Distribute nominal discount proportionally
      const memberShareRatio = itemTotal / draft.totals.subTotal;
      itemDiscount = Math.floor(draft.fees.discountNominal * memberShareRatio);
    }
    
    // 2. Harga setelah diskon
    const itemAfterDiscount = Math.max(0, itemTotal - itemDiscount);
    
    // 3. Hitung service dari harga setelah diskon
    const itemService = Math.floor(itemAfterDiscount * (draft.fees.servicePct / 100));
    
    // 4. Hitung pajak dari harga setelah diskon
    const itemTax = Math.floor(itemAfterDiscount * (draft.fees.taxPct / 100));
    
    // 5. Total akhir per item
    const itemGrandTotal = itemAfterDiscount + itemService + itemTax;
    
    memberSummary[assignment.memberId].items.push({
      name: item.name,
      qty: item.isSharing ? 1 : assignment.shareQty,
      price: item.isSharing ? assignment.shareQty : item.price,
      subtotal: itemTotal,
      service: itemService,
      tax: itemTax,
      discount: itemDiscount,
      total: itemGrandTotal
    });
    
    memberSummary[assignment.memberId].total += itemGrandTotal;
    memberSummary[assignment.memberId].totalDiscount += itemDiscount;
    memberSummary[assignment.memberId].isPaid = assignment.isPaidUpfront || false;
  });

  const handleSendBill = () => {
    router.push('/create-bill/pin-verification');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Ringkasan Tagihan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.billInfo}>
          <Text style={styles.billTitle}>{draft.name}</Text>
          <Text style={styles.paymentMethod}>
            {draft.paymentMethod === 'PAY_NOW' ? 'Bayar Sekarang (24 jam)' : 'Bayar Nanti'}
            {draft.paymentMethod === 'PAY_LATER' && draft.dueDate && ` • ${draft.dueDate}`}
          </Text>
          <Text style={styles.totalAmount}>{formatRp(draft.totals.grandTotal)}</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
          
          {Object.entries(memberSummary).map(([memberId, member]) => (
            <View key={memberId} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberTotalContainer}>
                    <Text style={styles.memberTotal}>{formatRp(member.total)}</Text>
                    {member.totalDiscount > 0 && (
                      <Text style={styles.memberDiscount}>
                        <Text>Hemat </Text>
                        <Text>{formatRp(member.totalDiscount)}</Text>
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[styles.statusBadge, member.isPaid ? styles.statusPaid : styles.statusUnpaid]}>
                  <Text style={[styles.statusText, member.isPaid ? styles.statusTextPaid : styles.statusTextUnpaid]}>
                    {member.isPaid ? 'Lunas' : 'Belum Bayar'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemsList}>
                {member.items.map((item, idx) => (
                  <View key={idx} style={styles.itemContainer}>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>{item.qty}x</Text>
                      <View style={styles.itemPriceContainer}>
                        {item.discount > 0 ? (
                          <>
                            <Text style={styles.itemPriceOriginal}>{formatRp(item.subtotal + item.service + item.tax)}</Text>
                            <Text style={styles.itemPrice}>{formatRp(item.total)}</Text>
                          </>
                        ) : (
                          <Text style={styles.itemPrice}>{formatRp(item.total)}</Text>
                        )}
                      </View>
                    </View>
                    {item.discount > 0 && (
                      <View style={styles.discountRow}>
                        <View style={styles.discountContainer}>
                          <Ionicons name="pricetag" size={12} color={COLORS.success} />
                          <Text style={styles.discountText}>
                            <Text>Diskon -</Text>
                            <Text>{formatRp(item.discount)}</Text>
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.subTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              <Text>Pajak (</Text>
              <Text>{draft.fees.taxPct}</Text>
              <Text>%)</Text>
            </Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              <Text>Layanan (</Text>
              <Text>{draft.fees.servicePct}</Text>
              <Text>%)</Text>
            </Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.service)}</Text>
          </View>
          {draft.totals.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                <Text>Diskon </Text>
                {draft.fees.discountPct > 0 ? (
                  <Text>
                    <Text>(</Text>
                    <Text>{draft.fees.discountPct}</Text>
                    <Text>%)</Text>
                  </Text>
                ) : (
                  <Text>(Nominal)</Text>
                )}
              </Text>
              <Text style={[styles.totalValue, styles.successColor]}>
                <Text>-</Text>
                <Text>{formatRp(draft.totals.discount)}</Text>
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatRp(draft.totals.grandTotal)}</Text>
          </View>
        </View>

            <Pressable 
              onPress={handleSendBill} 
              style={styles.sendButton}
            >
              <Text style={styles.sendButtonText}>Lanjut ke Verifikasi</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  billInfo: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  paymentMethod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal,
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  summarySection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  memberTotalContainer: {
    alignItems: 'flex-start',
  },
  memberTotal: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  memberDiscount: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusPaid: {
    backgroundColor: COLORS.successLight,
  },
  statusUnpaid: {
    backgroundColor: COLORS.warningLight,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
  statusTextPaid: {
    color: COLORS.success,
  },
  statusTextUnpaid: {
    color: COLORS.warning,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  itemContainer: {
    marginBottom: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  itemName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  itemQty: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  itemPriceOriginal: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'right',
    textDecorationLine: 'line-through',
  },
  discountRow: {
    paddingLeft: SPACING.md,
    paddingTop: 2,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    fontStyle: 'italic',
  },
  totalSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  sendButton: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  successColor: {
    color: COLORS.success,
  },
});