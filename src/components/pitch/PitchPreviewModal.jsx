import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PitchVideoPlayer from "./PitchVideoPlayer";
import PitchDetailsCard from "./PitchDetailsCard";
import {
  likePitch,
  unlikePitch,
  sharePitch,
  recordPitchCta,
  apiErrorMessage,
} from "../../services/pitchesApi";

const LG_QUERY = "(min-width: 1024px)";
/** Min scroll/swipe distance before switching video ↔ card focus */
const FOCUS_DELTA = 28;
/** Prevent rapid flip-flopping between panels */
const FOCUS_COOLDOWN_MS = 320;

export default function PitchPreviewModal({
  isOpen,
  onClose,
  initialPitch,
  allPitches = [],
}) {
  const [pitches, setPitches] = useState(allPitches);
  const [currentIndex, setCurrentIndex] = useState(0);
  /** Mobile only: which panel is enlarged — null = balanced */
  const [mobileFocus, setMobileFocus] = useState(null);
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(LG_QUERY).matches : true
  );

  const lastSwitchAt = useRef(0);
  const touchStartY = useRef(null);
  const cardScrollRef = useRef(null);

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

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isOpen) setMobileFocus(null);
  }, [isOpen]);

  useEffect(() => {
    setMobileFocus(null);
    touchStartY.current = null;
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (pitches.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : pitches.length - 1));
  }, [pitches.length]);

  const handleNext = useCallback(() => {
    if (pitches.length <= 1) return;
    setCurrentIndex((prev) => (prev < pitches.length - 1 ? prev + 1 : 0));
  }, [pitches.length]);

  /**
   * Scroll down (deltaY > 0) → grow card, shrink video
   * Scroll up   (deltaY < 0) → grow video, shrink card
   * When the card body is scrolled mid-content, don't steal the gesture.
   */
  const applyScrollFocus = useCallback(
    (deltaY, { fromCardScroll = false } = {}) => {
      if (isLg || !deltaY) return;

      const now = Date.now();
      if (now - lastSwitchAt.current < FOCUS_COOLDOWN_MS) return;

      const scrollEl = cardScrollRef.current;
      const atCardTop = !scrollEl || scrollEl.scrollTop <= 2;

      if (deltaY > FOCUS_DELTA) {
        // Scroll / swipe down → focus card
        if (mobileFocus === "card") return;
        setMobileFocus("card");
        lastSwitchAt.current = now;
        return;
      }

      if (deltaY < -FOCUS_DELTA) {
        // Scroll / swipe up → focus video (only if card content is at top)
        if (fromCardScroll && !atCardTop) return;
        if (mobileFocus === "video") return;
        setMobileFocus("video");
        lastSwitchAt.current = now;
      }
    },
    [isLg, mobileFocus]
  );

  const handleColumnWheel = useCallback(
    (e) => {
      if (isLg) return;
      // Prefer card-internal scroll when the card is expanded and has overflow
      const scrollEl = cardScrollRef.current;
      if (
        mobileFocus === "card" &&
        scrollEl &&
        e.deltaY > 0 &&
        scrollEl.scrollHeight > scrollEl.clientHeight &&
        scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - 2
      ) {
        return;
      }
      if (
        mobileFocus === "card" &&
        scrollEl &&
        e.deltaY < 0 &&
        scrollEl.scrollTop > 2
      ) {
        return;
      }
      applyScrollFocus(e.deltaY);
    },
    [isLg, mobileFocus, applyScrollFocus]
  );

  const handleTouchStart = useCallback(
    (e) => {
      if (isLg) return;
      touchStartY.current = e.touches[0]?.clientY ?? null;
    },
    [isLg]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isLg || touchStartY.current == null) return;
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      // Finger up → positive (scroll down); finger down → negative (scroll up)
      const deltaY = touchStartY.current - y;
      if (Math.abs(deltaY) < FOCUS_DELTA) return;

      const scrollEl = cardScrollRef.current;
      if (
        mobileFocus === "card" &&
        scrollEl &&
        deltaY > 0 &&
        scrollEl.scrollHeight > scrollEl.clientHeight &&
        scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - 2
      ) {
        touchStartY.current = y;
        return;
      }
      if (
        mobileFocus === "card" &&
        scrollEl &&
        deltaY < 0 &&
        scrollEl.scrollTop > 2
      ) {
        touchStartY.current = y;
        return;
      }

      applyScrollFocus(deltaY);
      touchStartY.current = y;
    },
    [isLg, mobileFocus, applyScrollFocus]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  // Keyboard navigation + lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen) return null;

  const currentPitch = pitches[currentIndex] || initialPitch;
  if (!currentPitch) return null;

  const videoSize =
    isLg || !mobileFocus
      ? "balanced"
      : mobileFocus === "video"
        ? "expanded"
        : "collapsed";
  const cardSize =
    isLg || !mobileFocus
      ? "balanced"
      : mobileFocus === "card"
        ? "expanded"
        : "collapsed";

  const handleToggleLike = async (pitchId) => {
    const target = pitches.find((p) => p.id === pitchId);
    if (!target) return;
    const wasLiked = Boolean(target.isLiked);

    setPitches((prev) =>
      prev.map((p) => {
        if (p.id !== pitchId) return p;
        return {
          ...p,
          isLiked: !wasLiked,
          likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
        };
      })
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
    } catch {
      toast.info(`Pitch link: ${shareUrl}`);
    }
  };

  const handleHireMe = async (pitch) => {
    try {
      const result = await recordPitchCta(pitch.id);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-hidden">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Floating Top Controls */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-4 z-60 flex items-center gap-2">
        <Link
          to="/pitch"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-sm"
        >
          <span>Open in Pitch Hub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
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
            className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-60 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next pitch"
            className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-60 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Modal Dialog Content — constrained to viewport, no page scroll */}
      <div className="relative z-50 w-full max-w-5xl h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1rem)] flex items-center justify-center overflow-hidden">
        <div
          className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-3 sm:gap-4 lg:gap-8 w-full h-full max-h-full min-h-0 py-8 lg:py-4 touch-pan-y"
          onWheel={handleColumnWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/* Video — scroll up expands on mobile */}
          <div
            className={
              isLg
                ? "shrink-0"
                : `flex items-center justify-center min-h-0 transition-all duration-300 ease-out ${
                    videoSize === "expanded"
                      ? "flex-[1.35] w-full"
                      : videoSize === "collapsed"
                        ? "flex-none"
                        : "flex-none"
                  }`
            }
          >
            <PitchVideoPlayer
              pitch={currentPitch}
              hasPrev={pitches.length > 1}
              hasNext={pitches.length > 1}
              onPrev={handlePrev}
              onNext={handleNext}
              mobileSize={isLg ? "desktop" : videoSize}
            />
          </div>

          {/* Card — scroll down expands on mobile */}
          <div
            className={
              isLg
                ? "shrink-0 w-full max-w-[420px]"
                : `w-full min-h-0 flex transition-all duration-300 ease-out ${
                    cardSize === "expanded"
                      ? "flex-1"
                      : cardSize === "collapsed"
                        ? "flex-none max-h-[96px]"
                        : "flex-1"
                  }`
            }
          >
            <PitchDetailsCard
              pitch={currentPitch}
              onHireMe={handleHireMe}
              onToggleLike={handleToggleLike}
              onShare={handleShare}
              mobileSize={isLg ? "desktop" : cardSize}
              scrollContainerRef={cardScrollRef}
              onScrollIntent={(deltaY) =>
                applyScrollFocus(deltaY, { fromCardScroll: true })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
