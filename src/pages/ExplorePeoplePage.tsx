import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchSuggestedUsers,
  followUser,
  unfollowUser,
} from "@/features/userSlice";
import Avatar from "@/components/Avatar";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export default function ExplorePeoplePage() {
  const dispatch = useDispatch<AppDispatch>();

  const { suggestedUsers, userLoading, followLoadingIds } = useSelector(
    (state: RootState) => state.users,
  );

  const authUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchSuggestedUsers({ limit: 30 }));
  }, [dispatch]);

  return (
    <div className="min-h-screen w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-xl font-semibold mb-6">Gợi ý theo dõi</h1>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            {userLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedUsers.map((user) => {
                  const isFollowingLoading = followLoadingIds.includes(
                    user._id,
                  );

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 rounded-2xl border hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <Link to={`/user/${user._id}`}>
                          <Avatar
                            src={user.profilePicture}
                            name={user.fullName}
                            size={48}
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/user/${user._id}`}
                            className="font-semibold text-sm"
                          >
                            {user.username}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {user.fullName}
                          </p>
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
                          text-sm font-semibold px-4 py-1.5 rounded-xl transition
                          ${
                            user.isFollowing
                              ? "bg-gray-200 text-gray-600"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }
                          ${isFollowingLoading ? "opacity-70 cursor-not-allowed" : ""}
                        `}
                      >
                        {isFollowingLoading
                          ? "Đang xử lý..."
                          : user.isFollowing
                            ? "Đang theo dõi"
                            : "Theo dõi"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
