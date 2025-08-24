import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
// Removed unused imports
import { formatRp } from "@/lib/currency";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function BillSuccess() {
  const params = useLocalSearchParams();
  const [billData, setBillData] = useState({
    name: '',
    code: '',
    total: 0,
    memberNames: [] as string[],
    inviteLink: '',
    qrCodeUrl: '',
    hostName: '',
    participantsAdded: 0,
    notificationsSent: 0
  });

  useEffect(() => {
    // Get data from params
    const billName = params.billName as string || 'Tagihan';
    const billCode = params.billCode as string || '';
    const totalAmount = parseInt(params.totalAmount as string || '0');
    const inviteLink = params.inviteLink as string || '';
    const qrCodeUrl = params.qrCodeUrl as string || '';
    const hostName = params.hostName as string || '';
    const participantsAdded = parseInt(params.participantsAdded as string || '0');
    const notificationsSent = parseInt(params.notificationsSent as string || '0');
    const memberNamesParam = params.memberNames as string;
    
    let memberNames: string[] = [];
    if (memberNamesParam) {
      try {
        const parsedNames = JSON.parse(memberNamesParam);
        memberNames = parsedNames;
      } catch (e) {
        console.error('Error parsing member names:', e);
        memberNames = ['You'];
      }
    } else {
      memberNames = ['You'];
    }
    
    setBillData({
      name: billName,
      code: billCode,
      total: totalAmount,
      memberNames: memberNames,
      inviteLink,
      qrCodeUrl,
      hostName,
      participantsAdded,
      notificationsSent
    });
  }, [params.billName, params.totalAmount, params.memberNames]);

  const handleGoHome = () => {
    router.replace("/(tabs)/home");
  };

  const handleViewBills = () => {
    router.replace("/(tabs)/monitoring");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={80} color={COLORS.white} />
            </View>
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.successTitle}>Splitr Berhasil Dibuat!</Text>
            <Text style={styles.successSubtitle}>
              Tagihan telah berhasil dibuat dan dikirimkan ke semua anggota
            </Text>
          </View>

          {/* Bill Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.billName}>{billData.name}</Text>
            {billData.code && (
              <Text style={styles.billCode}>Kode: {billData.code}</Text>
            )}
            <Text style={styles.totalAmount}>{formatRp(billData.total)}</Text>
            <Text style={styles.memberCount}>
              Dibagi untuk {billData.memberNames.length} orang
            </Text>
            {billData.notificationsSent > 0 && (
              <Text style={styles.notificationInfo}>
                📩 {billData.notificationsSent} notifikasi terkirim
              </Text>
            )}
          </View>

          {/* Members List */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Anggota Tagihan:</Text>
            <View style={styles.membersList}>
              {billData.memberNames.map((name, index) => {
                const isYou = name === 'You';
                return (
                  <View key={index} style={[styles.memberItem, index === billData.memberNames.length - 1 && styles.memberItemLast]}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.memberName}>{name}</Text>
                    {isYou ? (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>Pembuat</Text>
                      </View>
                    ) : (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    )}
                  </View>
                );
              })}
            </View>
            
            {billData.memberNames.filter(name => name !== 'You').length > 0 && (
              <Text style={styles.sentInfo}>
                Tagihan telah dikirim ke {billData.memberNames.filter(name => name !== 'You').length} anggota
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable onPress={handleViewBills} style={styles.primaryButton}>
              <Ionicons name="list-outline" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Lihat Tagihan</Text>
            </Pressable>
            
            <Pressable onPress={handleGoHome} style={styles.secondaryButton}>
              <Ionicons name="home-outline" size={20} color={COLORS.teal} />
              <Text style={styles.secondaryButtonText}>Kembali ke Beranda</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  successCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  billName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  billCode: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
    marginBottom: SPACING.xs,
  },
  notificationInfo: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
    marginBottom: SPACING.xs,
  },
  memberCount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  membersSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  membersList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberItemLast: {
    borderBottomWidth: 0,
  },
  youBadge: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  youBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  sentInfo: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  memberName: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.teal,
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
});