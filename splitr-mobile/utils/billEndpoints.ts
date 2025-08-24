import { API_CONFIG } from '../constants/config';

export const getBillEndpoint = (billId: string, isHost: boolean) => {
  if (isHost) {
    return `${API_CONFIG.ENDPOINTS.MASTER}/${billId}`;
  } else {
    return `${API_CONFIG.ENDPOINTS.PERSONAL}/${billId}`;
  }
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