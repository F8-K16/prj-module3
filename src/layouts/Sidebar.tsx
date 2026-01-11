import { NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  MessageCircleHeart,
  Search,
  Instagram,
  Heart,
  User,
  Menu,
  SquarePlus,
} from "lucide-react";
import { useState } from "react";
import SearchModal from "@/components/modals/SearchModal";
import NotificationModal from "@/components/modals/NotificationModal";
import SidebarActionButton from "@/components/buttons/SidebarActionButton";
import OptionModal from "@/components/modals/OptionModal";
import SidebarButton from "@/components/buttons/SidebarButton";

type ActivePanel = "search" | "notification" | "option" | "create" | null;

export default function Sidebar() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const isSidebarCollapsed =
    activePanel === "search" ||
    activePanel === "notification" ||
    activePanel === "create";

  return (
    <>
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-screen w-84 pt-4 pb-6 px-3 z-40 flex-col ${
          isSidebarCollapsed ? "" : "border-r border-[#262626]"
        }`}
      >
        {isSidebarCollapsed ? (
          <NavLink to="/" className="m-4" onClick={() => setActivePanel(null)}>
            <Instagram />
          </NavLink>
        ) : (
          <h1 className="text-[26px] m-4">𝓘𝓷𝓼𝓽𝓪𝓰𝓻𝓪𝓶</h1>
        )}

        <nav className="flex flex-col gap-2 mt-6">
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

          <SidebarButton
            to="/chat"
            icon={<MessageCircleHeart />}
            label="Tin nhắn"
            disableActive={isSidebarCollapsed}
            onNavigate={closePanel}
          />

          <SidebarActionButton
            icon={<Heart />}
            label="Thông báo"
            isActive={activePanel === "notification"}
            isCollapsed={isSidebarCollapsed}
            onClick={() => togglePanel("notification")}
          />

          <SidebarButton
            to="/profile"
            icon={<User />}
            label="Trang cá nhân"
            disableActive={isSidebarCollapsed}
            onNavigate={closePanel}
          />

          <SidebarActionButton
            icon={<SquarePlus />}
            label="Tạo"
            isActive={activePanel === "create"}
            isCollapsed={isSidebarCollapsed}
            onClick={() => {}}
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
      <OptionModal open={activePanel === "option"} onClose={closePanel} />
    </>
  );
}
