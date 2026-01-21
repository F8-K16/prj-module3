export interface PostComment {
  _id: string;
  postId: string;
  content: string;
  parentCommentId: string | null;
  likes: number;
  repliesCount: number;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  isLiked: boolean;
  likedBy: string[];
  replies: PostComment[];
  likeLoading: boolean;
  updateLoading: boolean;
  repliesLoading: boolean;
  replyCreating: boolean;
  repliesVisible: boolean;
  repliesHasMore: boolean;
  repliesOffset: number;
  repliesLimit: number;
}

export interface CommentRepliesResponse {
  replies: PostComment[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CommentState {
  comments: PostComment[];
  listLoading: boolean;
  hasMore: boolean;
  limit: number;
  createLoading: boolean;
  deleteLoading: boolean;
}
