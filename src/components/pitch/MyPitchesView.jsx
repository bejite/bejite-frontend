import React from "react";
import { Play, Eye, Heart, Pencil, Trash2, ZapIcon } from "lucide-react";

export default function MyPitchesView({
  myPitchesSubTab,
  onSubTabChange,
  userActivePitches,
  drafts,
  onViewUserPitch,
  onContinueEditingDraft,
  onDeleteDraft,
  onEditActivePitch,
  onDeleteActivePitch,
}) {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-5">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#1A3E32] tracking-tight">
          My Pitches
        </h1>
        <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Create, manage and track your professional Pitches.
        </p>
      </div>

      {/* Subtabs: Active | Drafts */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSubTabChange("active")}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            myPitchesSubTab === "active"
              ? "bg-[#16730F] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => onSubTabChange("drafts")}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            myPitchesSubTab === "drafts"
              ? "bg-[#C05621] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Drafts {drafts.length > 0 && `(${drafts.length})`}
        </button>
      </div>

      {/* ACTIVE SUBTAB */}
      {myPitchesSubTab === "active" && (
        <div className="space-y-3">
          {userActivePitches.length > 0 ? (
            userActivePitches.map((item) => (
              <ActivePitchCard
                key={item.id}
                item={item}
                onView={() => onViewUserPitch(item)}
                onEdit={() => onEditActivePitch?.(item)}
                onDelete={() => onDeleteActivePitch?.(item.id)}
              />
            ))
          ) : (
            <div className="p-6 sm:p-8 text-center bg-white rounded-xl sm:rounded-2xl border border-gray-200 text-gray-500 text-xs sm:text-sm">
              No active pitches yet. Click &quot;Create Pitch&quot; to broadcast your first video!
            </div>
          )}
        </div>
      )}

      {/* DRAFTS SUBTAB */}
      {myPitchesSubTab === "drafts" && (
        <div className="space-y-3">
          {drafts.length > 0 ? (
            drafts.map((draft) => (
              <DraftPitchCard
                key={draft.id}
                draft={draft}
                onContinueEditing={() => onContinueEditingDraft(draft)}
                onDelete={() => onDeleteDraft(draft.id)}
              />
            ))
          ) : (
            <div className="p-6 sm:p-8 text-center bg-white rounded-xl sm:rounded-2xl border border-gray-200 text-gray-500 text-xs sm:text-sm">
              No saved drafts. Pitch drafts will automatically appear here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────── Active Pitch Row Card ───────── */
function ActivePitchCard({ item, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 p-3 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 shadow-xs">
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Dark thumbnail square */}
        <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#1A3E32] shrink-0 overflow-hidden flex items-center justify-center">
          {item.videoPoster || item.videoThumbnailUrl ? (
            <img
              src={item.videoPoster || item.videoThumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <Play className="relative w-5 h-5 sm:w-6 sm:h-6 fill-white/80 text-white/80" />
          <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 px-1 py-0.5 rounded bg-black/60 text-white text-[8px] sm:text-[9px] font-medium">
            {item.duration || "0:00"}
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-500 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold uppercase text-[9px] sm:text-[10px]">
              {item.typeBadge || "PITCH"}
            </span>
            {item.industry || item.category ? (
              <span className="font-semibold text-gray-600">
                {item.industry || item.category}
              </span>
            ) : null}
            {item.publishedTime ? (
              <>
                <span>•</span>
                <span>{item.publishedTime}</span>
              </>
            ) : null}
          </div>

          <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#1A3E32] leading-snug line-clamp-2 break-words">
            {item.headline || "Untitled Pitch"}
          </h3>

          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 mt-1">
            Audience: {item.audience || "Everyone"}
            {item.cta ? (
              <>
                {" "}
                • CTA:{" "}
                <span className="text-[#16730F] font-semibold">{item.cta}</span>
              </>
            ) : null}
          </p>

          {/* Metrics row */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-2 text-[10px] sm:text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
              <span>{item.views ?? 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
              <span>{item.likes ?? 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <ZapIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
              <span>{item.ctaCount ?? 0} CTA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Live badge + actions */}
      <div className="flex items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-emerald-600">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>LIVE{item.expiresIn ? ` | ${item.expiresIn}` : ""}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="px-3 sm:px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 sm:p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
            aria-label="Delete pitch"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onView}
            className="px-3.5 sm:px-4 py-1.5 rounded-full border border-[#16730F] text-[#16730F] hover:bg-green-50 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
          >
            View Pitch
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Draft Pitch Row Card ───────── */
function DraftPitchCard({ draft, onContinueEditing, onDelete }) {
  const progress =
    typeof draft.progressPercent === "number"
      ? draft.progressPercent
      : Math.min(100, Math.round(((draft.wizardStep || 1) / 6) * 100));

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 p-3 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 shadow-xs">
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Dark thumbnail square */}
        <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#1A3E32] shrink-0 overflow-hidden flex items-center justify-center">
          {draft.videoPoster || draft.videoThumbnailUrl ? (
            <img
              src={draft.videoPoster || draft.videoThumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <Play className="relative w-5 h-5 sm:w-6 sm:h-6 fill-white/80 text-white/80" />
          <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 px-1 py-0.5 rounded bg-black/60 text-white text-[8px] sm:text-[9px] font-medium">
            {draft.duration || "0:00"}
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-500 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold uppercase text-[9px] sm:text-[10px]">
              {draft.typeBadge || "DRAFT"}
            </span>
            {draft.industry || draft.category ? (
              <span className="font-semibold text-gray-600">
                {draft.industry || draft.category}
              </span>
            ) : null}
            {draft.editedTime ? (
              <>
                <span>•</span>
                <span>{draft.editedTime}</span>
              </>
            ) : null}
          </div>

          <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#1A3E32] leading-snug line-clamp-2 break-words mb-2">
            {draft.headline || "Untitled Pitch"}
          </h3>

          {/* Orange progress bar */}
          <div className="flex items-center gap-2 sm:gap-3 max-w-[200px] sm:max-w-xs">
            <div className="flex-1 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 shrink-0">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Continue Editing + Delete buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 justify-end pt-2.5 sm:pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onContinueEditing}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#16730F] hover:bg-[#125e0c] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Continue Editing</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 sm:p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
          aria-label="Delete draft"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
