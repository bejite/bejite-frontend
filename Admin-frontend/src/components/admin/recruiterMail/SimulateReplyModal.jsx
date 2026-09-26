import React, { useState } from "react";
import {
  X,
  Sparkles,
  Send,
  Building,
  User,
  Clock,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";

export const SimulateReplyModal = ({
  isOpen,
  onClose,
  threads,
  onExecuteSimulation,
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [replyType, setReplyType] = useState("positive_review");
  const [customText, setCustomText] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(0);

  if (!isOpen) return null;

  const activeThreads = threads.filter((t) => t.folder !== "trash");

  const PRESET_REPLIES = {
    positive_review: "Hi! Thanks for reaching out. We would love to review the candidate profiles. Can you send over their GitHub and portfolio links?",
    interview_request: "This is great timing! Our Engineering Manager reviewed the profile specs and wants to set up a 30-min interview next Tuesday. Let us know their availability.",
    verified_badge_inquiry: "Thank you for the warm welcome! We'd like to get our recruiter verified badge activated right away. What documentation do you need from our HR team?",
    partnership_pricing: "Hello! We are looking to post 5 more jobs this month. Could you share details on the AdPro featured slots and candidate guarantees?",
  };

  const currentThreadId = selectedThreadId || activeThreads[0]?.id;
  // const currentThread = activeThreads.find((t) => t.id === currentThreadId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentThreadId) {
      toast.warn("Please select a recruiter conversation");
      return;
    }

    const textToSend = replyType === "custom" ? customText.trim() : PRESET_REPLIES[replyType];
    if (!textToSend) {
      toast.warn("Please select or enter reply text");
      return;
    }

    onClose();

    if (delaySeconds > 0) {
      toast.info(`Simulated reply will arrive in ${delaySeconds} seconds...`);
      setTimeout(() => {
        onExecuteSimulation(currentThreadId, textToSend);
      }, delaySeconds * 1000);
    } else {
      onExecuteSimulation(currentThreadId, textToSend);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[92dvh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Pinned Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex flex-col shrink-0 select-none">
          <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-1.5 sm:hidden" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Sparkles size={17} />
              <h3 className="font-bold text-xs sm:text-sm">Simulate Live Recruiter Reply</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto nfl-scroll flex-1 min-h-0">
            <p className="text-xs text-gray-500 leading-relaxed">
              Test the live 2-way email experience! This will simulate a recruiter opening your email, typing a realistic reply, and delivering it to your <strong>Inbox</strong> with unread indicators.
            </p>

            {/* Select Recruiter Thread */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Select Recruiter Thread
              </label>
              <select
                value={currentThreadId}
                onChange={(e) => setSelectedThreadId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer truncate"
              >
                {activeThreads.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.recruiter?.name} ({t.recruiter?.company}) — {t.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Preset Reply Options */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Choose Recruiter Response Type
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs">
                  <input
                    type="radio"
                    name="replyType"
                    value="positive_review"
                    checked={replyType === "positive_review"}
                    onChange={() => setReplyType("positive_review")}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Candidate Shortlist Request</span>
                    <span className="text-gray-500 text-[11px]">
                      "{PRESET_REPLIES.positive_review}"
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs">
                  <input
                    type="radio"
                    name="replyType"
                    value="interview_request"
                    checked={replyType === "interview_request"}
                    onChange={() => setReplyType("interview_request")}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Interview Scheduling</span>
                    <span className="text-gray-500 text-[11px]">
                      "{PRESET_REPLIES.interview_request}"
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs">
                  <input
                    type="radio"
                    name="replyType"
                    value="verified_badge_inquiry"
                    checked={replyType === "verified_badge_inquiry"}
                    onChange={() => setReplyType("verified_badge_inquiry")}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Badge Verification Inquiry</span>
                    <span className="text-gray-500 text-[11px]">
                      "{PRESET_REPLIES.verified_badge_inquiry}"
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs">
                  <input
                    type="radio"
                    name="replyType"
                    value="custom"
                    checked={replyType === "custom"}
                    onChange={() => setReplyType("custom")}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">Write Custom Recruiter Reply</span>
                    {replyType === "custom" && (
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type the message you want the recruiter to say in response..."
                        rows={3}
                        className="w-full mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Delay option */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Simulated Delay
              </label>
              <div className="flex gap-2">
                {[0, 3, 7].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDelaySeconds(s)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      delaySeconds === s
                        ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {s === 0 ? "Instant" : `${s}s delay`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pinned Action Buttons Footer */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Sparkles size={14} />
              <span>Trigger Reply Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
