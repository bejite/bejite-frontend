import { useRef } from "react";
import { Users, Upload, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { getAllCountryNames } from "../../../utils/countryStateData";
import RecruiterSelect from "../RecruiterSelect";

const PROFESSION_SUGGESTIONS = [
  "Information Technology",
  "Software Engineer",
  "Data Analyst",
  "Healthcare",
  "Nurse",
  "Finance",
  "Accountant",
  "Education",
  "Teacher",
  "Construction",
  "Manufacturing",
  "Retail",
  "Marketing",
  "Legal",
  "Biotechnology",
];

const COUNTRY_OPTIONS = getAllCountryNames();

const AudienceFiltersStep = ({
  campaignForm = {},
  setCampaignForm = () => {},
  matchingCount = 0,
  audienceLoading = false,
  sampleRecipient = null,
  audienceMeta = {},
}) => {
  const csvInputRef = useRef(null);
  const isExternal = campaignForm.audienceSource === "external";

  const setAudienceSource = (source) => {
    setCampaignForm({
      ...campaignForm,
      audienceSource: source,
      consentChecked: source === "external" ? false : true,
    });
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || "").trim();
      if (!text) {
        toast.error("That file is empty");
        return;
      }
      const existing = String(campaignForm.customEmailsText || "").trim();
      setCampaignForm({
        ...campaignForm,
        audienceSource: "external",
        customEmailsText: existing ? `${existing}\n${text}` : text,
      });
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => toast.error("Could not read that file");
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Target audience</h3>
        <p className="text-gray-500 text-xs">
          Email Bejite members, or people whose addresses are not in the Bejite
          database.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-gray-100 rounded-xl border border-gray-200 max-w-xl">
        <button
          type="button"
          onClick={() => setAudienceSource("members")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
            !isExternal
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users size={16} />
          Bejite members
        </button>
        <button
          type="button"
          onClick={() => setAudienceSource("external")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
            isExternal
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Mail size={16} />
          External emails
        </button>
      </div>

      {isExternal ? (
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email list
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Paste addresses (one per line, or comma-separated). Optional CSV
              with an Email column and First Name. Addresses already registered
              on Bejite are skipped automatically.
            </p>
            <textarea
              rows={8}
              value={campaignForm.customEmailsText || ""}
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  customEmailsText: e.target.value,
                })
              }
              placeholder={`jane@company.com\nJohn Okonkwo <john@firm.co>\nemail,first name`}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm text-gray-900 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="hidden"
              onChange={handleCsvUpload}
            />
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Upload size={16} />
              Upload CSV / TXT
            </button>
            {campaignForm.customEmailsText ? (
              <button
                type="button"
                onClick={() =>
                  setCampaignForm({ ...campaignForm, customEmailsText: "" })
                }
                className="text-xs font-semibold text-gray-500 hover:text-red-600 cursor-pointer"
              >
                Clear list
              </button>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Profession label for placeholders (optional)
            </label>
            <input
              list="outreach-profession-suggestions"
              type="text"
              placeholder="Used for {Profession} — leave blank for “your field”"
              value={
                campaignForm.profession === "All"
                  ? ""
                  : campaignForm.profession || ""
              }
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  profession: e.target.value.trim() ? e.target.value : "All",
                })
              }
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm text-gray-900"
            />
            <datalist id="outreach-profession-suggestions">
              {PROFESSION_SUGGESTIONS.map((ind) => (
                <option key={ind} value={ind} />
              ))}
            </datalist>
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#16730F]/5 rounded-xl border border-[#16730F]/20">
            <input
              id="external-consent-check"
              type="checkbox"
              checked={campaignForm.consentChecked ?? false}
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  consentChecked: e.target.checked,
                })
              }
              className="h-4 w-4 mt-0.5 text-[#16730F] focus:ring-[#16730F] border-gray-300 rounded"
            />
            <label
              htmlFor="external-consent-check"
              className="text-xs text-[#16730F] font-semibold leading-snug cursor-pointer"
            >
              I confirm I have permission to email these people and they are not
              already Bejite members (registered addresses will still be
              excluded).
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left">
          <div>
            <RecruiterSelect
              label="Role"
              name="role"
              value={campaignForm.role || "Jobseeker"}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, role: e.target.value })
              }
              options={[
                { value: "All Users", label: "All users (active)" },
                { value: "Jobseeker", label: "Jobseekers" },
                { value: "Employer", label: "Employers / recruiters" },
                { value: "Partners", label: "Partners (verified badge)" },
                { value: "Unverified", label: "Unverified email only" },
                { value: "Incomplete Profile", label: "Incomplete profile only" },
                { value: "Inactive", label: "Inactive accounts only" },
                {
                  value: "Re-engagement",
                  label:
                    "Re-engagement (unverified, incomplete, or inactive)",
                },
              ]}
              placeholder="Select Role"
            />
            {(campaignForm.role === "Unverified" ||
              campaignForm.role === "Incomplete Profile" ||
              campaignForm.role === "Inactive" ||
              campaignForm.role === "Re-engagement") && (
              <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                {campaignForm.role === "Unverified" &&
                  "Users whose email is not verified (includes inactive signup accounts)."}
                {campaignForm.role === "Incomplete Profile" &&
                  "Active users who have not finished profile setup."}
                {campaignForm.role === "Inactive" &&
                  "Users marked inactive (still need an email address to receive mail)."}
                {campaignForm.role === "Re-engagement" &&
                  "Anyone who is unverified, incomplete, or inactive."}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Sector / profession
            </label>
            <input
              list="outreach-profession-suggestions"
              type="text"
              placeholder="e.g. Nurse, Software, Finance — leave blank for all"
              value={
                campaignForm.profession === "All"
                  ? ""
                  : campaignForm.profession || ""
              }
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  profession: e.target.value.trim() ? e.target.value : "All",
                })
              }
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm text-gray-900"
            />
            <datalist id="outreach-profession-suggestions">
              {PROFESSION_SUGGESTIONS.map((ind) => (
                <option key={ind} value={ind} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Skills
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node, AWS (comma separated)"
              value={campaignForm.skills || ""}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, skills: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-green-100 focus:outline-none text-sm text-gray-900"
            />
          </div>

          <div>
            <RecruiterSelect
              label="Country"
              name="location"
              value={campaignForm.location || ""}
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  location: e.target.value,
                })
              }
              options={[
                { value: "", label: "All countries" },
                ...COUNTRY_OPTIONS.map((c) => ({ value: c, label: c })),
              ]}
              placeholder="All countries"
            />
          </div>

          <div>
            <RecruiterSelect
              label="Profile completeness"
              name="completeness"
              value={campaignForm.completeness || "All"}
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  completeness: e.target.value,
                })
              }
              disabled={
                campaignForm.role === "Incomplete Profile" ||
                campaignForm.role === "Re-engagement"
              }
              options={[
                { value: "All", label: "All profiles" },
                { value: "high", label: "High (most sections filled)" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low (few sections filled)" },
              ]}
              placeholder="Select completeness"
            />
          </div>

          <div className="flex items-center gap-2 md:mt-8 p-3 bg-[#16730F]/5 rounded-xl border border-[#16730F]/20">
            <input
              id="consent-check"
              type="checkbox"
              checked={campaignForm.consentChecked ?? true}
              onChange={(e) =>
                setCampaignForm({
                  ...campaignForm,
                  consentChecked: e.target.checked,
                })
              }
              className="h-4 w-4 text-[#16730F] focus:ring-[#16730F] border-gray-300 rounded"
            />
            <label
              htmlFor="consent-check"
              className="text-xs text-[#16730F] font-semibold leading-snug cursor-pointer"
            >
              Only users with email notifications enabled
            </label>
          </div>
        </div>
      )}

      <div className="bg-[#16730F]/5 rounded-2xl p-6 border border-[#16730F]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h4 className="text-[#16730F] text-xl font-black">
              {audienceLoading
                ? "Counting…"
                : `${matchingCount.toLocaleString()} ${
                    isExternal ? "external emails" : "users"
                  }`}
            </h4>
            <p className="text-gray-500 text-xs mt-0.5">
              {isExternal
                ? [
                    audienceMeta.alreadyRegisteredCount
                      ? `${audienceMeta.alreadyRegisteredCount.toLocaleString()} already on Bejite (skipped)`
                      : null,
                    audienceMeta.unsubscribedCount
                      ? `${audienceMeta.unsubscribedCount.toLocaleString()} unsubscribed (skipped)`
                      : null,
                    audienceMeta.invalidCount
                      ? `${audienceMeta.invalidCount.toLocaleString()} invalid`
                      : null,
                    audienceMeta.duplicateCount
                      ? `${audienceMeta.duplicateCount.toLocaleString()} duplicates`
                      : null,
                    audienceMeta.truncated ? "list truncated at 10,000" : null,
                    sampleRecipient
                      ? `Sample: ${sampleRecipient.email}`
                      : "not already registered on Bejite",
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : sampleRecipient
                  ? `Sample: ${sampleRecipient.firstName} · ${sampleRecipient.profession}`
                  : "matching current filters"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceFiltersStep;
