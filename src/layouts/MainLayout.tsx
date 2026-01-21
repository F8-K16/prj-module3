import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import AppModal from "@/components/modals/AppModal";
import useScrollToTop from "@/hooks/useScrollToTop";

export default function MainLayout() {
  useScrollToTop();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="md:ml-84 py-12 flex-1">
        <Outlet />
        <AppModal />
      </main>
    </div>
  );
}
