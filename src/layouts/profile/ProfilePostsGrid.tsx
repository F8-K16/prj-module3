import { openPostModal } from "@/features/modalSlice";
import type { AppDispatch } from "@/store/store";
import type { Post } from "@/types/post";
import { getMediaUrl } from "@/utils/helper";
import { Clapperboard, Images } from "lucide-react";

import { useDispatch } from "react-redux";

export default function ProfilePostsGrid({ posts }: { posts: Post[] }) {
  const dispatch = useDispatch<AppDispatch>();
  if (!posts.length) {
    return (
      <p className="text-center text-gray-400 mt-10">Chưa có bài viết nào</p>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-px mt-1 w-294 mx-auto">
      {posts.map((post) => (
        <div
          onClick={() => dispatch(openPostModal(post._id))}
          key={post._id}
          className="h-77 bg-black overflow-hidden cursor-pointer"
        >
          {post.mediaType === "image" && post.image && (
            <div className="relative h-full">
              <img
                src={getMediaUrl(post.image)}
                alt={post.caption || "post"}
                className="w-full h-full object-fit hover:opacity-80"
              />
              <Images className="absolute top-3 right-3" />
            </div>
          )}

          {post.mediaType === "video" && post.video && (
            <div className="relative h-full">
              <video
                src={getMediaUrl(post.video)}
                className="w-full h-full object-cover"
                muted
              />
              <Clapperboard className="absolute top-3 right-3" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
