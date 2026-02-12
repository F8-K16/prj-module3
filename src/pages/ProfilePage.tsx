import Loading from "@/utils/loading/Loading";
import {
  openFollowersModal,
  openFollowingModal,
  openMiniChat,
} from "@/features/modalSlice";
import {
  fetchProfileById,
  followUser,
  unfollowUser,
} from "@/features/userSlice";
import ProfilePostsGrid from "@/layouts/profile/ProfilePostsGrid";

import { getUserPosts } from "@/services/postApi";

import type { AppDispatch, RootState } from "@/store/store";

import type { Post } from "@/types/post";

import { Bookmark, Grid3X3, ListVideo } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Avatar from "@/components/Avatar";
import { Spinner } from "@/components/ui/spinner";
import { fetchOrCreateConversation } from "@/features/messageSlice";

type TabType = "posts" | "saved" | "videos";

const filterMap: Record<TabType, "all" | "saved" | "video"> = {
  posts: "all",
  saved: "saved",
  videos: "video",
};

function TabButton({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 border-b-2 cursor-pointer ${
        active
          ? "border-black dark:border-white dark:text-white"
          : "border-transparent text-gray-500"
      }`}
    >
      {icon}
    </button>
  );
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const user = useSelector((state: RootState) => state.users.profileUser);
  const { profileLoading } = useSelector((state: RootState) => state.users);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const tab: TabType = location.pathname.endsWith("/saved")
    ? "saved"
    : location.pathname.endsWith("/videos")
      ? "videos"
      : "posts";
  const followLoadingIds = useSelector(
    (state: RootState) => state.users.followLoadingIds,
  );

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!userId) return;

    dispatch(fetchProfileById(userId));
  }, [userId, dispatch]);

  /* ================= LOAD POSTS ================= */
  useEffect(() => {
    if (!userId) return;

    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        const data = await getUserPosts(userId, filterMap[tab]);
        setPosts(data);
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [userId, tab]);

  const isOwnProfile = authUser?._id === user?._id;

  if (profileLoading || !user) return <Loading />;
  const isFollowLoading = followLoadingIds.includes(user?._id);

  const handleSendMessage = async () => {
    try {
      const conversation = await dispatch(
        fetchOrCreateConversation(user?._id),
      ).unwrap();

      dispatch(openMiniChat(conversation._id));
    } catch (err) {
      console.error("Không thể mở cuộc trò chuyện:", err);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl md:px-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-10 mb-8 items-center sm:items-start">
          <Avatar
            src={user.profilePicture}
            name={user.username}
            size={120}
            classes="sm:!w-[150px] sm:!h-[150px]"
          />

          <div className="space-y-2 md:space-y-3 w-100">
            <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
              {user.username}
            </h2>
            <p>{user.fullName}</p>

            <div className="flex justify-between sm:justify-start gap-2 md:gap-3 text-sm w-full">
              <span>
                <strong>{posts.length}</strong> bài viết
              </span>
              <span
                onClick={() => dispatch(openFollowersModal(user._id))}
                className="cursor-pointer"
              >
                <strong>{user.followersCount}</strong> người theo dõi
              </span>
              <span
                onClick={() => dispatch(openFollowingModal(user._id))}
                className="cursor-pointer"
              >
                Đang theo dõi <strong>{user.followingCount}</strong> người dùng
              </span>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              {user.bio && <p>{user.bio}</p>}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {user.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="mb-10 flex w-full gap-2 text-sm sm:text-base">
          {isOwnProfile ? (
            <>
              <Link
                to="/profile"
                className="h-11 dark:bg-[#25292e] rounded-xl w-full dark:hover:bg-[#2f3338] flex items-center justify-center"
              >
                Chỉnh sửa trang cá nhân
              </Link>

              <button className="h-11 dark:bg-[#25292e] rounded-xl w-full dark:hover:bg-[#2f3338]">
                Xem kho lưu trữ
              </button>
            </>
          ) : (
            <>
              <button
                disabled={isFollowLoading}
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
          h-11 rounded-xl w-full flex items-center justify-center gap-2 transition
          ${
            user.isFollowing
              ? "dark:bg-[#25292e] dark:hover:bg-[#2f3338]"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }
          ${isFollowLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        `}
              >
                {isFollowLoading ? (
                  <Spinner />
                ) : user.isFollowing ? (
                  "Đang theo dõi"
                ) : (
                  "Theo dõi"
                )}
              </button>

              {user.isFollowing && (
                <button
                  onClick={handleSendMessage}
                  className="h-11 dark:bg-[#25292e] rounded-xl w-full dark:hover:bg-[#2f3338] cursor-pointer"
                >
                  Gửi tin nhắn
                </button>
              )}
            </>
          )}
        </div>

        {/* TABS */}
        <div className="border-b flex justify-around sm:justify-center sm:gap-24 mt-6">
          <TabButton
            icon={<Grid3X3 size={24} />}
            active={tab === "posts"}
            onClick={() => navigate(`/user/${userId}`)}
          />
          <TabButton
            icon={<Bookmark size={24} />}
            active={tab === "saved"}
            onClick={() => navigate(`/user/${userId}/saved`)}
          />
          <TabButton
            icon={<ListVideo size={24} />}
            active={tab === "videos"}
            onClick={() => navigate(`/user/${userId}/videos`)}
          />
        </div>

        {/* POSTS */}
        {postsLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-px mt-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-77 bg-[#1f1f1f] animate-pulse" />
            ))}
          </div>
        ) : (
          <ProfilePostsGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
