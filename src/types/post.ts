export interface PostUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface Post {
  _id: string;
  caption: string;
  image?: string;
  video?: string | null;
  mediaType: "image" | "video";
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  likedBy: string[];
  savedBy: string[];
  comments: number;
  createdAt: string;
  updatedAt: string;
  userId: PostUser;
}

export type PostState = {
  posts: Post[];
  postLoading: boolean;
  createLoading: boolean;
  deleteLoading: boolean;
  updateLoading: boolean;
  deletedPostId: string | null;
};

export type PostDetailState = {
  post: Post | null;
  postDetailLoading: boolean;
  error?: string;
};

export interface UpdatePostCaptionResponse {
  _id: string;
  caption: string;
  image?: string;
  updatedAt: string;
}
