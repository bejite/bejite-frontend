import { Send, Calendar, Users } from "lucide-react";
import { toast } from "react-toastify";
import { sendOutreachTestEmail } from "../../../services/emailOutreachAdminApi";
import { sanitizeHtml } from "../../../utils/sanitizeHtml";

const OUTREACH_CTA_URL = "https://bejite.com/";

function applyPreviewPlaceholders(html, { firstName, profession, ctaText, ctaLink }) {
  let text = String(html || "");
  text = text.replace(/\{([^}]+)\}/g, (_, inner) => {
    const cleaned = String(inner)
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return `{${cleaned}}`;
  });

  const resolvedLink = ctaLink || OUTREACH_CTA_URL;
  const jobLink = `<a href="${resolvedLink}" class="text-[#16730F] font-semibold underline">${ctaText || "View openings"}</a>`;
  return text
    .replaceAll("{First Name}", firstName || "there")
    .replaceAll("{Profession}", profession || "your field")
    .replaceAll("{Job Link}", jobLink)
    .replaceAll(
      "{Unsubscribe Link}",
      '<a href="#" class="text-gray-400 underline">Unsubscribe</a>',
    );
}

const PreviewScheduleStep = ({
  campaignForm = {},
  setCampaignForm = () => {},
  sampleRecipient = null,
  matchingCount = 0,
}) => {
  const firstName = sampleRecipient?.firstName || "there";
  const profession =
    campaignForm.profession && campaignForm.profession !== "All"
      ? campaignForm.profession
      : sampleRecipient?.profession || "your field";
  const previewEmail = sampleRecipient?.email || "recipient@bejite.com";

  const bodyHtml = {
    __html: sanitizeHtml(
      applyPreviewPlaceholders(
        campaignForm.body ||
          "<p class='text-gray-400 italic'>Compose your message to see it here.</p>",
        {
          firstName,
          profession,
          ctaText: campaignForm.ctaText,
          ctaLink: OUTREACH_CTA_URL,
        },
      ),
    ),
  };

  const subjectPreview = applyPreviewPlaceholders(campaignForm.subject || "", {
    firstName,
    profession,
    ctaText: campaignForm.ctaText,
    ctaLink: OUTREACH_CTA_URL,
  }).replace(/<[^>]+>/g, "");

  const handleSendTestEmail = async () => {
    const val = document.getElementById("test-email-address")?.value?.trim();
    if (!val) {
      toast.error("Enter a test email address");
      return;
    }
    if (!campaignForm.subject || !campaignForm.body) {
      toast.error("Subject and body are required");
      return;
    }

    toast.info("Sending test email…");
    try {
      await sendOutreachTestEmail({
        to: val,
        subject: campaignForm.subject,
        body: campaignForm.body,
        senderName: campaignForm.senderName,
        ctaText: campaignForm.ctaText,
        ctaLink: OUTREACH_CTA_URL,
        logoUrl: campaignForm.logoUrl,
        previewText: campaignForm.previewText,
        profession,
        firstName,
        audienceSource: campaignForm.audienceSource || "members",
      });
      toast.success(`Test email sent to ${val}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          "Failed to send test email",
      );
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 150_000) {
      toast.error("Logo must be under ~150KB for email delivery");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCampaignForm({
          ...campaignForm,
          logoUrl: event.target.result,
        });
        toast.success("Logo updated");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      <input
        type="file"
        id="logo-preview-upload"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Preview & send</h3>
        <p className="text-gray-500 text-xs">
          Preview uses a real matched recipient when available. Placeholders are
          filled the same way as on send
          {campaignForm.audienceSource === "external"
            ? ". This campaign goes to emails that are not registered on Bejite."
            : "."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-semibold text-gray-700">From:</span>{" "}
                {campaignForm.senderName || "Bejite"}
              </div>
              <div>
                <span className="font-semibold text-gray-700">To:</span>{" "}
                {firstName} &lt;{previewEmail}&gt;
                {sampleRecipient ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-[#16730F] bg-green-50 px-1.5 py-0.5 rounded">
                    Sample from audience
                  </span>
                ) : null}
              </div>
              <div className="font-bold text-gray-800 text-sm mt-2">
                Subject: {subjectPreview || "(no subject)"}
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm max-w-xl mx-auto space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("logo-preview-upload")?.click()
                    }
                    className="cursor-pointer"
                    title="Upload logo"
                  >
                    <img
                      src={campaignForm.logoUrl || "/assets/images/logo.png"}
                      alt="Logo"
                      className="h-8 object-contain"
                    />
                  </button>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1">
                    <Users size={12} />
                    {matchingCount.toLocaleString()} recipients
                  </span>
                </div>

                <div
                  className="min-h-[120px] text-sm text-gray-700 leading-relaxed text-left [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                  dangerouslySetInnerHTML={bodyHtml}
                />

                <div className="text-center pt-2 border-t border-gray-100">
                    <a
                      href={OUTREACH_CTA_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-[#16730F] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-green-700"
                    >
                      {campaignForm.ctaText || "Visit Bejite"}
                    </a>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm text-left">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Send size={16} className="text-[#16730F]" />
              Send test
            </h4>
            <input
              id="test-email-address"
              type="email"
              defaultValue={sampleRecipient?.email || ""}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#16730F]"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              className="w-full bg-[#16730F] hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Send test email
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm text-left">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-[#16730F]" />
              Delivery
            </h4>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="sendType"
                checked={campaignForm.sendType !== "scheduled"}
                onChange={() =>
                  setCampaignForm({ ...campaignForm, sendType: "now" })
                }
              />
              Send now
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="sendType"
                checked={campaignForm.sendType === "scheduled"}
                onChange={() =>
                  setCampaignForm({ ...campaignForm, sendType: "scheduled" })
                }
              />
              Schedule
            </label>
            {campaignForm.sendType === "scheduled" ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={campaignForm.scheduledDate || ""}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      scheduledDate: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#16730F]"
                />
                <input
                  type="time"
                  value={campaignForm.scheduledTime || ""}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      scheduledTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#16730F]"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewScheduleStep;
