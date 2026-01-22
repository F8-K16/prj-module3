import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import AppModal from "@/components/modals/AppModal";
import useScrollToTop from "@/hooks/useScrollToTop";
import ChatEntryButton from "@/components/buttons/ChatEntryButton";
import ChatListModal from "@/components/modals/ChatListModal";
import ChatMiniModal from "@/components/modals/ChatMiniModal";
import { useAutoCloseChatOn } from "@/hooks/useAutoCloseChatOn";

export default function MainLayout() {
  useScrollToTop();
  useAutoCloseChatOn();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="md:ml-84 py-12 flex-1">
        <Outlet />
        <AppModal />
      </main>
      <ChatEntryButton />
      <ChatListModal />
      <ChatMiniModal />
    </div>
  );
}
