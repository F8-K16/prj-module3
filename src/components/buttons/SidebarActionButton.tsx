interface SidebarActionButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

export default function SidebarActionButton({
  icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}: SidebarActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center rounded-lg p-3 transition hover:bg-[#f3f3f3] dark:hover:bg-[#25282c] cursor-pointer
        ${isCollapsed ? "w-15 justify-center p-2" : "gap-4"}
        ${isActive ? "font-bold bg-[#f3f5f7] dark:bg-[#25292e]" : ""}
      `}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </button>
  );
}
