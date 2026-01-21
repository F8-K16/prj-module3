import type { Conversation } from "@/types/message";
import type { User } from "@/types/user";

export const markAsFollowing = (users: User[], userId: string) => {
  const user = users.find((u) => u._id === userId);
  if (user) {
    user.isFollowing = true;
    return true;
  }
  return false;
};
export const markAsUnfollowing = (users: User[], userId: string) => {
  const user = users.find((u) => u._id === userId);
  if (user) {
    user.isFollowing = false;
    return true;
  }
  return false;
};

export const getMediaUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_BASE_URL}${path}`;
};

export function formatTimeAgo(dateInput: string | Date): string {
  const now = new Date();
  const date = new Date(dateInput);

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Vừa xong";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} phút`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} ngày`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} tuần`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} tháng`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} năm`;
}

export const getOtherUser = (
  conversation: Conversation,
  authUserId: string,
): User | undefined =>
  conversation.participants.find((u) => u._id !== authUserId);
