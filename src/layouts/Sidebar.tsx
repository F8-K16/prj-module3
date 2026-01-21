import { Link, NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  MessageCircleHeart,
  Search,
  Instagram,
  Heart,
  Menu,
  SquarePlus,
} from "lucide-react";
import { useState } from "react";
import SearchModal from "@/components/modals/SearchModal";
import NotificationModal from "@/components/modals/NotificationModal";
import SidebarActionButton from "@/components/buttons/SidebarActionButton";
import OptionModal from "@/components/modals/OptionModal";
import SidebarButton from "@/components/buttons/SidebarButton";
import SidebarHybridButton from "@/components/buttons/SidebarHybridButton";
import ChatModal from "@/components/modals/ChatModal";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { openCreateModal } from "@/features/modalSlice";
import Avatar from "@/components/Avatar";

type ActivePanel = "search" | "notification" | "option" | "chat" | null;

export default function Sidebar() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const isSidebarCollapsed =
    activePanel === "search" ||
    activePanel === "notification" ||
    activePanel === "chat";

  return (
    <>
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-screen w-84 pt-4 pb-6 px-3 z-40 flex-col ${
          isSidebarCollapsed
            ? ""
            : "border-r border-[#dbdfe4] dark:border-[#262626] shadow-2xl"
        }`}
      >
        {isSidebarCollapsed ? (
          <NavLink to="/" className="m-4" onClick={() => setActivePanel(null)}>
            <Instagram />
          </NavLink>
        ) : (
          <Link to="/">
            <img
              src="/icons/logo.svg"
              alt="Instagram"
              className="w-30 m-4 hidden dark:block"
            />
            <img
              src="/icons/logo-light.svg"
              alt="Instagram"
              className="w-30 m-4 dark:hidden"
            />
          </Link>
        )}

        <nav className="flex flex-col gap-2 mt-4">
          <SidebarButton
            to="/"
            icon={<Home />}
            label="Trang chủ"
            disableActive={isSidebarCollapsed}
            onNavigate={closePanel}
          />

          <SidebarActionButton
            icon={<Search />}
            label="Tìm kiếm"
            isActive={activePanel === "search"}
            isCollapsed={isSidebarCollapsed}
            onClick={() => togglePanel("search")}
          />

          <SidebarButton
            to="/explore"
            icon={<Compass />}
            label="Khám phá"
            disableActive={isSidebarCollapsed}
            onNavigate={closePanel}
          />

          <SidebarHybridButton
            to="/chat"
            icon={<MessageCircleHeart />}
            label="Tin nhắn"
            isActive={activePanel === "chat"}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => togglePanel("chat")}
          />

          <SidebarActionButton
            icon={<Heart />}
            label="Thông báo"
            isActive={activePanel === "notification"}
            isCollapsed={isSidebarCollapsed}
            onClick={() => togglePanel("notification")}
          />

          <SidebarActionButton
            icon={<SquarePlus />}
            label="Tạo"
            isActive={false}
            isCollapsed={isSidebarCollapsed}
            onClick={() => dispatch(openCreateModal())}
          />

          <SidebarButton
            to={user ? `/user/${user._id}` : "/"}
            icon={
              <Avatar
                src={user?.profilePicture}
                name={user?.username || "U"}
                size={24}
              />
            }
            label="Trang cá nhân"
            disableActive={isSidebarCollapsed}
            onNavigate={closePanel}
          />
        </nav>

        <div className="mt-auto pt-4 w-full">
          <SidebarActionButton
            icon={<Menu />}
            label="Xem thêm"
            isActive={activePanel === "option"}
            isCollapsed={isSidebarCollapsed}
            onClick={() => togglePanel("option")}
          />
        </div>
      </aside>

      {/* Modals */}
      <SearchModal open={activePanel === "search"} onClose={closePanel} />
      <NotificationModal
        open={activePanel === "notification"}
        onClose={closePanel}
      />
      <OptionModal
        open={activePanel === "option"}
        onClose={closePanel}
        userId={user?._id}
      />
      <ChatModal open={activePanel === "chat"} onClose={closePanel} />
    </>
  );
}
