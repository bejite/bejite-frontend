/** Preview text for conversation list (left sidebar). */
export function formatConversationPreview(conversation) {
  const text =
    conversation?.lastMessage?.trim() ||
    conversation?.last_message?.trim() ||
    '';
  if (text) return text;

  if (conversation?.hasAttachment || conversation?.has_attachment) {
    return 'Attachment';
  }

  return 'No messages yet';
}
