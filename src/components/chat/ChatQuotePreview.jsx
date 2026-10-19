import { getQuotePreviewText, getQuoteSenderName } from '../../utils/chatQuote';

export default function ChatQuotePreview({
  quote,
  isOwnMessage = false,
  onClick,
  onDismiss,
  clickable = false,
}) {
  if (!quote?.id) return null;

  const senderName = getQuoteSenderName(quote);
  const preview = getQuotePreviewText(quote);
  const canActivate = clickable && typeof onClick === 'function';

  const handleActivate = (event) => {
    if (!canActivate) return;
    event.stopPropagation();
    onClick(quote.id);
  };

  const palette = isOwnMessage
    ? 'bg-white/15 border-white/80'
    : 'bg-black/[0.04] border-[#16730F]';
  const nameClass = isOwnMessage ? 'text-white' : 'text-[#16730F]';
  const previewClass = isOwnMessage ? 'text-white/80' : 'text-gray-600';
  const shellClass = `block w-full max-w-full min-w-0 rounded-lg border-l-4 px-2.5 py-1.5 text-left ${
    onDismiss ? 'mb-1.5' : 'mb-2'
  } ${palette} ${canActivate ? 'cursor-pointer' : ''}`;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[11px] font-semibold truncate ${nameClass}`}>
          {senderName}
        </p>
        {typeof onDismiss === 'function' && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
            className={`shrink-0 text-xs leading-none px-1 ${
              isOwnMessage ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
            aria-label="Cancel reply"
          >
            ✕
          </button>
        )}
      </div>
      {preview ? (
        <p className={`text-xs truncate ${previewClass}`}>{preview}</p>
      ) : null}
    </>
  );

  if (canActivate) {
    return (
      <div
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate(event);
          }
        }}
        className={shellClass}
      >
        {body}
      </div>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
