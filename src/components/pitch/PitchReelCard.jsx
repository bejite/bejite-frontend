import React, { useRef, useState } from "react";
import { Play, MoreVertical, CheckCircle } from "lucide-react";

export default function PitchReelCard({ pitch, onSelectPitch }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Playback error or interruption safely ignored
          setIsPlaying(false);
        });
    }
  };

  const handleMouseLeave = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.pause();
      video.currentTime = 0;
    } catch {
      // Ignore pause error
    }
    setIsPlaying(false);
  };

  if (!pitch) return null;

  return (
    <div
      onClick={() => onSelectPitch(pitch)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-[150px] xs:w-[165px] sm:w-[185px] h-[260px] xs:h-[285px] sm:h-[310px] shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer select-none group bg-gray-900 border border-gray-200/80 hover:-translate-y-1"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={pitch.videoUrl}
        poster={pitch.videoPoster}
        muted
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Top Overlay Controls */}
      <div className="absolute top-0 inset-x-0 p-2.5 flex items-center justify-between z-10">
        {/* Creator Avatar with Online indicator */}
        <div className="relative">
          <img
            src={pitch.creator?.image || "/assets/images/photo_placeholder.png"}
            alt={pitch.creator?.name || "Creator"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/images/photo_placeholder.png";
            }}
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white" />
        </div>

        {/* Badge & More menu */}
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/45 backdrop-blur-md text-white border border-white/20">
            {pitch.typeBadge || pitch.type?.split(" ")[0] || "PITCH"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPitch(pitch);
            }}
            className="p-1 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
            aria-label="Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Play Icon (Fades out when hovered and playing) */}
      <div
        className={`absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center text-white transition-opacity duration-200 pointer-events-none z-10 ${
          isPlaying ? "opacity-0" : "opacity-90 group-hover:opacity-0"
        }`}
      >
        <Play className="w-4 h-4 fill-white translate-x-0.5" />
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-10 text-white flex flex-col justify-end pointer-events-none z-10">
        {/* Creator Name */}
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-xs font-bold text-white truncate drop-shadow-sm">
            {pitch.creator?.name}
          </span>
          {pitch.creator?.verified && (
            <CheckCircle className="w-3 h-3 fill-[#16730F] text-white shrink-0" />
          )}
        </div>

        {/* Headline */}
        <p className="text-[11px] sm:text-xs text-white/90 font-medium line-clamp-2 leading-tight drop-shadow-sm mb-1.5">
          {pitch.headline?.replace(/[«»]/g, "") || pitch.description}
        </p>

        {/* CTA Tag */}
        <div className="flex items-center justify-between gap-1">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#16730F] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
            {pitch.cta || "Hire Me"}
          </span>
          <span className="text-[9px] text-gray-300 font-medium">
            {pitch.duration || "0:30"}
          </span>
        </div>
      </div>
    </div>
  );
}
