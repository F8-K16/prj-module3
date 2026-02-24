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
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import SkeletonLoading from "@/utils/loading/SkeletonLoading";
import { X } from "lucide-react";
import type { ModalProps } from "@/types/modal";

export default function SearchModal({ open, onClose }: ModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { searchResult, searchLoading, searchHistory } = useSelector(
    (state: RootState) => state.users,
  );

  const isMobile = window.innerWidth < 640;

  const [keyword, setKeyword] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

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
      {/* ===== Overlay ===== */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 ${isMobile ? "bg-black/40" : "left-20"}`}
      />

      {/* ===== Modal ===== */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-50 bg-white dark:bg-[#0c1013] shadow-2xl
          ${
            isMobile
              ? "top-0 inset-x-0 max-h-[70vh] rounded-b-2xl overflow-auto"
              : "top-0 left-20 h-full w-100 border-r"
          }`}
      >
        {/* ===== Header ===== */}
        <div className="pt-6 px-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Tìm kiếm</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#333]"
            >
              <X size={20} />
            </button>
          </div>

          <input
            autoFocus
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full rounded-full py-2 px-4 outline-none
              bg-[#f3f5f7] dark:bg-[#25292e]"
          />

          {searchLoading && <SkeletonLoading count={12} />}

          {!searchLoading && hasSearched && searchResult.length === 0 && (
            <p className="text-sm text-gray-400">Không tìm thấy kết quả</p>
          )}
        </div>

        {/* ===== Search Result ===== */}
        <div className="mt-6">
          {searchResult.map((user) => (
            <Link
              key={user._id}
              to={`/user/${user._id}`}
              className="px-6 py-2.5 flex items-center gap-3
                hover:bg-gray-100 dark:hover:bg-[#333]"
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

        {/* ===== Search History ===== */}
        {!keyword && searchHistory.length > 0 && (
          <div className={isMobile ? "p-3" : ""}>
            <div className="flex items-center justify-between px-6 mb-2">
              <p className="font-semibold">Mới đây</p>
              <button
                onClick={() => dispatch(clearAllSearchHistory())}
                className="text-sm font-semibold text-[#3143e3] dark:text-[#85a1ff]"
              >
                Xóa tất cả
              </button>
            </div>

            <div
              className={
                isMobile ? "bg-[#262626] rounded-2xl overflow-hidden" : ""
              }
            >
              {searchHistory.map((item) => (
                <div
                  key={item._id}
                  className="px-6 py-3 flex items-center justify-between
                    hover:bg-gray-100 dark:hover:bg-[#333]"
                >
                  <Link
                    to={`/user/${item.searchedUserId._id}`}
                    className="flex gap-3 flex-1"
                    onClick={onClose}
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
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
