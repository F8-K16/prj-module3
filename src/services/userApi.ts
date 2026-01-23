import type { SearchHistory, User } from "@/types/user";
import instance from "@/utils/axios";
import { parseApiError } from "@/utils/helper";

/* ================= GET PROFILE BY ID ================= */
export const getProfileById = async (userId: string): Promise<User> => {
  try {
    const res = await instance.get<{
      success: boolean;
      data: User;
    }>(`/api/users/${userId}`);

    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateProfileApi = async (data: FormData): Promise<User> => {
  try {
    const res = await instance.patch<{
      success: boolean;
      data: User;
    }>(`/api/users/profile`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= SUGGESTED USERS ================= */
export const getSuggestedUsersApi = async (limit = 5): Promise<User[]> => {
  try {
    const res = await instance.get<{
      success: boolean;
      data: User[];
    }>("/api/users/suggested", {
      params: { limit },
    });

    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= FOLLOW USER ================= */
export const followUserApi = async (userId: string): Promise<void> => {
  try {
    await instance.post(`/api/follow/${userId}/follow`);
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= UNFOLLOW USER ================= */
export const unfollowUserApi = async (userId: string): Promise<void> => {
  try {
    await instance.delete(`/api/follow/${userId}/follow`);
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= GET FOLLOWERS ================= */
export const getFollowersApi = async (userId: string): Promise<User[]> => {
  try {
    const res = await instance.get<{
      success: boolean;
      data: {
        followers: User[];
      };
    }>(`/api/follow/${userId}/followers`);

    return res.data.data.followers;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= GET FOLLOWING ================= */
export const getFollowingApi = async (userId: string): Promise<User[]> => {
  try {
    const res = await instance.get<{
      success: boolean;
      data: {
        following: User[];
      };
    }>(`/api/follow/${userId}/following`);
    console.log(res);

    return res.data.data.following;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= SEARCH USERS ================= */
export const searchUsersApi = async (q: string): Promise<User[]> => {
  try {
    const res = await instance.get<{
      success: boolean;
      data: User[];
    }>(`/api/users/search`, {
      params: { q },
    });

    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= SAVE SEARCH HISTORY ================= */
export const saveSearchHistoryApi = async (data: {
  searchedUserId: string;
}): Promise<void> => {
  try {
    await instance.post("/api/search-history", data);
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= GET SEARCH HISTORY ================= */
export const getSearchHistoryApi = async (
  limit = 20,
): Promise<SearchHistory[]> => {
  try {
    const res = await instance.get<{
      success: boolean;
      data: SearchHistory[];
    }>("/api/search-history", {
      params: { limit },
    });

    return res.data.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= DELETE SEARCH HISTORY ITEM ================= */
export const deleteSearchHistoryItemApi = async (
  historyId: string,
): Promise<void> => {
  try {
    await instance.delete(`/api/search-history/${historyId}`);
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= CLEAR ALL SEARCH HISTORY ================= */
export const clearAllSearchHistoryApi = async (): Promise<void> => {
  try {
    await instance.delete(`/api/search-history`);
  } catch (err) {
    throw parseApiError(err);
  }
};
