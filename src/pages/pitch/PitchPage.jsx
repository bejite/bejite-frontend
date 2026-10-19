import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import CreatePitchModal from "../../components/pitch/CreatePitchModal";
import PitchSidebar from "../../components/pitch/PitchSidebar";
import PitchVideoPlayer from "../../components/pitch/PitchVideoPlayer";
import PitchDetailsCard from "../../components/pitch/PitchDetailsCard";
import MyPitchesView from "../../components/pitch/MyPitchesView";
import PitchEmptyState from "../../components/pitch/PitchEmptyState";
import { useSelector } from "react-redux";
import { getUser } from "../../utils/tokenManager";
import { toast } from "react-toastify";
import { CATEGORIES } from "./pitchData";
import {
  getPitchFeed,
  getMyPitches,
  getPitch,
  likePitch,
  unlikePitch,
  sharePitch,
  viewPitch,
  recordPitchCta,
  deletePitch,
  apiErrorMessage,
} from "../../services/pitchesApi";

export default function PitchPage() {
  const reduxUser = useSelector((state) => state.auth?.user);
  const localUser = getUser();
  const currentUser = reduxUser || localUser || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const [pitches, setPitches] = useState([]);
  const [userActivePitches, setUserActivePitches] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);

  const [activeTab, setActiveTab] = useState("discover");
  const [myPitchesSubTab, setMyPitchesSubTab] = useState("active");
  const [activeCategory, setActiveCategory] = useState("For You");
  const [currentPitchIndex, setCurrentPitchIndex] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);

  const deepLinkIdRef = useRef(searchParams.get("id"));
  const viewedPitchIdsRef = useRef(new Set());

  const currentPitch = pitches[currentPitchIndex] || pitches[0] || null;

  const recordViewOnce = useCallback((pitchId) => {
    if (!pitchId) return;
    const key = String(pitchId);
    if (viewedPitchIdsRef.current.has(key)) return;
    viewedPitchIdsRef.current.add(key);
    viewPitch(pitchId).catch(() => {
      viewedPitchIdsRef.current.delete(key);
    });
  }, []);

  const loadFeed = useCallback(async (category = activeCategory) => {
    setLoadingFeed(true);
    try {
      const deepLinkId = deepLinkIdRef.current;
      const { pitches: feed } = await getPitchFeed(30, { category });

      if (deepLinkId) {
        const inFeed = feed.find((p) => String(p.id) === String(deepLinkId));
        if (inFeed) {
          setPitches([inFeed, ...feed.filter((p) => String(p.id) !== String(deepLinkId))]);
          setCurrentPitchIndex(0);
        } else {
          try {
            const linked = await getPitch(deepLinkId);
            setPitches(linked ? [linked, ...feed] : feed);
            setCurrentPitchIndex(0);
          } catch {
            setPitches(feed);
            setCurrentPitchIndex(0);
          }
        }
        deepLinkIdRef.current = null;
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (!next.has("id")) return prev;
            next.delete("id");
            return next;
          },
          { replace: true }
        );
      } else {
        setPitches(feed);
        setCurrentPitchIndex(0);
      }
    } catch (error) {
      console.error("loadFeed:", error);
      toast.error(apiErrorMessage(error, "Failed to load pitches"));
      setPitches([]);
    } finally {
      setLoadingFeed(false);
    }
  }, [activeCategory, setSearchParams]);

  const loadMine = useCallback(async () => {
    setLoadingMine(true);
    try {
      const [active, draftList] = await Promise.all([
        getMyPitches("active"),
        getMyPitches("drafts"),
      ]);
      setUserActivePitches(active);
      setDrafts(draftList);
    } catch (error) {
      console.error("loadMine:", error);
      toast.error(apiErrorMessage(error, "Failed to load your pitches"));
    } finally {
      setLoadingMine(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "discover") {
      loadFeed(activeCategory);
    }
  }, [activeTab, activeCategory, loadFeed]);

  useEffect(() => {
    if (activeTab === "my-pitches") {
      loadMine();
    }
  }, [activeTab, loadMine]);

  useEffect(() => {
    if (currentPitch?.id && activeTab === "discover") {
      recordViewOnce(currentPitch.id);
    }
  }, [currentPitch?.id, activeTab, recordViewOnce]);

  const handlePrevPitch = () => {
    if (pitches.length <= 1) return;
    setCurrentPitchIndex((prev) => (prev > 0 ? prev - 1 : pitches.length - 1));
  };

  const handleNextPitch = () => {
    if (pitches.length <= 1) return;
    setCurrentPitchIndex((prev) => (prev < pitches.length - 1 ? prev + 1 : 0));
  };

  const handleToggleLike = async (pitchId) => {
    const target = pitches.find((p) => p.id === pitchId);
    if (!target) return;

    const wasLiked = Boolean(target.isLiked);
    setPitches((prev) =>
      prev.map((p) =>
        p.id === pitchId
          ? {
              ...p,
              isLiked: !wasLiked,
              likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
            }
          : p
      )
    );

    try {
      const result = wasLiked ? await unlikePitch(pitchId) : await likePitch(pitchId);
      if (result?.likes != null) {
        setPitches((prev) =>
          prev.map((p) =>
            p.id === pitchId
              ? { ...p, likes: result.likes, isLiked: result.isLiked }
              : p
          )
        );
      }
    } catch (error) {
      setPitches((prev) =>
        prev.map((p) =>
          p.id === pitchId
            ? {
                ...p,
                isLiked: wasLiked,
                likes: wasLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
              }
            : p
        )
      );
      toast.error(apiErrorMessage(error, "Could not update like"));
    }
  };

  const handleShare = async (pitch) => {
    const shareUrl = `${window.location.origin}/pitch?id=${pitch.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      const result = await sharePitch(pitch.id);
      setPitches((prev) =>
        prev.map((p) =>
          p.id === pitch.id
            ? { ...p, shares: result?.shares ?? p.shares + 1 }
            : p
        )
      );
      toast.success("Pitch link copied to clipboard!");
    } catch (error) {
      toast.info(`Pitch link: ${shareUrl}`);
      console.error("sharePitch:", error);
    }
  };

  const handleHireMe = async (pitch) => {
    try {
      const result = await recordPitchCta(pitch.id);
      setPitches((prev) =>
        prev.map((p) =>
          p.id === pitch.id
            ? { ...p, ctaCount: result?.ctaCount ?? p.ctaCount }
            : p
        )
      );
      if (result?.alreadyRecorded || result?.counted === false) {
        toast.info("You already sent interest on this pitch.");
      } else {
        toast.success(
          `${pitch.creator?.name || "Creator"} was notified of your interest.`
        );
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not send inquiry"));
    }
  };

  const handlePitchCreated = (pitch, meta = {}) => {
    if (!pitch) return;
    if (meta.isDraft) {
      setDrafts((prev) => {
        const without = prev.filter((d) => String(d.id) !== String(pitch.id));
        return [pitch, ...without];
      });
      return;
    }
    setPitches((prev) => {
      const without = prev.filter((p) => String(p.id) !== String(pitch.id));
      return [pitch, ...without];
    });
    setUserActivePitches((prev) => {
      const without = prev.filter((p) => String(p.id) !== String(pitch.id));
      return [pitch, ...without];
    });
    setDrafts((prev) => prev.filter((d) => String(d.id) !== String(pitch.id)));
    setCurrentPitchIndex(0);
  };

  const handleViewInFeed = () => {
    setActiveTab("discover");
    setActiveCategory("For You");
    setCurrentPitchIndex(0);
    // loadFeed runs via useEffect when tab/category settle — avoid double fetch
  };

  const handleGoToMyPitches = () => {
    setActiveTab("my-pitches");
    setMyPitchesSubTab("active");
  };

  const handleViewUserPitch = (userPitch) => {
    setActiveTab("discover");
    setActiveCategory("For You");
    setPitches((prev) => {
      const without = prev.filter((p) => String(p.id) !== String(userPitch.id));
      return [userPitch, ...without];
    });
    setCurrentPitchIndex(0);
  };

  const handleContinueEditingDraft = (draft) => {
    setEditingDraft(draft);
    setIsCreateModalOpen(true);
  };

  const handleEditActivePitch = (pitch) => {
    setEditingDraft(pitch);
    setIsCreateModalOpen(true);
  };

  const removePitchEverywhere = (pitchId) => {
    const id = String(pitchId);
    setDrafts((prev) => prev.filter((d) => String(d.id) !== id));
    setUserActivePitches((prev) => prev.filter((p) => String(p.id) !== id));
    setPitches((prev) => {
      const next = prev.filter((p) => String(p.id) !== id);
      setCurrentPitchIndex((idx) =>
        next.length === 0 ? 0 : Math.min(idx, next.length - 1),
      );
      return next;
    });
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return;
    try {
      await deletePitch(draftId);
      removePitchEverywhere(draftId);
      toast.info("Draft removed");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to delete draft"));
    }
  };

  const handleDeleteActivePitch = async (pitchId) => {
    if (
      !window.confirm(
        "Delete this live pitch? It will be removed from the feed and cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await deletePitch(pitchId);
      removePitchEverywhere(pitchId);
      toast.info("Pitch deleted");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to delete pitch"));
    }
  };

  const openCreateModal = () => {
    setEditingDraft(null);
    setIsCreateModalOpen(true);
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-5 md:px-6 py-3 sm:py-5">
        <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-5 lg:gap-8 items-start">
          <PitchSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCreatePitch={openCreateModal}
          />

          <main className="flex-1 min-w-0 w-full flex flex-col gap-3.5 sm:gap-4 md:gap-5">
            {activeTab === "my-pitches" ? (
              loadingMine ? (
                <div className="py-16 text-center text-sm text-gray-500">
                  Loading your pitches…
                </div>
              ) : (
                <MyPitchesView
                  myPitchesSubTab={myPitchesSubTab}
                  onSubTabChange={setMyPitchesSubTab}
                  userActivePitches={userActivePitches}
                  drafts={drafts}
                  onViewUserPitch={handleViewUserPitch}
                  onContinueEditingDraft={handleContinueEditingDraft}
                  onDeleteDraft={handleDeleteDraft}
                  onEditActivePitch={handleEditActivePitch}
                  onDeleteActivePitch={handleDeleteActivePitch}
                />
              )
            ) : (
              <>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3E32] tracking-tight">
                    Bejite Pitch
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                    Discover professionals, opportunities, services and ideas through short
                    professional videos.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 nfl-scroll -mx-1 px-1 scroll-smooth">
                  {CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#1A3E32] text-white shadow-sm"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {loadingFeed ? (
                  <div className="py-16 text-center text-sm text-gray-500">
                    Loading pitches…
                  </div>
                ) : currentPitch ? (
                  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6 lg:gap-8 mt-1 sm:mt-2 w-full">
                    <PitchVideoPlayer
                      pitch={currentPitch}
                      hasPrev={pitches.length > 1}
                      hasNext={pitches.length > 1}
                      onPrev={handlePrevPitch}
                      onNext={handleNextPitch}
                    />

                    <PitchDetailsCard
                      pitch={currentPitch}
                      onHireMe={handleHireMe}
                      onToggleLike={handleToggleLike}
                      onShare={handleShare}
                    />
                  </div>
                ) : (
                  <PitchEmptyState onCreatePitch={openCreateModal} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <CreatePitchModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingDraft(null);
        }}
        onPitchCreated={handlePitchCreated}
        onViewInFeed={handleViewInFeed}
        onGoToMyPitches={handleGoToMyPitches}
        currentUser={currentUser}
        draftToEdit={editingDraft}
      />
    </NewsFeedLayout>
  );
}
