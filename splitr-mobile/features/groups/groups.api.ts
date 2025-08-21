import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';

export const groupsAPI = {
  // Get all groups
  getGroups: () => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.GROUPS);
    return api.get(API_CONFIG.ENDPOINTS.GROUPS);
  },

  // Create new group
  createGroup: (data: { groupName: string; description?: string; memberIds: string[] }) => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.CREATE_GROUP);
    return api.post(API_CONFIG.ENDPOINTS.CREATE_GROUP, data);
  },

  // Get group detail
  getGroupDetail: (groupId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}`);
    return api.get(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}`);
  },

  // Edit group (creator only)
  editGroup: (groupId: string, data: { groupName: string; description?: string }) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/edit/${groupId}`);
    return api.patch(`${API_CONFIG.ENDPOINTS.GROUPS}/edit/${groupId}`, data);
  },

  // Add member to group (creator only)
  addMember: (groupId: string, userId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/members`);
    return api.post(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/members`, { userId });
  },

  // Remove member from group (creator only)
  removeMember: (groupId: string, userId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/members/${userId}`);
    return api.delete(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/members/${userId}`);
  },

  // Leave group (member only)
  leaveGroup: (groupId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/leave`);
    return api.post(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/leave`);
  },

  // Delete group (creator only)
  deleteGroup: (groupId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/delete/${groupId}`);
    return api.delete(`${API_CONFIG.ENDPOINTS.GROUPS}/delete/${groupId}`);
  },

  // Add friend from group member
  addFriendFromGroup: (groupId: string, memberId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/add-friend/${memberId}`);
    return api.post(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/add-friend/${memberId}`);
  },
};