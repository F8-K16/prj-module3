import { openPostModal } from "@/features/modalSlice";
import { fetchPostsTrending, resetExplore } from "@/features/postSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { getMediaUrl } from "@/utils/helper";
import Loading from "@/utils/loading/Loading";
import { Clapperboard, Images } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { explorePosts, exploreLoading, exploreHasMore, exploreFirstLoad } =
    useSelector((state: RootState) => state.posts);

  useEffect(() => {
    if (!loadMoreRef.current || exploreLoading || !exploreHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          dispatch(fetchPostsTrending());
        }
      },
      { threshold: 1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [dispatch, exploreLoading, exploreHasMore]);

  useEffect(() => {
    dispatch(resetExplore());
  }, [dispatch]);

  if (exploreLoading && exploreFirstLoad) return <Loading />;

  return (
    <div className="w-full mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px">
      {explorePosts.map((post) => (
        <div
          onClick={() => dispatch(openPostModal(post._id))}
          key={post._id}
          className="h-77 dark:bg-black overflow-hidden cursor-pointer"
        >
          {post.mediaType === "image" && (
            <div className="relative h-full">
              <img
                src={getMediaUrl(post.image)}
                className="w-full h-full aspect-square object-cover hover:opacity-80"
              />
              <Images className="absolute top-3 right-3" />
            </div>
          )}

          {post.mediaType === "video" && post.video && (
            <div className="relative h-full">
              <video
                src={getMediaUrl(post.video)}
                className="w-full h-full aspect-square object-contain"
                muted
                autoPlay
              />
              <Clapperboard className="absolute top-3 right-3" />
            </div>
          )}
        </div>
      ))}
      <div ref={loadMoreRef} className="h-10" />
    </div>
  );
}
