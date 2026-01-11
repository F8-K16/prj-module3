import useEscapeKey from "@/hooks/useEscapeKey";
import type { ModalProps } from "@/types/modal";

export default function NotificationModal({ open, onClose }: ModalProps) {
  useEscapeKey(open, onClose);
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed top-0 left-20 right-0 bottom-0 z-40"
      />

      <div
        className="fixed top-0 left-20 h-full w-100 z-50
         border-r border-[#262626] animate-in fade-in bg-[#0c1014]"
      >
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Thông báo</h2>

          <div className="text-sm text-gray-400">Tháng này</div>
          <div>Thông báo</div>
        </div>
      </div>
    </>
  );
}
