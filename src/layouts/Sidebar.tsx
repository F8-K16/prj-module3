/* eslint-disable react-hooks/set-state-in-effect */
import { Link, NavLink, useLocation } from "react-router-dom";
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
import { useEffect, useState } from "react";
import SearchModal from "@/components/modals/SearchModal";
import NotificationModal from "@/components/modals/NotificationModal";
import SidebarActionButton from "@/components/buttons/SidebarActionButton";
import OptionModal from "@/components/modals/OptionModal";
import SidebarButton from "@/components/buttons/SidebarButton";
import SidebarHybridButton from "@/components/buttons/SidebarHybridButton";
import ChatModal from "@/components/modals/ChatModal";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { closeModal, openCreateModal } from "@/features/modalSlice";
import Avatar from "@/components/Avatar";

type ActivePanel = "search" | "notification" | "option" | "chat" | null;

export default function Sidebar() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const dispatch = useDispatch<AppDispatch>();
  const activeModal = useSelector(
    (state: RootState) => state.modals.activeModal,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  const isChatRoute =
    location.pathname === "/chat" || location.pathname.startsWith("/direct/");

  const resolvedActivePanel: ActivePanel =
    activePanel ?? (isChatRoute ? "chat" : null);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleCloseSearch = () => {
    setActivePanel(null);
    dispatch(closeModal());
  };

  const isSidebarCollapsed =
    resolvedActivePanel === "search" ||
    resolvedActivePanel === "notification" ||
    resolvedActivePanel === "chat";

  useEffect(() => {
    if (!isChatRoute) {
      setActivePanel(null);
    }
  }, [isChatRoute]);

  useEffect(() => {
    if (activeModal === "search") {
      setActivePanel("search");
    }

    if (activeModal === null) {
      setActivePanel(null);
    }
  }, [activeModal]);

  return (
    <>
      <aside
        className={`hidden sm:flex sm:fixed top-0 left-0 h-screen sm:w-20 lg:w-60 xl:w-72 pt-4 pb-6 px-3 z-40 flex-col ${
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
          <Link to="/" onClick={() => setActivePanel(null)} className="m-4">
            <Instagram className="lg:hidden" />

            <img
              src="/icons/logo.svg"
              alt="Instagram"
              className="hidden dark:lg:block w-30"
            />
            <img
              src="/icons/logo-light.svg"
              alt="Instagram"
              className="hidden lg:block dark:hidden w-30"
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
            isActive={resolvedActivePanel === "search"}
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
            isActive={resolvedActivePanel === "chat"}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => togglePanel("chat")}
          />

          <SidebarActionButton
            icon={<Heart />}
            label="Thông báo"
            isActive={resolvedActivePanel === "notification"}
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
                name={user?.username}
                size={24}
              />
            }
            label="Trang cá nhân"
            disableActive={isSidebarCollapsed}
            onNavigate={closePanel}
          />
        </nav>

        <div className="mt-auto pt-4 w-full justify-center lg:justify-start">
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
      <SearchModal
        open={activeModal === "search" || resolvedActivePanel === "search"}
        onClose={handleCloseSearch}
      />
      <NotificationModal
        open={resolvedActivePanel === "notification"}
        onClose={closePanel}
      />
      <OptionModal
        open={activePanel === "option"}
        onClose={closePanel}
        userId={user?._id}
      />
      <ChatModal open={resolvedActivePanel === "chat"} onClose={closePanel} />
    </>
  );
}
