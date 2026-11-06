import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Hourglass,
  LogOut,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import { ConfirmModal } from "../components/modal/confirmBadgeModal";
import DisplayNameWithBadge from "../components/DisplayNameWithBadge";
import RecruiterAvatar from "../components/assign-recruiter/RecruiterAvatar";
import {
  DELEGATION_DURATIONS,
  DELEGATION_PERMISSIONS,
  acceptDelegation,
  computeEffectiveDelegationStatus,
  declineDelegation,
  getReceivedDelegations,
  isRecruiterAccount,
  leaveDelegation,
} from "../services/accountDelegationService";
import { getUser, mergeAuthUsers } from "../utils/tokenManager";

const PERMISSION_LABELS = Object.fromEntries(
  DELEGATION_PERMISSIONS.map((perm) => [perm.id, perm.label])
);

const STATUS_STYLES = {
  active: {
    label: "Active",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  paused: {
    label: "Paused by owner",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  expired: {
    label: "Expired",
    pill: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
};

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

function describeRequestedDuration(delegation) {
  if (delegation.durationType === "until_revoked") return "Until the owner revokes it";
  if (delegation.durationType === "custom") {
    return `Until ${formatShortDate(delegation.expiresAt) || "the chosen end date"}`;
  }
  const preset = DELEGATION_DURATIONS.find((d) => d.id === delegation.durationType);
  return preset?.days ? `${preset.days} days from when you accept` : "Until revoked";
}

function describeExpiry(delegation, effectiveStatus) {
  const formatted = formatShortDate(delegation.expiresAt);
  if (!formatted) return "Until revoked";
  return effectiveStatus === "expired" ? `Expired ${formatted}` : `Until ${formatted}`;
}

function AccessScope({ delegation }) {
  if (delegation.accessLevel === "full") {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <span className="font-semibold text-gray-800">Scope:</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#1A3E32]/10 text-[#1A3E32] text-[11px] font-semibold">
          All 6 operational modules
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-gray-500 mr-1">Permissions:</span>
      {(delegation.permissions || []).map((permId) => (
        <span
          key={permId}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium"
        >
          <Check className="w-3 h-3 text-[#16730F]" />
          {PERMISSION_LABELS[permId] || permId}
        </span>
      ))}
    </div>
  );
}

function ManagedAccountCard({ delegation, children, meta }) {
  const owner = delegation.owner || {};
  const isFull = delegation.accessLevel === "full";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <RecruiterAvatar recruiter={owner} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DisplayNameWithBadge
                user={owner}
                fallback={owner.name || "Account owner"}
                badgeSize="xs"
                className="font-bold text-sm sm:text-base text-gray-900"
              />
              {owner.isCorporate && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Corporate
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-500 mt-0.5">
              {owner.jobTitle && <span>{owner.jobTitle}</span>}
              {owner.companyName && owner.companyName !== owner.jobTitle && (
                <span className="inline-flex items-center gap-1 text-gray-400">
                  <Building2 className="w-3 h-3 shrink-0" />
                  {owner.companyName}
                </span>
              )}
            </div>

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
                {isFull ? "Full Access" : "Partial Access"}
              </span>
              {meta}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-start shrink-0">{children}</div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-gray-100">
        <AccessScope delegation={delegation} />
        {delegation.note && (
          <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
            "{delegation.note}"
          </p>
        )}
      </div>
    </div>
  );
}

export default function ManagedAccountsSettings() {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(() => {
    const localUser = getUser();
    return mergeAuthUsers(localUser || {}, reduxUser || localUser || {});
  }, [reduxUser]);
  const canManage = isRecruiterAccount(currentUser);

  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [leaveTarget, setLeaveTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3400);
  }, []);

  const loadDelegations = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setDelegations(await getReceivedDelegations());
    } catch (err) {
      setLoadError(err?.message || "Failed to load accounts you manage");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManage) loadDelegations();
  }, [canManage, loadDelegations]);

  const pending = delegations.filter((d) => d.status === "pending");
  const managed = delegations.filter((d) => d.status === "active" || d.status === "paused");

  const runAction = async (delegation, action, successMessage) => {
    if (busyId) return;
    setBusyId(delegation.id);
    try {
      await action(delegation.id);
      showToast(successMessage);
      setLeaveTarget(null);
      await loadDelegations();
    } catch (err) {
      showToast(err?.message || "Something went wrong. Please try again.", "error");
      if (err?.status === 404 || err?.status === 409) await loadDelegations();
    } finally {
      setBusyId(null);
    }
  };

  const ownerName = (delegation) => delegation.owner?.name || "the account owner";

  if (!canManage) {
    return <Navigate to="/account-settings" replace />;
  }

  return (
    <NewsFeedLayout classes={false} showSidebars={false}>
      <div className="h-full min-h-0 w-full max-w-screen-xl mx-auto flex flex-col">
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
              <h1 className="text-white font-bold text-xl">Managed Accounts</h1>
            </div>

            {pending.length > 0 && (
              <div className="self-start sm:self-center inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white shrink-0">
                <span className="w-2 h-2 rounded-full bg-sky-300" />
                {pending.length === 1 ? "1 Pending Request" : `${pending.length} Pending Requests`}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto nfl-scroll scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-12">
            {loading && delegations.length === 0 && (
              <div className="space-y-3">
                {[0, 1].map((key) => (
                  <div key={key} className="h-32 rounded-2xl bg-white border border-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && loadError && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loadError}</span>
                </div>
                <button
                  type="button"
                  onClick={loadDelegations}
                  className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-xl border border-red-200 bg-white text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try again
                </button>
              </div>
            )}

            {!loading && !loadError && delegations.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EAF5E9] flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6 text-[#16730F]" />
                </div>
                <h2 className="font-bold text-gray-900">No managed accounts yet</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  When another recruiter asks you to help manage their Bejite account, the request
                  will appear here for you to accept or decline.
                </p>
              </div>
            )}

            {pending.length > 0 && (
              <section className="space-y-2.5">
                <p className="px-1 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Requests awaiting your response ({pending.length})
                </p>
                {pending.map((delegation) => (
                  <ManagedAccountCard
                    key={delegation.id}
                    delegation={delegation}
                    meta={
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Hourglass className="w-3.5 h-3.5 text-gray-400" />
                        {describeRequestedDuration(delegation)}
                      </span>
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          delegation,
                          declineDelegation,
                          `Declined the request from ${ownerName(delegation)}`
                        )
                      }
                      disabled={Boolean(busyId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          delegation,
                          acceptDelegation,
                          `You can now manage ${ownerName(delegation)}'s account`
                        )
                      }
                      disabled={Boolean(busyId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16730F] hover:bg-[#125B0C] text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {busyId === delegation.id ? "Saving..." : "Accept"}
                    </button>
                  </ManagedAccountCard>
                ))}
              </section>
            )}

            {managed.length > 0 && (
              <section className="space-y-2.5">
                <p className="px-1 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Accounts you manage ({managed.length})
                </p>
                {managed.map((delegation) => {
                  const effectiveStatus = computeEffectiveDelegationStatus(delegation);
                  const statusStyle = STATUS_STYLES[effectiveStatus] || STATUS_STYLES.expired;
                  return (
                    <ManagedAccountCard
                      key={delegation.id}
                      delegation={delegation}
                      meta={
                        <>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.pill}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {describeExpiry(delegation, effectiveStatus)}
                          </span>
                        </>
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setLeaveTarget(delegation)}
                        disabled={Boolean(busyId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Leave
                      </button>
                    </ManagedAccountCard>
                  );
                })}
              </section>
            )}
          </div>
        </div>
      </div>

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

      <AnimatePresence>
        {leaveTarget && (
          <ConfirmModal
            key="confirm-leave-account"
            title="Leave Managed Account"
            description={`Stop managing ${ownerName(leaveTarget)}'s account? Your delegated access ends immediately and they will be notified. They would need to send a new request to give you access again.`}
            confirmLabel="Leave Account"
            danger
            icon={LogOut}
            isLoading={busyId === leaveTarget.id}
            onClose={() => setLeaveTarget(null)}
            onConfirm={() =>
              runAction(leaveTarget, leaveDelegation, `You left ${ownerName(leaveTarget)}'s account`)
            }
          />
        )}
      </AnimatePresence>
    </NewsFeedLayout>
  );
}
