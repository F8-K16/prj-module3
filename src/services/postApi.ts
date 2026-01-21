import type { Post, UpdatePostCaptionResponse } from "@/types/post";
import instance from "@/utils/axios";

export const getNewsfeed = async (): Promise<Post[]> => {
  const res = await instance.get("/api/posts/feed");
  return res.data.data.posts;
};

export const getPostsTrending = async (): Promise<Post[]> => {
  const res = await instance.get(`/api/posts/explore`);
  return res.data.data.posts;
};

export const getUserPosts = async (
  userId: string,
  filter: "all" | "video" | "saved" = "all",
): Promise<Post[]> => {
  const res = await instance.get(`/api/posts/user/${userId}`, {
    params: { filter },
  });
  return res.data.data.posts;
};

export const getPostDetail = async (postId: string): Promise<Post> => {
  const res = await instance.get(`/api/posts/${postId}`);
  return res.data.data;
};

export const createPostApi = async (file: File, caption?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) {
    formData.append("caption", caption);
  }

  const res = await instance.post(`/api/posts`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};

export const updatePostCaptionApi = async (
  postId: string,
  caption: string,
): Promise<UpdatePostCaptionResponse> => {
  const res = await instance.patch(`/api/posts/${postId}`, {
    caption,
  });

  return res.data.data;
};

export const deletePostApi = async (postId: string) => {
  const res = await instance.delete(`/api/posts/${postId}`);
  return res.data;
};

export const toggleLikePostApi = async (postId: string) => {
  const res = await instance.post(`/api/posts/${postId}/like`);
  return res.data.data;
};

export const savePostApi = async (postId: string) => {
  const res = await instance.post(`/api/posts/${postId}/save`);
  return res.data.data;
};

export const unsavePostApi = async (postId: string) => {
  const res = await instance.delete(`/api/posts/${postId}/save`);
  return res.data.data;
};
