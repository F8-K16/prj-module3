export type PostModalState = {
  isOpen: boolean;
  post: Post | null;
};

export interface Comment {
  id: number;
  createdAt?: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
}

export interface Post {
  id: number;
  image: string | string[];
  caption: string;
  likes: number;
  isLiked?: boolean;
  comments: Comment[];
  createdAt: string;
  user: {
    name: string;
    avatar: string;
  };
}
