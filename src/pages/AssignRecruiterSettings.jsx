import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  UserMinus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import { ConfirmModal } from "../components/modal/confirmBadgeModal";
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
  isRecruiterAccount,
} from "../services/accountDelegationService";
import { getUser, mergeAuthUsers } from "../utils/tokenManager";
import RecruiterPickerStep from "../components/assign-recruiter/RecruiterPickerStep";
import AssignmentTypeStep from "../components/assign-recruiter/AssignmentTypeStep";
import AssignmentDurationStep from "../components/assign-recruiter/AssignmentDurationStep";
import AssignedRecruiterCard from "../components/assign-recruiter/AssignedRecruiterCard";
import DelegationActivityLog from "../components/assign-recruiter/DelegationActivityLog";

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

export default function AssignRecruiterSettings() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const reduxUser = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(() => {
    const localUser = getUser();
    return mergeAuthUsers(localUser || {}, reduxUser || localUser || {});
  }, [reduxUser]);
  const canManageDelegation = isRecruiterAccount(currentUser);

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
    if (!canManageDelegation) return undefined;
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
  }, [canManageDelegation, showToast]);

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
    if (!canManageDelegation) return undefined;
    const timer = setTimeout(() => {
      loadRecruiterDirectory(searchQuery);
    }, searchQuery.trim() ? 280 : 0);

    return () => clearTimeout(timer);
  }, [canManageDelegation, searchQuery, loadRecruiterDirectory]);

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

  if (!canManageDelegation) {
    return <Navigate to="/account-settings" replace />;
  }

  return (
    <NewsFeedLayout classes={false} showSidebars={false}>
      <div className="h-full min-h-0 w-full max-w-screen-xl mx-auto flex flex-col">
        {/* Top Banner (Description Removed) */}
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
                  {delegations.map((delegation) => (
                    <AssignedRecruiterCard
                      key={delegation.id}
                      delegation={delegation}
                      isEditingThis={editingDelegationId === delegation.id}
                      isBusy={actionBusyId === delegation.id}
                      onEdit={populateFormFromDelegation}
                      onTogglePause={handleTogglePause}
                      onRevoke={setRevokeTarget}
                      permissionLabelMap={permissionLabelMap}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Assignment Configurator Form */}
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
            >
              {/* Form Header (Description Removed) */}
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
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
                {/* STEP 1: Select Recruiter Component */}
                <RecruiterPickerStep
                  selectedRecruiter={selectedRecruiter}
                  isPickerOpen={isPickerOpen}
                  editingDelegationId={editingDelegationId}
                  onOpenPicker={() => setIsPickerOpen(true)}
                  onClosePicker={() => setIsPickerOpen(false)}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  recruiters={recruiters}
                  recruitersLoading={recruitersLoading}
                  recruitersError={recruitersError}
                  onRetry={() => loadRecruiterDirectory(searchQuery)}
                  onSelectRecruiter={handleSelectRecruiter}
                  assignedByRecruiterId={assignedByRecruiterId}
                />

                {/* STEP 2: Assignment Type & Permissions Component */}
                <AssignmentTypeStep
                  accessLevel={accessLevel}
                  onAccessLevelChange={setAccessLevel}
                  selectedPermissions={selectedPermissions}
                  onTogglePermission={togglePermission}
                  onApplyPreset={applyPreset}
                  permissions={DELEGATION_PERMISSIONS}
                  presets={DELEGATION_PRESETS}
                />

                {/* STEP 3: Duration & Handover Note Component */}
                <AssignmentDurationStep
                  durationType={durationType}
                  onDurationTypeChange={setDurationType}
                  customExpiresAt={customExpiresAt}
                  onCustomExpiresAtChange={setCustomExpiresAt}
                  minCustomDate={getTomorrowInputDate()}
                  note={note}
                  onNoteChange={setNote}
                  durations={DELEGATION_DURATIONS}
                />

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

            {/* Recent Delegation Activity Trail Component */}
            <DelegationActivityLog logs={logs} />
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
