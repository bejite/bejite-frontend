import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ExternalLink,
  Heart,
  Share2,
  Bookmark,
  X,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import { getLandingHref } from "../../utils/landingDestination";

export default function AdCard({
  ad,
  onInteraction,
  onClose,
  isSponsored = true,
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const cardRef = useRef(null);
  const impressionTracked = useRef(false);
  const playTracked = useRef(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || impressionTracked.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || impressionTracked.current) return;
        impressionTracked.current = true;
        onInteraction?.("impression", ad.id);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ad.id, onInteraction]);

  useEffect(() => {
    if (!mediaExpanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMediaExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mediaExpanded]);

  const handleClick = () => {
    const href = getLandingHref(ad.landingType, ad.landingDestination);
    if (href) {
      onInteraction?.("click", ad.id);
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked);
    if (nextLiked) {
      onInteraction?.("like", ad.id);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (nextSaved) {
      onInteraction?.("save", ad.id);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onInteraction?.("share", ad.id);
    navigator
      .share?.({
        title: ad.headline,
        text: ad.description,
        url: ad.landingDestination,
      })
      .catch(() => {});
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (playTracked.current) return;
    playTracked.current = true;
    onInteraction?.("play", ad.id);
  };

  const description = ad.description || "";
  const shouldTruncate = description.length > 150;
  const displayDescription =
    shouldTruncate && !expanded
      ? description.substring(0, 150) + "..."
      : description;

  const mediaPreviewButtonClass =
    "relative mb-3 w-full aspect-video max-h-[50vh] sm:max-h-80 overflow-hidden rounded-xl bg-gray-100 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F]";

  const mediaPreviewFitClass = "absolute inset-0 h-full w-full object-cover";

  const openMediaPreview = (e) => {
    e.stopPropagation();
    setMediaExpanded(true);
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSponsored && (
            <>
              <span className="text-xs text-gray-500 font-medium">
                Sponsored
              </span>
              <span className="text-xs bg-[#1A3E32]/10 text-[#1A3E32] px-2 py-0.5 rounded-full font-medium">
                AdPro
              </span>
            </>
          )}
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(ad.id);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 cursor-pointer" onClick={handleClick}>
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {ad.headline}
        </h3>

        {ad.mediaUrl && !mediaFailed && (
          <button
            type="button"
            onClick={openMediaPreview}
            className={mediaPreviewButtonClass}
            aria-label={
              ad.mediaType === "video" ? "Play ad video" : "View ad image"
            }
          >
            {ad.mediaType === "image" ? (
              <img
                src={ad.mediaUrl}
                alt={ad.headline}
                className={mediaPreviewFitClass}
                loading="lazy"
                onError={() => setMediaFailed(true)}
              />
            ) : (
              <>
                {ad.posterUrl ? (
                  <img
                    src={ad.posterUrl}
                    alt={ad.headline}
                    className={mediaPreviewFitClass}
                  />
                ) : (
                  <video
                    src={ad.mediaUrl}
                    className={mediaPreviewFitClass}
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white">
                    <Play className="ml-1 h-6 w-6 fill-current" />
                  </span>
                </span>
              </>
            )}
          </button>
        )}

        <p className="text-gray-600 text-sm leading-relaxed">
          {displayDescription}
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-[#1A3E32] font-medium ml-1 hover:underline inline-flex items-center gap-0.5"
            >
              {expanded ? "See less" : "See more"}
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </p>

        <div className="mt-4">
          <button
            onClick={handleClick}
            className="bg-[#1A3E32] text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#2d6a54] transition-all hover:gap-3"
          >
            Learn More <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {mediaExpanded &&
        ad.mediaUrl &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setMediaExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-label={ad.mediaType === "video" ? "Ad video player" : "Ad image viewer"}
          >
            <div
              className="relative w-full max-w-4xl max-h-[92vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {ad.mediaType === "image" ? (
                <img
                  src={ad.mediaUrl}
                  alt={ad.headline}
                  className="max-w-full max-h-[85vh] w-full h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={ad.mediaUrl}
                  className="max-w-full max-h-[85vh] w-full object-contain rounded-lg bg-black"
                  controls
                  autoPlay
                  playsInline
                  onPlay={handlePlay}
                  poster={ad.posterUrl}
                />
              )}
              <button
                type="button"
                aria-label="Close media preview"
                className="absolute -top-2 right-0 sm:top-0 text-white text-2xl bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setMediaExpanded(false)}
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}

      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-around bg-gray-50/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition-all duration-200 ${
            liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${liked ? "fill-current scale-110" : ""}`}
          />
          <span>Like</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1A3E32] transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 text-sm transition-all duration-200 ${
            saved ? "text-[#1A3E32]" : "text-gray-500 hover:text-[#1A3E32]"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 transition-transform ${saved ? "fill-current" : ""}`}
          />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
