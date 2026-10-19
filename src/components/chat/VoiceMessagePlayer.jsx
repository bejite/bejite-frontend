import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import {
  isCloudinaryRawAudioUrl,
  resolveVoicePlaybackUrl,
} from '../../utils/chatAttachmentUtils';
import {
  formatVoiceDuration,
  generateWaveformPeaksFromUrl,
  placeholderWaveformLevels,
} from '../../utils/voiceWaveform';
import VoiceWaveform from './VoiceWaveform';

function VoiceMessagePlayer({ url, isOwnMessage = false }) {
  const blobUrlRef = useRef(null);
  const audioRef = useRef(null);
  const needsBlobPrep = isCloudinaryRawAudioUrl(url);
  const [audioSrc, setAudioSrc] = useState(needsBlobPrep ? '' : url);
  const [preparing, setPreparing] = useState(needsBlobPrep);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [levels, setLevels] = useState(() => placeholderWaveformLevels());

  useEffect(() => {
    let cancelled = false;

    const revokeBlob = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    const prepare = async () => {
      revokeBlob();
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);

      if (!needsBlobPrep) {
        setAudioSrc(url);
        setPreparing(false);
        return;
      }

      setPreparing(true);
      try {
        const resolved = await resolveVoicePlaybackUrl(url);
        if (cancelled) {
          if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved);
          return;
        }

        if (resolved.startsWith('blob:')) {
          blobUrlRef.current = resolved;
        }
        setAudioSrc(resolved);
      } catch {
        if (!cancelled) setAudioSrc(url);
      } finally {
        if (!cancelled) setPreparing(false);
      }
    };

    prepare();

    return () => {
      cancelled = true;
      revokeBlob();
    };
  }, [url, needsBlobPrep]);

  useEffect(() => {
    if (!audioSrc || preparing) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const peaks = await generateWaveformPeaksFromUrl(audioSrc);
        if (!cancelled) setLevels(peaks);
      } catch {
        if (!cancelled) setLevels(placeholderWaveformLevels());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioSrc, preparing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || preparing || !audioSrc) return undefined;

    if (audio.src !== audioSrc) {
      audio.src = audioSrc;
      audio.load();
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioSrc, preparing]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || preparing) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [playing, preparing]);

  const timeLabel =
    playing || currentTime > 0
      ? formatVoiceDuration(currentTime)
      : formatVoiceDuration(duration);

  return (
    <div className="mb-2 flex w-full min-w-[12rem] max-w-xs items-center gap-2">
      <button
        type="button"
        onClick={togglePlay}
        disabled={preparing}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
          isOwnMessage
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-[#1A3E32]/10 text-[#1A3E32] hover:bg-[#1A3E32]/20'
        }`}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
      >
        {playing ? <FaPause className="h-3 w-3" /> : <FaPlay className="ml-0.5 h-3 w-3" />}
      </button>

      {preparing ? (
        <span
          className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-[#1A3E32]/70'}`}
        >
          Loading…
        </span>
      ) : (
        <>
          <VoiceWaveform
            levels={levels}
            progress={progress}
            isOwnMessage={isOwnMessage}
            className="max-w-none"
          />
          <span
            className={`shrink-0 text-xs tabular-nums ${
              isOwnMessage ? 'text-white/80' : 'text-[#1A3E32]/80'
            }`}
          >
            {timeLabel}
          </span>
        </>
      )}

      <audio ref={audioRef} preload="metadata" className="hidden" />
    </div>
  );
}

export default memo(VoiceMessagePlayer);
