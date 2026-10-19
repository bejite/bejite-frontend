import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LayoutTemplate, Loader2, X } from "lucide-react";

import EventHeader from "../../components/admin/events/EventHeader";
import EventComposer from "../../components/admin/events/EventComposer";
import EventSimulator from "../../components/admin/events/EventSimulator";
import EventHistory from "../../components/admin/events/EventHistory";
import EventAnalyticsModal from "../../components/admin/events/EventAnalyticsModal";
import ActiveLiveEvents from "../../components/admin/events/ActiveLiveEvents";
import TemplateCenter from "../../components/admin/events/TemplateCenter";
import {
  listPartnerEvents,
  createPartnerEvent,
  deletePartnerEvent,
  notifyPartnerEvent,
} from "../../services/partnerEventsAdminApi";

const TEMPLATES_STORAGE_KEY = "bejite_admin_event_templates";

const DEFAULT_TEMPLATES = [
  {
    id: "temp_1",
    title: "Next-Gen Fintech Summit Preset",
    host: "Bejite Finance",
    category: "Finance",
    locationType: "virtual",
    location: "https://zoom.us/j/fintech-summit-2026",
    coverImg:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80",
    tags: ["Fintech", "Blockchain", "Web3"],
    summary:
      "Explore the future of decentralized finance and banking tech with industry leaders.",
    description:
      "Join us for an exclusive 1-day summit focusing on the expansion of fintech solutions across sub-Saharan Africa.",
  },
  {
    id: "temp_2",
    title: "AI & Machine Learning Career Preset",
    host: "Bejite Tech",
    category: "Technology",
    locationType: "physical",
    location: "Silicon Valley Hub, Yaba, Lagos",
    coverImg:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    tags: ["AI", "Careers", "Networking"],
    summary:
      "Connect with top global companies hiring machine learning engineers and researchers.",
    description:
      "Are you an ML engineer or data scientist looking for your next challenge?",
  },
  {
    id: "temp_3",
    title: "Design Systems & UX Masterclass Preset",
    host: "Creative Labs",
    category: "Creative",
    locationType: "virtual",
    location: "https://meet.google.com/ux-masterclass",
    coverImg:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
    tags: ["UX/UI", "Design", "Figma"],
    summary:
      "Learn how to build scalable, accessible design systems for enterprise web apps.",
    description:
      "A comprehensive deep dive into design token architecture, component structuring in Figma, and automated handoffs.",
  },
];

const emptyForm = () => ({
  title: "",
  host: "Bejite Admin",
  category: "Technology",
  date: "",
  time: "",
  locationType: "virtual",
  location: "",
  coverImg: "",
  tags: [],
  summary: "",
  description: "",
  targetAudience: "all",
  notifyApp: true,
  notifyPush: true,
  notifyEmail: false,
  seats: 50,
});

function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveTemplates(list) {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota errors */
  }
}

