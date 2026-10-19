import React, { memo } from 'react';
import {
  getAttachmentType,
  getDocumentFilename,
  isVoiceMessageCaption,
} from '../../utils/chatAttachmentUtils';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { CertificateViewLink } from '../CertificateViewerModal';

function MessageAttachment({
  url,
  caption,
  kind,
  filename,
  mime,
  messageId,
  isOwnMessage = false,
}) {
  const meta = { kind, name: filename, mime };
  const type = isVoiceMessageCaption(caption)
    ? 'audio'
    : getAttachmentType(url, caption, meta);
  const displayName = getDocumentFilename(caption, url, filename);

  if (type === 'video') {
    return (
      <video
        src={url}
        controls
        className="mb-2 w-full max-w-xs rounded-lg max-h-48 bg-black"
        onClick={(event) => event.stopPropagation()}
      />
    );
  }

  if (type === 'audio') {
    return <VoiceMessagePlayer url={url} isOwnMessage={isOwnMessage} />;
  }

  if (type === 'document') {
    const cardClass = `w-full max-w-xs text-left rounded-xl px-3 py-2.5 border ${
      isOwnMessage
        ? 'bg-white/10 border-white/20 hover:bg-white/15'
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`;
    const titleClass = `text-sm font-semibold truncate ${isOwnMessage ? 'text-white' : 'text-[#1A3E32]'}`;
    const hintClass = `text-[11px] mt-0.5 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`;

    return (
      <div className="mb-2" onClick={(event) => event.stopPropagation()}>
        <CertificateViewLink
          fileUrl={url}
          fetchUrl={messageId ? `/messages/${messageId}/attachment` : undefined}
          title={displayName}
          overlayClassName="z-[10000]"
          className={cardClass}
        >
          <p className={titleClass}>{displayName}</p>
          <p className={hintClass}>Tap to view</p>
        </CertificateViewLink>
      </div>
    );
  }

  return (
    <div className="mb-2" onClick={(event) => event.stopPropagation()}>
      <CertificateViewLink
        fileUrl={url}
        fetchUrl={messageId ? `/messages/${messageId}/attachment` : undefined}
        title={
          displayName && displayName !== 'Document' ? displayName : 'Photo'
        }
        overlayClassName="z-[10000]"
        className="block w-full max-w-xs text-left p-0 border-0 bg-transparent cursor-zoom-in rounded-lg"
      >
        <img
          src={url}
          alt={caption || 'Photo'}
          className="w-full max-w-xs rounded-lg max-h-48 object-cover pointer-events-none"
        />
      </CertificateViewLink>
    </div>
  );
}

export default memo(MessageAttachment);
