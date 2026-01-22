import {
  clearMessages,
  fetchMessages,
  markMessageAsReadThunk,
  pushOptimisticMessage,
  sendImageMessageThunk,
  sendTextMessageThunk,
  setCurrentConversation,
  updateMessageStatus,
} from "@/features/messageSlice";
import { emitStopTyping, emitTyping } from "@/socket/socket";
import type { AppDispatch, RootState } from "@/store/store";
import { formatMessageTime, getMediaUrl, getOtherUser } from "@/utils/helper";
import { ChevronLeft, Info, Phone, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { nanoid } from "zod";
import Avatar from "../Avatar";
import { Spinner } from "../ui/spinner";
import { backToChatList } from "@/features/modalSlice";

type ChatWindowProps = {
  variant?: "page" | "modal";
};

export default function ChatWindow({ variant = "page" }: ChatWindowProps) {
  const [sending, setSending] = useState<boolean>(false);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { conversationId: paramConversationId } = useParams<{
    conversationId: string;
  }>();
  const modalConversationId = useSelector(
    (state: RootState) => state.modal.conversationId,
  );

  const conversationId =
    variant === "modal" ? modalConversationId : paramConversationId;

  const { currentConversation, conversations, messages, messagesLoading } =
    useSelector((state: RootState) => state.messages);
  const typingUsers = useSelector(
    (state: RootState) =>
      state.messages.typingUsers[currentConversation?._id || ""],
  );

  const authUser = useSelector((state: RootState) => state.auth.user);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const otherUser = useMemo(() => {
    if (!currentConversation || !authUser) return null;
    return getOtherUser(currentConversation, authUser._id) ?? null;
  }, [currentConversation, authUser]);

  // ================= SEND =================
  const handleSend = async () => {
    if (!conversationId || !otherUser || sending) return;

    try {
      setSending(true);

      if (selectedImage) {
        const optimisticId = `optimistic_${nanoid()}`;
        dispatch(
          pushOptimisticMessage({
            _id: optimisticId,
            conversationId,
            senderId: authUser!,
            recipientId: otherUser._id,
            messageType: "image",
            content: "",
            imageUrl: imagePreview!,
            isRead: true,
            createdAt: new Date().toISOString(),
            optimistic: true,
            status: "sending",
          }),
        );

        setSelectedImage(null);
        setImagePreview(null);
        try {
          await dispatch(
            sendImageMessageThunk({
              conversationId,
              recipientId: otherUser._id,
              image: selectedImage,
            }),
          ).unwrap();
        } catch {
          dispatch(
            updateMessageStatus({
              id: optimisticId,
              status: "failed",
            }),
          );
        }
        return;
      }

      if (!content.trim()) return;

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

  const handleSelectImage = (file?: File) => {
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ================= TYPING =================
  const typingTimeout = useRef<number | null>(null);

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

  // ================= EFFECTS =================
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

  useEffect(() => {
    if (!messages.length || !authUser) return;

    messages.forEach((msg) => {
      if (msg.optimistic) return;

      const senderId =
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;

      if (!msg.isRead && senderId !== authUser._id) {
        dispatch(markMessageAsReadThunk(msg._id));
      }
    });
  }, [messages, authUser, dispatch]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= GUARD =================
  if (!currentConversation || !otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        Đang tải cuộc trò chuyện...
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full text-white ${variant === "page" ? "ml-36" : ""}`}
    >
      {/* Header */}
      <div
        className={`flex items-center px-4  border-b border-[#363636] ${variant === "page" ? "-mt-7 pb-3" : "pb-3 pt-7 shrink-0"} `}
      >
        {variant === "modal" && (
          <button
            onClick={() => dispatch(backToChatList())}
            className="-ml-2 mr-2 cursor-pointer hover:opacity-70"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <Link to={`/user/${otherUser._id}`}>
          {variant === "page" ? (
            <Avatar
              src={otherUser?.profilePicture}
              name={otherUser?.username}
              size={44}
            />
          ) : (
            <Avatar
              src={otherUser?.profilePicture}
              name={otherUser?.username}
              size={32}
            />
          )}
        </Link>

        <div className="ml-3">
          <p className="font-semibold text-[#f5f5f5]">{otherUser?.fullName}</p>
          {variant === "page" && (
            <p className="text-xs text-[#a8a8a8]">{otherUser?.username}</p>
          )}
        </div>
        {variant === "page" && (
          <div className="flex items-center ml-auto gap-5">
            <Phone />
            <Video />
            <Info />
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4  [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:rounded-full
        dark:[&::-webkit-scrollbar-track]:bg-[#2c2c2c]
        dark:[&::-webkit-scrollbar-thumb]:bg-[#9f9f9f]"
      >
        <div className="flex flex-col justify-end min-h-full space-y-2">
          {messagesLoading && (
            <div className="mx-auto">
              <Spinner />
            </div>
          )}

          {!messagesLoading &&
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
                      className={`text-[15px] rounded-2xl ${msg.messageType === "text" && `px-3 py-2`} 
                    ${isMe ? "bg-[#4a5df9]" : "bg-[#25292e]"}
                  `}
                    >
                      {msg.messageType === "text" && msg.content}

                      {msg.messageType === "image" && (
                        <div className="relative">
                          <img
                            src={getMediaUrl(msg.imageUrl)}
                            className={`rounded-2xl ${variant === "page" ? "max-w-65" : "max-w-42"} ${
                              msg.status === "sending" ? "opacity-60" : ""
                            }`}
                          />

                          {msg.status === "sending" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Spinner />
                            </div>
                          )}

                          {msg.status === "failed" && (
                            <p className="text-xs text-red-400 mt-1">
                              Gửi thất bại
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          <div
            className={`flex items-center gap-4 m-0 ${variant === "page" ? "h-10" : "h-5"}`}
          >
            {typingUsers?.length > 0 && (
              <>
                <Avatar
                  src={getMediaUrl(otherUser.profilePicture)}
                  name={otherUser.username}
                  size={28}
                />
                <div className="flex gap-1 text-lg">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-150">.</span>
                  <span className="animate-bounce delay-300">.</span>
                </div>
              </>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-3 -mb-4">
        <div className="flex items-end gap-3">
          {/* Upload image */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleSelectImage(e.target.files?.[0])}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-1"
          >
            <img src="/icons/picture.svg" alt="" className="w-7 h-7" />
          </button>

          {/* Input wrapper */}
          <div className="flex-1 border border-[#363636] rounded-2xl px-3 py-2 bg-transparent">
            {/* Image preview */}
            {imagePreview && (
              <div
                className={`relative my-2 ${variant === "page" ? "w-32" : "w-18"}`}
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  className="rounded-xl w-full object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black/70 text-white text-xs rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Text input + send */}
            <div className="flex items-center">
              <input
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleTyping();
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent text-sm outline-none px-1"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <button
                disabled={sending || (!content.trim() && !selectedImage)}
                onClick={handleSend}
                className="ml-3 text-blue-500 font-semibold disabled:opacity-40"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
