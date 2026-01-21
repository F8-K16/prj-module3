import type { User } from "@/types/user";
import instance from "@/utils/axios";

export const getProfileById = async (userId: string) => {
  const res = await instance.get(`/api/users/${userId}`);
  return res.data.data;
};

export const updateProfileApi = async (data: FormData) => {
  const res = await instance.patch(`/api/users/profile`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getSuggestedUsersApi = (limit = 5) =>
  instance.get<{
    success: boolean;
    data: User[];
  }>("/api/users/suggested", {
    params: { limit },
  });

export const followUserApi = (userId: string) =>
  instance.post(`/api/follow/${userId}/follow`);

export const unfollowUserApi = (userId: string) =>
  instance.delete(`/api/follow/${userId}/follow`);

export const getFollowersApi = (userId: string) =>
  instance.get(`/api/follow/${userId}/followers`);

export const getFollowingApi = (userId: string) =>
  instance.get(`/api/follow/${userId}/following`);

export const searchUsersApi = async (q: string) => {
  const res = await instance.get(`/api/users/search`, {
    params: { q },
  });
  return res.data;
};

export const saveSearchHistoryApi = (data: { searchedUserId: string }) =>
  instance.post("/api/search-history", data);

export const getSearchHistoryApi = (limit = 20) =>
  instance.get("/api/search-history", {
    params: { limit },
  });

export const deleteSearchHistoryItemApi = async (historyId: string) => {
  const res = await instance.delete(`/api/search-history/${historyId}`);
  return res.data;
};

export const clearAllSearchHistoryApi = async () => {
  const res = await instance.delete(`/api/search-history`);
  return res.data;
};
