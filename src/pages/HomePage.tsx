import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openPostModal, openPostOptionsModal } from "@/features/modalSlice";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchNewsfeed,
  toggleLikePost,
  toggleSavePost,
} from "@/features/postSlice";
import Loading from "@/utils/loading/Loading";
import SuggestedUsersList from "@/layouts/home/SuggestedUsersList";

import { Link } from "react-router-dom";
import Avatar from "@/components/Avatar";
import { fetchSuggestedUsers } from "@/features/userSlice";
import { formatTimeAgo, getMediaUrl } from "@/utils/helper";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, postLoading } = useSelector((state: RootState) => state.posts);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchNewsfeed());
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  if (postLoading) return <Loading />;

  return (
    <div className="flex ml-80">
      <div className="flex flex-col gap-14">
        {posts.map((post) => {
          const user = post.userId;

          return (
            <Card
              key={post._id}
              className="border-0 bg-transparent p-0 m-0 w-125 gap-0"
            >
              <CardHeader className="gap-0 px-5">
                <div className="flex items-center gap-3 mb-3">
                  <Link to={`/user/${user._id}`}>
                    <Avatar
                      src={user.profilePicture}
                      name={user.username}
                      size={32}
                    />
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link to={`/user/${user._id}`}>
                      <p className="font-semibold text-sm">{user.username}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      • {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      dispatch(
                        openPostOptionsModal({
                          postId: post!._id,
                          ownerId: post!.userId._id,
                          parentModal: null,
                        }),
                      )
                    }
                    className="ml-auto cursor-pointer"
                  >
                    <MoreHorizontal />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="px-3 h-full">
                {post.mediaType === "image" && (
                  <img
                    src={getMediaUrl(post.image)}
                    alt="post"
                    className="w-full h-full object-fit rounded-md"
                  />
                )}

                {post.mediaType === "video" && post.video && (
                  <video
                    src={getMediaUrl(post.video)}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full rounded-lg"
                  />
                )}
              </CardContent>
              <CardFooter className="px-4 mt-1 flex flex-col items-start gap-2">
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center">
                      <button
                        onClick={() => dispatch(toggleLikePost(post._id))}
                        className="p-1.5"
                      >
                        <Heart
                          className={`h-6 w-6 transition hover:scale-105 cursor-pointer ${
                            post.isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </button>
                      <span className="font-semibold text-sm">
                        {post.likes}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <button
                        className="p-1.5"
                        onClick={() => dispatch(openPostModal(post._id))}
                      >
                        <MessageCircle className="h-6 w-6 hover:scale-105 cursor-pointer" />
                      </button>
                      <span className="font-semibold text-sm">
                        {post.comments}
                      </span>
                    </div>
                    <button className="p-1.5">
                      <Send className="h-6 w-6 hover:scale-105 cursor-pointer" />
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(toggleSavePost(post._id))}
                    className="ml-auto cursor-pointer p-1.5"
                  >
                    <Bookmark
                      className={`w-6 h-6 hover:scale-105 ${
                        post.isSaved ? "fill-white" : ""
                      }`}
                    />
                  </button>
                </div>

                {post.caption && (
                  <p className="text-sm text-[#f5f5f5] pl-1.5">
                    <Link to={`/user/${user._id}`} className="font-medium mr-1">
                      {user.username}
                    </Link>
                    {post.caption}
                  </p>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <div className="ml-36 w-78.75">
        <div className="flex items-center gap-3">
          <Link to={user ? `/user/${user._id}` : "/"}>
            <Avatar
              src={user?.profilePicture}
              name={user?.username || "U"}
              size={44}
            />
          </Link>
          <div>
            <p className="text-sm font-semibold">{user?.username}</p>
            <p className="text-sm text-[#a8a8a8]">{user?.fullName}</p>
          </div>
        </div>
        <SuggestedUsersList />
      </div>
    </div>
  );
}
