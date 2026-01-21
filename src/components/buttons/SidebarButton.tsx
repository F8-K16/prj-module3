import { NavLink } from "react-router-dom";

export default function SidebarButton({
  to,
  icon,
  label,
  disableActive,
  onNavigate,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  disableActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center rounded-lg p-3 transition hover:bg-[#f3f3f3] dark:hover:bg-[#25282c]
         ${disableActive ? "w-15 justify-center" : "gap-4"}
         ${isActive && !disableActive ? "font-bold" : ""}`
      }
    >
      {icon}
      {!disableActive && <span>{label}</span>}
    </NavLink>
  );
}
