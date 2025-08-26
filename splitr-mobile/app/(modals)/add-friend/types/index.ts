export interface Friend {
  id: string;
  profilePhoto?: string;
  name: string;
  username: string;
}

export interface SearchResult {
  found: boolean;
  user: {
    userId: string;
    username: string;
    name: string;
    email: string;
    accountNumber: string;
  };
  isAlreadyFriend: boolean;
  canAddFriend: boolean;
}