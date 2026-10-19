import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Mail, Plus } from "lucide-react";

import OutreachMetricsDashboard from "../../components/admin/outreach/OutreachMetricsDashboard";
import CampaignHistoryTable from "../../components/admin/outreach/CampaignHistoryTable";
import CampaignAnalyticsDrawer from "../../components/admin/outreach/CampaignAnalyticsDrawer";
import CampaignBuilderWizard from "../../components/admin/outreach/CampaignBuilderWizard";
import TemplatePresetsGrid from "../../components/admin/outreach/TemplatePresetsGrid";

import DeleteCampaignConfirmModal from "../../components/admin/outreach/DeleteCampaignConfirmModal";
import TemplateEditorModal from "../../components/admin/outreach/TemplateEditorModal";
import {
  createOutreachTemplate,
  deleteOutreachCampaign,
  getOutreachAudienceCount,
  getOutreachCampaign,
  launchOutreachCampaign,
  listOutreachCampaigns,
  listOutreachTemplates,
  updateOutreachTemplate,
} from "../../services/emailOutreachAdminApi";

const EMPTY_CAMPAIGN_FORM = {
  name: "",
  subject: "",
  previewText: "",
  senderName: "Bejite Support",
  senderEmail: "info@bejite.com",
  audienceSource: "members",
  customEmailsText: "",
  role: "Jobseeker",
  profession: "All",
  skills: "",
  location: "",
  completeness: "All",
  consentChecked: true,
  body: "",
  ctaText: "",
  ctaLink: "",
  logoUrl: "/assets/images/logo.png",
  attachments: [],
  sendType: "now",
  scheduledDate: "",
  scheduledTime: "",
};

