import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import {
  fetchFollowers,
  fetchFollowing,
  followUser,
  unfollowUser,
} from "@/features/userSlice";
import Avatar from "../Avatar";

import { Link } from "react-router-dom";
import SkeletonLoading from "@/utils/loading/SkeletonLoading";
import { Spinner } from "../ui/spinner";

type UserListType = "followers" | "following";

export default function FollowerListModal({
  open,
  userId,
  type,
  onClose,
}: {
  open: boolean;
  userId: string | null;
  type: UserListType;
  onClose: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const { followers, following, userLoading, followLoadingIds } = useSelector(
    (state: RootState) => state.users,
  );
  const authUserId = useSelector((state: RootState) => state.auth.user?._id);

  const users = type === "followers" ? followers : following;
  const title = type === "followers" ? "Người theo dõi" : "Đang theo dõi";

  useEffect(() => {
    if (!open || !userId) return;
    if (type === "followers") {
      dispatch(fetchFollowers(userId));

      if (authUserId) {
        dispatch(fetchFollowing(authUserId));
      }
    } else {
      dispatch(fetchFollowing(userId));
    }
  }, [open, userId, type, authUserId, dispatch]);
  const followingIds = new Set(following.map((u) => u._id));

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#262626] w-140 rounded-xl overflow-hidden"
      >
        <div className="text-center py-3 border-b font-semibold">{title}</div>

        <div className="max-h-100 overflow-y-auto p-4">
          {userLoading ? (
            <SkeletonLoading count={5} />
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Danh sách trống
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const isMe = user._id === authUserId;
                const isLoading = followLoadingIds.includes(user._id);
                const isFollowing =
                  type === "following" ? true : followingIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Link to={`/user/${user._id}`} onClick={onClose}>
                        <Avatar
                          src={user.profilePicture}
                          name={user.username}
                          size={36}
                        />
                      </Link>
                      <div>
                        <Link to={`/user/${user._id}`} onClick={onClose}>
                          <p className="text-sm font-medium">{user.username}</p>
                        </Link>
                        <p className="text-xs text-gray-400">{user.fullName}</p>
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        disabled={isLoading}
                        onClick={() =>
                          isFollowing
                            ? dispatch(
                                unfollowUser({
                                  targetUserId: user._id,
                                  authUserId: authUserId!,
                                }),
                              )
                            : dispatch(
                                followUser({
                                  targetUserId: user._id,
                                  authUserId: authUserId!,
                                }),
                              )
                        }
                        className={`py-1.5 px-5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                          isFollowing
                            ? "bg-[#25292e] hover:bg-[#333]/80"
                            : "bg-[#4a5df9] hover:bg-[#4a5df9]/80"
                        }`}
                      >
                        {isLoading ? (
                          <Spinner />
                        ) : isFollowing ? (
                          "Đang theo dõi"
                        ) : (
                          "Theo dõi"
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
