// components/SuggestedUsersList.tsx

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import Avatar from "@/components/Avatar";

import Loading from "@/utils/loading/Loading";
import { Link } from "react-router-dom";
import { followUser, unfollowUser } from "@/features/userSlice";
import { Spinner } from "@/components/ui/spinner";

export default function SuggestedUsersList() {
  const dispatch = useDispatch<AppDispatch>();
  const { suggestedUsers, userLoading, followLoadingIds } = useSelector(
    (state: RootState) => state.users,
  );
  const authUser = useSelector((state: RootState) => state.auth.user);

  if (userLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm font-semibold">Gợi ý cho bạn</span>
        <button className="text-sm font-semibold cursor-pointer">
          Xem tất cả
        </button>
      </div>

      {suggestedUsers.map((user) => {
        const isFollowingLoading = followLoadingIds.includes(user._id);

        return (
          <div key={user._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/user/${user._id}`}>
                <Avatar
                  src={user.profilePicture}
                  name={user.fullName}
                  size={44}
                />
              </Link>
              <div>
                <Link
                  to={`/user/${user._id}`}
                  className="text-sm font-semibold"
                >
                  {user.username}
                </Link>
                <p className="text-xs text-muted-foreground">Gợi ý cho bạn</p>
              </div>
            </div>

            <button
              disabled={isFollowingLoading}
              onClick={() =>
                user.isFollowing
                  ? dispatch(
                      unfollowUser({
                        targetUserId: user._id,
                        authUserId: authUser!._id,
                      }),
                    )
                  : dispatch(
                      followUser({
                        targetUserId: user._id,
                        authUserId: authUser!._id,
                      }),
                    )
              }
              className={`
          text-xs font-semibold flex items-center gap-2 transition cursor-pointer
          ${
            user.isFollowing
              ? "text-muted-foreground cursor-default"
              : "text-blue-500 hover:text-blue-400"
          }
          ${isFollowingLoading ? "opacity-70 cursor-not-allowed" : ""}
        `}
            >
              {isFollowingLoading ? (
                <Spinner />
              ) : user.isFollowing ? (
                "Đang theo dõi"
              ) : (
                "Theo dõi"
              )}
            </button>
          </div>
        );
      })}

      <p className="mt-10 text-xs text-[#a8a8a8]">© 2026 INSTAGRAM FROM F8</p>
    </div>
  );
}
