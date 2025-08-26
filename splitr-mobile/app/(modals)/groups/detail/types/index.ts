export interface GroupMember {
  id: string;
  name: string;
  status: string;
  avatar?: string | any;
  isCreator: boolean;
  isFriend: boolean;
  canAddFriend: boolean;
  isCurrentUser: boolean;
}

export interface GroupData {
  groupId: string;
  groupName: string;
  description?: string;
  groupDescription?: string;
  creatorName: string;
  isCreator: boolean;
  members?: Array<{
    userId?: string;
    id?: string;
    name?: string;
    username?: string;
    status?: string;
    profilePhotoUrl?: string;
    avatar?: string;
    isCreator?: boolean;
    isFriend?: boolean;
    canAddFriend?: boolean;
    isCurrentUser?: boolean;
  }>;
}

export interface FriendData {
  friend: {
    userId: string;
    name: string;
    profilePhotoUrl?: string;
    avatar?: string;
  };
}