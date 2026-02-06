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
      className="hidden fixed right-4 bottom-4 sm:right-6 sm:bottom-6 lg:right-10 lg:bottom-10 sm:flex items-center gap-3 w-14 lg:w-auto h-14 px-0 lg:px-5 rounded-full dark:bg-[#212328] dark:hover:bg-[#212328]/50 shadow-2xl cursor-pointer"
    >
      <Send size={24} className="mx-4 lg:mx-0" />

      <span className="hidden lg:inline font-semibold whitespace-nowrap">
        Tin nhắn
      </span>

      <div className="hidden lg:flex -space-x-1 ml-4">
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
