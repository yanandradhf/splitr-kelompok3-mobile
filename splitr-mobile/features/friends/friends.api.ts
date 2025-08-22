import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';

export const friendsAPI = {
  getFriends: () => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.FRIENDS);
    return api.get(API_CONFIG.ENDPOINTS.FRIENDS);
  },
  
  addFriend: (data: { email: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.ADD_FRIEND);
    return api.post(API_CONFIG.ENDPOINTS.ADD_FRIEND, data);
  },
  
  removeFriend: (friendId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.FRIENDS}/${friendId}`);
    return api.delete(`${API_CONFIG.ENDPOINTS.FRIENDS}/${friendId}`);
  },
};