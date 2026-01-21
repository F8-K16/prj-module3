import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  CirclePlus,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store/store";
import type { PostModalProps } from "@/types/modal";

import { fetchPostDetail, clearPostDetail } from "@/features/postDetailSlice";

import Avatar from "../Avatar";
import { formatTimeAgo, getMediaUrl } from "@/utils/helper";
import {
  resetDeletedPostId,
  toggleLikePost,
  toggleSavePost,
} from "@/features/postSlice";
import useEscapeKey from "@/hooks/useEscapeKey";
import {
  clearComments,
  createPostComment,
  createReply,
  fetchCommentReplies,
  fetchPostComments,
  increaseLimit,
  toggleHideReplies,
  toggleLikeComment,
} from "@/features/commentSlice";
import { Spinner } from "../ui/spinner";
import type { PostComment } from "@/types/comment";
import {
  openCommentOptionsModal,
  openPostOptionsModal,
} from "@/features/modalSlice";
import { Link } from "react-router-dom";

export default function PostModal({ open, postId, onClose }: PostModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { post, postDetailLoading } = useSelector(
    (state: RootState) => state.postDetail,
  );

  const deletedPostId = useSelector(
    (state: RootState) => state.posts.deletedPostId,
  );

  const { comments, hasMore, listLoading } = useSelector(
    (state: RootState) => state.comments,
  );
  const { createLoading } = useSelector((state: RootState) => state.comments);

  const [comment, setComment] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (open && postId) {
      dispatch(fetchPostDetail(postId));
      dispatch(fetchPostComments({ postId }));

      dispatch(resetDeletedPostId());
    }

    return () => {
      dispatch(clearPostDetail());
      dispatch(clearComments());
    };
  }, [open, postId, dispatch]);

  useEffect(() => {
    if (open && deletedPostId === postId) {
      onClose();
    }
  }, [open, deletedPostId, postId, onClose]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim() || !post) return;

    if (replyTo) {
      dispatch(
        createReply({
          postId: post._id,
          commentId: replyTo._id,
          content: comment.trim(),
        }),
      );
      setReplyTo(null);
    } else {
      dispatch(
        createPostComment({
          postId: post._id,
          content: comment.trim(),
          parentCommentId: null,
        }),
      );
    }
    setComment("");
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <button
        className="absolute top-4 right-5 text-white text-xl font-semibold"
        onClick={onClose}
      >
        ✕
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black rounded-lg overflow-hidden flex w-[60%] h-[90%]"
      >
        <div className="flex-1 bg-black flex items-center justify-center">
          {postDetailLoading && (
            <p className="text-white text-sm">Đang tải...</p>
          )}

          {!postDetailLoading && post?.mediaType === "image" && (
            <img
              src={getMediaUrl(post.image)}
              alt="post"
              className="w-full h-full object-fit"
            />
          )}

          {!postDetailLoading && post?.mediaType === "video" && post.video && (
            <video
              src={getMediaUrl(post.video)}
              controls
              autoPlay
              loop
              className="w-full h-full object-fill"
            />
          )}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="w-120 bg-[#212328] text-white flex flex-col border-l border-[#262626]">
          <div className="flex items-center gap-3 p-4 border-b border-[#262626]">
            <Link
              to={`/user/${post?.userId._id}`}
              onClick={onClose}
              className="flex items-center gap-3"
            >
              <Avatar
                src={post?.userId.profilePicture}
                name={post?.userId.username ?? ""}
                size={32}
              />
              <span className="font-medium">{post?.userId.username}</span>
            </Link>

            <button
              onClick={() =>
                dispatch(
                  openPostOptionsModal({
                    postId: post!._id,
                    ownerId: post!.userId._id,
                  }),
                )
              }
              className="ml-auto cursor-pointer"
            >
              <MoreHorizontal />
            </button>
          </div>

          <div className="flex-1 py-4 px-4 text-sm overflow-y-auto space-y-7">
            {post?.caption && (
              <div className="flex gap-3">
                <Link to={`/user/${post.userId._id}`} onClick={onClose}>
                  <Avatar
                    src={post.userId.profilePicture}
                    name={post.userId.username}
                    size={32}
                  />
                </Link>
                <div>
                  <p className="text-[#f8f9f9]">
                    <Link to={`/user/${post.userId._id}`} onClick={onClose}>
                      <span className="font-medium mr-1 text-white">
                        {post.userId.username}
                      </span>
                    </Link>
                    {post.caption}
                  </p>
                  <span className="mt-1 text-xs text-[#a2aab4]">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {listLoading && comment.length === 0 && <Spinner />}

            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Link
                  to={`/user/${comment.userId._id}`}
                  className="cursor-pointer"
                  onClick={onClose}
                >
                  <Avatar
                    src={comment.userId.profilePicture}
                    name={comment.userId.username}
                    size={32}
                  />
                </Link>
                <div className="flex-1">
                  <div className=" group">
                    <div className="flex items-center justify-between">
                      <p className="text-[#f8f9f9]">
                        <Link
                          to={`/user/${comment.userId._id}`}
                          onClick={onClose}
                        >
                          <span className="font-medium mr-1 text-white">
                            {comment.userId.username}
                          </span>
                        </Link>
                        {comment.content}
                      </p>
                      <button
                        disabled={comment.likeLoading}
                        onClick={() =>
                          dispatch(
                            toggleLikeComment({
                              postId: post!._id,
                              commentId: comment!._id,
                            }),
                          )
                        }
                        className="flex items-center gap-1 text-xs cursor-pointer"
                      >
                        {comment.likeLoading ? (
                          <Spinner />
                        ) : (
                          <Heart
                            size={16}
                            className={`transition ${
                              comment.isLiked ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        )}
                      </button>
                    </div>
                    <div
                      className={`flex items-center gap-3 mt-1 text-xs text-[#a2aab4] ${comment.repliesHasMore ? "mb-5" : ""}`}
                    >
                      <span>{formatTimeAgo(comment.createdAt)}</span>
                      {comment.likes !== 0 && (
                        <span className="font-semibold">
                          {comment.likes} lượt thích
                        </span>
                      )}
                      <button
                        className="cursor-pointer font-semibold"
                        onClick={() => {
                          setReplyTo(comment);
                          commentInputRef.current?.focus();
                        }}
                      >
                        Trả lời
                      </button>

                      {/* Options */}
                      <button
                        onClick={() =>
                          dispatch(
                            openCommentOptionsModal({
                              postId: post!._id,
                              commentId: comment._id,
                              ownerId: comment.userId._id,
                            }),
                          )
                        }
                        className="ml-2 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>

                  {comment.replyCreating && (
                    <div className="ml-10 mt-2">
                      <Spinner />
                    </div>
                  )}

                  {comment.repliesVisible &&
                    comment.replies.map((reply) => (
                      <div key={reply._id} className="flex gap-3 my-5 group">
                        <Link
                          to={`/user/${reply.userId._id}`}
                          onClick={onClose}
                        >
                          <Avatar
                            src={reply.userId.profilePicture}
                            name={reply.userId.username}
                            size={28}
                          />
                        </Link>
                        <div className="flex-1">
                          <p className="text-[#f8f9f9] text-sm">
                            <Link
                              to={`/user/${reply.userId._id}`}
                              onClick={onClose}
                            >
                              <span className="font-medium mr-1 text-white">
                                {reply.userId.username}
                              </span>
                            </Link>
                            {reply.content}
                          </p>
                          <div className="flex items-center">
                            <span className="text-xs text-[#a2aab4]">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(
                                  openCommentOptionsModal({
                                    postId: post!._id,
                                    commentId: reply._id,
                                    ownerId: reply.userId._id,
                                  }),
                                )
                              }
                              className="ml-3 mt-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {comment.repliesHasMore && !comment.repliesLoading && (
                    <div
                      onClick={() =>
                        dispatch(
                          fetchCommentReplies({
                            postId: post!._id,
                            commentId: comment._id,
                          }),
                        )
                      }
                      className="flex items-center gap-5 cursor-pointer"
                    >
                      <div className="w-6 h-px bg-white mt-1"></div>
                      <button className=" text-xs text-[#a2a3b4] font-semibold cursor-pointer">
                        Xem câu trả lời
                      </button>
                    </div>
                  )}

                  {!comment.repliesHasMore &&
                    comment.repliesVisible &&
                    comment.replies.length > 0 && (
                      <div
                        className="mt-5 flex items-center gap-5 cursor-pointer"
                        onClick={() => dispatch(toggleHideReplies(comment._id))}
                      >
                        <div className="w-6 h-px bg-white mt-1"></div>
                        <button className="text-xs text-[#a2a3b4] font-semibold cursor-pointer">
                          Ẩn câu trả lời
                        </button>
                      </div>
                    )}

                  {comment.repliesLoading && (
                    <div className="ml-10 mt-2">
                      <Spinner />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {hasMore && !listLoading && (
              <button
                onClick={() => {
                  dispatch(increaseLimit(10));
                  dispatch(fetchPostComments({ postId: post!._id }));
                }}
                className="block mt-auto mx-auto cursor-pointer"
              >
                <CirclePlus />
              </button>
            )}
          </div>

          <div className="px-4 pt-2 pb-3 border-t border-[#262626] text-sm">
            <div className="flex items-center gap-1 -ml-2 mb-2">
              <button
                className="p-2 cursor-pointer"
                onClick={() => dispatch(toggleLikePost(post!._id))}
              >
                <Heart
                  className={`h-6 w-6 hover:scale-105 transition ${
                    post?.isLiked ? "fill-red-500 text-red-500" : "text-white"
                  }`}
                />
              </button>

              <button
                onClick={() => commentInputRef.current?.focus()}
                className="p-2 cursor-pointer"
              >
                <MessageCircle className="h-6 w-6 hover:scale-105" />
              </button>

              <button className="p-2 cursor-pointer">
                <Send className="h-6 w-6 hover:scale-105" />
              </button>

              <button
                className="ml-auto cursor-pointer"
                onClick={() => dispatch(toggleSavePost(post!._id))}
              >
                <Bookmark
                  className={`h-6 w-6 hover:scale-105 transition ${
                    post?.isSaved ? "fill-white text-white" : "text-white"
                  }`}
                />
              </button>
            </div>

            <p className="font-medium">{post?.likes} lượt thích</p>
            <p className="text-gray-400 text-xs mt-1">
              {post &&
                (() => {
                  const timeAgo = formatTimeAgo(post.createdAt);
                  return timeAgo === "vừa xong" ? timeAgo : `${timeAgo} trước`;
                })()}
            </p>
          </div>

          <div className="border-t border-[#262626] p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              {replyTo && (
                <div className="text-xs text-blue-400 flex items-center gap-2">
                  @{replyTo.userId.username}
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                ref={commentInputRef}
                value={comment}
                onChange={handleCommentChange}
                placeholder="Bình luận..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
              />

              <button
                type="submit"
                disabled={!comment.trim() || createLoading}
                className={`text-sm font-medium ${"text-blue-500 hover:text-blue-400 disabled:text-blue-500/40 cursor-default"}`}
              >
                {createLoading ? <Spinner /> : "Đăng"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
