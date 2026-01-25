import { useDispatch, useSelector } from "react-redux";

import Avatar from "@/components/Avatar";
import { Send } from "lucide-react";
import type { RootState } from "@/store/store";
import { getOtherUser, useHideChatUI } from "@/utils/helper";
import { openChatListModal } from "@/features/modalSlice";

export default function ChatEntryButton() {
  const dispatch = useDispatch();

  const { conversations } = useSelector((state: RootState) => state.messages);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const previewUsers = conversations
    .map((conversation) => getOtherUser(conversation, authUser!._id))
    .filter(Boolean)
    .slice(0, 3);

  const hide = useHideChatUI();

  if (hide) return null;
  return (
    <button
      onClick={() => dispatch(openChatListModal())}
      className="fixed right-10 bottom-10 flex items-center gap-3 px-5 h-14 rounded-full dark:bg-[#212328] dark:hover:bg-[#212328]/50 cursor-pointer shadow-2xl"
    >
      <Send size={24} />

      <span className="font-semibold whitespace-nowrap">Tin nhắn</span>

      {/* Avatar preview */}
      <div className="flex -space-x-1 ml-6">
        {previewUsers.map((user, i) => (
          <Avatar
            key={i}
            src={user?.profilePicture}
            name={user?.username}
            size={24}
          />
        ))}
      </div>
    </button>
  );
}
