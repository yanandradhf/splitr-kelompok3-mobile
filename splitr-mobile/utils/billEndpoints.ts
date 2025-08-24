import { API_CONFIG } from '../constants/config';

export const getBillEndpoint = (billId: string, isHost: boolean) => {
  if (isHost) {
    return `${API_CONFIG.ENDPOINTS.MASTER}/${billId}`;
  } else {
    return `${API_CONFIG.ENDPOINTS.PERSONAL}/${billId}`;
  }
};

export const getBillEndpointFromNotification = (billId: string, notificationType: string) => {
  const hostNotificationTypes = ['bill_created', 'payment_received', 'participant_joined'];
  const participantNotificationTypes = ['bill_assignment', 'bill_invitation', 'payment_reminder'];
  
  if (hostNotificationTypes.includes(notificationType)) {
    return `${API_CONFIG.ENDPOINTS.MASTER}/${billId}`;
  } else if (participantNotificationTypes.includes(notificationType)) {
    return `${API_CONFIG.ENDPOINTS.PERSONAL}/${billId}`;
  } else {
    return `${API_CONFIG.ENDPOINTS.BILL_DETAIL}/${billId}`;
  }
};

export const getIsHostFromNotification = (notificationType: string): boolean => {
  const hostNotificationTypes = ['bill_created', 'payment_received', 'participant_joined'];
  return hostNotificationTypes.includes(notificationType);
};

export const getBillNavigationPath = (billId: string, isHost: boolean) => {
  if (isHost) {
    return {
      pathname: '/master-bill/[identifier]' as const,
      params: { identifier: billId }
    };
  } else {
    return {
      pathname: '/bill-notification/[identifier]' as const,
      params: { identifier: billId, isHost: 'false' }
    };
  }
};

export const getBillNavigationFromNotification = (billId: string, notificationType: string) => {
  const isHost = getIsHostFromNotification(notificationType);
  return getBillNavigationPath(billId, isHost);
};