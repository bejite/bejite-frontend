import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaTimes,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaTelegramPlane,
  FaLink,
  FaEnvelope,
  FaShareAlt,
} from 'react-icons/fa';
import {
  buildInviteMessage,
  buildInviteUrl,
  canUseNativeShare,
  shareInvite,
} from '../utils/inviteShare';

const BASE_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, bg: 'bg-green-100', color: 'text-green-600' },
  { id: 'email', label: 'Email', icon: FaEnvelope, bg: 'bg-amber-100', color: 'text-amber-700' },
  { id: 'facebook', label: 'Facebook', icon: FaFacebookF, bg: 'bg-blue-100', color: 'text-blue-600' },
  { id: 'x', label: 'X', icon: FaTwitter, bg: 'bg-gray-200', color: 'text-black' },
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, bg: 'bg-blue-100', color: 'text-blue-700' },
  { id: 'telegram', label: 'Telegram', icon: FaTelegramPlane, bg: 'bg-sky-100', color: 'text-sky-500' },
  { id: 'copy', label: 'Copy', icon: FaLink, bg: 'bg-[#E8F5E6]', color: 'text-[#16730F]' },
];

const NATIVE_OPTION = {
  id: 'native',
  label: 'More',
  icon: FaShareAlt,
  bg: 'bg-purple-100',
  color: 'text-purple-600',
};

const InviteFriendsModal = ({ isOpen, onClose, user }) => {
  const inviteUrl = useMemo(() => buildInviteUrl(user?.id), [user?.id]);
  const defaultMessage = useMemo(() => buildInviteMessage(user), [user]);
  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMessage(defaultMessage);
    }
  }

  const options = useMemo(() => {
    if (canUseNativeShare()) {
      return [...BASE_OPTIONS, NATIVE_OPTION];
    }
    return BASE_OPTIONS;
  }, []);

  const handleShare = async (platform) => {
    await shareInvite(platform, { message, url: inviteUrl });
    if (platform !== 'native') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 py-4 sm:py-8 share-backdrop-enter"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl share-sheet-enter max-h-full sm:max-h-[min(90vh,calc(100vh-4rem))] overflow-y-auto nfl-scroll scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#D9D9D9] px-5 py-4">
          <h3 className="text-lg font-semibold text-[#1A3E32]">Invite Friends</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close invite modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="invite-message" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Your message
            </label>
            <textarea
              id="invite-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1A3E32] outline-none focus:border-[#16730F]"
              placeholder="Write a personal invite message..."
            />
          </div>

          <div className="rounded-xl bg-[#F5F9F4] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invite link</p>
            <p className="mt-1 break-all text-sm text-[#16730F]">{inviteUrl}</p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Share via</p>
            <div className="grid grid-cols-3 gap-3 pb-2 sm:pb-0">
              {options.map(({ id, label, icon: Icon, color, bg }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleShare(id)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-300 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-[#16730F] hover:bg-[#F5F9F4]"
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`text-xl ${color}`} />
                  </span>
                  <span className="text-xs font-medium text-[#1A3E32]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default InviteFriendsModal;
