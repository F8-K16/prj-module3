import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Loading from "@/components/Loading";

export default function AuthMiddleware() {
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  if (!isInitialized) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
