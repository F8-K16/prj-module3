import { logout } from "@/features/authSlice";
import type { AppDispatch } from "@/store/store";
import { Bookmark, LogOut, Moon } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import ThemeModal from "./ThemeModal";
import type { ModalProps } from "@/types/modal";
import { useNavigate } from "react-router-dom";
import useEscapeKey from "@/hooks/useEscapeKey";

interface OptionModalProps extends ModalProps {
  userId?: string;
}

export default function OptionModal({
  open,
  onClose,
  userId,
}: OptionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [view, setView] = useState<"main" | "theme">("main");

  useEscapeKey(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      {view === "main" && (
        <div className="absolute w-72 bottom-20 left-4 bg-[#f8f9f9] dark:bg-[#25292e] shadow-lg rounded-2xl px-2 py-3">
          <button
            onClick={() => {
              navigate(`/user/${userId}/saved`);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-[#f3f3f3] dark:hover:bg-[#37383a]"
          >
            <Bookmark />
            <span>Bài viết đã lưu</span>
          </button>
          <button
            onClick={() => setView("theme")}
            className="flex w-full items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-[#f3f3f3] dark:hover:bg-[#37383a]"
          >
            <Moon />
            <span>Chuyển chế độ</span>
          </button>

          <button
            onClick={async () => {
              await dispatch(logout());
              navigate("/login", { replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-[#f3f3f3] text-red-500 dark:hover:bg-[#37383a]"
          >
            <LogOut />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}

      {view === "theme" && <ThemeModal onBack={() => setView("main")} />}
    </div>
  );
}
