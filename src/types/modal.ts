type ModalType =
  | "post"
  | "search"
  | "new-message"
  | "create"
  | "followers"
  | "following"
  | "comment-options"
  | "post-options"
  | "edit-comment"
  | "edit-post"
  | "chat-list"
  | "chat-mini";

export type ModalState = {
  activeModal: ModalType | null;
  postId: string | null;
  userId: string | null;

  commentId?: string | null;
  commentOwnerId?: string | null;
  ownerId?: string | null;
  parentModal?: ModalType | null;
  conversationId?: string | null;
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export interface PostModalProps extends ModalProps {
  postId: string | null;
}