export default function AdminEvents() {
  const [currentTab, setCurrentTab] = useState("history");
  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [composerTab, setComposerTab] = useState("info");
  const [previewChannel, setPreviewChannel] = useState("app");
  const [eventsList, setEventsList] = useState([]);
  const [templatesList, setTemplatesList] = useState(loadTemplates);
  const [selectedAnalyticsEvent, setSelectedAnalyticsEvent] = useState(null);
  const [selectedTemplateToConfirm, setSelectedTemplateToConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [audienceTotal, setAudienceTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPartnerEvents({ includeInactive: true });
      setEventsList(Array.isArray(data?.events) ? data.events : []);
      setAudienceTotal(Number(data?.audience?.all) || 0);
    } catch (err) {
      console.error("Failed to load partner events:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load partner events",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const liveEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return eventsList.filter(
      (e) => e.isActive !== false && e.date && e.date >= today,
    );
  }, [eventsList]);

  const totalRegistrations = useMemo(
    () =>
      eventsList.reduce(
        (sum, e) => sum + (Number(e.metrics?.registered) || 0),
        0,
      ),
    [eventsList],
  );

  const handleSelectTemplate = (template) => {
    setSelectedTemplateToConfirm(template);
  };

  const handleConfirmTemplateUse = () => {
    if (!selectedTemplateToConfirm) return;
    const template = selectedTemplateToConfirm;
    setForm({
      ...emptyForm(),
      title: template.title,
      host: template.host,
      category: template.category,
      locationType: template.locationType,
      location: template.location,
      coverImg: template.coverImg,
      tags: template.tags || [],
      summary: template.summary,
      description: template.description || "",
    });
    setIsSelectingTemplate(false);
    setSelectedTemplateToConfirm(null);
    setCurrentTab("create");
    toast.success("Template loaded! Prefill ready for customization.");
  };

  const handleClearWorkspace = (showToast = true) => {
    setForm(emptyForm());
    setComposerTab("info");
    if (showToast === true) {
      toast.success("Workspace cleared");
    }
  };

  const handleSaveTemplate = () => {
    if (!form.title) {
      toast.error("Please add a title before saving a template.");
      return;
    }
    const newTemplate = {
      id: `temp_${Date.now()}`,
      title: `${form.title} Preset`,
      host: form.host,
      category: form.category,
      locationType: form.locationType,
      location: form.location,
      coverImg: form.coverImg,
      tags: form.tags,
      summary: form.summary,
      description: form.description,
    };
    setTemplatesList((prev) => {
      const next = [newTemplate, ...prev];
      saveTemplates(next);
      return next;
    });
    toast.success("Event details saved to Template Center");
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.date) {
      toast.error("Event date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        host: form.host,
        category: form.category,
        date: form.date,
        time: form.time,
        locationType: form.locationType,
        location: form.location,
        coverImg: form.coverImg,
        tags: form.tags,
        summary: form.summary,
        description: form.description,
        targetAudience: form.targetAudience,
        notifyApp: form.notifyApp,
        notifyPush: form.notifyPush,
        notifyEmail: form.notifyEmail,
        seats: form.seats || 50,
      };

      const data = await createPartnerEvent(payload);
      const created = data?.event;
      if (created) {
        setEventsList((prev) => [created, ...prev.filter((e) => e.id !== created.id)]);
      } else {
        await fetchEvents();
      }

      const notified = data?.notify?.notified ?? 0;
      handleClearWorkspace(false);
      setCurrentTab("history");
      toast.success(
        notified > 0
          ? `Event published and notified ${notified} badge holder${notified === 1 ? "" : "s"}`
          : "Event published successfully",
      );
    } catch (err) {
      console.error("Failed to publish event:", err);
      toast.error(err?.response?.data?.message || "Failed to publish event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEvent = async (evt) => {
    try {
      const data = await notifyPartnerEvent(evt.id, {
        notifyPush: true,
        notifyEmail: false,
        targetAudience: "all",
      });
      const notified = data?.notify?.notified ?? 0;
      if (data?.event) {
        setEventsList((prev) =>
          prev.map((e) => (e.id === evt.id ? data.event : e)),
        );
      } else {
        await fetchEvents();
      }
      toast.success(
        `Resent to ${notified} badge holder${notified === 1 ? "" : "s"} for "${evt.title}"`,
      );
    } catch (err) {
      console.error("Failed to resend notifications:", err);
      toast.error(err?.response?.data?.message || "Failed to resend notifications");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deletePartnerEvent(id, { hard: true });
      setEventsList((prev) => prev.filter((e) => e.id !== id));
      toast.warning("Event deleted");
    } catch (err) {
      console.error("Failed to delete event:", err);
      toast.error(err?.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 select-none p-4">
      {currentTab === "create" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentTab("history")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="text-gray-500" size={20} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Create Event Broadcast
                </h2>
                <p className="text-xs text-gray-400">
                  Compose and publish custom events to badge holders
                  {audienceTotal > 0 ? ` · ${audienceTotal.toLocaleString()} verified` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            <EventComposer
              form={form}
              setForm={setForm}
              composerTab={composerTab}
              setComposerTab={setComposerTab}
              tagInput={tagInput}
              setTagInput={setTagInput}
              isSubmitting={isSubmitting}
              onChooseTemplate={() => setIsSelectingTemplate(true)}
              onClearWorkspace={handleClearWorkspace}
              onSubmit={handleSendBroadcast}
              onSaveTemplate={handleSaveTemplate}
              onClose={() => setCurrentTab("history")}
            />

            <EventSimulator
              form={form}
              previewChannel={previewChannel}
              setPreviewChannel={setPreviewChannel}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <EventHeader
            onCreateEvent={() => {
              handleClearWorkspace(false);
              setCurrentTab("create");
            }}
            eventsCount={eventsList.length}
            verifiedSubscribers={audienceTotal}
            upcomingCount={liveEvents.length}
            totalRegistrations={totalRegistrations}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />

          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="animate-spin mb-3" size={28} />
                <p className="text-sm font-medium">Loading events…</p>
              </div>
            ) : (
              <>
                {currentTab === "history" && (
                  <EventHistory
                    eventsList={eventsList}
                    onDeleteEvent={handleDeleteEvent}
                    onResendEvent={handleResendEvent}
                    onSelectEvent={setSelectedAnalyticsEvent}
                  />
                )}

                {currentTab === "live" && (
                  <ActiveLiveEvents eventsList={liveEvents} />
                )}

                {currentTab === "templates" && (
                  <TemplateCenter
                    templates={templatesList}
                    onSelectTemplate={handleSelectTemplate}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedAnalyticsEvent && (
          <EventAnalyticsModal
            selectedAnalyticsEvent={selectedAnalyticsEvent}
            onClose={() => setSelectedAnalyticsEvent(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSelectingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSelectingTemplate(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[85vh] overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <LayoutTemplate size={20} className="text-[#16730F]" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Select Template Preset
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSelectingTemplate(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <TemplateCenter
                templates={templatesList}
                onSelectTemplate={handleSelectTemplate}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTemplateToConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-xs"
              onClick={() => setSelectedTemplateToConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-[#16730F]/10 text-[#16730F] rounded-full flex items-center justify-center mx-auto">
                <LayoutTemplate size={24} />
              </div>
              <div className="space-y-2">
                <h3
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "NunitoBold" }}
                >
                  Use Template?
                </h3>
                <p className="text-xs text-gray-500">
                  Do you want to use the template{" "}
                  <strong className="text-gray-700">
                    &quot;{selectedTemplateToConfirm.title}&quot;
                  </strong>
                  ? This will prefill the workspace form with its preset details.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateToConfirm(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex-1"
                >
                  No, Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTemplateUse}
                  className="px-4 py-2 bg-[#16730F] hover:bg-[#0e4a09] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex-1"
                >
                  Yes, Use
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
