import React from 'react';
import {
  FaTimes,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaTelegramPlane,
  FaLink,
} from 'react-icons/fa';
import { isMobileDevice } from '../utils/postShare';

const OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, bg: 'bg-green-100', color: 'text-green-600' },
  { id: 'facebook', label: 'Facebook', icon: FaFacebookF, bg: 'bg-blue-100', color: 'text-blue-600' },
  { id: 'x', label: 'X', icon: FaTwitter, bg: 'bg-gray-200', color: 'text-black' },
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, bg: 'bg-blue-100', color: 'text-blue-700' },
  { id: 'telegram', label: 'Telegram', icon: FaTelegramPlane, bg: 'bg-sky-100', color: 'text-sky-500' },
  { id: 'copy', label: 'Copy link', icon: FaLink, bg: 'bg-[#E8F5E6]', color: 'text-[#16730F]' },
];

const optionClassName =
  'flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-300 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-[#16730F] hover:bg-[#F5F9F4]';

const SharePostModal = ({
  isOpen,
  onClose,
  onShare,
  getPlatformHref,
  title = 'Share post',
}) => {
  if (!isOpen) return null;

  const mobile = isMobileDevice();

  const stopParentDismiss = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      data-share-modal
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4 share-backdrop-enter"
      onClick={onClose}
      onMouseDown={stopParentDismiss}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl share-sheet-enter"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={stopParentDismiss}
      >
        <div className="pt-3 sm:hidden">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between border-b border-[#D9D9D9] px-5 py-4">
          <h3 className="text-lg font-semibold text-[#1A3E32]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close share modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="px-5 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Share via</p>
        </div>

        <div className="grid grid-cols-3 gap-4 p-5 pt-3 pb-7 sm:pb-5">
          {OPTIONS.map(({ id, label, icon, color, bg }) => {
            const href = getPlatformHref?.(id);
            const content = (
              <>
                <span className={`flex h-11 w-11 items-center justify-center rounded-full ${bg}`}>
                  {React.createElement(icon, { className: `text-xl ${color}` })}
                </span>
                <span className="text-xs font-medium text-[#1A3E32]">{label}</span>
              </>
            );

            if (href) {
              return (
                <a
                  key={id}
                  href={href}
                  {...(mobile ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  onMouseDown={stopParentDismiss}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                  }}
                  className={optionClassName}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={id}
                type="button"
                onMouseDown={stopParentDismiss}
                onClick={() => onShare(id)}
                className={optionClassName}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
