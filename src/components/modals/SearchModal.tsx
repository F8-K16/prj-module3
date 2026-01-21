/* eslint-disable react-hooks/set-state-in-effect */
import {
  clearAllSearchHistory,
  clearSearch,
  deleteSearchHistoryItem,
  fetchSearchHistory,
  saveSearchHistory,
  searchUsers,
} from "@/features/userSlice";
import useDebounce from "@/hooks/useDebounce";
import useEscapeKey from "@/hooks/useEscapeKey";
import type { AppDispatch, RootState } from "@/store/store";
import type { ModalProps } from "@/types/modal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import SkeletonLoading from "@/utils/loading/SkeletonLoading";
import { X } from "lucide-react";

export default function SearchModal({ open, onClose }: ModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { searchResult, searchLoading, searchHistory } = useSelector(
    (state: RootState) => state.users,
  );
  const [keyword, setKeyword] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    if (open) {
      setKeyword("");
      setHasSearched(false);
      dispatch(clearSearch());
      dispatch(fetchSearchHistory());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      dispatch(clearSearch());
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    dispatch(searchUsers(debouncedKeyword));
  }, [debouncedKeyword, dispatch]);

  useEscapeKey(open, onClose);
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed top-0 left-20 right-0 bottom-0 z-40"
      />

      <div
        className="fixed top-0 left-20 h-full w-100 z-50
         border-r border-[#dbdfe4] shadow-2xl dark:border-l dark:border-[#262626] animate-in fade-in"
      >
        <div className="pt-6 px-6 space-y-6">
          <h2 className="text-2xl font-semibold">Tìm kiếm</h2>

          <input
            autoFocus
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm"
            className="mb-4 w-full rounded-full py-2 px-4 outline-none bg-[#f3f5f7] dark:bg-[#25292e]"
          />

          {searchLoading && <SkeletonLoading count={12} />}

          {!searchLoading && hasSearched && searchResult.length === 0 && (
            <p className="px-6 text-sm text-gray-400">Không tìm thấy kết quả</p>
          )}
        </div>
        <div>
          {searchResult.map((user) => (
            <Link
              to={`/user/${user._id}`}
              key={user._id}
              className="px-6 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]"
              onClick={() => {
                dispatch(
                  saveSearchHistory({
                    searchedUserId: user._id,
                    searchQuery: keyword,
                  }),
                );
                onClose();
              }}
            >
              <Avatar
                src={user.profilePicture}
                name={user.username}
                size={44}
              />
              <div>
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-sm text-[#a8a8a8]">{user.fullName}</p>
              </div>
            </Link>
          ))}
        </div>

        {!keyword && searchHistory.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="px-6 text-[#f5f5f5] font-semibold mt-2 mb-4">
                Mới đây
              </p>
              <button
                onClick={() => dispatch(clearAllSearchHistory())}
                className="mr-6 text-[#85a1ff] font-semibold text-sm cursor-pointer hover:underline"
              >
                Xóa tất cả
              </button>
            </div>
            {searchHistory.map((item) => (
              <div
                key={item._id}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#333]"
              >
                <Link
                  to={`/user/${item.searchedUserId._id}`}
                  className="flex gap-3 flex-1"
                  onClick={() => onClose()}
                >
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
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(deleteSearchHistoryItem(item._id));
                  }}
                  className="text-gray-400 cursor-pointer hover:scale-105 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
