import PostModal from "@/components/modals/PostModal";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="md:ml-84 py-12">
        <Outlet />
        <PostModal />
      </main>
    </div>
  );
}
