import { create } from 'zustand';
import { groupsAPI } from '../../services';

interface GroupMember {
  userId: string;
  name: string;
  email: string;
  isCreator: boolean;
  isCurrentUser: boolean;
  isFriend: boolean;
  canAddFriend: boolean;
  joinedAt: string;
}

interface Group {
  groupId: string;
  groupName: string;
  description?: string;
  isCreator: boolean;
  creatorName: string;
  memberCount: number;
  billCount?: number;
  members: GroupMember[];
  createdAt: string;
}

interface GroupDetail extends Group {
  recentBills?: any[];
}

interface GroupsState {
  groups: Group[];
  currentGroup: GroupDetail | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Actions
  fetchGroups: () => Promise<void>;
  createGroup: (data: { groupName: string; description?: string; memberIds: string[] }) => Promise<Group>;
  fetchGroupDetail: (groupId: string) => Promise<void>;
  editGroup: (groupId: string, data: { groupName: string; description?: string }) => Promise<void>;
  addMember: (groupId: string, userId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addFriendFromGroup: (groupId: string, memberId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentGroup: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsAPI.getGroups();
      set({ groups: response.data.groups || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch groups',
        isLoading: false 
      });
    }
  },

  createGroup: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const response = await groupsAPI.createGroup(data);
      const newGroup = response.data;
      
      // Add new group to the list
      set(state => ({ 
        groups: [newGroup, ...state.groups],
        isCreating: false 
      }));
      
      return newGroup;
    } catch (error: any) {
      console.error('Error creating group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create group',
        isCreating: false 
      });
      throw error;
    }
  },

  fetchGroupDetail: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsAPI.getGroupDetail(groupId);
      set({ currentGroup: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching group detail:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch group details',
        isLoading: false 
      });
      // Re-throw error so it can be caught in the component
      throw error;
    }
  },

  editGroup: async (groupId, data) => {
    set({ isUpdating: true, error: null });
    try {
      await groupsAPI.editGroup(groupId, data);
      
      // Update group in the list
      set(state => ({
        groups: state.groups.map(group => 
          group.groupId === groupId 
            ? { ...group, ...data }
            : group
        ),
        currentGroup: state.currentGroup?.groupId === groupId 
          ? { ...state.currentGroup, ...data }
          : state.currentGroup,
        isUpdating: false
      }));
    } catch (error: any) {
      console.error('Error editing group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update group',
        isUpdating: false 
      });
      throw error;
    }
  },

  addMember: async (groupId, userId) => {
    set({ isUpdating: true, error: null });
    try {
      await groupsAPI.addMember(groupId, userId);
      
      // Refresh group detail to get updated member list
      await get().fetchGroupDetail(groupId);
      
      // Update member count in groups list
      set(state => ({
        groups: state.groups.map(group => 
          group.groupId === groupId 
            ? { ...group, memberCount: group.memberCount + 1 }
            : group
        ),
        isUpdating: false
      }));
    } catch (error: any) {
      console.error('Error adding member:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to add member',
        isUpdating: false 
      });
      throw error;
    }
  },

  removeMember: async (groupId, userId) => {
    set({ isUpdating: true, error: null });
    try {
      await groupsAPI.removeMember(groupId, userId);
      
      // Refresh group detail to get updated member list
      await get().fetchGroupDetail(groupId);
      
      // Update member count in groups list
      set(state => ({
        groups: state.groups.map(group => 
          group.groupId === groupId 
            ? { ...group, memberCount: group.memberCount - 1 }
            : group
        ),
        isUpdating: false
      }));
    } catch (error: any) {
      console.error('Error removing member:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to remove member',
        isUpdating: false 
      });
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    set({ isUpdating: true, error: null });
    try {
      await groupsAPI.leaveGroup(groupId);
      
      // Remove group from list
      set(state => ({
        groups: state.groups.filter(group => group.groupId !== groupId),
        currentGroup: state.currentGroup?.groupId === groupId ? null : state.currentGroup,
        isUpdating: false
      }));
    } catch (error: any) {
      console.error('Error leaving group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to leave group',
        isUpdating: false 
      });
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    set({ isDeleting: true, error: null });
    try {
      await groupsAPI.deleteGroup(groupId);
      
      // Remove group from list
      set(state => ({
        groups: state.groups.filter(group => group.groupId !== groupId),
        currentGroup: state.currentGroup?.groupId === groupId ? null : state.currentGroup,
        isDeleting: false
      }));
    } catch (error: any) {
      console.error('Error deleting group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to delete group',
        isDeleting: false 
      });
      throw error;
    }
  },

  addFriendFromGroup: async (groupId, memberId) => {
    set({ error: null });
    try {
      await groupsAPI.addFriendFromGroup(groupId, memberId);
      
      // Refresh group detail to update friend status
      await get().fetchGroupDetail(groupId);
    } catch (error: any) {
      console.error('Error adding friend from group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to add friend'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentGroup: () => set({ currentGroup: null }),
}));