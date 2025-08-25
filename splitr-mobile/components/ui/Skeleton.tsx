import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E1E5E9', '#F2F4F7'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={80} height={16} />
        <Skeleton width={100} height={16} />
      </View>
      <View style={styles.content}>
        <View style={styles.avatars}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={32} height={32} borderRadius={16} style={i > 1 && { marginLeft: -8 }} />
          ))}
        </View>
        <View style={styles.info}>
          <Skeleton width={120} height={18} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={14} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={32} height={32} borderRadius={16} style={{ marginBottom: 6 }} />
            <Skeleton width={24} height={16} style={{ marginBottom: 2 }} />
            <Skeleton width={40} height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonNotification() {
  return (
    <View style={styles.notifCard}>
      <View style={styles.notifRow}>
        <Skeleton width={50} height={50} borderRadius={25} style={{ marginRight: 12 }} />
        <View style={styles.notifContent}>
          <Skeleton width={120} height={16} style={{ marginBottom: 4 }} />
          <Skeleton width={180} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width={80} height={12} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonProfile() {
  return (
    <View style={styles.profileCard}>
      <Skeleton width={100} height={100} borderRadius={50} style={{ marginBottom: 16 }} />
      <Skeleton width={120} height={24} style={{ marginBottom: 4 }} />
      <Skeleton width={80} height={16} />
    </View>
  );
}

export function SkeletonList() {
  return (
    <View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width='70%' height={16} style={{ marginBottom: 4 }} />
            <Skeleton width='50%' height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonForm() {
  return (
    <View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.formGroup}>
          <Skeleton width={80} height={16} style={{ marginBottom: 8 }} />
          <Skeleton width='100%' height={50} borderRadius={15} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonBillCard() {
  return (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <View style={styles.billLeft}>
          <Skeleton width={150} height={18} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={14} style={{ marginBottom: 4 }} />
          <Skeleton width={100} height={14} />
        </View>
        <View style={styles.billRight}>
          <Skeleton width={80} height={18} style={{ marginBottom: 8 }} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonHistoryCard() {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyLeft}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
          <View>
            <Skeleton width={140} height={16} style={{ marginBottom: 4 }} />
            <Skeleton width={120} height={14} />
          </View>
        </View>
        <Skeleton width={80} height={18} />
      </View>
      <View style={styles.historyDetails}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.historyDetailRow}>
            <Skeleton width={80} height={12} />
            <Skeleton width={100} height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonMonitoringList() {
  return (
    <View>
      {[1, 2, 3].map((i) => (
        <SkeletonBillCard key={i} />
      ))}
    </View>
  );
}

export function SkeletonHistoryList() {
  return (
    <View>
      {[1, 2, 3].map((i) => (
        <SkeletonHistoryCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 16,
    width: 300,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  header: {
    backgroundColor: '#00897B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    height: 120,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '33.33%',
    height: '100%',
  },
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    height: 120,
    justifyContent: 'center',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billLeft: {
    flex: 1,
    marginRight: 16,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  historyDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});