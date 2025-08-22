import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../../../../constants/theme';


const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

interface TransferScreenProps {}

const TransferScreen: React.FC<TransferScreenProps> = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [amount, setAmount] = useState<string>(params.amount as string || '0');
  const [note, setNote] = useState<string>('');
  const [showBalance, setShowBalance] = useState<boolean>(false);
  
  // Dynamic recipient data
  const recipientName = params.from as string || 'MUHAMMAD IQBAL MASYKURI';
  const recipientBank = 'BNI • 1916299898';
  const recipientInitials = recipientName.split(' ').map(n => n[0]).join('').substring(0, 2);
  
  // Dynamic source account data
  const sourceAccountName = 'TAPLUS PEGAWAI BNI';
  const sourceAccountNumber = '1920199807';
  const sourceBalance = '1,234,567';
  
  // Check payment method
  const paymentMethod = params.paymentMethod as string;
  const isBayarNanti = paymentMethod !== 'sekarang';
  
  const handleCalendarPress = () => {
    if (isBayarNanti) {
      router.push({
        pathname: '/monitoring/transaction/bayarNanti/pilih-tanggal',
        params: {
          transactionId: params.transactionId,
          title: params.title,
          from: params.from,
          amount: params.amount
        }
      });
    }
  };
  
  const handleContinuePress = () => {
    router.push({
      pathname: '/monitoring/transaction/pembayaran/pin',
      params: {
        transactionId: params.transactionId,
        title: params.title,
        from: params.from,
        amount: params.amount,
        note: note,
        paymentMethod: paymentMethod
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail transfer</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Recipient Info */}
        <View style={styles.recipientContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{recipientInitials}</Text>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.bankInfo}>{recipientBank}</Text>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Nominal</Text>
          <Text style={styles.amount}>{amount}</Text>
          <View style={styles.divider} />
        </View>

        {/* Source Account */}
        <View style={styles.sourceSection}>
          <View style={styles.sourceLabelContainer}>
            <Text style={styles.sourceLabel}>Sumber dana</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons 
                name={showBalance ? "eye" : "eye-off"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sourceAccountContainer}>
            <View style={styles.sourceAccount}>
              <Text style={styles.accountName}>{sourceAccountName}</Text>
              <Text style={styles.accountNumber}>{sourceAccountNumber}</Text>
              <Text style={styles.balance}>
                Rp{showBalance ? sourceBalance : "********"}
              </Text>
            </View>
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Catatan (opsional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder=""
            maxLength={50}
            multiline
          />
          <Text style={styles.characterCount}>0/50</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.calendarButton, !isBayarNanti && styles.disabledCalendarButton]} 
            onPress={handleCalendarPress}
            disabled={!isBayarNanti}
          >
            <Ionicons name="calendar-outline" size={20} color={isBayarNanti ? "#666" : "#ccc"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
            <Text style={styles.continueButtonText}>Lanjut</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  avatarContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bankInfo: {
    fontSize: width * 0.035,
    color: '#666',
  },
  amountSection: {
    marginBottom: height * 0.04,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: width * 0.08,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  sourceSection: {
    marginBottom: height * 0.04,
  },
  sourceLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceLabel: {
    fontSize: 14,
    color: '#666',
  },
  sourceAccountContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: width * 0.04,
    backgroundColor: '#fafafa',
  },
  sourceAccount: {},
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balance: {
    fontSize: 14,
    color: '#000',
  },
  noteSection: {
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    fontSize: width * 0.04,
    color: '#000',
    textAlignVertical: 'top',
    minHeight: height * 0.08,
    padding: width * 0.04,
    ...Platform.select({
      ios: {
        paddingTop: width * 0.04,
      },
      android: {
        textAlignVertical: 'top',
      },
    }),
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  bottomContainer: {
    padding: width * 0.04,
    paddingBottom: isIOS ? 20 : 8,
    paddingTop: 8,
    marginTop: 30,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 170,
  },
  calendarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: height * 0.02,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 48,
  },
  disabledCalendarButton: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  continueButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.teal,
    paddingVertical: height * 0.02,
    borderRadius: 20,
    minHeight: 48,
  },
  continueButtonText: {
    fontSize: width * 0.04,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default TransferScreen;