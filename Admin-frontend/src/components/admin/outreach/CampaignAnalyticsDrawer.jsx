import { X } from "lucide-react";
import { sanitizeHtml } from "../../../utils/sanitizeHtml";

const CampaignAnalyticsDrawer = ({
  selectedCampaign = null,
  onClose = () => {},
  onDuplicate = () => {},
}) => {
  if (!selectedCampaign) return null;

  const sent = Number(selectedCampaign.sentCount) || 0;
  const delivered = Number(selectedCampaign.deliveredCount) || 0;
  const matching = Number(selectedCampaign.matchingCount) || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col z-10">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] bg-[#16730F]/10 text-[#16730F] font-bold uppercase px-2.5 py-0.5 rounded-md">
              {selectedCampaign.status}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {selectedCampaign.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400">Subject</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {selectedCampaign.subject}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Audience</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {selectedCampaign.role === "External" ||
                selectedCampaign.audienceSource === "external"
                  ? "External list"
                  : selectedCampaign.role}
                {selectedCampaign.profession &&
                selectedCampaign.profession !== "All"
                  ? ` · ${selectedCampaign.profession}`
                  : ""}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Sent</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {selectedCampaign.sentAt
                  ? new Date(selectedCampaign.sentAt).toLocaleString()
                  : selectedCampaign.scheduledAt
                    ? `Scheduled ${new Date(selectedCampaign.scheduledAt).toLocaleString()}`
                    : "—"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Sender</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {selectedCampaign.senderName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 font-semibold">Matched</span>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                {matching.toLocaleString()}
              </h3>
            </div>
            <div className="bg-green-50/40 p-4 rounded-xl border border-green-100">
              <span className="text-xs text-green-700 font-semibold">Sent</span>
              <h3 className="text-xl font-black text-green-800 mt-1">
                {sent.toLocaleString()}
              </h3>
            </div>
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
              <span className="text-xs text-blue-700 font-semibold">
                Accepted
              </span>
              <h3 className="text-xl font-black text-blue-800 mt-1">
                {delivered.toLocaleString()}
              </h3>
            </div>
          </div>

          {selectedCampaign.lastError ? (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {selectedCampaign.lastError}
            </p>
          ) : null}

          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Message
            </span>
            <div
              className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(selectedCampaign.body || ""),
              }}
            />
            {selectedCampaign.ctaText && selectedCampaign.ctaLink ? (
              <p className="text-xs font-semibold text-[#16730F] pt-2">
                CTA: {selectedCampaign.ctaText} → {selectedCampaign.ctaLink}
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onDuplicate(selectedCampaign);
              onClose();
            }}
            className="bg-[#16730F] text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-green-700"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalyticsDrawer;
