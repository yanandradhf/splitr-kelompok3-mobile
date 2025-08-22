import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import { useFriends } from "@/hooks/useApi";
import { formatRp } from "@/lib/currency";
import { Colors } from '../../constants/Colors';

export default function SplitBill() {
  const { draft, assignShare, markPaidUpfront, finalize } = useBillStore();
  const { friends } = useFriends();
  const [assignments, setAssignments] = useState<{[itemId: string]: {[memberId: string]: number}}>({});
  const [paidUpfront, setPaidUpfront] = useState<{[itemId: string]: string | null}>({});

  // Get selected members with names + host (me)
  const selectedMembers = friends
    .filter(f => draft.selectedMemberIds.includes(f.friend?.userId || f.id))
    .map(f => ({ id: f.friend?.userId || f.id, name: f.friend?.name || f.name }));
  
  // Add host (me) as first member
  const allMembers = [{ id: 'host', name: 'Saya' }, ...selectedMembers];

  const isValidAssignment = (itemId: string, qty: number) => {
    const itemAssignments = assignments[itemId] || {};
    const totalShares = Object.values(itemAssignments).reduce((sum, shares) => sum + shares, 0);
    return totalShares === qty;
  };

  const allItemsValid = draft.items.every(item => isValidAssignment(item.id, item.qty));

  const updateAssignment = (itemId: string, memberId: string, shares: number) => {
    setAssignments(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [memberId]: shares }
    }));
  };

  const handleConfirm = () => {
    // Save assignments to store
    Object.entries(assignments).forEach(([itemId, memberShares]) => {
      Object.entries(memberShares).forEach(([memberId, shareQty]) => {
        if (shareQty > 0) {
          assignShare({ itemId, memberId, shareQty, isPaidUpfront: paidUpfront[itemId] === memberId });
        }
      });
    });
    
    // Navigate to bill summary for final confirmation
    router.push("/create-bill/bill-summary");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Pembagian Tagihan</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.memberInfo}>Anggota dipilih: {selectedMembers.length + 1} (termasuk Anda)</Text>
        
        <View style={styles.billSummary}>
          <Text style={styles.summaryTitle}>Rincian Pesanan</Text>
          {draft.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name} × {item.qty}</Text>
                <Text style={styles.itemPrice}>{formatRp(item.qty * item.price)}</Text>
              </View>
              
              <Text style={styles.assignLabel}>Pilih siapa yang bayar:</Text>
              
              {allMembers.map((member) => {
                const currentShares = assignments[item.id]?.[member.id] || 0;
                return (
                  <View key={member.id} style={styles.memberRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={styles.shareControls}>
                      <Pressable 
                        onPress={() => updateAssignment(item.id, member.id, Math.max(0, currentShares - 1))}
                        style={styles.shareButton}
                      >
                        <Text style={styles.shareButtonText}>-</Text>
                      </Pressable>
                      <Text style={styles.shareCount}>{currentShares}</Text>
                      <Pressable 
                        onPress={() => updateAssignment(item.id, member.id, Math.min(item.qty, currentShares + 1))}
                        style={styles.shareButton}
                      >
                        <Text style={styles.shareButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
              
              <View style={styles.paidUpfrontSection}>
                <Text style={styles.paidLabel}>Sudah dibayar oleh:</Text>
                <View style={styles.paidOptions}>
                  <Pressable 
                    onPress={() => setPaidUpfront(prev => ({ ...prev, [item.id]: null }))}
                    style={[styles.paidOption, !paidUpfront[item.id] && styles.paidOptionActive]}
                  >
                    <Text style={[styles.paidOptionText, !paidUpfront[item.id] && styles.paidOptionActiveText]}>Belum</Text>
                  </Pressable>
                  {allMembers.map((member) => (
                    <Pressable 
                      key={member.id}
                      onPress={() => setPaidUpfront(prev => ({ ...prev, [item.id]: member.id }))}
                      style={[styles.paidOption, paidUpfront[item.id] === member.id && styles.paidOptionActive]}
                    >
                      <Text style={[styles.paidOptionText, paidUpfront[item.id] === member.id && styles.paidOptionActiveText]}>
                        {member.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              
              {!isValidAssignment(item.id, item.qty) && (
                <Text style={styles.validationError}>
                  Total pembagian harus sama dengan qty ({item.qty})
                </Text>
              )}
            </View>
          ))}
        </View>

        <Pressable 
          onPress={handleConfirm} 
          disabled={!allItemsValid} 
          style={[styles.confirmButton, { opacity: allItemsValid ? 1 : 0.5 }]}
        >
          <Text style={styles.confirmText}>Konfirmasi</Text>
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
  memberInfo: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.text,
  },
  billSummary: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontWeight: "600",
    fontSize: 16,
    color: Colors.text,
  },
  itemPrice: {
    fontWeight: "600",
    fontSize: 16,
    color: '#00897B',
  },
  assignLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  shareControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  shareCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  paidUpfrontSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  paidLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  paidOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paidOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  paidOptionActive: {
    backgroundColor: '#E6FFF3',
    borderColor: '#20C997',
  },
  paidOptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  paidOptionActiveText: {
    color: '#20C997',
    fontWeight: '600',
  },
  validationError: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
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