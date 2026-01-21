import type { CommentRepliesResponse, PostComment } from "@/types/comment";
import instance from "@/utils/axios";

export const getPostComments = async (
  postId: string,
  limit: number,
): Promise<PostComment[]> => {
  const res = await instance.get(
    `/api/posts/${postId}/comments?limit=${limit}`,
  );
  return res.data.data.comments;
};

export const createPostCommentApi = async (
  postId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<PostComment> => {
  const res = await instance.post(`/api/posts/${postId}/comments`, {
    content,
    parentCommentId,
  });
  return res.data.data;
};

export const getCommentRepliesApi = async (
  postId: string,
  commentId: string,
  limit = 5,
  offset = 0,
): Promise<CommentRepliesResponse> => {
  const res = await instance.get(
    `/api/posts/${postId}/comments/${commentId}/replies`,
    {
      params: { limit, offset },
    },
  );

  return res.data.data;
};

export const createReplyApi = async (
  postId: string,
  commentId: string,
  content: string,
): Promise<PostComment> => {
  const res = await instance.post(
    `/api/posts/${postId}/comments/${commentId}/replies`,
    { content },
  );
  return res.data.data;
};

export const deleteCommentApi = async (postId: string, commentId: string) => {
  const res = await instance.delete(
    `/api/posts/${postId}/comments/${commentId}`,
  );
  return res.data;
};

export const toggleLikeCommentApi = async (
  postId: string,
  commentId: string,
) => {
  const res = await instance.post(
    `/api/posts/${postId}/comments/${commentId}/like`,
  );
  return res.data.data;
};

export const updateCommentApi = async (
  postId: string,
  commentId: string,
  content: string,
) => {
  const res = await instance.patch(
    `/api/posts/${postId}/comments/${commentId}`,
    { content },
  );
  return res.data.data;
};
