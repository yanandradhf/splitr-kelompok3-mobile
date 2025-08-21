import { create } from 'zustand';
import { friendsAPI } from '../../services';

interface Friend {
  userId: string;
  name: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt: string;
}

interface FriendsState {
  friends: Friend[];
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  error: string | null;
  
  // Actions
  fetchFriends: () => Promise<void>;
  addFriend: (email: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  isLoading: false,
  isAdding: false,
  isRemoving: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await friendsAPI.getFriends();
      set({ friends: response.data.friends || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch friends',
        isLoading: false 
      });
    }
  },

  addFriend: async (email) => {
    set({ isAdding: true, error: null });
    try {
      const response = await friendsAPI.addFriend({ email });
      const newFriend = response.data.friend;
      
      // Add new friend to the list
      set(state => ({ 
        friends: [newFriend, ...state.friends],
        isAdding: false 
      }));
    } catch (error: any) {
      console.error('Error adding friend:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to add friend',
        isAdding: false 
      });
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    set({ isRemoving: true, error: null });
    try {
      await friendsAPI.removeFriend(friendId);
      
      // Remove friend from list
      set(state => ({
        friends: state.friends.filter(friend => friend.userId !== friendId),
        isRemoving: false
      }));
    } catch (error: any) {
      console.error('Error removing friend:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to remove friend',
        isRemoving: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));