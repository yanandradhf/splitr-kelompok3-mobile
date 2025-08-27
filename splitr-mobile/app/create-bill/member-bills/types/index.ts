export interface Friend {
  friend: {
    userId: string;
    name: string;
  };
}

export interface Group {
  groupId: string;
  groupName: string;
  members?: Array<{
    userId?: string;
    id?: string;
    name?: string;
  }>;
}

export interface SearchUser {
  id: string;
  name: string;
  username: string;
}