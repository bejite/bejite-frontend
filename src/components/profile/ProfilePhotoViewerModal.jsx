import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Executive Glassmorphism Photo Viewer Modal
 * Renders full-resolution profile photo with ambient backdrop blur,
 *Escape key listener, and click-outside dismissal.
 */
const ProfilePhotoViewerModal = ({ isOpen, onClose, photoSrc, alt = "Profile photo" }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-[95vw] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-slate-900">
          <img
            src={photoSrc}
            alt={alt}
            className="max-w-full max-h-[85vh] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <button
          type="button"
          aria-label="Close photo viewer"
          className="absolute -top-3.5 -right-3.5 text-white bg-slate-900/90 hover:bg-slate-800 rounded-full w-9 h-9 flex items-center justify-center border border-white/30 shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onClick={onClose}
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ProfilePhotoViewerModal;
