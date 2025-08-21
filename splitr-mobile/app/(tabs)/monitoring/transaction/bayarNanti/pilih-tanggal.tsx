import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../../../../constants/theme';
import { useTransactionStore } from '../../../../../store/transaction.store';

export default function PilihTanggalScreen() {
  const params = useLocalSearchParams();
  const { transactionId, title, from, amount } = params;
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { runningTransactions } = useTransactionStore();

  // Get due date from transaction
  const transaction = runningTransactions.find(t => t.id === transactionId);
  const dueDate = transaction ? new Date(transaction.dueDate) : new Date();
  
  // Generate calendar dates
  const generateCalendarDates = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Start from first day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get first day of week for the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = current.getMonth() === currentMonth;
      const isToday = current.toDateString() === today.toDateString();
      const isPast = current < today;
      const isAfterDue = current > dueDate;
      const isSelectable = !isPast && !isAfterDue && isCurrentMonth;
      
      dates.push({
        id: current.toISOString().split('T')[0],
        date: current.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isAfterDue,
        isSelectable,
        fullDate: new Date(current)
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const handleContinue = () => {
    if (selectedDate) {
      router.push({
        pathname: '/monitoring/transaction/pembayaran/pin',
        params: {
          transactionId,
          title,
          from,
          amount,
          paymentMethod: 'nanti',
          scheduledDate: selectedDate
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilih Tanggal Pembayaran</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Text style={styles.sectionTitle}>Anda hanya dapat memilih tanggal maksimal hingga yang telah ditentukan host</Text>
            <Text style={styles.dueDateWarning}>Maksimal pembayaran: {dueDate.toLocaleDateString('id-ID')}</Text>
            
            {/* Month Header */}
            <Text style={styles.monthHeader}>{currentMonth} {currentYear}</Text>
            
            {/* Day Headers */}
            <View style={styles.dayHeaderRow}>
              {dayNames.map((day) => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDates.map((dateItem) => (
                <TouchableOpacity
                  key={dateItem.id}
                  style={[
                    styles.calendarDate,
                    !dateItem.isCurrentMonth && styles.otherMonthDate,
                    dateItem.isToday && styles.todayDate,
                    dateItem.isPast && styles.pastDate,
                    dateItem.isAfterDue && styles.afterDueDate,
                    selectedDate === dateItem.id && styles.selectedDate,
                    !dateItem.isSelectable && styles.disabledDate
                  ]}
                  onPress={() => dateItem.isSelectable && setSelectedDate(dateItem.id)}
                  disabled={!dateItem.isSelectable}
                >
                  <Text style={[
                    styles.calendarDateText,
                    !dateItem.isCurrentMonth && styles.otherMonthText,
                    dateItem.isToday && styles.todayText,
                    dateItem.isPast && styles.pastText,
                    dateItem.isAfterDue && styles.afterDueText,
                    selectedDate === dateItem.id && styles.selectedText,
                    !dateItem.isSelectable && styles.disabledText
                  ]}>
                    {dateItem.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            

          </View>

          {/* Confirmation Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedDate && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!selectedDate}
          >
            <Text style={[
              styles.confirmButtonText,
              !selectedDate && styles.disabledButtonText
            ]}>
              Konfirmasi Pembayaran
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.backgroundMain,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginTop: 10,
  },
  confirmationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  confirmationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  confirmationValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  calendarContainer: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dueDateWarning: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#D32F2F',
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDate: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  calendarDateText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  otherMonthDate: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: COLORS.textSecondary,
  },
  todayDate: {
    backgroundColor: '#E3F2FD',
  },
  todayText: {
    color: '#1976D2',
    fontFamily: FONTS.bold,
  },
  pastDate: {
    backgroundColor: '#F5F5F5',
  },
  pastText: {
    color: '#BDBDBD',
  },
  afterDueDate: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  afterDueText: {
    color: '#BDBDBD',
  },
  selectedDate: {
    backgroundColor: COLORS.teal,
    opacity:0.4,
  },
  disabledDate: {
    opacity:2,
  },
  disabledText: {
    color: '#BDBDBD',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  selectedText: {
    color: COLORS.teal,
  },
  confirmButton: {
    backgroundColor: '#00897B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  disabledButtonText: {
    color: COLORS.white,
  },
});