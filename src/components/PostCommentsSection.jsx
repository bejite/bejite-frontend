import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostActionIcon from "./feed/PostActionIcon";
import EmojiPickerButton from "./common/EmojiPickerButton";
import {
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
  updateComment,
} from "../services/postsApi";
import { getAuthorProfileImageUrl } from "../utils/profileImageUtils";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import DisplayNameWithBadge from "./DisplayNameWithBadge";
import FormattedPostBody from "./feed/FormattedPostBody";
import MentionComposerField from "./feed/MentionComposerField";

const getDisplayName = (user) => formatDisplayPersonName(user);

function CommentComposerBox({
  textareaRef,
  value,
  onValueChange,
  placeholder,
  autoFocus = false,
  maxHeightClass = "max-h-32",
  textSizeClass = "text-sm",
  submitLabel,
  submitAriaLabel,
  submitButtonClassName,
}) {
  const fallbackRef = React.useRef(null);
  const fieldRef = textareaRef || fallbackRef;
  const canSubmit = Boolean(value.trim());

  return (
    <>
      <div className="relative flex-1 min-w-0 border border-[#D3D3D3] rounded-2xl px-2 pt-1 focus-within:border-[#16730F]">
        <MentionComposerField
          ref={fieldRef}
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full min-w-0 min-h-[40px] ${maxHeightClass} overflow-y-auto px-2 py-1.5 pb-9 ${textSizeClass} leading-relaxed`}
        />
        <div className="absolute bottom-1 left-1 z-[2]">
          <EmojiPickerButton
            onEmojiSelect={(emoji) => {
              fieldRef.current?.insertText?.(emoji);
            }}
            buttonClassName="p-0.5"
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="sm:hidden absolute bottom-1 right-1 z-[2] inline-flex items-center justify-center p-0.5 disabled:opacity-40"
          aria-label={submitAriaLabel}
        >
          <img
            src="/assets/images/chat_send.svg"
            alt=""
            className="block w-7 h-7"
          />
        </button>
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className={`hidden sm:inline-flex bg-[#16730F] text-white rounded-full hover:bg-[#145a0c] disabled:opacity-50 mt-1 ${submitButtonClassName}`}
      >
        {submitLabel}
      </button>
    </>
  );
}

function collectDescendantCommentIds(commentId, allComments) {
  const ids = new Set([commentId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of allComments) {
      if (
        entry.parentCommentId &&
        ids.has(entry.parentCommentId) &&
        !ids.has(entry.id)
      ) {
        ids.add(entry.id);
        changed = true;
      }
    }
  }
  return ids;
}

function CommentEditForm({ value, onChange, onCancel, onSave, saving }) {
  const fieldRef = React.useRef(null);

  return (
    <form onSubmit={onSave} className="space-y-2">
      <MentionComposerField
        ref={fieldRef}
        value={value}
        onChange={onChange}
        autoFocus
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus-within:border-[#16730F] min-h-[64px]"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !value.trim()}
          className="px-3 py-1 rounded-full text-xs font-medium bg-[#16730F] text-white hover:bg-[#145a0c] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  currentUserPhotoUrl,
  currentUserId,
  replyingTo,
  replyText,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onLike,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onViewProfile,
  deletingCommentId,
  editingCommentId,
  savingCommentId,
  editDraft,
  onEditDraftChange,
  getReplies,
  getCommentById,
  depth = 0,
}) {
  const replies = getReplies(comment.id);
  const isReplying = replyingTo === comment.id;
  const isEditing = editingCommentId === comment.id;
  const isReply = depth > 0;
  const isOwner = String(comment.authorId) === String(currentUserId);
  const parentComment = isReply ? getCommentById(comment.parentCommentId) : null;
  const authorImage =
    String(comment.authorId) === String(currentUserId)
      ? currentUserPhotoUrl
      : getAuthorProfileImageUrl(comment.author);

  const goToAuthorProfile = () => {
    if (comment.authorId) onViewProfile(comment.authorId);
  };

  const goToParentProfile = () => {
    if (parentComment?.authorId) onViewProfile(parentComment.authorId);
  };

  return (
    <div>
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-2xl px-3 py-2 ${
            isReply
              ? "bg-white border border-gray-100 shadow-sm"
              : "bg-gray-50"
          }`}
        >
          {/* Avatar + name inside the card, above the comment */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={goToAuthorProfile}
              disabled={!comment.authorId}
              className="rounded-full shrink-0 disabled:cursor-default self-center"
              aria-label={`View ${getDisplayName(comment.author)}'s profile`}
            >
              <img
                src={authorImage}
                alt=""
                className={`rounded-full object-cover ${
                  isReply ? "w-6 h-6 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-8 sm:h-8"
                } ${comment.authorId ? "cursor-pointer hover:opacity-90" : ""}`}
              />
            </button>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={goToAuthorProfile}
                disabled={!comment.authorId}
                className="font-semibold text-sm text-[#16730F] hover:underline text-left disabled:cursor-default disabled:no-underline min-w-0 max-w-full"
              >
                <DisplayNameWithBadge user={comment.author} badgeSize="xs" />
              </button>
              {parentComment && depth > 1 && (
                <p className="text-xs text-gray-500">
                  replying to{" "}
                  <button
                    type="button"
                    onClick={goToParentProfile}
                    disabled={!parentComment.authorId}
                    className="font-medium text-[#16730F] hover:underline disabled:cursor-default disabled:no-underline inline-flex items-center gap-1"
                  >
                    <DisplayNameWithBadge
                      user={parentComment.author}
                      badgeSize="xs"
                    />
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="text-sm break-words text-gray-800 mt-1.5 whitespace-pre-wrap">
            {isEditing ? (
              <CommentEditForm
                value={editDraft}
                onChange={onEditDraftChange}
                onCancel={onCancelEdit}
                onSave={(e) => onSaveEdit(e, comment)}
                saving={savingCommentId === comment.id}
              />
            ) : (
              <FormattedPostBody
                body={comment.body}
                className="text-sm text-gray-800 whitespace-pre-wrap break-words"
              />
            )}
          </div>
        </div>

        <div className="flex flex-row justify-start items-center gap-3 sm:gap-3 mt-1 px-1">
          <button
            type="button"
            onClick={() => onLike(comment)}
            className={`flex items-center gap-1 sm:gap-1.5 text-xs font-medium transition-colors ${
              comment.likedByMe
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
            aria-label={comment.likedByMe ? "Unlike comment" : "Like comment"}
          >
            <PostActionIcon
              type="like"
              active={comment.likedByMe}
              compact
            />
            <span className="text-xs tabular-nums sm:hidden">
              {comment.likesCount || 0}
            </span>
            <span className="hidden sm:inline">
              {comment.likesCount > 0 && (
                <span className="tabular-nums mr-1">{comment.likesCount}</span>
              )}
              {comment.likedByMe ? "Liked" : "Like"}
            </span>
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={() =>
                isReplying ? onCancelReply() : onStartReply(comment.id)
              }
              className="text-xs font-medium text-gray-500 hover:text-[#16730F] transition-colors"
              aria-label={isReplying ? "Cancel reply" : "Reply to comment"}
            >
              Reply
            </button>
          )}
          {isOwner && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => onEdit(comment)}
                className="text-xs font-medium text-gray-500 hover:text-[#16730F] transition-colors"
                aria-label="Edit comment"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(comment)}
                disabled={deletingCommentId === comment.id}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                aria-label={
                  deletingCommentId === comment.id
                    ? "Deleting comment"
                    : "Delete comment"
                }
              >
                <PostActionIcon
                  type="delete"
                  compact
                  active={deletingCommentId === comment.id}
                />
                <span className="hidden sm:inline">
                  {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                </span>
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <form
            onSubmit={(e) => onSubmitReply(e, comment.id)}
            className="flex gap-2 mt-2 items-start"
          >
            <img
              src={currentUserPhotoUrl}
              alt=""
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 mt-1"
            />
            <CommentComposerBox
              value={replyText}
              onValueChange={onReplyTextChange}
              placeholder={`Reply to ${getDisplayName(comment.author)}...`}
              autoFocus
              maxHeightClass="max-h-28"
              textSizeClass="text-xs sm:text-sm"
              submitLabel="Reply"
              submitAriaLabel={`Reply to ${getDisplayName(comment.author)}`}
              submitButtonClassName="px-3 py-1.5 text-xs"
            />
          </form>
        )}
      </div>

      {replies.length > 0 && (
        <div
          className={
            depth === 0
              ? "mt-3 ml-4 sm:ml-5 pl-3 sm:pl-4 border-l-2 border-gray-200 space-y-3"
              : "mt-3 space-y-3"
          }
        >
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserPhotoUrl={currentUserPhotoUrl}
              currentUserId={currentUserId}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              onLike={onLike}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              onViewProfile={onViewProfile}
              deletingCommentId={deletingCommentId}
              editingCommentId={editingCommentId}
              savingCommentId={savingCommentId}
              editDraft={editDraft}
              onEditDraftChange={onEditDraftChange}
              getReplies={getReplies}
              getCommentById={getCommentById}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostCommentsSection({
  postId,
  comments,
  setComments,
  loading,
  onReload,
  onCommentCountChange,
  currentUserPhotoUrl,
  currentUserId,
  inputRef = null,
  sectionRef = null,
}) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingCommentId, setSavingCommentId] = useState(null);

  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentCommentId === parentId);
  const getCommentById = (commentId) =>
    comments.find((c) => c.id === commentId);

  const handleViewProfile = (authorId) => {
    if (authorId) navigate(`/user-profile/${authorId}`);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const data = await addComment(postId, newComment);
      setNewComment("");
      if (data?.comment) {
        setComments((prev) => [data.comment, ...prev]);
        onCommentCountChange?.(1);
      } else {
        await onReload();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const data = await addComment(postId, replyText, parentCommentId);
      setReplyText("");
      setReplyingTo(null);
      if (data?.comment) {
        setComments((prev) => [data.comment, ...prev]);
        onCommentCountChange?.(1);
      } else {
        await onReload();
      }
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const handleLike = async (comment) => {
    const wasLiked = comment.likedByMe === true;
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              likedByMe: !wasLiked,
              likesCount: Math.max(0, (c.likesCount || 0) + (wasLiked ? -1 : 1)),
            }
          : c,
      ),
    );
    try {
      if (wasLiked) {
        await unlikeComment(postId, comment.id);
      } else {
        await likeComment(postId, comment.id);
      }
    } catch (err) {
      console.error("Error toggling comment like:", err);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                likedByMe: wasLiked,
                likesCount: comment.likesCount || 0,
              }
            : c,
        ),
      );
    }
  };

  const handleEdit = (comment) => {
    setReplyingTo(null);
    setReplyText("");
    setEditingCommentId(comment.id);
    setEditDraft(comment.body || "");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditDraft("");
  };

  const handleSaveEdit = async (e, comment) => {
    e.preventDefault();
    const trimmed = editDraft.trim();
    if (!trimmed || savingCommentId) return;

    setSavingCommentId(comment.id);
    setComments((prev) =>
      prev.map((entry) =>
        entry.id === comment.id ? { ...entry, body: trimmed } : entry,
      ),
    );

    try {
      const data = await updateComment(postId, comment.id, trimmed);
      if (data?.comment) {
        setComments((prev) =>
          prev.map((entry) =>
            entry.id === comment.id ? { ...entry, ...data.comment } : entry,
          ),
        );
      }
      setEditingCommentId(null);
      setEditDraft("");
    } catch (err) {
      console.error("Error updating comment:", err);
      setComments((prev) =>
        prev.map((entry) =>
          entry.id === comment.id ? { ...entry, body: comment.body } : entry,
        ),
      );
      await onReload();
    } finally {
      setSavingCommentId(null);
    }
  };

  const handleDelete = async (comment) => {
    if (deletingCommentId) return;

    const idsToRemove = collectDescendantCommentIds(comment.id, comments);
    const confirmed = window.confirm(
      idsToRemove.size > 1
        ? "Delete this comment and its replies?"
        : "Delete this comment?",
    );
    if (!confirmed) return;

    setDeletingCommentId(comment.id);

    if (replyingTo && idsToRemove.has(replyingTo)) {
      setReplyingTo(null);
      setReplyText("");
    }
    if (editingCommentId && idsToRemove.has(editingCommentId)) {
      setEditingCommentId(null);
      setEditDraft("");
    }

    setComments((prev) => prev.filter((entry) => !idsToRemove.has(entry.id)));
    onCommentCountChange?.(-idsToRemove.size);

    try {
      await deleteComment(postId, comment.id);
    } catch (err) {
      console.error("Error deleting comment:", err);
      await onReload();
      onCommentCountChange?.(idsToRemove.size);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div ref={sectionRef} className="border-t border-[#A9A9A9] pt-4 mt-4">
      <form
        onSubmit={handleAddComment}
        className="flex gap-2 mb-4 items-start"
      >
        {currentUserPhotoUrl && (
          <img
            src={currentUserPhotoUrl}
            alt="Your profile"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mt-1"
          />
        )}
        <CommentComposerBox
          textareaRef={inputRef}
          value={newComment}
          onValueChange={setNewComment}
          placeholder="Write a comment..."
          submitLabel="Post"
          submitAriaLabel="Post comment"
          submitButtonClassName="px-4 py-2 text-sm"
        />
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : topLevelComments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserPhotoUrl={currentUserPhotoUrl}
              currentUserId={currentUserId}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onStartReply={setReplyingTo}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              onSubmitReply={handleSubmitReply}
              onLike={handleLike}
              onEdit={handleEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDelete}
              onViewProfile={handleViewProfile}
              deletingCommentId={deletingCommentId}
              editingCommentId={editingCommentId}
              savingCommentId={savingCommentId}
              editDraft={editDraft}
              onEditDraftChange={setEditDraft}
              getReplies={getReplies}
              getCommentById={getCommentById}
            />
          ))}
        </div>
      )}
    </div>
  );
}
