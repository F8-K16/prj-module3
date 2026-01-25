import { openNewMessageModal } from "@/features/modalSlice";
import type { AppDispatch } from "@/store/store";
import { MessageCircleMore } from "lucide-react";
import { useDispatch } from "react-redux";

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="pl-36 relative w-full h-full">
      <div className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] text-center">
        <MessageCircleMore size={96} className="mx-auto" />
        <h2 className="mt-4 text-xl">Tin nhắn của bạn</h2>
        <p className="text-[#6a717a] dark:text-[#a8a8a8] text-sm">
          Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm
        </p>
        <button
          onClick={() => dispatch(openNewMessageModal())}
          className="mt-4 text-sm font-semibold px-4 py-2 bg-[#4a5df9] rounded-lg cursor-pointer hover:bg-[#4a5df9]/80"
        >
          Gửi tin nhắn
        </button>
      </div>
    </div>
  );
}
