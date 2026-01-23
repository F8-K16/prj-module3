import {
  clearUnreadForConversation,
  fetchConversations,
  setCurrentConversation,
} from "@/features/messageSlice";
import { openNewMessageModal } from "@/features/modalSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ModalProps } from "@/types/modal";
import { ImageIcon, SquarePen } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "../Avatar";
import type { Conversation } from "@/types/message";
import { formatTimeAgo, getOtherUser } from "@/utils/helper";
import { Spinner } from "../ui/spinner";

export default function ChatModal({ open }: ModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { conversations, conversationsLoading, currentConversation } =
    useSelector((state: RootState) => state.messages);
  const authUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (open) {
      dispatch(fetchConversations());
    }
  }, [open, dispatch]);

  const handleOpenConversation = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation));
    dispatch(clearUnreadForConversation(conversation._id));
    navigate(`/direct/${conversation._id}`);
  };

  if (!open || !authUser) return null;

  return (
    <div className="fixed top-0 left-20 h-full w-100 z-50 border-r border-[#dbdfe4] shadow-2xl dark:border-[#262626] dark:border-l animate-in fade-in bg-white dark:bg-[#0c1014]">
      <div className="p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">{authUser.username}</span>
          <button
            className="cursor-pointer hover:opacity-70"
            onClick={() => dispatch(openNewMessageModal())}
          >
            <SquarePen />
          </button>
        </div>

        <input
          placeholder="Tìm kiếm"
          className="-ml-2 w-full rounded-full py-2 px-4
          outline-none bg-[#f3f5f7] dark:bg-[#25292e]"
        />
      </div>
      <div className="font-semibold mb-2 px-6">Tin nhắn</div>

      <div className="space-y-2">
        {conversationsLoading && (
          <div className="ml-6 mt-3">
            <Spinner />
          </div>
        )}

        {!conversationsLoading &&
          conversations.map((conversation: Conversation) => {
            const otherUser = getOtherUser(conversation, authUser._id);
            const isActive = currentConversation?._id === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => handleOpenConversation(conversation)}
                className={`flex items-center gap-3 px-6 py-2.5 cursor-pointer ${
                  isActive
                    ? "bg-gray-200 dark:bg-[#2a2a2a]"
                    : "hover:bg-gray-100 dark:hover:bg-[#333]"
                }`}
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

                  <div className="flex gap-1">
                    <p className="flex gap-1.5 text-xs text-[#a8a8a8] truncate">
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.senderId ===
                            authUser._id && (
                            <span className="font-medium">Bạn: </span>
                          )}

                          {conversation.lastMessage.messageType === "image" ? (
                            <span className="flex items-center gap-1">
                              <ImageIcon size={14} />
                              <span>Ảnh</span>
                            </span>
                          ) : (
                            conversation.lastMessage.content
                          )}
                        </>
                      ) : (
                        "Bắt đầu trò chuyện"
                      )}
                    </p>
                    {conversation.lastMessageAt && (
                      <span className="text-xs text-[#a8a8a8] whitespace-nowrap">
                        · {formatTimeAgo(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                </div>

                {conversation.unreadCount > 0 && (
                  <span
                    className="
                        min-w-5 h-5 rounded-full bg-red-500
                        text-white text-xs flex items-center justify-center
                      "
                  >
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
