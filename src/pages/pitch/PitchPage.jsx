import React, { useState, useEffect } from "react";
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
import {
  INITIAL_PITCHES,
  INITIAL_USER_ACTIVE_PITCHES,
  INITIAL_DRAFTS,
  CATEGORIES,
} from "./pitchData";

export default function PitchPage() {
  const reduxUser = useSelector((state) => state.auth?.user);
  const localUser = getUser();
  const currentUser = reduxUser || localUser || {};

  const [pitches, setPitches] = useState(INITIAL_PITCHES);
  const [userActivePitches, setUserActivePitches] = useState(INITIAL_USER_ACTIVE_PITCHES);
  const [drafts, setDrafts] = useState(INITIAL_DRAFTS);

  // Tabs
  const [activeTab, setActiveTab] = useState("discover"); // 'discover' | 'my-pitches'
  const [myPitchesSubTab, setMyPitchesSubTab] = useState("active"); // 'active' | 'drafts'
  const [activeCategory, setActiveCategory] = useState("For You");
  const [currentPitchIndex, setCurrentPitchIndex] = useState(0);

  // Create Pitch modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);

  // Filtered pitches for Discover feed
  const filteredPitches = pitches.filter((p) => {
    if (activeCategory === "For You") return true;
    return p.category === activeCategory;
  });

  const currentPitch = filteredPitches[currentPitchIndex] || filteredPitches[0] || null;

  useEffect(() => {
    setCurrentPitchIndex(0);
  }, [activeCategory, activeTab]);

  // ── Handlers ──

  const handlePrevPitch = () => {
    if (filteredPitches.length <= 1) return;
    setCurrentPitchIndex((prev) => (prev > 0 ? prev - 1 : filteredPitches.length - 1));
  };

  const handleNextPitch = () => {
    if (filteredPitches.length <= 1) return;
    setCurrentPitchIndex((prev) => (prev < filteredPitches.length - 1 ? prev + 1 : 0));
  };

  const handleToggleLike = (pitchId) => {
    setPitches((prev) =>
      prev.map((p) => {
        if (p.id === pitchId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const handleShare = (pitch) => {
    const shareUrl = `${window.location.origin}/pitch?id=${pitch.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Pitch link copied to clipboard!");
    } else {
      toast.info(`Pitch link: ${shareUrl}`);
    }
  };

  const handleHireMe = (pitch) => {
    toast.success(`Hiring inquiry sent to ${pitch.creator.name}!`);
  };

  const handlePitchCreated = (newPitch) => {
    setPitches([newPitch, ...pitches]);

    const activeEntry = {
      id: newPitch.id,
      type: newPitch.type,
      typeBadge: newPitch.typeBadge || "INTRO",
      industry: newPitch.category || "UIUX Design",
      publishedTime: "Published today",
      expiresIn: "Expires in 24h 0m",
      headline: newPitch.headline,
      audience: "Recruiters + Hiring Managers",
      cta: newPitch.cta,
      views: 0,
      likes: 0,
      ctaCount: 0,
      duration: newPitch.durationText || "0:30",
      videoUrl: newPitch.videoUrl,
      creator: newPitch.creator,
      skills: newPitch.skills,
      description: newPitch.description,
    };
    setUserActivePitches([activeEntry, ...userActivePitches]);
  };

  const handleViewInFeed = () => {
    setActiveTab("discover");
    setActiveCategory("For You");
    setCurrentPitchIndex(0);
  };

  const handleGoToMyPitches = () => {
    setActiveTab("my-pitches");
    setMyPitchesSubTab("active");
  };

  const handleViewUserPitch = (userPitch) => {
    setActiveTab("discover");
    setActiveCategory("For You");
    const foundIdx = pitches.findIndex((p) => p.id === userPitch.id);
    if (foundIdx >= 0) {
      setCurrentPitchIndex(foundIdx);
    } else {
      setPitches([userPitch, ...pitches]);
      setCurrentPitchIndex(0);
    }
  };

  const handleContinueEditingDraft = (draft) => {
    setEditingDraft(draft);
    setIsCreateModalOpen(true);
  };

  const handleDeleteDraft = (draftId) => {
    setDrafts(drafts.filter((d) => d.id !== draftId));
    localStorage.removeItem("bejite_pitch_draft");
    toast.info("Draft removed");
  };

  const openCreateModal = () => {
    setEditingDraft(null);
    setIsCreateModalOpen(true);
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-5 md:px-6 py-3 sm:py-5">
        <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-5 lg:gap-8 items-start">
          {/* ─── Left Sidebar ─── */}
          <PitchSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCreatePitch={openCreateModal}
          />

          {/* ─── Main Content ─── */}
          <main className="flex-1 min-w-0 w-full flex flex-col gap-3.5 sm:gap-4 md:gap-5">
            {activeTab === "my-pitches" ? (
              <MyPitchesView
                myPitchesSubTab={myPitchesSubTab}
                onSubTabChange={setMyPitchesSubTab}
                userActivePitches={userActivePitches}
                drafts={drafts}
                onViewUserPitch={handleViewUserPitch}
                onContinueEditingDraft={handleContinueEditingDraft}
                onDeleteDraft={handleDeleteDraft}
              />
            ) : (
              <>
                {/* Header Title */}
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3E32] tracking-tight">
                    Bejite Pitch
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                    Discover professionals, opportunities, services and ideas through short
                    professional videos.
                  </p>
                </div>

                {/* Category Filter Pills */}
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

                {/* Showcase Stage */}
                {currentPitch ? (
                  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6 lg:gap-8 mt-1 sm:mt-2 w-full">
                    <PitchVideoPlayer
                      pitch={currentPitch}
                      hasPrev={filteredPitches.length > 1}
                      hasNext={filteredPitches.length > 1}
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

      {/* Multi-Step Create Pitch Modal */}
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
