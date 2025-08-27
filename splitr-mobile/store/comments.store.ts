import { create } from 'zustand';
import { commentsAPI, Comment } from '../services/commentsApi';

interface CommentsState {
  // State
  comments: Record<string, Comment[]>; // billId -> comments[]
  loading: Record<string, boolean>; // billId -> loading state
  sending: Record<string, boolean>; // billId -> sending state
  error: string | null;

  // Actions
  fetchComments: (billId: string) => Promise<void>;
  postComment: (billId: string, message: string) => Promise<void>;
  clearComments: (billId: string) => void;
  clearError: () => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  // Initial state
  comments: {},
  loading: {},
  sending: {},
  error: null,

  // Fetch comments for a specific bill
  fetchComments: async (billId: string) => {
    set(state => ({
      loading: { ...state.loading, [billId]: true },
      error: null
    }));

    try {
      const response = await commentsAPI.getComments(billId);
      
      if (response.success) {
        set(state => ({
          comments: { ...state.comments, [billId]: response.data.comments },
          loading: { ...state.loading, [billId]: false }
        }));
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      set(state => ({
        loading: { ...state.loading, [billId]: false },
        error: 'Gagal memuat komentar'
      }));
    }
  },

  // Post a new comment
  postComment: async (billId: string, message: string) => {
    if (!message.trim()) return;

    set(state => ({
      sending: { ...state.sending, [billId]: true },
      error: null
    }));

    try {
      const response = await commentsAPI.postComment(billId, message);
      
      if (response.success) {
        set(state => ({
          comments: {
            ...state.comments,
            [billId]: [...(state.comments[billId] || []), response.data.comment]
          },
          sending: { ...state.sending, [billId]: false }
        }));
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      set(state => ({
        sending: { ...state.sending, [billId]: false },
        error: 'Gagal mengirim komentar'
      }));
      throw error; // Re-throw for component handling
    }
  },

  // Clear comments for a specific bill
  clearComments: (billId: string) => {
    set(state => {
      const newComments = { ...state.comments };
      const newLoading = { ...state.loading };
      const newSending = { ...state.sending };
      
      delete newComments[billId];
      delete newLoading[billId];
      delete newSending[billId];
      
      return {
        comments: newComments,
        loading: newLoading,
        sending: newSending
      };
    });
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  }
}));