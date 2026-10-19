import { getAttachmentType, getDocumentFilename, isVoiceMessageCaption } from './chatAttachmentUtils';
import { formatDisplayPersonName } from './personDisplayName';

export function toQuotePreview(message) {
  if (!message?.id) return null;
  const firstName = message.firstName ?? message.first_name;
  const lastName = message.lastName ?? message.last_name;
  return {
    id: message.id,
    content: message.content || '',
    sender_id: message.sender_id,
    firstName,
    lastName,
    senderName: formatDisplayPersonName({ firstName, lastName }, 'User'),
    is_deleted: Boolean(message.is_deleted),
    image_url: message.image_url || null,
    attachment_kind: message.attachment_kind || null,
    attachment_name: message.attachment_name || null,
  };
}

export function getQuotedMessage(message) {
  if (message?.reply_to?.id) return message.reply_to;
  return null;
}

export function getQuoteSenderName(quote, fallback = 'User') {
  if (!quote) return fallback;
  const stored = String(quote.senderName || '').trim();
  if (stored) return stored;
  return formatDisplayPersonName(
    {
      firstName: quote.firstName ?? quote.first_name,
      lastName: quote.lastName ?? quote.last_name,
    },
    fallback,
  );
}

export function getQuotePreviewText(quote) {
  if (!quote) return '';
  if (quote.is_deleted) return 'Message deleted';

  const kind =
    quote.attachment_kind ||
    getAttachmentType(quote.image_url, quote.content, {
      kind: quote.attachment_kind,
      name: quote.attachment_name,
    });

  if (kind === 'video') return 'Video';
  if (kind === 'audio' || isVoiceMessageCaption(quote.content)) return 'Voice message';
  if (kind === 'document') {
    return getDocumentFilename(quote.content, quote.image_url, quote.attachment_name);
  }
  if (kind === 'image' && quote.image_url) return 'Photo';

  const text = String(quote.content || '').replace(/\s+/g, ' ').trim();
  if (text) return text;
  if (quote.image_url) return 'Photo';
  return '';
}
