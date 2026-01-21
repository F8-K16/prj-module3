import type { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useDebounce from "@/hooks/useDebounce";
import {
  clearSearch,
  fetchSearchHistory,
  searchUsers,
} from "@/features/userSlice";

import Avatar from "../Avatar";
import SkeletonLoading from "@/utils/loading/SkeletonLoading";
import { DialogDescription } from "@radix-ui/react-dialog";
import { fetchOrCreateConversation } from "@/features/messageSlice";

export default function NewMessageModal({ open, onClose }: ModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { searchResult, searchLoading, searchHistory } = useSelector(
    (state: RootState) => state.users,
  );

  const [keyword, setKeyword] = useState("");
  const [selectingUserId, setSelectingUserId] = useState<string | null>(null);
  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    if (open) {
      setKeyword("");
      dispatch(clearSearch());
      dispatch(fetchSearchHistory());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      dispatch(clearSearch());
      return;
    }

    dispatch(searchUsers(debouncedKeyword));
  }, [debouncedKeyword, dispatch]);

  const handleSelectUser = async (userId: string) => {
    if (selectingUserId) return;

    try {
      setSelectingUserId(userId);

      const conversation = await dispatch(
        fetchOrCreateConversation(userId),
      ).unwrap();

      onClose();
      navigate(`/direct/${conversation._id}`);
    } catch (err) {
      console.error("Create conversation failed:", err);
    } finally {
      setSelectingUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-137 min-h-105 p-0 gap-0 bg-[#212328] text-white border-none flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-[#363636]">
          <DialogTitle className="text-center">Tin nhắn mới</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#363636]">
          <label className="font-semibold text-[#f5f5f5]">Tới:</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full bg-transparent outline-none text-sm"
            autoFocus
          />
        </div>

        {/* Result */}
        <div className="max-h-105 overflow-y-auto">
          {searchLoading && (
            <div className="px-4 py-2">
              <SkeletonLoading count={6} />
            </div>
          )}

          {!searchLoading &&
            searchResult.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                className={`
                  flex items-center gap-3 px-4 py-2
                  hover:bg-gray-800 cursor-pointer
                  ${selectingUserId === user._id ? "opacity-50 pointer-events-none" : ""}
                `}
              >
                <Avatar
                  src={user.profilePicture}
                  name={user.username}
                  size={44}
                />
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-[#a8a8a8]">{user.fullName}</p>
                </div>
              </div>
            ))}

          {!searchLoading && debouncedKeyword && searchResult.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">
              Không tìm thấy kết quả
            </p>
          )}
        </div>

        {!keyword && searchHistory.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="ml-4 text-[#f5f5f5] text-sm font-semibold my-3">
                Gợi ý
              </p>
            </div>
            {searchHistory.map((item) => (
              <div
                onClick={() => handleSelectUser(item.searchedUserId._id)}
                key={item._id}
                className="flex items-center justify-between px-4 py-2 hover:bg-[#333] cursor-pointer
"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={item.searchedUserId.profilePicture}
                    name={item.searchedUserId.username}
                    size={44}
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {item.searchedUserId.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      {item.searchedUserId.fullName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
