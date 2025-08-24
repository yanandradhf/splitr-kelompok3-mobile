import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../constants/theme';

console.log('HistoryCard component loaded');

interface HistoryCardProps {
  title: string;
  subtitle: string;
  amount: string;
  date: string;
  icon: string;
  gradientColors: string[];
  iconBgColor: string;
}

export default function HistoryCard({ 
  title, 
  subtitle, 
  amount, 
  date, 
  icon,
  gradientColors,
  iconBgColor
}: HistoryCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.leftBorder}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.amount}>{amount}</Text>
        </View>
        
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>SELESAI</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  content: {
    padding: 20,
    paddingLeft: 26,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 72,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});