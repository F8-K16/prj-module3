import { closePostModal } from "@/features/postModalSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import useEscapeKey from "@/hooks/useEscapeKey";

export default function PostModal() {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [comment, setComment] = useState("");

  const commentInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, post } = useSelector((state: RootState) => state.postModal);

  useEscapeKey(isOpen, () => {
    dispatch(closePostModal());
  });

  if (!isOpen || !post) return null;

  const images = Array.isArray(post.image) ? post.image : [post.image];

  const prevImage = () => {
    setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const nextImage = () =>
    setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim()) return;
    console.log("Submit comment:", comment);
    setComment("");
  };

  return (
    <div
      onClick={() => dispatch(closePostModal())}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <button
        className="absolute top-4 right-5 text-white text-xl font-semibold cursor-pointer"
        onClick={() => dispatch(closePostModal())}
      >
        ✕
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black rounded-lg overflow-hidden flex w-[60%] h-[90%]"
      >
        <div className="flex-1 bg-black relative">
          <img
            src={images[activeImage]}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2
                   bg-black/50 hover:bg-black/80
                   text-white w-10 h-10 rounded-full cursor-pointer"
              >
                <ChevronLeft className="ml-2" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2
                   bg-black/50 hover:bg-black/80
                   text-white w-10 h-10 rounded-full cursor-pointer"
              >
                <ChevronRight className="ml-2" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === activeImage ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-125 bg-[#212328] text-white flex flex-col border-l border-[#262626]">
          <div className="flex items-center gap-3 p-4 border-b border-[#262626]">
            <img src={post.user.avatar} className="w-10 h-10 rounded-full" />
            <span className="font-medium">{post.user.name}</span>
          </div>

          <div className="flex-1 py-4 pl-4 pr-6 text-sm overflow-y-auto space-y-8">
            <div className="flex gap-3">
              <img
                src={post.user.avatar}
                className="w-10 h-10 rounded-full object-cover"
              />
              <p>
                <span className="font-medium mr-1">{post.user.name}</span>{" "}
                {post.caption}
              </p>
            </div>
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.user.avatar}
                  className="w-10 h-10 rounded-full"
                />
                <p>
                  <span className="font-medium mr-1">{comment.user.name}</span>{" "}
                  {comment.text}
                </p>
              </div>
            ))}
          </div>

          <div className="px-4 pt-1 pb-3 border-t border-[#262626] text-sm">
            <div className="flex items-center gap-1 -ml-2 mb-2">
              <button className="flex items-center gap-1 cursor-pointer p-2">
                <Heart
                  className={`h-6 w-6 hover:scale-105 ${
                    post.isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => commentInputRef.current?.focus()}
                className="flex items-center gap-1 cursor-pointer p-2"
              >
                <MessageCircle className="h-6 w-6 hover:scale-105" />
              </button>
              <button className="flex items-center gap-1 cursor-pointer p-2">
                <Send className="h-6 w-6 hover:scale-105" />
              </button>
            </div>
            <p className="font-medium">{post.likes} lượt thích</p>
            <p className="text-gray-400 text-xs mt-1">{post.createdAt}</p>
          </div>

          {/* Comment */}
          <div className="border-t border-[#262626] p-4">
            <form
              onSubmit={handleSubmitComment}
              className="flex items-center gap-3"
            >
              <input
                ref={commentInputRef}
                value={comment}
                onChange={handleChangeInput}
                placeholder="Bình luận..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
              />

              <button
                type="submit"
                disabled={!comment.trim()}
                className={`text-sm font-medium ${
                  comment.trim()
                    ? "text-blue-500 hover:text-blue-400"
                    : "text-blue-500/40 cursor-default"
                }`}
              >
                Đăng
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
