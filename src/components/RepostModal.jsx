import React, { useEffect, useState } from "react";
import { FaClock, FaRetweet, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import EmojiPickerButton from "./common/EmojiPickerButton";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import { getAuthorProfileImageUrl } from "../utils/profileImageUtils";

const MAX_QUOTE_LEN = 500;

function getDefaultSchedule() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60);
  d.setSeconds(0, 0);
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

function formatScheduledLabel(dateStr, timeStr) {
  const scheduled = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(scheduled.getTime())) return "";
  return scheduled.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RepostModal({
  isOpen,
  onClose,
  post,
  onConfirm,
  onRemove,
  submitting = false,
  initialQuote = "",
  initialScheduledAt = null,
  isEditing = false,
}) {
  const [quote, setQuote] = useState("");
  const [mode, setMode] = useState("now");
  const defaults = getDefaultSchedule();
  const [scheduleDate, setScheduleDate] = useState(defaults.date);
  const [scheduleTime, setScheduleTime] = useState(defaults.time);

  useEffect(() => {
    if (!isOpen) return;
    setQuote(initialQuote || "");
    if (initialScheduledAt) {
      const d = new Date(initialScheduledAt);
      if (!Number.isNaN(d.getTime())) {
        setMode("schedule");
        setScheduleDate(d.toISOString().slice(0, 10));
        setScheduleTime(d.toTimeString().slice(0, 5));
        return;
      }
    }
    setMode("now");
    const next = getDefaultSchedule();
    setScheduleDate(next.date);
    setScheduleTime(next.time);
  }, [isOpen, post?.id, initialQuote, initialScheduledAt]);

  if (!isOpen || !post) return null;

  const authorName = formatDisplayPersonName(post.author, "Someone");
  const authorImage = getAuthorProfileImageUrl(post.author);
  const previewBody = String(post.body || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const remaining = MAX_QUOTE_LEN - quote.length;
  const isScheduleMode = mode === "schedule";
  const minDate = new Date().toISOString().slice(0, 10);

  const stopParentDismiss = (event) => {
    event.stopPropagation();
  };

  const buildScheduledAt = () => {
    const scheduled = new Date(`${scheduleDate}T${scheduleTime}`);
    if (Number.isNaN(scheduled.getTime())) {
      toast.error("Pick a valid date and time.");
      return null;
    }
    if (scheduled.getTime() <= Date.now()) {
      toast.error("Schedule time must be in the future.");
      return null;
    }
    return scheduled.toISOString();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    let scheduledAt = null;
    if (isScheduleMode) {
      scheduledAt = buildScheduledAt();
      if (!scheduledAt) return;
    }
    await onConfirm(quote.trim() || null, scheduledAt);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
      onClick={onClose}
      onMouseDown={stopParentDismiss}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={stopParentDismiss}
      >
        <div className="pt-3 sm:hidden">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between border-b border-[#D9D9D9] px-5 py-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-[#1A3E32] flex items-center gap-2">
            <FaRetweet className="text-[#16730F]" />
            Repost
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close repost modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A3E32] mb-2">
              Add your thoughts (optional)
            </label>
            <div className="rounded-2xl border border-gray-200 focus-within:border-[#16730F] bg-gray-50/60">
              <textarea
                value={quote}
                onChange={(e) =>
                  setQuote(e.target.value.slice(0, MAX_QUOTE_LEN))
                }
                rows={4}
                placeholder="Share why you're reposting this…"
                className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                autoFocus
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <EmojiPickerButton
                  onEmojiSelect={(emoji) =>
                    setQuote((prev) =>
                      `${prev}${emoji}`.slice(0, MAX_QUOTE_LEN),
                    )
                  }
                  buttonClassName="p-1.5"
                />
                <span
                  className={`text-xs tabular-nums ${
                    remaining < 40 ? "text-amber-600" : "text-gray-400"
                  }`}
                >
                  {remaining}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              When to repost
            </p>
            <div className="inline-flex rounded-full border border-gray-200 p-0.5 bg-gray-50">
              <button
                type="button"
                onClick={() => setMode("now")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !isScheduleMode
                    ? "bg-[#16730F] text-white"
                    : "text-gray-600 hover:text-[#1A3E32]"
                }`}
              >
                Repost now
              </button>
              <button
                type="button"
                onClick={() => setMode("schedule")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                  isScheduleMode
                    ? "bg-[#16730F] text-white"
                    : "text-gray-600 hover:text-[#1A3E32]"
                }`}
              >
                <FaClock className="text-[10px]" />
                Schedule
              </button>
            </div>
            {isScheduleMode && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-gray-600 mb-1 block">Date</span>
                  <input
                    type="date"
                    value={scheduleDate}
                    min={minDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#16730F]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600 mb-1 block">Time</span>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#16730F]"
                  />
                </label>
                <p className="sm:col-span-2 text-xs text-gray-500">
                  Will go live on{" "}
                  <span className="font-medium text-[#1A3E32]">
                    {formatScheduledLabel(scheduleDate, scheduleTime) || "—"}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-3.5">
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src={authorImage}
                alt=""
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#16730F] truncate">
                  {authorName}
                </p>
                <p className="text-[11px] text-gray-500">Original post</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap break-words">
              {previewBody || "Media post"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            {isEditing && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={submitting}
                className="px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-[#16730F] text-white hover:bg-[#145a0c] disabled:opacity-50"
              >
                {isScheduleMode ? <FaClock /> : <FaRetweet />}
                {submitting
                  ? isScheduleMode
                    ? "Saving…"
                    : isEditing
                      ? "Updating…"
                      : "Reposting…"
                  : isScheduleMode
                    ? isEditing
                      ? "Update schedule"
                      : "Schedule repost"
                    : isEditing
                      ? "Repost now"
                      : "Repost"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
