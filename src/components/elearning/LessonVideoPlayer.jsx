import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function parseDurationToSeconds(durationStr) {
  if (!durationStr) return 0;
  const parts = String(durationStr).split(":").map(Number);
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Reusable Interactive Dark Cinema Lesson Player (matches Bejite Academy Lesson Player UI).
 */
export default function LessonVideoPlayer({
  title,
  durationLabel = "0:00",
  onCompleteMedia,
}) {
  const containerRef = useRef(null);
  const totalSeconds = parseDurationToSeconds(durationLabel);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [title]);

  useEffect(() => {
    if (!playing) return undefined;
    const targetMax = totalSeconds > 0 ? totalSeconds : 60;
    const timer = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= targetMax) {
          setPlaying(false);
          onCompleteMedia?.();
          return targetMax;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, totalSeconds, onCompleteMedia]);

  const targetMax = totalSeconds > 0 ? totalSeconds : 60;
  const progressPercent = playing || elapsed > 0
    ? Math.min(100, Math.round((elapsed / targetMax) * 100))
    : 0;

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={() => setPlaying((p) => !p)}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#071114] via-[#0D1C21] to-[#081316] select-none cursor-pointer group shadow-xs"
    >
      {/* Subtle Studio Backdrop Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(22,115,15,0.16),transparent_55%)] pointer-events-none" />

      {playing && (
        <div className="absolute inset-x-8 top-12 text-center pointer-events-none">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-medium text-emerald-300">
            Now Playing: {title}
          </span>
        </div>
      )}

      {/* Top-Left Mute Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMuted((m) => !m);
        }}
        aria-label={muted ? "Unmute lesson audio" : "Mute lesson audio"}
        className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#16730F]/35 hover:bg-[#16730F]/55 border border-emerald-400/25 text-emerald-300 flex items-center justify-center transition-colors cursor-pointer z-10"
      >
        {muted ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Center Play / Pause Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/50 flex items-center justify-center text-white backdrop-blur-xs transition-all">
          {playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </div>
      </div>

      {/* Bottom Scrubber & Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-6 bg-gradient-to-t from-black/80 via-black/35 to-transparent space-y-2"
      >
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(
              0,
              Math.min(1, (e.clientX - rect.left) / rect.width)
            );
            setElapsed(Math.round(ratio * targetMax));
          }}
          className="w-full h-1 rounded-full bg-[#1A3E32]/90 overflow-hidden cursor-pointer"
        >
          <div
            className="h-full bg-[#22C55E] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/75 font-medium">
          <span>
            {elapsed > 0 || playing
              ? `${formatClock(elapsed)} / ${formatClock(targetMax)}`
              : "0:00 / 0:00"}
          </span>

          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
            className="text-white/75 hover:text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

