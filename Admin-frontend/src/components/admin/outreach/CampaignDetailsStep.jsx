const CampaignDetailsStep = ({
  campaignForm = {},
  setCampaignForm = () => {},
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Campaign details</h3>
        <p className="text-gray-500 text-xs">
          Name, subject, and sender display name for this outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Campaign name
          </label>
          <input
            type="text"
            placeholder="e.g. June developer digest"
            value={campaignForm.name || ""}
            onChange={(e) =>
              setCampaignForm({ ...campaignForm, name: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm transition-all text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            Subject line
            <span className="text-xs font-normal text-gray-400">
              Use {"{First Name}"} / {"{Profession}"}
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. Hi {First Name}, new matches for {Profession}"
            value={campaignForm.subject || ""}
            onChange={(e) =>
              setCampaignForm({ ...campaignForm, subject: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm transition-all font-medium text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Preview text
          </label>
          <input
            type="text"
            placeholder="Inbox snippet shown next to the subject"
            value={campaignForm.previewText || ""}
            onChange={(e) =>
              setCampaignForm({ ...campaignForm, previewText: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm transition-all text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Sender name
          </label>
          <input
            type="text"
            placeholder="e.g. Bejite Talent"
            value={campaignForm.senderName || ""}
            onChange={(e) =>
              setCampaignForm({ ...campaignForm, senderName: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm transition-all text-gray-900"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Delivered from your verified Resend From address. Only the display
            name above is customized.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsStep;
