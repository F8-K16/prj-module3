export interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
  gender: "male" | "female" | "other";
  bio?: string;
  website?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface SearchHistory {
  _id: string;
  searchQuery: string;
  searchedUserId: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture?: string;
  };
}

export interface UsersState {
  suggestedUsers: User[];
  profileUser: User | null;
  followers: User[];
  following: User[];
  followLoadingIds: string[];
  searchResult: User[];
  searchLoading: boolean;
  searchHistory: SearchHistory[];
  userLoading: boolean;
  profileLoading: boolean;
}