const AdminEmailOutreach = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingCount, setMatchingCount] = useState(0);
  const [sampleRecipient, setSampleRecipient] = useState(null);
  const [audienceMeta, setAudienceMeta] = useState({
    alreadyRegisteredCount: 0,
    unsubscribedCount: 0,
    invalidCount: 0,
    duplicateCount: 0,
    truncated: false,
  });
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [deletingCampaignId, setDeletingCampaignId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    body: "",
    ctaText: "",
    ctaLink: "",
    category: "Job Alert",
  });

  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN_FORM);

  const refreshCampaigns = useCallback(async () => {
    const data = await listOutreachCampaigns();
    setCampaigns(data.campaigns || []);
  }, []);

  const refreshTemplates = useCallback(async () => {
    const data = await listOutreachTemplates();
    setTemplates(data.templates || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([refreshCampaigns(), refreshTemplates()]);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error?.response?.data?.error || "Failed to load email outreach data",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshCampaigns, refreshTemplates]);

  useEffect(() => {
    if (activeTab !== "create") return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setAudienceLoading(true);
      try {
        const data = await getOutreachAudienceCount({
          audienceSource: campaignForm.audienceSource || "members",
          customEmails: campaignForm.customEmailsText || "",
          role: campaignForm.role,
          profession: campaignForm.profession,
          skills: campaignForm.skills,
          location: campaignForm.location,
          completeness: campaignForm.completeness,
          consentChecked: campaignForm.consentChecked,
        });
        if (cancelled) return;
        setMatchingCount(Number(data.count) || 0);
        setSampleRecipient(data.sample || null);
        setAudienceMeta({
          alreadyRegisteredCount: Number(data.alreadyRegisteredCount) || 0,
          unsubscribedCount: Number(data.unsubscribedCount) || 0,
          invalidCount: Number(data.invalidCount) || 0,
          duplicateCount: Number(data.duplicateCount) || 0,
          truncated: Boolean(data.truncated),
        });
      } catch (error) {
        if (cancelled) return;
        console.warn("audience count failed:", error?.message || error);
        setSampleRecipient(null);
        setAudienceMeta({
          alreadyRegisteredCount: 0,
          unsubscribedCount: 0,
          invalidCount: 0,
          duplicateCount: 0,
          truncated: false,
        });
        toast.error(
          error?.response?.data?.error || "Could not refresh audience count",
        );
      } finally {
        if (!cancelled) setAudienceLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    activeTab,
    campaignForm.audienceSource,
    campaignForm.customEmailsText,
    campaignForm.role,
    campaignForm.profession,
    campaignForm.skills,
    campaignForm.location,
    campaignForm.completeness,
    campaignForm.consentChecked,
  ]);

  // Refresh list while a campaign may still be sending
  useEffect(() => {
    const hasSending = campaigns.some((c) => c.status === "Sending");
    if (!hasSending) return undefined;
    const timer = setInterval(() => {
      refreshCampaigns().catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [campaigns, refreshCampaigns]);

  const campaignFormWithCount = { ...campaignForm, matchingCount };

  const handleLaunchCampaignSubmit = async () => {
    try {
      const data = await launchOutreachCampaign(campaignForm);
      toast.success(
        data.message ||
          (campaignForm.sendType === "scheduled"
            ? "Campaign scheduled successfully"
            : "Campaign launched successfully"),
      );
      setCampaignForm(EMPTY_CAMPAIGN_FORM);
      setActiveTab("campaigns");
      await refreshCampaigns();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to launch campaign",
      );
    }
  };

  const handleSelectTemplate = (template) => {
    setCampaignForm({
      ...campaignForm,
      subject: template.subject,
      body: template.body,
      ctaText: template.ctaText || "",
      ctaLink: template.ctaLink || "",
    });
    toast.info(`Loaded template: "${template.name}"`);
    setActiveTab("create");
  };

  const handleDuplicate = async (camp) => {
    const audienceSource =
      camp.audienceSource === "external" || camp.role === "External"
        ? "external"
        : "members";
    let customEmailsText = "";
    if (audienceSource === "external") {
      try {
        const data = await getOutreachCampaign(camp.id);
        const recips = data.campaign?.customRecipients || [];
        customEmailsText = recips
          .map((r) => {
            const email = r?.email || "";
            const name = r?.firstName || "";
            if (!email) return "";
            return name && name !== "there" ? `${name} <${email}>` : email;
          })
          .filter(Boolean)
          .join("\n");
      } catch (error) {
        toast.error(
          error?.response?.data?.error || "Could not load the original email list",
        );
        return;
      }
    }

    setCampaignForm({
      name: `Copy of ${camp.name}`,
      subject: camp.subject,
      previewText: camp.previewText || "",
      senderName: camp.senderName,
      senderEmail: camp.senderEmail,
      audienceSource,
      customEmailsText,
      role: audienceSource === "external" ? "Jobseeker" : camp.role || "Jobseeker",
      profession: camp.profession || "All",
      skills: camp.skills || "",
      location: camp.location || "",
      completeness: camp.completeness || "All",
      consentChecked: audienceSource !== "external",
      body: camp.body,
      ctaText: camp.ctaText || "",
      ctaLink: camp.ctaLink || "",
      logoUrl: camp.logoUrl || "/assets/images/logo.png",
      attachments: camp.attachments || [],
      sendType: "now",
      scheduledDate: "",
      scheduledTime: "",
    });
    setActiveTab("create");
    toast.success("Duplicate loaded into the campaign builder.");
  };

  const triggerDeleteCampaignModal = (id) => {
    setDeletingCampaignId(id);
  };

  const confirmDeleteCampaign = async () => {
    try {
      await deleteOutreachCampaign(deletingCampaignId);
      setDeletingCampaignId(null);
      toast.success("Campaign removed.");
      await refreshCampaigns();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete campaign");
    }
  };

  const handleOpenCreateTemplate = () => {
    setTemplateForm({
      name: "",
      subject: "",
      body: "",
      ctaText: "",
      ctaLink: "",
      category: "Job Alert",
    });
    setEditingTemplateId(null);
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tpl) => {
    setTemplateForm({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
      ctaText: tpl.ctaText || "",
      ctaLink: tpl.ctaLink || "",
      category: tpl.category || "Job Alert",
    });
    setEditingTemplateId(tpl.id);
    setShowTemplateModal(true);
  };

  const handleSaveTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      toast.error(
        "Template Name, Subject line and Message Body content are required!",
      );
      return;
    }

    try {
      if (editingTemplateId) {
        await updateOutreachTemplate(editingTemplateId, templateForm);
        toast.success(`Preset "${templateForm.name}" updated successfully.`);
      } else {
        await createOutreachTemplate(templateForm);
        toast.success(
          `Custom template "${templateForm.name}" added to presets library.`,
        );
      }
      setShowTemplateModal(false);
      await refreshTemplates();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save template");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 pb-12 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Mail className="text-[#16730F] w-7 h-7" />
            Email Outreach & Campaigns
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Build, schedule, and analyze bulk email to Bejite members or to
            people who are not yet on the platform.
          </p>
        </div>

        <div className="flex items-center bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner max-w-max self-start md:self-auto">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === "campaigns"
                ? "bg-white text-gray-900 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Campaigns History
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "create"
                ? "bg-[#16730F] text-white shadow-sm font-bold animate-pulse"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus size={16} />
            Create Campaign
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === "templates"
                ? "bg-white text-gray-900 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Templates Library
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading outreach data…</p>
      )}

      {activeTab === "campaigns" && !loading && (
        <div className="space-y-8">
          <OutreachMetricsDashboard campaigns={campaigns} />

          <CampaignHistoryTable
            campaigns={campaigns}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onViewAnalytics={setSelectedCampaign}
            onDuplicate={handleDuplicate}
            onDelete={triggerDeleteCampaignModal}
          />
        </div>
      )}

      {activeTab === "create" && (
        <CampaignBuilderWizard
          campaignForm={campaignFormWithCount}
          setCampaignForm={setCampaignForm}
          matchingCount={matchingCount}
          audienceLoading={audienceLoading}
          sampleRecipient={sampleRecipient}
          audienceMeta={audienceMeta}
          onNavigateTemplates={() => setActiveTab("templates")}
          onSubmit={handleLaunchCampaignSubmit}
        />
      )}

      {activeTab === "templates" && !loading && (
        <TemplatePresetsGrid
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
          onCreateTemplateCustomization={handleOpenCreateTemplate}
          onEditTemplate={handleOpenEditTemplate}
        />
      )}

      <CampaignAnalyticsDrawer
        selectedCampaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onDuplicate={handleDuplicate}
      />

      <DeleteCampaignConfirmModal
        isOpen={!!deletingCampaignId}
        onClose={() => setDeletingCampaignId(null)}
        onConfirm={confirmDeleteCampaign}
      />

      <TemplateEditorModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templateForm={templateForm}
        setTemplateForm={setTemplateForm}
        onSubmit={handleSaveTemplateSubmit}
        editingTemplateId={editingTemplateId}
      />
    </div>
  );
};

export default AdminEmailOutreach;
