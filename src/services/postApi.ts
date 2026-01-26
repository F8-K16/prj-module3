import type { Post, UpdatePostCaptionResponse } from "@/types/post";
import instance from "@/utils/axios";
import { parseApiError } from "@/utils/helper";

/* ================= FEED ================= */
export const getNewsfeed = async (
  offset = 0,
  limit = 20,
): Promise<{
  posts: Post[];
  hasMore: boolean;
}> => {
  const res = await instance.get("/api/posts/feed", {
    params: { offset, limit },
  });

  return res.data.data;
};

export const getPostsTrending = async (): Promise<Post[]> => {
  try {
    const res = await instance.get(`/api/posts/explore`);
    return res.data.data.posts;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= USER POSTS ================= */
export const getUserPosts = async (
  userId: string,
  filter: "all" | "video" | "saved" = "all",
): Promise<Post[]> => {
  try {
    const res = await instance.get(`/api/posts/user/${userId}`, {
      params: { filter },
    });
    return res.data.data.posts;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= POST DETAIL ================= */
export const getPostDetail = async (postId: string): Promise<Post> => {
  try {
    const res = await instance.get(`/api/posts/${postId}`);
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= CREATE POST ================= */
export const createPostApi = async (
  file: File,
  caption?: string,
): Promise<Post> => {
  try {
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
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= UPDATE CAPTION ================= */
export const updatePostCaptionApi = async (
  postId: string,
  caption: string,
): Promise<UpdatePostCaptionResponse> => {
  try {
    const res = await instance.patch(`/api/posts/${postId}`, {
      caption,
    });

    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= DELETE ================= */
export const deletePostApi = async (postId: string): Promise<void> => {
  try {
    await instance.delete(`/api/posts/${postId}`);
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= LIKE ================= */
export const toggleLikePostApi = async (postId: string): Promise<Post> => {
  try {
    const res = await instance.post(`/api/posts/${postId}/like`);
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= SAVE ================= */
export const savePostApi = async (postId: string): Promise<Post> => {
  try {
    const res = await instance.post(`/api/posts/${postId}/save`);
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const unsavePostApi = async (postId: string): Promise<Post> => {
  try {
    const res = await instance.delete(`/api/posts/${postId}/save`);
    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};
