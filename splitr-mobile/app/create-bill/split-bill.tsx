import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "../../store/billStore";
import { useFriends, useGroups } from "../../hooks/useApi";
import { useAuthStore } from "../../features/auth/auth.store";
import { COLORS, FONTS } from '../../constants/theme';

export default function SplitBill() {
  const { draft, assignShare, clearAssignmentsForItem, markPaidUpfront, finalize } = useBillStore();
  const { friends } = useFriends();
  const { groups } = useGroups(false);
  const [assignments, setAssignments] = useState({});
  const [paidUpfront, setPaidUpfront] = useState({});
  
  // Initialize paidUpfront with host as default for all items
  useEffect(() => {
    const initialPaidUpfront = {};
    draft.items.forEach(item => {
      initialPaidUpfront[item.id] = 'host'; // Auto-set host as paid upfront
    });
    setPaidUpfront(initialPaidUpfront);
  }, [draft.items]);
  
  // Get current user ID to exclude from selected members
  const { user } = useAuthStore();
  const currentUserId = user?.userId;

  const formatRp = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Create a map of all users (friends + group members) by userId
  const userMap = new Map();
  
  // Add friends to map
  friends.forEach(f => {
    if (f.friend?.userId) {
      userMap.set(f.friend.userId, { id: f.friend.userId, name: f.friend.name });
    }
  });
  
  // Add group members to map (will overwrite if same userId)
  groups.forEach(group => {
    group.members?.forEach(member => {
      userMap.set(member.userId, { id: member.userId, name: member.name });
    });
  });
  
  // Get selected members by looking up their userIds, excluding current user
  const selectedMembers = draft.selectedMemberIds
    .filter(userId => userId !== currentUserId) // Exclude current user
    .map(userId => userMap.get(userId))
    .filter(Boolean); // Remove any undefined entries
  
  // Always put current user (You) first, then other selected members
  const allMembers = [
    { id: 'host', name: 'You' },
    ...selectedMembers
  ];

  const isValidAssignment = (item) => {
    const itemAssignments = assignments[item.id] || {};
    if (item.isSharing) {
      // For sharing items, check if at least one person is selected
      const participantCount = Object.values(itemAssignments).filter(val => val > 0).length;
      return participantCount > 0;
    } else {
      // For normal items, check if total shares equals quantity
      const totalShares = Object.values(itemAssignments).reduce((sum, shares) => sum + shares, 0);
      return totalShares === item.qty;
    }
  };

  const allItemsValid = draft.items.every(item => isValidAssignment(item));

  const updateAssignment = (itemId, memberId, shares) => {
    setAssignments(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [memberId]: shares }
    }));
  };

  const handleConfirm = () => {
    // Clear all existing assignments first
    draft.items.forEach(item => {
      clearAssignmentsForItem(item.id);
    });
    
    // Save new assignments to store
    Object.entries(assignments).forEach(([itemId, memberShares]) => {
      const item = draft.items.find(i => i.id === itemId);
      if (item?.isSharing) {
        // For sharing items, calculate equal division
        const participants = Object.entries(memberShares).filter(([_, val]) => val > 0);
        if (participants.length > 0) {
          const sharePerPerson = item.price / participants.length;
          
          console.log(`🍽️ Sharing item: ${item.name}`);
          console.log(`💰 Total price: ${item.price}`);
          console.log(`👥 Participants: ${participants.length}`);
          console.log(`💵 Share per person: ${sharePerPerson}`);
          
          participants.forEach(([memberId]) => {
            console.log(`➡️ Assigning ${sharePerPerson} to ${memberId}`);
            assignShare({ 
              itemId, 
              memberId, 
              shareQty: sharePerPerson, 
              isPaidUpfront: paidUpfront[itemId] === memberId 
            });
          });
        }
      } else {
        // For normal items, use the assigned quantities
        Object.entries(memberShares).forEach(([memberId, shareQty]) => {
          if (shareQty > 0) {
            assignShare({ itemId, memberId, shareQty, isPaidUpfront: paidUpfront[itemId] === memberId });
          }
        });
      }
    });
    
    // Navigate to bill summary for final confirmation
    router.push("/create-bill/bill-summary");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pembagian Tagihan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.memberInfo}>Anggota dipilih: {allMembers.length} orang (termasuk Anda)</Text>
            
            <View style={styles.billSummary}>
              <Text style={styles.summaryTitle}>Rincian Pesanan</Text>
              {draft.items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name} × {item.qty}</Text>
                    <Text style={styles.itemPrice}>{formatRp(item.qty * item.price)}</Text>
                  </View>
                  
                  <Text style={styles.assignLabel}>Pilih siapa yang bayar:</Text>
                  
                  {item.isSharing ? (
                    // Sharing item - checkbox selection
                    <View style={styles.sharingContainer}>
                      <Text style={styles.sharingHint}>Pilih siapa yang ikut - akan dibagi rata otomatis</Text>
                      {allMembers.map((member) => {
                        const isSelected = (assignments[item.id]?.[member.id] || 0) > 0;
                        return (
                          <TouchableOpacity 
                            key={member.id} 
                            onPress={() => {
                              if (isSelected) {
                                updateAssignment(item.id, member.id, 0);
                              } else {
                                updateAssignment(item.id, member.id, 1); // Just mark as participating
                              }
                            }}
                            style={styles.sharingMemberRow}
                          >
                            <Text style={styles.memberName}>{member.name}</Text>
                            <View style={[styles.sharingCheckbox, isSelected && styles.sharingCheckboxActive]}>
                              {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    // Normal item - quantity based
                    allMembers.map((member) => {
                      const currentShares = assignments[item.id]?.[member.id] || 0;
                      return (
                        <View key={member.id} style={styles.memberRow}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <View style={styles.shareControls}>
                            <TouchableOpacity 
                              onPress={() => updateAssignment(item.id, member.id, Math.max(0, currentShares - 1))}
                              style={styles.shareButton}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.shareButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.shareCount}>{currentShares}</Text>
                            <TouchableOpacity 
                              onPress={() => updateAssignment(item.id, member.id, Math.min(item.qty, currentShares + 1))}
                              style={styles.shareButton}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.shareButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                  
                  <View style={styles.paidUpfrontSection}>
                    <Text style={styles.paidLabel}>Sudah dibayar oleh:</Text>
                    <View style={styles.paidInfoContainer}>
                      <View style={[styles.paidOption, styles.paidOptionActive]}>
                        <Text style={[styles.paidOptionText, styles.paidOptionActiveText]}>You</Text>
                      </View>
                      <Text style={styles.paidInfoText}>(Otomatis karena Anda pembuat tagihan)</Text>
                    </View>
                  </View>
                  
                  {!isValidAssignment(item) && (
                    <Text style={styles.validationError}>
                      {item.isSharing 
                        ? 'Pilih minimal 1 orang yang ikut'
                        : `Total pembagian harus sama dengan qty (${item.qty})`
                      }
                    </Text>
                  )}
                </View>
              ))}
            </View>

          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={handleConfirm} 
              disabled={!allItemsValid} 
              style={[styles.confirmButton, { opacity: allItemsValid ? 1 : 0.5 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Konfirmasi</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 70,
  },
  memberInfo: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 8,
    color: COLORS.textPrimary,
    textAlign: 'center',
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 8,
  },
  billSummary: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
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
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  itemPrice: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.teal,
  },
  assignLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
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
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  shareControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 4,
  },
  shareButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 16,
  },
  shareCount: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    minWidth: 32,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  paidUpfrontSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  paidLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  paidOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paidOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    minWidth: 50,
    alignItems: 'center',
  },
  paidOptionActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  paidOptionText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  paidOptionActiveText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  paidInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paidInfoText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  validationError: {
    color: COLORS.red,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 70,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  sharingContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  sharingHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  sharingMemberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sharingCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  sharingCheckboxActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
});