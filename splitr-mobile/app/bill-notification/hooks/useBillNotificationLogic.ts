import { useState, useEffect } from "react";
import { router } from "expo-router";
import api from "../../../services/api";
import { getBillEndpoint } from "../../../utils/billEndpoints";
import { COLORS } from "../../../constants/theme";
import { BillData } from "../types";

export const useBillNotificationLogic = (
  identifier: string,
  isHost?: string,
  passedBillData?: string
) => {
  const [billData, setBillData] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (identifier) {
      fetchBillData();
    }
  }, [identifier]);

  const fetchBillData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting fetchBillData with params:', { identifier, isHost, hasPassedData: !!passedBillData });
      
      const isHostUser = isHost === 'true';
      const endpoint = getBillEndpoint(identifier, isHostUser);
      
      console.log(`🔍 [${isHostUser ? 'HOST' : 'PARTICIPANT'}] Fetching bill data:`, endpoint);
      
      const response = await api.get(endpoint);
      console.log('📥 API Response status:', response.status);
      
      if (response.data.success) {
        console.log('✅ Bill data received successfully');
        const rawBillData = response.data.data || response.data.bill;
        
        // Redirect to master bill page if this is a host view
        if (isHostUser && rawBillData.viewType === 'master') {
          router.replace({
            pathname: '/master-bill/[identifier]',
            params: { identifier, billData: JSON.stringify(rawBillData) }
          });
          return;
        }
        
        setBillData(rawBillData);
      } else {
        console.log('❌ API returned success: false');
        setError('Tagihan tidak ditemukan');
      }
    } catch (error) {
      console.error('💥 Error fetching bill data:', error);
      setError('Gagal memuat data tagihan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.success;
      case 'paid': return COLORS.success;
      case 'expired': return COLORS.red;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string, isOverdue?: boolean) => {
    if (status === 'completed_late') return 'Terlambat';
    if (isOverdue && status === 'pending') return 'Kadaluarsa';
    
    switch (status) {
      case 'pending': return 'Belum Bayar';
      case 'overdue': return 'Terlambat';
      case 'completed': return 'Selesai';
      case 'completed_scheduled': return 'Terjadwal Selesai';
      case 'completed_late': return 'Terlambat';
      case 'paid': return 'Selesai';
      case 'scheduled': return 'Belum Bayar';
      case 'expired': return 'Kadaluarsa';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = () => {
    router.push({
      pathname: '/payment-new',
      params: {
        billId: billData?.billId,
        billName: billData?.billName,
        amount: billData?.yourShare.toString(),
        hostName: billData?.hostName,
        hostAccount: billData?.hostAccount,
        paymentDeadline: billData?.paymentDeadline,
        canSchedule: (billData?.allowScheduledPayment || billData?.canSchedule) ? 'true' : 'false',
        isOverdue: billData?.actions?.isOverdue?.toString()
      }
    });
  };

  return {
    billData,
    loading,
    error,
    getStatusColor,
    getStatusText,
    formatDate,
    handlePayment,
  };
};