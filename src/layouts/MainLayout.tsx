import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import AppModal from "@/components/modals/AppModal";
import useScrollToTop from "@/hooks/useScrollToTop";
import ChatEntryButton from "@/components/buttons/ChatEntryButton";
import ChatListModal from "@/components/modals/ChatListModal";
import ChatMiniModal from "@/components/modals/ChatMiniModal";
import { useAutoCloseChatOn } from "@/hooks/useAutoCloseChatOn";
import MobileTopbar from "./MobileTopBar";
import MobileBottombar from "./MobileBottomBar";

export default function MainLayout() {
  useScrollToTop();
  useAutoCloseChatOn();

  return (
    <div className="flex min-h-screen">
      <MobileTopbar />
      <MobileBottombar />
      <Sidebar />
      <main className="mt-16 sm:mt-8 sm:ml-20 lg:ml-60 xl:ml-72 pt-4 sm:pt-6 pb-20 sm:pb-16 px-4 sm:px-5 flex-1 flex justify-center">
        <Outlet />
        <AppModal />
      </main>
      <ChatEntryButton />
      <ChatListModal />
      <ChatMiniModal />
    </div>
  );
}
