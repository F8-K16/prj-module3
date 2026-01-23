/* eslint-disable react-hooks/set-state-in-effect */
import { closeModal } from "@/features/modalSlice";
import { updatePostCaption } from "@/features/postSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function EditPostModal() {
  const dispatch = useDispatch<AppDispatch>();

  const { activeModal, postId } = useSelector(
    (state: RootState) => state.modals,
  );

  const post = useSelector((state: RootState) =>
    state.posts.posts.find((p) => p._id === postId),
  );

  const updating = useSelector((state: RootState) => state.posts.updateLoading);

  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (activeModal === "edit-post" && post) {
      setCaption(post.caption ?? "");
    }
  }, [activeModal, post]);

  const handleSave = async () => {
    try {
      await dispatch(
        updatePostCaption({
          postId: postId!,
          caption: caption.trim(),
        }),
      ).unwrap();

      dispatch(closeModal());
    } catch {
      //
    }
  };

  if (activeModal !== "edit-post" || !post) return null;
  const isChanged = caption.trim() !== post.caption;

  return (
    <div
      onClick={() => dispatch(closeModal())}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#262626] rounded-xl w-120 h-60 p-4 text-white flex flex-col"
      >
        <h3 className="font-semibold mb-3">Chỉnh sửa tiêu đề</h3>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          className="flex-1 bg-[#1c1c1c] p-2 rounded outline-none text-sm resize-none"
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
