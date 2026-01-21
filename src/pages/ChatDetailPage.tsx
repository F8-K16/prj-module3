import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchMessages,
  sendTextMessageThunk,
  fetchConversations,
  setCurrentConversation,
  pushMessage,
  clearMessages,
} from "@/features/messageSlice";

import Avatar from "@/components/Avatar";
import { getOtherUser } from "@/utils/helper";
import { Spinner } from "@/components/ui/spinner";
import { offNewMessage, onNewMessage } from "@/socket/socket";
import type { Message } from "@/types/message";

export default function ChatDetailPage() {
  const [sending, setSending] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const { conversationId } = useParams<{ conversationId: string }>();

  const { currentConversation, conversations, messages, loading } = useSelector(
    (state: RootState) => state.messages,
  );
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ conversation
  useEffect(() => {
    if (!conversationId) return;

    if (conversations.length === 0) {
      dispatch(fetchConversations());
      return;
    }

    const found = conversations.find((c) => c._id === conversationId);

    if (found) {
      dispatch(setCurrentConversation(found));
    }
  }, [conversationId, conversations, dispatch]);

  // Listener events & fetch content
  useEffect(() => {
    if (!conversationId) return;

    dispatch(fetchMessages(conversationId));
    const handler = (message: Message) => {
      if (message.conversationId === conversationId) {
        dispatch(pushMessage(message));
      }
    };

    onNewMessage(handler);
    return () => offNewMessage(handler);
  }, [conversationId, dispatch]);

  useEffect(() => {
    dispatch(clearMessages());
  }, [conversationId, dispatch]);

  const otherUser = useMemo(() => {
    if (!currentConversation || !authUser) return null;
    return getOtherUser(currentConversation, authUser._id) ?? null;
  }, [currentConversation, authUser]);

  const handleSend = async () => {
    if (!content.trim() || !conversationId || !otherUser || sending) return;
    try {
      setSending(true);

      await dispatch(
        sendTextMessageThunk({
          conversationId,
          recipientId: otherUser._id,
          content,
        }),
      ).unwrap();
      setContent("");
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setSending(false);
    }
  };

  /* 3️⃣ Auto scroll xuống cuối */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentConversation || !otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        Đang tải cuộc trò chuyện...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white ml-36">
      {/* Header */}
      <div className="-mt-7 flex items-center gap-3 px-4 pb-3 border-b border-[#363636]">
        <Avatar
          src={otherUser?.profilePicture}
          name={otherUser?.username}
          size={44}
        />
        <p className="font-semibold">{otherUser?.username}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col justify-end min-h-full space-y-2">
          {loading && <Spinner />}

          {!loading &&
            messages.map((msg) => {
              const isMe = msg.senderId === authUser?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                    max-w-[70%] px-3 py-2 rounded-2xl text-[15px]
                    ${
                      isMe
                        ? "bg-[#4a5df9] rounded-br-md"
                        : "bg-gray-700 rounded-bl-md"
                    }
                  `}
                  >
                    {msg.messageType === "text" && msg.content}

                    {msg.messageType === "image" && (
                      <img
                        src={msg.imageUrl}
                        alt="image"
                        className="max-w-full rounded-lg"
                      />
                    )}
                  </div>
                </div>
              );
            })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 -mb-4">
        <div className="flex items-center gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="
              flex-1 bg-transparent border border-[#363636]
              rounded-full px-4 py-3 text-sm outline-none
            "
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            disabled={sending}
            onClick={handleSend}
            className="text-blue-500 font-semibold disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
