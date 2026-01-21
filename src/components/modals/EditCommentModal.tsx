/* eslint-disable react-hooks/set-state-in-effect */
import { updateComment } from "@/features/commentSlice";
import { closeModal } from "@/features/modalSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function EditCommentModal() {
  const dispatch = useDispatch<AppDispatch>();

  const { activeModal, postId, commentId } = useSelector(
    (state: RootState) => state.modal,
  );

  const comment = useSelector((state: RootState) =>
    state.comments.comments.find((c) => c._id === commentId),
  );

  const updating = useSelector((state: RootState) => {
    const c = state.comments.comments.find((c) => c._id === commentId);
    return c?.updateLoading;
  });

  const [content, setContent] = useState("");

  useEffect(() => {
    if (!updating && activeModal === "edit-comment" && comment) {
      setContent(comment.content);
    }
  }, [activeModal, comment, updating]);

  const handleSave = async () => {
    try {
      await dispatch(
        updateComment({
          postId: postId!,
          commentId: commentId!,
          content: content.trim(),
        }),
      ).unwrap();

      dispatch(closeModal());
    } catch {
      //
    }
  };

  if (activeModal !== "edit-comment" || !comment) return null;
  const isChanged = content.trim() !== comment.content;
  return (
    <div
      onClick={() => dispatch(closeModal())}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#262626] rounded-xl w-120 h-100 p-4 text-white flex flex-col"
      >
        <h3 className="font-semibold mb-3">Chỉnh sửa bình luận</h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-[#1c1c1c] p-2 rounded outline-none text-sm resize-none"
          rows={4}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => dispatch(closeModal())}
            className="text-sm text-gray-400 cursor-pointer hover:text-white"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!isChanged || updating}
            className="text-sm font-medium text-blue-500 cursor-pointer disabled:text-gray-400 disabled:pointer-events-none"
          >
            {updating ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
