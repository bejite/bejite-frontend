import { useState } from "react";
import { Check, ChevronRight, ChevronLeft, Send } from "lucide-react";
import { toast } from "react-toastify";

import CampaignDetailsStep from "./CampaignDetailsStep";
import AudienceFiltersStep from "./AudienceFiltersStep";
import ComposeEmailStep from "./ComposeEmailStep";
import PreviewScheduleStep from "./PreviewScheduleStep";

const CampaignBuilderWizard = ({
  campaignForm = {},
  setCampaignForm = () => {},
  matchingCount = 0,
  audienceLoading = false,
  sampleRecipient = null,
  audienceMeta = {},
  onSubmit = () => {},
  onNavigateTemplates = () => {},
}) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleLaunchCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.body) {
      toast.error("Please fill in Campaign Name, Subject, and Email Body!");
      return;
    }
    if (!campaignForm.consentChecked) {
      toast.error(
        campaignForm.audienceSource === "external"
          ? "Confirm you have permission to email these contacts!"
          : "You must confirm compliance with GDPR/CASL regulations!",
      );
      return;
    }
    if (
      campaignForm.audienceSource === "external" &&
      Number(matchingCount) < 1
    ) {
      toast.error(
        "Add at least one email that is not already registered on Bejite.",
      );
      return;
    }
    if (campaignForm.sendType === "scheduled") {
      if (!campaignForm.scheduledDate || !campaignForm.scheduledTime) {
        toast.error("Please choose a scheduled date and time!");
        return;
      }
    }
    setSubmitting(true);
    try {
      await onSubmit(matchingCount);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50/50 p-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#16730F] transition-all duration-300 -z-0"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          <button
            type="button"
            onClick={() => step > 1 && setStep(1)}
            className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= 1
                  ? "bg-[#16730F] text-white ring-4 ring-green-100"
                  : "bg-white text-gray-500 border border-gray-300"
              }`}
            >
              {step > 1 ? <Check size={16} /> : "1"}
            </div>
            <span className="text-xs font-semibold text-gray-700">Details</span>
          </button>

          <button
            type="button"
            onClick={() => step > 2 && setStep(2)}
            className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
            disabled={step < 2}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= 2
                  ? "bg-[#16730F] text-white ring-4 ring-green-100"
                  : "bg-white text-gray-500 border border-gray-300"
              }`}
            >
              {step > 2 ? <Check size={16} /> : "2"}
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Audience
            </span>
          </button>

          <button
            type="button"
            onClick={() => step > 3 && setStep(3)}
            className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
            disabled={step < 3}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= 3
                  ? "bg-[#16730F] text-white ring-4 ring-green-100"
                  : "bg-white text-gray-500 border border-gray-300"
              }`}
            >
              {step > 3 ? <Check size={16} /> : "3"}
            </div>
            <span className="text-xs font-semibold text-gray-700">Compose</span>
          </button>

          <button
            type="button"
            className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
            disabled={step < 4}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === 4
                  ? "bg-[#16730F] text-white ring-4 ring-green-100"
                  : "bg-white text-gray-500 border border-gray-300"
              }`}
            >
              4
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Preview & Send
            </span>
          </button>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        {step === 1 && (
          <CampaignDetailsStep
            campaignForm={campaignForm}
            setCampaignForm={setCampaignForm}
          />
        )}

        {step === 2 && (
          <AudienceFiltersStep
            campaignForm={campaignForm}
            setCampaignForm={setCampaignForm}
            matchingCount={matchingCount}
            audienceLoading={audienceLoading}
            sampleRecipient={sampleRecipient}
            audienceMeta={audienceMeta}
          />
        )}

        {step === 3 && (
          <ComposeEmailStep
            campaignForm={campaignForm}
            setCampaignForm={setCampaignForm}
            onNavigateTemplates={onNavigateTemplates}
          />
        )}

        {step === 4 && (
          <PreviewScheduleStep
            campaignForm={campaignForm}
            setCampaignForm={setCampaignForm}
            sampleRecipient={sampleRecipient}
            matchingCount={matchingCount}
          />
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className={`flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-xl cursor-pointer transition-all ${
              step === 1 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (
                  step === 2 &&
                  campaignForm.audienceSource === "external" &&
                  Number(matchingCount) < 1
                ) {
                  toast.error(
                    "Add at least one email that is not already registered on Bejite.",
                  );
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#16730F] hover:bg-green-700 px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all ml-auto"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunchCampaign}
              disabled={submitting}
              className="flex items-center gap-1.5 text-sm font-extrabold text-white bg-[#16730F] hover:bg-green-700 px-6 py-3 rounded-xl shadow-lg cursor-pointer transition-all ml-auto hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              <Send size={16} />
              {submitting
                ? "Submitting…"
                : campaignForm.sendType === "scheduled"
                  ? "Schedule Campaign"
                  : "Launch Outreach Campaign"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilderWizard;
