import { Home, Compass, SquarePlus, MessageCircleHeart } from "lucide-react";
import { NavLink } from "react-router-dom";
import Avatar from "@/components/Avatar";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { openCreateModal } from "@/features/modalSlice";

export default function MobileBottombar() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden items-center justify-around h-14 border-t border-[#262626] bg-white dark:bg-[#0c1014]">
      <NavLink to="/">
        <Home />
      </NavLink>

      <NavLink to="/explore">
        <Compass />
      </NavLink>

      <button onClick={() => dispatch(openCreateModal())}>
        <SquarePlus />
      </button>

      <NavLink to="/chat">
        <MessageCircleHeart />
      </NavLink>

      <NavLink to={user ? `/user/${user._id}` : "/"}>
        <Avatar src={user?.profilePicture} name={user?.username} size={24} />
      </NavLink>
    </nav>
  );
}
