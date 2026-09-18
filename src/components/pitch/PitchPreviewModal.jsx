import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
// import { ExternalLink } from "lucide-react"; // pitch hub link temporarily disabled
// import { Link } from "react-router-dom"; // pitch hub link temporarily disabled
import { toast } from "react-toastify";
import PitchVideoPlayer from "./PitchVideoPlayer";
import PitchDetailsCard from "./PitchDetailsCard";

export default function PitchPreviewModal({
  isOpen,
  onClose,
  initialPitch,
  allPitches = [],
}) {
  const [pitches, setPitches] = useState(allPitches);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allPitches.length > 0) {
      setPitches(allPitches);
    }
  }, [allPitches]);

  useEffect(() => {
    if (initialPitch && pitches.length > 0) {
      const idx = pitches.findIndex((p) => String(p.id) === String(initialPitch.id));
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [initialPitch, pitches]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pitches.length, currentIndex]);

  if (!isOpen) return null;

  const currentPitch = pitches[currentIndex] || initialPitch;
  if (!currentPitch) return null;

  const handlePrev = () => {
    if (pitches.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : pitches.length - 1));
  };

  const handleNext = () => {
    if (pitches.length <= 1) return;
    setCurrentIndex((prev) => (prev < pitches.length - 1 ? prev + 1 : 0));
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
    toast.success(`Hiring inquiry sent to ${pitch.creator?.name || "Creator"}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Floating Top Controls */}
      <div className="fixed top-3 sm:top-5 right-3 sm:right-6 z-60 flex items-center gap-2">
        {/* Pitch hub temporarily disabled
        <Link
          to="/pitch"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-sm"
        >
          <span>Open in Pitch Hub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Side Navigation Chevrons for Desktop */}
      {pitches.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous pitch"
            className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-60 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next pitch"
            className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-60 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Modal Dialog Content */}
      <div className="relative z-50 w-full max-w-4xl max-h-[94vh] overflow-y-auto nfl-scroll my-auto flex flex-col items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 w-full py-2">
          {/* Pitch Video Player */}
          <PitchVideoPlayer
            pitch={currentPitch}
            hasPrev={pitches.length > 1}
            hasNext={pitches.length > 1}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          {/* Pitch Details Card */}
          <PitchDetailsCard
            pitch={currentPitch}
            onHireMe={handleHireMe}
            onToggleLike={handleToggleLike}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  );
}
