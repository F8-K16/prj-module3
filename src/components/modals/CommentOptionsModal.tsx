/* eslint-disable react-hooks/set-state-in-effect */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { closeModal, openEditCommentModal } from "@/features/modalSlice";
import { deleteComment } from "@/features/commentSlice";
import { useEffect, useRef, useState } from "react";

export default function CommentOptionsModal() {
  const dispatch = useDispatch<AppDispatch>();
  const [confirming, setConfirming] = useState<boolean>(false);
  const didSubmitDeleteRef = useRef<boolean>(false);

  const { activeModal, commentOwnerId, commentId, postId } = useSelector(
    (state: RootState) => state.modals,
  );
  const { deleteLoading } = useSelector((state: RootState) => state.comments);
  const authUserId = useSelector((state: RootState) => state.auth.user?._id);
  const isOwner = authUserId === commentOwnerId;

  useEffect(() => {
    if (didSubmitDeleteRef.current && !deleteLoading) {
      dispatch(closeModal());
      setConfirming(false);
      didSubmitDeleteRef.current = false;
    }
  }, [deleteLoading, dispatch]);

  if (activeModal !== "comment-options" || !commentId || !postId) return null;

  return (
    <div
      onClick={() => dispatch(closeModal())}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#212328] rounded-xl w-90 text-sm text-[#f8f9f9] overflow-hidden"
      >
        {isOwner && !confirming && (
          <>
            <button
              onClick={() =>
                dispatch(openEditCommentModal({ postId, commentId }))
              }
              className="w-full py-3 hover:bg-[#333] cursor-pointer"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="w-full py-3 text-red-500 hover:bg-[#333] font-semibold cursor-pointer"
            >
              Xóa bình luận
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
              Bạn chắc chắn muốn xóa bình luận này?
            </p>

            <button
              disabled={deleteLoading}
              onClick={() => {
                didSubmitDeleteRef.current = true;
                dispatch(deleteComment({ postId, commentId }));
              }}
              className="w-full py-3 text-red-500 font-semibold hover:bg-[#333] disabled:opacity-50 cursor-pointer"
            >
              {deleteLoading ? "Đang xóa..." : "Xác nhận xóa"}
            </button>

            <button
              onClick={() => setConfirming(false)}
              disabled={deleteLoading}
              className="w-full py-3 border-t border-[#333] hover:bg-[#333] cursor-pointer"
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
