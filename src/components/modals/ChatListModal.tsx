// components/chat/ChatListModal.tsx
import { fetchConversations } from "@/features/messageSlice";
import {
  closeModal,
  openMiniChat,
  openNewMessageModal,
} from "@/features/modalSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { ImageIcon, SquarePen, X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../Avatar";
import { formatTimeAgo, getOtherUser, useHideChatUI } from "@/utils/helper";
import SkeletonLoading from "@/utils/loading/SkeletonLoading";

export default function ChatListModal() {
  const dispatch = useDispatch<AppDispatch>();

  const { activeModal } = useSelector((state: RootState) => state.modals);
  const open = activeModal === "chat-list";

  const { conversations, conversationsLoading } = useSelector(
    (state: RootState) => state.messages,
  );

  const authUser = useSelector((state: RootState) => state.auth.user);
  const hide = useHideChatUI();

  useEffect(() => {
    if (open) dispatch(fetchConversations());
  }, [open, dispatch]);

  if (!open || !authUser || hide) return null;

  return (
    <div className="fixed bottom-10 right-10 w-90 max-h-130 bg-white dark:bg-[#212328] rounded-xl shadow-2xl z-50 flex flex-col ">
      <div className="flex items-center justify-between p-4 border-b border-[#363636]">
        <span className="font-semibold text-lg">Tin nhắn</span>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch(openNewMessageModal())}
            className="cursor-pointer hover:opacity-70"
          >
            <SquarePen size={20} />
          </button>
          <button
            onClick={() => dispatch(closeModal())}
            className="cursor-pointer hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-thumb]:rounded-full
        dark:[&::-webkit-scrollbar-track]:bg-[#2c2c2c]
        dark:[&::-webkit-scrollbar-thumb]:bg-[#9f9f9f]"
      >
        {conversationsLoading ? (
          <div className="ml-6 mt-3">
            <SkeletonLoading count={6} />
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation, authUser._id);

            return (
              <div
                key={conversation._id}
                onClick={() => dispatch(openMiniChat(conversation._id))}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]"
              >
                <Avatar
                  src={otherUser?.profilePicture}
                  name={otherUser?.username}
                  size={44}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">
                    {otherUser?.username}
                  </p>

                  <div className="flex gap-1 text-xs text-[#a8a8a8] truncate">
                    {conversation.lastMessage?.messageType === "image" ? (
                      <span className="flex items-center gap-1">
                        <ImageIcon size={14} />
                        Ảnh
                      </span>
                    ) : (
                      conversation.lastMessage?.content || "Bắt đầu trò chuyện"
                    )}
                    {conversation.lastMessageAt && (
                      <span>· {formatTimeAgo(conversation.lastMessageAt)}</span>
                    )}
                  </div>
                </div>

                {conversation.unreadCount > 0 && (
                  <span
                    className="min-w-5 h-5 rounded-full bg-red-500
                    text-white text-xs flex items-center justify-center"
                  >
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
