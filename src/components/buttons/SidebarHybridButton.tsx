import { NavLink } from "react-router-dom";

interface SidebarHybridButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function SidebarHybridButton({
  to,
  icon,
  label,
  isActive,
  isCollapsed,
  onToggle,
}: SidebarHybridButtonProps) {
  return (
    <NavLink
      to={to}
      onClick={onToggle}
      className={`
        flex items-center rounded-lg p-3 transition hover:bg-[#f3f3f3] dark:hover:bg-[#25282c] cursor-pointer
        ${isCollapsed ? "w-15 justify-center p-2" : "gap-4"}
        ${isActive ? "font-bold bg-[#cbcbcb] dark:bg-[#25292e]" : ""}
      `}
    >
      <span>{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
}
