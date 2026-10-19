import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { resolveDocumentForView } from '../../utils/chatAttachmentUtils';

export default function ChatDocumentViewer({ url, filename, onClose }) {
  const [src, setSrc] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    (async () => {
      try {
        const result = await resolveDocumentForView(url);
        objectUrl = result.blobUrl;
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setIsPdf(result.isPdf);
        setSrc(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not open this file');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const title = filename || 'Document';
  const downloadName = title.includes('.') ? title : (isPdf ? `${title}.pdf` : title);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/70 flex flex-col"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 bg-[#1A3E32] text-white shrink-0"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-medium truncate min-w-0">{title}</p>
        <div className="flex items-center gap-2 shrink-0">
          {src && (
            <a
              href={src}
              download={downloadName}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25"
            >
              Download
            </a>
          )}
          <button
            type="button"
            aria-label="Close document viewer"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15"
          >
            <FaTimes />
          </button>
        </div>
      </div>
      <div
        className="flex-1 min-h-0 bg-[#111] flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        {loading && (
          <p className="text-white/80 text-sm">Opening file...</p>
        )}
        {error && (
          <div className="text-center px-4">
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white underline"
            >
              Open original file
            </a>
          </div>
        )}
        {src && !error && isPdf && (
          <iframe
            title={title}
            src={src}
            className="w-full h-full border-0 bg-white"
          />
        )}
        {src && !error && !isPdf && (
          <div className="text-center px-4">
            <p className="text-white/80 text-sm">
              This file is not a PDF, so it cannot be previewed here.
            </p>
            <a
              href={src}
              download={downloadName}
              className="text-sm text-white underline"
            >
              Download file
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
