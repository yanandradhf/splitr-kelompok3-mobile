import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "../../store/billStore";
import { useFriends, useGroups } from "../../hooks/useApi";
import { useAuthStore } from "../../features/auth/auth.store";
import { formatRp } from "../../lib/currency";
import { getCategories, Category } from "../../services/categoryApi";
import api from "../../services/api";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function PinVerification() {
  const { draft, finalize } = useBillStore();
  const { friends } = useFriends();
  const { groups } = useGroups(false);
  const { user } = useAuthStore();
  const [pin, setPin] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const currentUserId = user?.userId;

  // Create user map
  const userMap = new Map();
  
  if (currentUserId) {
    userMap.set('host', { userId: currentUserId, id: currentUserId, name: user?.name || 'You' });
  }
  
  friends.forEach(f => {
    if (f.friend?.userId) {
      userMap.set(f.friend.userId, { userId: f.friend.userId, id: f.friend.userId, name: f.friend.name });
    }
  });
  
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
  const memberSummary: {[memberId: string]: {name: string, items: any[], total: number}} = {};
  
  draft.assignments.forEach(assignment => {
    const item = draft.items.find(i => i.id === assignment.itemId);
    if (!item) return;
    
    if (!memberSummary[assignment.memberId]) {
      memberSummary[assignment.memberId] = {
        name: getMemberName(assignment.memberId),
        items: [],
        total: 0
      };
    }
  });

  // If no assignments, create summary from selected members
  if (Object.keys(memberSummary).length === 0) {
    // Add host
    memberSummary['host'] = {
      name: 'You',
      items: [],
      total: 0
    };
    
    // Add selected members
    draft.selectedMemberIds.forEach(memberId => {
      if (memberId !== currentUserId) {
        memberSummary[memberId] = {
          name: getMemberName(memberId),
          items: [],
          total: 0
        };
      }
    });
  }

  React.useEffect(() => {
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

  const handleCreateBill = async () => {
    if (isCreating || pin.length !== 6) return;
    
    // Validate PIN with API
    try {
      const response = await api.post('/api/mobile/auth/verify-pin', {
        pin: pin
      });
      
      if (!response.data.verified) {
        alert('PIN salah. Silakan coba lagi.');
        setPin("");
        setIsCreating(false);
        return;
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      alert('Gagal memverifikasi PIN. Silakan coba lagi.');
      setPin("");
      setIsCreating(false);
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create member names mapping
      const memberNames: {[id: string]: string} = {};
      Object.keys(memberSummary).forEach(memberId => {
        memberNames[memberId] = memberSummary[memberId].name;
      });

      // Use categoryId directly from draft
      const categoryId = draft.category;
      
      if (!categoryId) {
        alert('Error: Category not selected. Please try again.');
        setIsCreating(false);
        return;
      }

      // Finalize and send to backend
      const apiResponse = await finalize(memberNames, categoryId, userMap, user, categories);
      
      // Navigate to success page
      const allMemberNames = Object.values(memberNames);
      const uniqueNames = ['You', ...allMemberNames.filter(name => name !== 'You')];
      
      router.push({
        pathname: "/create-bill/success",
        params: {
          billName: apiResponse.billName,
          billCode: apiResponse.billCode,
          totalAmount: apiResponse.totalAmount.toString(),
          inviteLink: apiResponse.inviteLink,
          qrCodeUrl: apiResponse.qrCodeUrl,
          hostName: apiResponse.host.name,
          participantsAdded: apiResponse.participantsAdded.toString(),
          notificationsSent: apiResponse.notificationsSent.toString(),
          memberNames: JSON.stringify(uniqueNames)
        }
      });
    } catch (error) {
      console.error('Failed to create bill:', error);
      alert('Gagal membuat tagihan. Silakan coba lagi.');
      setIsCreating(false);
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(numericValue);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Verifikasi PIN</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={80} color={COLORS.teal} />
            </View>

            <Text style={styles.title}>Konfirmasi Pembuatan Tagihan</Text>
            <Text style={styles.subtitle}>
              Masukkan PIN Anda untuk mengonfirmasi pembuatan tagihan
            </Text>

            <View style={styles.billSummary}>
              <Text style={styles.billName}>{draft.name}</Text>
              <Text style={styles.totalAmount}>{formatRp(draft.totals.grandTotal)}</Text>
            </View>

            <View style={styles.participantsSection}>
              <Text style={styles.participantsTitle}>Peserta Tagihan</Text>
              <View style={styles.participantsList}>
                {Object.entries(memberSummary).map(([memberId, member]) => (
                  <View key={memberId} style={styles.participantItem}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>{member.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.pinContainer}>
              <Text style={styles.pinLabel}>Masukkan PIN (6 digit)</Text>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                placeholder="••••••"
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={styles.pinHint}>
                PIN digunakan untuk keamanan transaksi Anda
              </Text>
            </View>

            <Pressable 
              onPress={handleCreateBill} 
              style={[styles.confirmButton, (pin.length !== 6 || isCreating) && styles.confirmButtonDisabled]}
              disabled={pin.length !== 6 || isCreating}
            >
              {isCreating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.confirmText}>Membuat Tagihan...</Text>
                </View>
              ) : (
                <Text style={styles.confirmText}>Buat Tagihan</Text>
              )}
            </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  billSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  billName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  pinContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  pinLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  pinInput: {
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: SPACING.sm,
  },
  pinHint: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.bottomButton,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  participantsSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  participantsTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  participantItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  participantAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  participantName: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    maxWidth: 60,
  },
});