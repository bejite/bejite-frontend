import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../utils/axiosInstance';
import {
  documentViewUrl,
  getDocumentDownloadFilename,
  getDocumentMediaKind,
  triggerDocumentDownload,
} from '../utils/documentViewUrl';

function parseFilenameFromDisposition(disposition) {
  if (!disposition) return null;
  const match = String(disposition).match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  return match ? decodeURIComponent(match[1].replace(/"/g, '')) : null;
}

function mediaKindFromBlob(blob, fileUrl) {
  const type = String(blob?.type || '');
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  return getDocumentMediaKind(fileUrl);
}

function CertificateViewerModalContent({
  onClose,
  fileUrl,
  title,
  fetchUrl,
  overlayClassName = 'z-[100]',
}) {
  const directUrl = documentViewUrl(fileUrl) || '';
  const [blobUrl, setBlobUrl] = useState(null);
  const [blobKind, setBlobKind] = useState(null);
  const [blobContentType, setBlobContentType] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [loading, setLoading] = useState(Boolean(fetchUrl));
  const [loadError, setLoadError] = useState(false);
  const resolvedUrl = fetchUrl ? blobUrl || '' : directUrl;
  const kind = blobKind || getDocumentMediaKind(fileUrl, directUrl);

  const filename = useMemo(
    () =>
      downloadFilename ||
      getDocumentDownloadFilename(fileUrl, blobContentType),
    [downloadFilename, fileUrl, blobContentType],
  );

  useEffect(() => {
    if (!fetchUrl) return undefined;

    let active = true;
    let objectUrl = null;

    (async () => {
      try {
        const response = await axiosInstance.get(fetchUrl, {
          responseType: 'blob',
        });
        if (!active) return;

        const blob = response.data;
        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error('Empty document response');
        }
        if (blob.type === 'application/json') {
          throw new Error('Document fetch failed');
        }

        const contentType = blob.type || response.headers?.['content-type'] || '';
        const disposition = response.headers?.['content-disposition'];
        const resolvedKind = mediaKindFromBlob(blob, fileUrl);

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setBlobKind(resolvedKind);
        setBlobContentType(contentType);
        setDownloadFilename(
          parseFilenameFromDisposition(disposition) ||
            getDocumentDownloadFilename(fileUrl, contentType),
        );
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fetchUrl, fileUrl]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (fetchUrl && loading && !resolvedUrl) {
    return createPortal(
      <div
        className={`fixed inset-0 ${overlayClassName} bg-black/85 flex items-center justify-center p-4`}
        onClick={onClose}
      >
        <p className="text-white text-sm">Loading document...</p>
      </div>,
      document.body,
    );
  }

  if (!resolvedUrl && kind !== 'pdf') return null;

  const showImagePreview = kind === 'image';
  const showPdfDownload = kind === 'pdf' || kind === 'unknown';

  return createPortal(
    <div
      className={`fixed inset-0 ${overlayClassName} bg-black/85 flex items-center justify-center p-4`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Document preview'}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <p className="text-white text-center mb-3 text-sm font-medium truncate px-10">
            {title}
          </p>
        ) : null}

        <div className="flex-1 overflow-auto nfl-scroll rounded-lg flex flex-col items-center justify-center min-h-[240px] bg-black/30">
          {loadError ? (
            <div className="text-white text-center p-8">
              <p className="mb-4 text-sm">Could not load this document.</p>
              {!fetchUrl && directUrl ? (
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9AE6B0] underline text-sm"
                >
                  Try opening in new tab
                </a>
              ) : null}
            </div>
          ) : showImagePreview ? (
            <div className="flex flex-col items-center gap-4 p-3">
              <img
                src={resolvedUrl}
                alt={title || 'Photo'}
                className="max-w-full max-h-[72vh] object-contain rounded-lg"
                onError={() => setLoadError(true)}
              />
              <button
                type="button"
                disabled={!resolvedUrl}
                onClick={() => {
                  if (resolvedUrl) {
                    triggerDocumentDownload(resolvedUrl, filename || 'photo.jpg');
                  }
                }}
                className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D] disabled:opacity-50"
              >
                Download
              </button>
            </div>
          ) : showPdfDownload ? (
            <div className="text-white text-center p-8 space-y-4">
              <div className="w-16 h-20 mx-auto bg-white rounded-lg flex items-end justify-center pb-2 shadow-lg">
                <span className="text-red-600 font-bold text-xs tracking-wide">PDF</span>
              </div>
              <p className="text-sm text-white/90 max-w-sm mx-auto">
                PDF documents are downloaded for viewing on your device.
              </p>
              <button
                type="button"
                disabled={!resolvedUrl}
                onClick={() => {
                  if (resolvedUrl) triggerDocumentDownload(resolvedUrl, filename);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D] disabled:opacity-50"
              >
                Download PDF
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Close document viewer"
          className="absolute top-0 right-0 text-white text-2xl bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function CertificateViewerModal({
  open,
  onClose,
  fileUrl,
  title,
  fetchUrl,
  overlayClassName,
}) {
  if (!open) return null;

  return (
    <CertificateViewerModalContent
      onClose={onClose}
      fileUrl={fileUrl}
      title={title}
      fetchUrl={fetchUrl}
      overlayClassName={overlayClassName}
    />
  );
}

/**
 * Opens images in a preview modal; PDFs show a download prompt.
 */
export function CertificateViewLink({
  fileUrl,
  title,
  className = '',
  children = 'View certificate',
  fetchUrl,
  overlayClassName,
}) {
  const [open, setOpen] = useState(false);
  const kind = getDocumentMediaKind(fileUrl);
  const resolvedUrl = documentViewUrl(fileUrl) || fetchUrl || '';

  if (!resolvedUrl && !fetchUrl) return null;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {children || (kind === 'pdf' ? 'Download document' : 'View document')}
      </button>
      <CertificateViewerModal
        open={open}
        onClose={() => setOpen(false)}
        fileUrl={fileUrl}
        title={title}
        fetchUrl={fetchUrl}
        overlayClassName={overlayClassName}
      />
    </>
  );
}
