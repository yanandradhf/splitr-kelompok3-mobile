import api from './api';

export interface Comment {
  id: string;
  billId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  createdAt: string;
}

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
    totalCount: number;
  };
}

export interface PostCommentResponse {
  success: boolean;
  data: {
    comment: Comment;
  };
}

// Comments API endpoints
const COMMENTS_ENDPOINTS = {
  GET_COMMENTS: (billId: string) => `/api/mobile/bills/${billId}/comments`,
  POST_COMMENT: (billId: string) => `/api/mobile/bills/${billId}/comments`,
};

export const commentsAPI = {
  // Get all comments for a bill
  getComments: async (billId: string): Promise<CommentsResponse> => {
    console.log('🌐 Fetching comments for bill:', billId);
    const response = await api.get(COMMENTS_ENDPOINTS.GET_COMMENTS(billId));
    return response.data;
  },

  // Post a new comment
  postComment: async (billId: string, message: string): Promise<PostCommentResponse> => {
    console.log('🌐 Posting comment to bill:', billId);
    const response = await api.post(COMMENTS_ENDPOINTS.POST_COMMENT(billId), {
      message: message.trim()
    });
    return response.data;
  }
};