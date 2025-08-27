export interface Friend {
  friend: {
    userId: string;
    name: string;
    profilePhotoUrl?: string;
    profilePhoto?: string;
    avatar?: string;
  };
}

export interface Group {
  groupId: string;
  groupName: string;
  isCreator: boolean;
  creatorName: string;
  memberCount: number;
  members?: Array<{
    userId: string;
    name: string;
    profilePhotoUrl?: string;
    profilePhoto?: string;
    avatar?: string;
  }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface UserStats {
  totalBills: number;
  completedBills: number;
  pendingPayments: number;
}