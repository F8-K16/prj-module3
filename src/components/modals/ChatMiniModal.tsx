import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { closeModal } from "@/features/modalSlice";
import ChatWindow from "../chat/ChatWindow";
import { Maximize2, X } from "lucide-react";
import { useHideChatUI } from "@/utils/helper";
import { useNavigate } from "react-router-dom";

export default function ChatMiniModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeModal, conversationId } = useSelector(
    (state: RootState) => state.modals,
  );
  const hide = useHideChatUI();

  if (activeModal !== "chat-mini" || !conversationId || hide) return null;

  return (
    <div className="fixed bottom-10 right-10 w-90 h-130 bg-white dark:bg-[#212328] rounded-xl shadow-2xl flex flex-col z-99 overflow-hidden">
      <button
        onClick={() => navigate(`/direct/${conversationId}`)}
        className="absolute top-9 right-13 hover:opacity-70 cursor-pointer"
      >
        <Maximize2 size={20} />
      </button>
      <button
        onClick={() => dispatch(closeModal())}
        className="absolute top-9 right-3 hover:opacity-70 cursor-pointer"
      >
        <X />
      </button>

      <ChatWindow variant="modal" />
    </div>
  );
}
