/** Shared window events so NewsFeedHeader badge counts refresh immediately. */

export const NOTIFICATIONS_UNREAD_UPDATED = "notifications:unread-updated";
export const CHAT_CONVERSATION_UPDATED = "chat:conversation-updated";

export function notifyNotificationsUnreadUpdated(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UNREAD_UPDATED, { detail }),
  );
}

export function notifyChatConversationUpdated(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CHAT_CONVERSATION_UPDATED, { detail }),
  );
}
