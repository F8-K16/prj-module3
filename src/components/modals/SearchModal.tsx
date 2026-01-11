import useEscapeKey from "@/hooks/useEscapeKey";
import type { ModalProps } from "@/types/modal";

export default function SearchModal({ open, onClose }: ModalProps) {
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
         border-r border-[#262626] animate-in fade-in"
      >
        <div className="p-6 space-y-8">
          <h2 className="text-2xl font-semibold">Tìm kiếm</h2>

          <input
            autoFocus
            placeholder="Tìm kiếm"
            className="-ml-2 w-full rounded-full py-2 px-4 outline-none bg-[#f3f5f7] dark:bg-[#25292e]"
          />

          <div className="text-sm text-gray-400">Mới đây</div>
        </div>
      </div>
    </>
  );
}
