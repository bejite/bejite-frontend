import React from "react";
import { FaBirthdayCake, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { getAuthorProfileImageUrl } from "../../utils/profileImageUtils";
import { milestoneJobSubtitle } from "../../services/milestonesApi";

export default function BirthdayWishModal({
  selectedUser,
  customMessage,
  setCustomMessage,
  onClose,
  onSubmit,
  sending = false,
}) {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="birthday-wish-title"
      >
        <div className="bg-gradient-to-r from-[#16730F] to-[#1A3E32] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <FaBirthdayCake className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <h3 id="birthday-wish-title" className="font-bold text-lg">
                Send Birthday Note
              </h3>
              <p className="text-xs text-gray-200">To {selectedUser.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="text-white/80 hover:text-white text-xl font-bold p-1 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <img
              src={getAuthorProfileImageUrl(selectedUser)}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-[#1A3E32] truncate">
                {selectedUser.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {milestoneJobSubtitle(selectedUser)}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="birthday-custom-message"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
            >
              Your Message
            </label>
            <textarea
              id="birthday-custom-message"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={sending}
              className="w-full border-2 border-[#16730F] p-3 rounded-xl focus:outline-none text-sm text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Write your birthday wishes here..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !customMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#16730F] hover:bg-[#145a0c] text-white text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <FaSpinner className="text-xs animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Wish</span>
                  <FaPaperPlane className="text-xs" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
