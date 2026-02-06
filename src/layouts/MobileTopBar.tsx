import { openSearch } from "@/features/modalSlice";
import type { AppDispatch } from "@/store/store";
import { Heart, Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

export default function MobileTopbar() {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <header className="mb-10 fixed top-0 left-0 right-0 z-50 flex sm:hidden items-center justify-between px-4 h-14 bg-white dark:bg-[#0c1014]">
      <Link to="/">
        <img
          src="/icons/logo.svg"
          alt="Instagram"
          className="hidden dark:block h-8"
        />
        <img
          src="/icons/logo-light.svg"
          alt="Instagram"
          className="block dark:hidden h-8"
        />
      </Link>

      <button
        onClick={() => {
          dispatch(openSearch());
        }}
        className="flex items-center max-w-85 gap-2 dark:bg-[#262626] rounded-full px-4 py-1.5 flex-1 mx-3 sm:mx-8"
      >
        <Search size={16} className="opacity-70" />
        <span className="text-sm opacity-70">Tìm kiếm</span>
      </button>

      <Heart />
    </header>
  );
}
