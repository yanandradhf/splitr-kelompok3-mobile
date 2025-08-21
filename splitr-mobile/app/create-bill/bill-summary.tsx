import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import { useFriends } from "@/hooks/useApi";
import { formatRp } from "@/lib/currency";
import { Colors } from '../../constants/Colors';

export default function BillSummary() {
  const { draft, finalize } = useBillStore();
  const { friends } = useFriends();

  // Get member names
  const getMemberName = (memberId: string) => {
    if (memberId === 'host') return 'Saya';
    const friend = friends.find(f => (f.friend?.userId || f.id) === memberId);
    return friend?.friend?.name || friend?.name || 'Unknown';
  };

  // Group assignments by member
  const memberSummary: {[memberId: string]: {name: string, items: any[], total: number, isPaid: boolean}} = {};
  
  draft.assignments.forEach(assignment => {
    const item = draft.items.find(i => i.id === assignment.itemId);
    if (!item) return;
    
    if (!memberSummary[assignment.memberId]) {
      memberSummary[assignment.memberId] = {
        name: getMemberName(assignment.memberId),
        items: [],
        total: 0,
        isPaid: false
      };
    }
    
    const itemTotal = (item.price * assignment.shareQty);
    const itemTax = Math.floor(itemTotal * (draft.fees.taxPct / 100));
    const itemService = Math.floor(itemTotal * (draft.fees.servicePct / 100));
    const itemGrandTotal = itemTotal + itemTax + itemService;
    
    memberSummary[assignment.memberId].items.push({
      name: item.name,
      qty: assignment.shareQty,
      price: item.price,
      total: itemGrandTotal
    });
    
    memberSummary[assignment.memberId].total += itemGrandTotal;
    memberSummary[assignment.memberId].isPaid = assignment.isPaidUpfront || false;
  });

  const handleSendBill = () => {
    // Create member names mapping
    const memberNames: {[id: string]: string} = {};
    Object.keys(memberSummary).forEach(memberId => {
      memberNames[memberId] = memberSummary[memberId].name;
    });
    
    // Finalize and send to backend
    finalize(memberNames);
    
    // Navigate to monitoring tab
    router.replace("/(tabs)/monitoring");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Ringkasan Tagihan</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.billInfo}>
          <Text style={styles.billTitle}>{draft.name}</Text>
          <Text style={styles.paymentMethod}>
            {draft.paymentMethod === 'PAY_NOW' ? 'Bayar Sekarang' : 'Bayar Nanti'}
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
                  <Text style={styles.memberTotal}>{formatRp(member.total)}</Text>
                </View>
                <View style={[styles.statusBadge, member.isPaid ? styles.statusPaid : styles.statusUnpaid]}>
                  <Text style={[styles.statusText, member.isPaid ? styles.statusTextPaid : styles.statusTextUnpaid]}>
                    {member.isPaid ? 'Lunas' : 'Belum Bayar'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemsList}>
                {member.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.qty}x</Text>
                    <Text style={styles.itemPrice}>{formatRp(item.total)}</Text>
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
            <Text style={styles.totalLabel}>Pajak ({draft.fees.taxPct}%)</Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Layanan ({draft.fees.servicePct}%)</Text>
            <Text style={styles.totalValue}>{formatRp(draft.totals.service)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatRp(draft.totals.grandTotal)}</Text>
          </View>
        </View>

        <Pressable onPress={handleSendBill} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Kirim Tagihan</Text>
        </Pressable>
      </ScrollView>
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
  billInfo: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  billTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#00897B',
    fontWeight: '600',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00897B',
  },
  summarySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  memberTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00897B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusUnpaid: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPaid: {
    color: '#16A34A',
  },
  statusTextUnpaid: {
    color: '#D97706',
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  itemQty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    minWidth: 80,
  },
  totalSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
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
  grandTotalRow: {
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
  sendButton: {
    backgroundColor: '#00897B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});