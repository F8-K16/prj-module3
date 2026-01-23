/* eslint-disable react-hooks/set-state-in-effect */
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openEditPostModal } from "@/features/modalSlice";
import type { RootState, AppDispatch } from "@/store/store";
import { useEffect, useState } from "react";
import { deletePost } from "@/features/postSlice";

export default function PostOptionsModal() {
  const dispatch = useDispatch<AppDispatch>();
  const [confirming, setConfirming] = useState(false);

  const { activeModal, ownerId, postId } = useSelector(
    (state: RootState) => state.modals,
  );

  const { deleteLoading } = useSelector((state: RootState) => state.posts);

  const authUserId = useSelector((state: RootState) => state.auth.user?._id);

  const isOwner = authUserId === ownerId;

  useEffect(() => {
    if (activeModal !== "post-options") {
      setConfirming(false);
    }
  }, [activeModal, postId]);

  if (activeModal !== "post-options" || !postId) return null;

  return (
    <div
      onClick={() => dispatch(closeModal())}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#212328] rounded-xl w-90 text-sm text-[#f8f9f9] overflow-hidden"
      >
        {/* ===== OWNER OPTIONS ===== */}
        {isOwner && !confirming && (
          <>
            <button
              onClick={() => dispatch(openEditPostModal({ postId }))}
              className="w-full py-3 hover:bg-[#333] cursor-pointer"
            >
              Đổi tiêu đề
            </button>

            <button
              onClick={() => setConfirming(true)}
              className="w-full py-3 text-red-500 hover:bg-[#333] font-semibold cursor-pointer"
            >
              Xóa bài viết
            </button>
            <button
              onClick={() => dispatch(closeModal())}
              className="w-full py-3 border-t border-[#333] hover:bg-[#333] cursor-pointer"
            >
              Hủy
            </button>
          </>
        )}

        {isOwner && confirming && (
          <>
            <p className="text-center py-4 text-red-400">
              Bạn chắc chắn muốn xóa bài viết này?
            </p>

            <button
              disabled={deleteLoading}
              onClick={() => {
                {
                  dispatch(deletePost(postId!));
                  dispatch(closeModal());
                }
              }}
              className="w-full py-3 text-red-500 font-semibold hover:bg-[#333] disabled:opacity-50 cursor-pointer"
            >
              {deleteLoading ? "Đang xóa..." : "Xác nhận xóa"}
            </button>

            <button
              onClick={() => setConfirming(false)}
              disabled={deleteLoading}
              className="w-full py-3 hover:bg-[#333] border-t border-[#333] cursor-pointer"
            >
              Hủy
            </button>
          </>
        )}

        {!isOwner && (
          <>
            <button className="w-full py-3 text-red-500 font-semibold hover:bg-[#333] cursor-pointer">
              Báo cáo
            </button>
            <button
              onClick={() => dispatch(closeModal())}
              className="w-full py-3 border-t border-[#333] hover:bg-[#333] cursor-pointer"
            >
              Hủy
            </button>
          </>
        )}
      </div>
    </div>
  );
}
