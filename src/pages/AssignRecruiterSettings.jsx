import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UserMinus,
  PauseCircle,
  PlayCircle,
  Pencil,
  Check,
  X,
  Clock,
  Calendar,
  Building2,
  Briefcase,
  FileText,
  GitBranch,
  MessageSquare,
  Sparkles,
  Lock,
  History,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import DisplayNameWithBadge from "../components/DisplayNameWithBadge";
import { ConfirmModal } from "../components/modal/confirmBadgeModal";
import Loader from "../components/ui/Loader";
import { fetchRecruiters } from "../services/recruitersApi";
import {
  DELEGATION_PERMISSIONS,
  DELEGATION_PRESETS,
  DELEGATION_DURATIONS,
  ALL_PERMISSION_IDS,
  computeEffectiveDelegationStatus,
  getAccountDelegations,
  getAccountDelegationLogs,
  assignAccountToRecruiter,
  updateAccountDelegation,
  revokeAccountDelegation,
} from "../services/accountDelegationService";
import { profilePhotoUrl } from "../utils/profilePhotoUrl";

const PERMISSION_ICONS = {
  jobs_manage: Briefcase,
  applications_review: FileText,
  pipeline_manage: GitBranch,
  candidate_outreach: UserCheck,
  messaging_respond: MessageSquare,
  content_manage: Sparkles,
};

function getInitials(name) {
  if (!name) return "R";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return String(name).slice(0, 2).toUpperCase();
}

function getTomorrowInputDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toInputDateValue(isoString) {
  if (!isoString) return "";
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(isoString) {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(isoString) {
  if (!isoString) return "";
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RecruiterAvatar({ recruiter, sizeClass = "w-11 h-11", textClass = "text-sm" }) {
  const [failed, setFailed] = useState(false);
  const photoSrc = profilePhotoUrl(recruiter?.profilePhoto);

  if (photoSrc && !failed) {
    return (
      <img
        src={photoSrc}
        alt={recruiter?.name || "Recruiter"}
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-gray-200 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#1A3E32] to-[#2d6a54] text-white font-bold ${textClass} flex items-center justify-center shrink-0`}
    >
      {getInitials(recruiter?.name)}
    </div>
  );
}

export default function AssignRecruiterSettings() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Existing delegations & audit logs
  const [delegations, setDelegations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [delegationsLoading, setDelegationsLoading] = useState(true);

  // Recruiter directory search
  const [recruiters, setRecruiters] = useState([]);
  const [recruitersLoading, setRecruitersLoading] = useState(true);
  const [recruitersError, setRecruitersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(true);

  // Assignment form state
  const [editingDelegationId, setEditingDelegationId] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [accessLevel, setAccessLevel] = useState("partial");
  const [selectedPermissions, setSelectedPermissions] = useState([
    "applications_review",
    "pipeline_manage",
  ]);
  const [durationType, setDurationType] = useState("until_revoked");
  const [customExpiresAt, setCustomExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionBusyId, setActionBusyId] = useState(null);

  // Confirmation modals & toast
  const [confirmFullModalOpen, setConfirmFullModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3400);
  }, []);

  const refreshDelegationsAndLogs = useCallback(async () => {
    const [nextDelegations, nextLogs] = await Promise.all([
      getAccountDelegations(),
      getAccountDelegationLogs(),
    ]);
    setDelegations(
      Array.isArray(nextDelegations)
        ? nextDelegations.filter((item) => item && item.status !== "revoked")
        : []
    );
    setLogs(Array.isArray(nextLogs) ? nextLogs : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDelegationsLoading(true);
    Promise.all([getAccountDelegations(), getAccountDelegationLogs()])
      .then(([loadedDelegations, loadedLogs]) => {
        if (cancelled) return;
        setDelegations(
          Array.isArray(loadedDelegations)
            ? loadedDelegations.filter((item) => item && item.status !== "revoked")
            : []
        );
        setLogs(Array.isArray(loadedLogs) ? loadedLogs : []);
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(
            err?.message || "Failed to load current recruiter assignments",
            "error"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setDelegationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const loadRecruiterDirectory = useCallback(async (query = "") => {
    setRecruitersLoading(true);
    setRecruitersError("");
    try {
      const results = await fetchRecruiters({ query, limit: 60 });
      setRecruiters(results);
    } catch (err) {
      setRecruitersError(
        err?.message || "Could not load recruiters right now. Please try again."
      );
    } finally {
      setRecruitersLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecruiterDirectory(searchQuery);
    }, searchQuery.trim() ? 280 : 0);

    return () => clearTimeout(timer);
  }, [searchQuery, loadRecruiterDirectory]);

  const assignedByRecruiterId = useMemo(() => {
    const map = new Map();
    for (const item of delegations) {
      const key = String(item?.recruiter?.id || item?.recruiterId || "")
        .trim()
        .toLowerCase();
      if (key) {
        map.set(key, item);
      }
    }
    return map;
  }, [delegations]);

  const activeDelegationCount = useMemo(
    () =>
      delegations.filter(
        (item) => computeEffectiveDelegationStatus(item) === "active"
      ).length,
    [delegations]
  );

  const resetForm = useCallback(() => {
    setEditingDelegationId(null);
    setSelectedRecruiter(null);
    setIsPickerOpen(true);
    setAccessLevel("partial");
    setSelectedPermissions(["applications_review", "pipeline_manage"]);
    setDurationType("until_revoked");
    setCustomExpiresAt("");
    setNote("");
    setFormError("");
  }, []);

  const populateFormFromDelegation = useCallback((delegation) => {
    if (!delegation) return;
    setEditingDelegationId(delegation.id);
    setSelectedRecruiter(delegation.recruiter || null);
    setIsPickerOpen(false);
    setAccessLevel(delegation.accessLevel === "full" ? "full" : "partial");
    setSelectedPermissions(
      Array.isArray(delegation.permissions) && delegation.permissions.length > 0
        ? delegation.permissions
        : ["applications_review", "pipeline_manage"]
    );
    setDurationType(delegation.durationType || "until_revoked");
    setCustomExpiresAt(
      delegation.durationType === "custom"
        ? toInputDateValue(delegation.expiresAt)
        : ""
    );
    setNote(delegation.note || "");
    setFormError("");

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const handleSelectRecruiter = (recruiter) => {
    const key = String(recruiter?.id || "").trim().toLowerCase();
    const existingDelegation = key ? assignedByRecruiterId.get(key) : null;
    if (existingDelegation) {
      populateFormFromDelegation(existingDelegation);
      showToast(
        `${recruiter.name} is already assigned — loaded their access settings for editing.`
      );
      return;
    }

    setSelectedRecruiter(recruiter);
    setIsPickerOpen(false);
    setFormError("");
  };

  const togglePermission = (permissionId) => {
    setFormError("");
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const applyPreset = (permissions) => {
    setAccessLevel("partial");
    setSelectedPermissions([...permissions]);
    setFormError("");
  };

  const validateBeforeSubmit = () => {
    if (!selectedRecruiter?.id) {
      setFormError("Please select a recruiter from Step 1 before continuing.");
      return false;
    }
    if (accessLevel === "partial" && selectedPermissions.length === 0) {
      setFormError(
        "Please enable at least one permission for Partial Assignment, or switch to Full Assignment."
      );
      return false;
    }
    if (durationType === "custom") {
      if (!customExpiresAt) {
        setFormError("Please pick a custom expiration date.");
        return false;
      }
      const chosen = new Date(`${customExpiresAt}T23:59:59`);
      if (Number.isNaN(chosen.getTime()) || chosen.getTime() <= Date.now()) {
        setFormError("Custom expiration date must be in the future.");
        return false;
      }
    }
    setFormError("");
    return true;
  };

  const executeSaveAssignment = async () => {
    setSubmitting(true);
    setFormError("");
    try {
      const targetName = selectedRecruiter?.name || "Recruiter";
      if (editingDelegationId) {
        await updateAccountDelegation(editingDelegationId, {
          recruiter: selectedRecruiter,
          accessLevel,
          permissions:
            accessLevel === "full" ? ALL_PERMISSION_IDS : selectedPermissions,
          durationType,
          customExpiresAt,
          note,
          status: "active",
        });
        await refreshDelegationsAndLogs();
        showToast(`Updated account access for ${targetName}`);
      } else {
        await assignAccountToRecruiter({
          recruiter: selectedRecruiter,
          accessLevel,
          permissions:
            accessLevel === "full" ? ALL_PERMISSION_IDS : selectedPermissions,
          durationType,
          customExpiresAt,
          note,
        });
        await refreshDelegationsAndLogs();
        showToast(
          accessLevel === "full"
            ? `Full account access assigned to ${targetName}`
            : `Partial account access assigned to ${targetName}`
        );
      }
      setConfirmFullModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not save recruiter assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    const existingRecord = editingDelegationId
      ? delegations.find((d) => d.id === editingDelegationId)
      : null;
    const requiresFullConfirm =
      accessLevel === "full" && existingRecord?.accessLevel !== "full";

    if (requiresFullConfirm) {
      setConfirmFullModalOpen(true);
      return;
    }

    executeSaveAssignment();
  };

  const handleTogglePause = async (delegation) => {
    if (!delegation || actionBusyId) return;
    const effective = computeEffectiveDelegationStatus(delegation);
    const nextStatus = effective === "paused" ? "active" : "paused";

    setActionBusyId(delegation.id);
    try {
      await updateAccountDelegation(delegation.id, { status: nextStatus });
      await refreshDelegationsAndLogs();
      showToast(
        nextStatus === "paused"
          ? `Paused access for ${delegation.recruiter?.name || "recruiter"}`
          : `Resumed access for ${delegation.recruiter?.name || "recruiter"}`
      );
    } catch (err) {
      showToast(err?.message || "Could not update assignment status", "error");
    } finally {
      setActionBusyId(null);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    setActionBusyId(revokeTarget.id);
    try {
      const removedName = revokeTarget.recruiter?.name || "Recruiter";
      await revokeAccountDelegation(revokeTarget.id);
      if (editingDelegationId === revokeTarget.id) {
        resetForm();
      }
      await refreshDelegationsAndLogs();
      setRevokeTarget(null);
      showToast(`Revoked account access from ${removedName}`);
    } catch (err) {
      showToast(err?.message || "Could not revoke recruiter access", "error");
    } finally {
      setActionBusyId(null);
    }
  };

  const permissionLabelMap = useMemo(() => {
    const map = {};
    for (const perm of DELEGATION_PERMISSIONS) {
      map[perm.id] = perm.label;
    }
    return map;
  }, []);

  return (
    <NewsFeedLayout classes={false} showSidebars={false}>
      <div className="h-full min-h-0 w-full max-w-screen-xl mx-auto flex flex-col">
        {/* Top Banner */}
        <div className="bg-[#1A3E32] px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => navigate("/account-settings")}
                className="inline-flex items-center gap-1.5 text-green-200 hover:text-white text-xs font-medium mb-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Account Settings
              </button>
              <h1 className="text-white font-bold text-xl">
                Assign Account to a Recruiter
              </h1>
              <p className="text-green-200 text-xs sm:text-sm mt-0.5">
                Delegate partial or full hiring & account operations to a trusted recruiter
              </p>
            </div>

            <div className="self-start sm:self-center inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shrink-0">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeDelegationCount > 0 ? "bg-emerald-400" : "bg-gray-300"
                }`}
              />
              {activeDelegationCount === 1
                ? "1 Active Assignment"
                : `${activeDelegationCount} Active Assignments`}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto nfl-scroll scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-12">
            {/* Ownership & Security Guarantee Banner */}
            <div className="bg-[#EAF5E9]/70 border border-[#1A3E32]/15 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1A3E32] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1A3E32]">
                  You always retain primary ownership of your account
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Assigned recruiters act as authorized delegates on your behalf. Even under{" "}
                  <span className="font-semibold text-gray-800">Full Assignment</span>,
                  critical owner controls—including changing your password, 2FA, payment
                  methods, or deleting your account—remain strictly locked to you. You can
                  pause, adjust permissions, or revoke access instantly.
                </p>
              </div>
            </div>

            {/* Assigned Recruiters List */}
            {!delegationsLoading && delegations.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Assigned Recruiters ({delegations.length})
                  </p>
                  {editingDelegationId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-semibold text-[#16730F] hover:underline cursor-pointer"
                    >
                      + Assign a different recruiter
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {delegations.map((delegation) => {
                    const recruiter = delegation.recruiter || {};
                    const effectiveStatus =
                      computeEffectiveDelegationStatus(delegation);
                    const isFull = delegation.accessLevel === "full";
                    const expiryFormatted = formatShortDate(delegation.expiresAt);
                    const isEditingThis = editingDelegationId === delegation.id;
                    const isBusy = actionBusyId === delegation.id;

                    return (
                      <div
                        key={delegation.id}
                        className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
                          isEditingThis
                            ? "border-[#16730F] ring-2 ring-[#16730F]/15"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <RecruiterAvatar recruiter={recruiter} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <DisplayNameWithBadge
                                  user={recruiter}
                                  fallback={recruiter.name || "Recruiter"}
                                  badgeSize="xs"
                                  className="font-bold text-sm sm:text-base text-gray-900"
                                />
                                {recruiter.isCorporate && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    Corporate
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                                {recruiter.jobTitle && (
                                  <span>{recruiter.jobTitle}</span>
                                )}
                                {recruiter.companyName &&
                                  recruiter.companyName !== recruiter.jobTitle && (
                                    <span className="inline-flex items-center gap-1 text-gray-400">
                                      <Building2 className="w-3 h-3 shrink-0" />
                                      {recruiter.companyName}
                                    </span>
                                  )}
                                {recruiter.email && (
                                  <span className="text-gray-400 truncate">
                                    · {recruiter.email}
                                  </span>
                                )}
                              </div>

                              {/* Badges Row */}
                              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    isFull
                                      ? "bg-[#1A3E32] text-white"
                                      : "bg-[#EAF5E9] text-[#16730F] border border-[#16730F]/20"
                                  }`}
                                >
                                  {isFull ? (
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                  )}
                                  {isFull ? "Full Assignment" : "Partial Assignment"}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    effectiveStatus === "active"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : effectiveStatus === "paused"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-gray-100 text-gray-600 border border-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      effectiveStatus === "active"
                                        ? "bg-emerald-500"
                                        : effectiveStatus === "paused"
                                          ? "bg-amber-500"
                                          : "bg-gray-400"
                                    }`}
                                  />
                                  {effectiveStatus === "active"
                                    ? "Active"
                                    : effectiveStatus === "paused"
                                      ? "Paused"
                                      : "Expired"}
                                </span>

                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  {expiryFormatted
                                    ? effectiveStatus === "expired"
                                      ? `Expired ${expiryFormatted}`
                                      : `Until ${expiryFormatted}`
                                    : "Until revoked"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                            <button
                              type="button"
                              onClick={() => populateFormFromDelegation(delegation)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#1A3E32]/40 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>

                            {effectiveStatus !== "expired" && (
                              <button
                                type="button"
                                onClick={() => handleTogglePause(delegation)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-amber-50/60 hover:border-amber-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {effectiveStatus === "paused" ? (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5 text-[#16730F]" />
                                    Resume
                                  </>
                                ) : (
                                  <>
                                    <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                    Pause
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setRevokeTarget(delegation)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          </div>
                        </div>

                        {/* Granted Scope Pills */}
                        <div className="mt-3.5 pt-3 border-t border-gray-100">
                          {isFull ? (
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold text-gray-800">
                                Scope:
                              </span>{" "}
                              Full operational access across Job Postings, Applications,
                              Hiring Pipelines, Candidate Outreach, Messaging, and
                              Pitches/Posts.
                            </p>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-semibold text-gray-500 mr-1">
                                Permissions:
                              </span>
                              {(delegation.permissions || []).map((permId) => (
                                <span
                                  key={permId}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium"
                                >
                                  <Check className="w-3 h-3 text-[#16730F]" />
                                  {permissionLabelMap[permId] || permId}
                                </span>
                              ))}
                            </div>
                          )}

                          {delegation.note && (
                            <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                              "{delegation.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Main Assignment Configurator Form */}
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
            >
              {/* Form Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                      {editingDelegationId
                        ? "Update Recruiter Assignment"
                        : "New Recruiter Assignment"}
                    </h2>
                    {editingDelegationId && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5E9] text-[#16730F]">
                        Editing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingDelegationId
                      ? "Adjust between partial or full assignment, update permissions, or change expiration."
                      : "Search for a verified or registered recruiter on Bejite and configure their access level."}
                  </p>
                </div>

                {editingDelegationId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-7">
                {/* STEP 1: Select Recruiter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#1A3E32] text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">
                        Select Recruiter
                      </h3>
                    </div>

                    {selectedRecruiter && !isPickerOpen && !editingDelegationId && (
                      <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        className="text-xs font-semibold text-[#16730F] hover:underline cursor-pointer"
                      >
                        Change recruiter
                      </button>
                    )}
                  </div>

                  {/* Selected Recruiter Card */}
                  {selectedRecruiter && !isPickerOpen ? (
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-[#16730F] bg-[#EAF5E9]/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <RecruiterAvatar recruiter={selectedRecruiter} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <DisplayNameWithBadge
                              user={selectedRecruiter}
                              fallback={selectedRecruiter.name}
                              badgeSize="xs"
                              className="font-bold text-sm text-gray-900"
                            />
                            {selectedRecruiter.isCorporate && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Corporate
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate mt-0.5">
                            {[
                              selectedRecruiter.jobTitle,
                              selectedRecruiter.companyName &&
                              selectedRecruiter.companyName !==
                                selectedRecruiter.jobTitle
                                ? selectedRecruiter.companyName
                                : null,
                              selectedRecruiter.email,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16730F] text-white text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by recruiter name, email, role, or company..."
                          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A3E32] focus:ring-2 focus:ring-[#1A3E32]/15 transition-all"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            aria-label="Clear search"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Directory Results */}
                      <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/40">
                        {recruitersLoading ? (
                          <div className="py-8">
                            <Loader
                              fullscreen={false}
                              size="sm"
                              description="Loading recruiters..."
                            />
                          </div>
                        ) : recruitersError ? (
                          <div className="p-6 text-center space-y-2.5">
                            <p className="text-sm font-medium text-red-600">
                              {recruitersError}
                            </p>
                            <button
                              type="button"
                              onClick={() => loadRecruiterDirectory(searchQuery)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A3E32] text-white text-xs font-semibold hover:bg-[#153329] transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Try Again
                            </button>
                          </div>
                        ) : recruiters.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-sm font-semibold text-gray-700">
                              No matching recruiters found
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {searchQuery.trim()
                                ? `No recruiter matched "${searchQuery}". Try another name, company, or email.`
                                : "No discoverable recruiters are available right now."}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="px-3.5 py-2 bg-white border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                              <span>
                                {recruiters.length}{" "}
                                {recruiters.length === 1
                                  ? "recruiter"
                                  : "recruiters"}{" "}
                                available
                              </span>
                              {selectedRecruiter && (
                                <button
                                  type="button"
                                  onClick={() => setIsPickerOpen(false)}
                                  className="font-semibold text-[#16730F] hover:underline cursor-pointer"
                                >
                                  Keep {selectedRecruiter.name}
                                </button>
                              )}
                            </div>

                            <div className="max-h-68 overflow-y-auto divide-y divide-gray-100 bg-white">
                              {recruiters.map((recruiter) => {
                                const recKey = String(recruiter.id || "")
                                  .trim()
                                  .toLowerCase();
                                const existing = recKey
                                  ? assignedByRecruiterId.get(recKey)
                                  : null;

                                return (
                                  <div
                                    key={recruiter.id}
                                    onClick={() => handleSelectRecruiter(recruiter)}
                                    className="flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#EAF5E9]/40 transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <RecruiterAvatar
                                        recruiter={recruiter}
                                        sizeClass="w-10 h-10"
                                        textClass="text-xs"
                                      />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <DisplayNameWithBadge
                                            user={recruiter}
                                            fallback={recruiter.name}
                                            badgeSize="xs"
                                            className="font-semibold text-sm text-gray-900"
                                          />
                                          {recruiter.isCorporate && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                              Corporate
                                            </span>
                                          )}
                                          {existing && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                              Assigned
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                          {[
                                            recruiter.jobTitle,
                                            recruiter.companyName &&
                                            recruiter.companyName !==
                                              recruiter.jobTitle
                                              ? recruiter.companyName
                                              : null,
                                          ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectRecruiter(recruiter);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#1A3E32] hover:text-white text-gray-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                                    >
                                      {existing ? "Edit Access" : "Select"}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 2: Assignment Level (Partial vs Full) */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1A3E32] text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">
                      Choose Assignment Type
                    </h3>
                  </div>

                  {/* Partial vs Full Radio Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Partial Assignment Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccessLevel("partial");
                        setFormError("");
                      }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        accessLevel === "partial"
                          ? "border-[#16730F] bg-[#EAF5E9]/45 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              accessLevel === "partial"
                                ? "bg-[#16730F] text-white"
                                : "bg-gray-100 text-[#1A3E32]"
                            }`}
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1A3E32]/10 text-[#1A3E32]">
                              Recommended
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                accessLevel === "partial"
                                  ? "border-[#16730F] bg-[#16730F]"
                                  : "border-gray-300"
                              }`}
                            >
                              {accessLevel === "partial" && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="font-bold text-gray-900 text-sm mt-3">
                          Partial Assignment
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Choose exact capabilities—such as screening applications,
                          managing pipeline stages, or sourcing candidates.
                        </p>
                      </div>

                      <p className="text-[11px] font-semibold text-[#16730F] mt-3 pt-2.5 border-t border-gray-200/70">
                        Granular module-by-module control
                      </p>
                    </button>

                    {/* Full Assignment Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccessLevel("full");
                        setFormError("");
                      }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        accessLevel === "full"
                          ? "border-[#1A3E32] bg-[#1A3E32]/[0.04] shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              accessLevel === "full"
                                ? "bg-[#1A3E32] text-white"
                                : "bg-gray-100 text-[#1A3E32]"
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              accessLevel === "full"
                                ? "border-[#1A3E32] bg-[#1A3E32]"
                                : "border-gray-300"
                            }`}
                          >
                            {accessLevel === "full" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>

                        <p className="font-bold text-gray-900 text-sm mt-3">
                          Full Assignment
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Authorize a dedicated recruiter to operate your entire
                          hiring workflow, messaging, jobs, and pitches end-to-end.
                        </p>
                      </div>

                      <p className="text-[11px] font-semibold text-[#1A3E32] mt-3 pt-2.5 border-t border-gray-200/70">
                        All 6 operational modules · Owner security locked
                      </p>
                    </button>
                  </div>

                  {/* Scope Configuration Panel */}
                  {accessLevel === "partial" ? (
                    <div className="rounded-2xl border border-gray-200 p-4 space-y-3.5 bg-gray-50/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            Select Allowed Permissions
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {selectedPermissions.length} of{" "}
                            {DELEGATION_PERMISSIONS.length} modules enabled
                          </p>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {DELEGATION_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => applyPreset(preset.permissions)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#16730F] text-[11px] font-medium text-gray-700 transition-colors cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {DELEGATION_PERMISSIONS.map((perm) => {
                          const checked = selectedPermissions.includes(perm.id);
                          const PermIcon = PERMISSION_ICONS[perm.id] || Shield;

                          return (
                            <button
                              key={perm.id}
                              type="button"
                              onClick={() => togglePermission(perm.id)}
                              className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                                checked
                                  ? "bg-white border-[#16730F] shadow-2xs"
                                  : "bg-white/70 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  checked
                                    ? "bg-[#16730F] border-[#16730F] text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <PermIcon className="w-3.5 h-3.5 text-[#1A3E32] shrink-0" />
                                  <p className="text-xs font-bold text-gray-900">
                                    {perm.label}
                                  </p>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                  {perm.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#1A3E32]/20 bg-[#1A3E32]/[0.03] p-4 space-y-3">
                      <p className="text-xs font-bold text-[#1A3E32]">
                        Included in Full Assignment:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {DELEGATION_PERMISSIONS.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 text-xs text-gray-700 bg-white rounded-xl px-3 py-2 border border-gray-100"
                          >
                            <Check className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
                            <span className="font-medium">{perm.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 pt-1 text-[11px] text-gray-600">
                        <Lock className="w-3.5 h-3.5 text-[#1A3E32] shrink-0 mt-0.5" />
                        <span>
                          Login password, 2FA settings, saved payment cards, and
                          account deletion remain strictly restricted to you.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 3: Duration & Handover Note */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1A3E32] text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">
                      Access Duration & Handover Note
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      How long should this assignment stay active?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DELEGATION_DURATIONS.map((option) => {
                        const active = durationType === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setDurationType(option.id);
                              setFormError("");
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              active
                                ? "bg-[#1A3E32] text-white border-[#1A3E32]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    {durationType === "custom" && (
                      <div className="pt-2 max-w-xs">
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-[#1A3E32]" />
                          Automatic expiration date
                        </label>
                        <input
                          type="date"
                          min={getTomorrowInputDate()}
                          value={customExpiresAt}
                          onChange={(e) => {
                            setCustomExpiresAt(e.target.value);
                            setFormError("");
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#1A3E32] focus:ring-2 focus:ring-[#1A3E32]/15"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Handover / Scope Note{" "}
                        <span className="font-normal text-gray-400">
                          (Optional)
                        </span>
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {note.length}/240
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={240}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Manage Q4 engineering job postings, screen incoming CVs, and schedule shortlist interviews."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A3E32] focus:ring-2 focus:ring-[#1A3E32]/15 resize-none"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Submit Bar */}
                <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    {selectedRecruiter
                      ? `Assigning ${
                          accessLevel === "full" ? "Full" : "Partial"
                        } Access to ${selectedRecruiter.name}`
                      : "Select a recruiter in Step 1 to enable assignment"}
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-[#16730F] hover:bg-[#125B0C] text-white text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {submitting
                      ? "Saving Assignment..."
                      : editingDelegationId
                        ? "Save Access Changes"
                        : accessLevel === "full"
                          ? "Assign Full Account Access"
                          : "Assign Partial Account Access"}
                  </button>
                </div>
              </div>
            </form>

            {/* Recent Delegation Activity Trail */}
            {logs.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#1A3E32]" />
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Delegation Activity Log
                  </h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {logs.slice(0, 8).map((entry) => (
                    <div
                      key={entry.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-gray-700 font-medium">
                        {entry.summary}
                      </span>
                      <span className="text-gray-400 shrink-0">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-lg"
          >
            {toast.tone === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-green-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {confirmFullModalOpen && selectedRecruiter && (
          <ConfirmModal
            key="confirm-full-assignment"
            title="Confirm Full Account Assignment"
            description={`Grant ${selectedRecruiter.name} full operational access to manage your jobs, applications, hiring pipelines, candidate outreach, messages, and pitches? Your password, 2FA, billing, and account deletion will remain locked to you.`}
            confirmLabel="Grant Full Access"
            icon={ShieldCheck}
            iconBg="bg-[#EAF5E9]"
            iconColor="text-[#16730F]"
            isLoading={submitting}
            onClose={() => setConfirmFullModalOpen(false)}
            onConfirm={executeSaveAssignment}
          />
        )}

        {revokeTarget && (
          <ConfirmModal
            key="confirm-revoke-assignment"
            title="Revoke Recruiter Assignment"
            description={`Immediately remove ${revokeTarget.recruiter?.name || "this recruiter"}'s delegated access to your Bejite account? They will no longer be able to manage workflows on your behalf.`}
            confirmLabel="Revoke Access"
            danger
            icon={UserMinus}
            isLoading={actionBusyId === revokeTarget.id}
            onClose={() => setRevokeTarget(null)}
            onConfirm={handleConfirmRevoke}
          />
        )}
      </AnimatePresence>
    </NewsFeedLayout>
  );
}

