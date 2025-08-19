import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNotifications } from '../../hooks/useApi';
import { COLORS, FONTS } from '../../constants/theme';

const LOCAL_COLORS = {
  background: COLORS.purple,
  cardWhite: COLORS.white,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  card: COLORS.card,
};

export default function NotificationsScreen() {
  const { notifications, loading } = useNotifications();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 3) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return 'card-outline';
      case 'payment_received':
        return 'checkmark-circle-outline';
      case 'group_invite':
        return 'people-outline';
      default:
        return 'notifications-outline';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifikasi</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.orange} />
                <Text style={styles.loadingText}>Memuat notifikasi...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
                <Text style={styles.emptySubtitle}>Notifikasi akan muncul di sini</Text>
              </View>
            ) : (
              notifications.map((notification, index) => (
                <View key={notification.notificationId || index} style={styles.notificationCard}>
                  <View style={styles.cardContent}>
                    <View style={styles.notificationIcon}>
                      <Ionicons 
                        name={getNotificationIcon(notification.type)} 
                        size={24} 
                        color={COLORS.card} 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <View style={styles.dateContainer}>
                        <Text style={styles.notificationDate}>{formatDate(notification.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  purpleSection: {
    backgroundColor: LOCAL_COLORS.background,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  dateContainer: {
    backgroundColor: LOCAL_COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  notificationDate: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: LOCAL_COLORS.textPrimary,
    textAlign: 'center',
  },
});