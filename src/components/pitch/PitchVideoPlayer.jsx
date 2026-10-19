import React, { useEffect, useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { formatTime } from "../../pages/pitch/pitchData";

export default function PitchVideoPlayer({
  pitch,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  mobileSize = "balanced",
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [pitch?.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || 30);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
    };
  }, [pitch?.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  if (!pitch) return null;

  // Desktop keeps the original fixed 9:16 frame; mobile sizes animate expand/collapse
  const sizeClass =
    mobileSize === "desktop"
      ? "w-full max-w-[320px] xl:max-w-[360px] aspect-[9/16] h-auto max-h-[min(86dvh,640px)]"
      : mobileSize === "expanded"
        ? "h-[min(68dvh,520px)] w-[min(calc(68dvh*9/16),292px)] sm:h-[min(70dvh,560px)] sm:w-[min(calc(70dvh*9/16),315px)]"
        : mobileSize === "collapsed"
          ? "h-[72px] w-[40px] sm:h-[80px] sm:w-[45px] opacity-90"
          : "h-[min(42dvh,300px)] w-[min(calc(42dvh*9/16),168px)] sm:h-[min(44dvh,340px)] sm:w-[min(calc(44dvh*9/16),190px)]";

  return (
    <div
      className={`relative shrink-0 mx-auto lg:mx-0 bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-800 flex items-center justify-center group select-none transition-all duration-300 ease-out ${sizeClass}`}
    >
      <video
        ref={videoRef}
        src={pitch.videoUrl}
        poster={pitch.videoPoster}
        playsInline
        loop
        muted={isMuted}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Top-left mute toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm transition-colors z-20 cursor-pointer"
      >
        {isMuted ? (
          <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </button>

      {/* Center Play/Pause button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`absolute inset-0 m-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 hover:bg-black/60 border border-white/40 flex items-center justify-center text-white backdrop-blur-sm transition-all z-20 cursor-pointer ${
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 sm:w-7 sm:h-7" />
        ) : (
          <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-white translate-x-0.5" />
        )}
      </button>

      {/* Left & Right Switcher Chevrons */}
      {(hasPrev || hasNext) && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev?.();
            }}
            aria-label="Previous pitch"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            aria-label="Next pitch"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Bottom Video Progress Bar & Info */}
      <div
        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 z-20 flex flex-col gap-1.5 sm:gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            if (videoRef.current && duration) {
              videoRef.current.currentTime = pos * duration;
            }
          }}
        >
          <div
            className="h-full bg-[#16730F] transition-all"
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-white/90 font-medium">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={() => {
              if (videoRef.current?.requestFullscreen) {
                videoRef.current.requestFullscreen();
              }
            }}
            aria-label="Fullscreen"
            className="hover:text-white cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
