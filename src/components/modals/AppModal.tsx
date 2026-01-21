import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { closeModal } from "@/features/modalSlice";
import PostModal from "./PostModal";
import NewMessageModal from "./NewMessageModal";
import CreatePostModal from "./CreatePostModal";
import FollowerListModal from "./FollowerListModal";
import CommentOptionsModal from "./CommentOptionsModal";
import PostOptionsModal from "./PostOptionsModal";
import EditCommentModal from "./EditCommentModal";
import EditPostModal from "./EditPostModal";

export default function AppModal() {
  const dispatch = useDispatch();
  const { activeModal, postId, userId } = useSelector(
    (state: RootState) => state.modal,
  );

  return (
    <>
      <PostModal
        open={
          activeModal === "post" ||
          activeModal === "comment-options" ||
          activeModal === "post-options" ||
          activeModal === "edit-comment" ||
          activeModal === "edit-post"
        }
        postId={postId}
        onClose={() => dispatch(closeModal())}
      />

      <NewMessageModal
        open={activeModal === "new-message"}
        onClose={() => dispatch(closeModal())}
      />

      <CreatePostModal
        open={activeModal === "create"}
        onClose={() => dispatch(closeModal())}
      />

      <FollowerListModal
        open={activeModal === "followers"}
        userId={userId}
        type="followers"
        onClose={() => dispatch(closeModal())}
      />

      <FollowerListModal
        open={activeModal === "following"}
        userId={userId}
        type="following"
        onClose={() => dispatch(closeModal())}
      />

      <CommentOptionsModal />
      <PostOptionsModal />
      <EditCommentModal />
      <EditPostModal />
    </>
  );
}
