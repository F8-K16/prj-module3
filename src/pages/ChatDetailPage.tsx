import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchMessages,
  sendTextMessageThunk,
  setCurrentConversation,
  clearMessages,
} from "@/features/messageSlice";

import Avatar from "@/components/Avatar";
import { formatMessageTime, getMediaUrl, getOtherUser } from "@/utils/helper";
import { Spinner } from "@/components/ui/spinner";
import { Info, Phone, Video } from "lucide-react";
import { emitStopTyping, emitTyping } from "@/socket/socket";

export default function ChatDetailPage() {
  const [sending, setSending] = useState<boolean>(false);
  const [content, setContent] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { conversationId } = useParams<{ conversationId: string }>();

  const { currentConversation, conversations, messages, loading } = useSelector(
    (state: RootState) => state.messages,
  );
  const typingUsers = useSelector(
    (state: RootState) =>
      state.messages.typingUsers[currentConversation?._id || ""],
  );

  const authUser = useSelector((state: RootState) => state.auth.user);

  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  const typingTimeout = useRef<number | null>(null);

  // Đồng bộ conversation
  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const found = conversations.find((c) => c._id === conversationId);

    if (found) {
      dispatch(setCurrentConversation(found));
    }
  }, [conversationId, conversations, dispatch]);

  // Listener events & fetch content
  useEffect(() => {
    if (!conversationId) return;
    dispatch(fetchMessages(conversationId));
  }, [conversationId, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (currentConversation && otherUser?._id) {
        emitStopTyping({
          conversationId: currentConversation._id,
          recipientId: otherUser._id,
        });
      }
    };
  }, [currentConversation, otherUser]);

  /* 3️⃣ Auto scroll xuống cuối */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!currentConversation || !otherUser?._id) return;
    emitTyping({
      conversationId: currentConversation?._id,
      recipientId: otherUser?._id,
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      emitStopTyping({
        conversationId: currentConversation?._id,
        recipientId: otherUser?._id,
      });
    }, 1200);
  };

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
      <div className="flex -mt-7 items-center px-4 pb-3 border-b border-[#363636]">
        <Avatar
          src={otherUser?.profilePicture}
          name={otherUser?.username}
          size={44}
        />

        <div className="ml-3">
          <p className="font-semibold text-[#f5f5f5]">{otherUser?.fullName}</p>
          <p className="text-xs text-[#a8a8a8]">{otherUser?.username}</p>
        </div>
        <div className="flex items-center ml-auto gap-5">
          <Phone />
          <Video />
          <Info />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col justify-end min-h-full space-y-2">
          {loading && <Spinner />}

          {!loading &&
            messages.map((msg, index) => {
              const isMe =
                (typeof msg.senderId === "string"
                  ? msg.senderId
                  : msg.senderId._id) === authUser?._id;
              const prev = messages[index - 1];
              const shouldShowTime =
                !prev ||
                new Date(msg.createdAt).getTime() -
                  new Date(prev.createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <div key={msg._id}>
                  {shouldShowTime && (
                    <div className="text-center text-xs text-[#8a8d91] my-3">
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {typeof msg.senderId !== "string" && !isMe && (
                      <Avatar
                        src={getMediaUrl(msg.senderId.profilePicture)}
                        name={msg.senderId.username}
                        size={28}
                      />
                    )}

                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl text-[15px]
                    ${isMe ? "bg-[#4a5df9]" : "bg-[#25292e]"}
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
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            placeholder="Nhập tin nhắn..."
            className="
              flex-1 bg-transparent border border-[#363636]
              rounded-full px-4 py-3 text-sm outline-none
            "
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          {typingUsers?.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Đang nhập...</p>
          )}

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
