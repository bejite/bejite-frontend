import { useEffect, useRef, useState } from 'react';
import {
  isCloudinaryRawAudioUrl,
  resolveVoicePlaybackUrl,
} from '../../utils/chatAttachmentUtils';

function VoiceMessagePlayer({ url, isOwnMessage = false }) {
  const blobUrlRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(url);
  const [loading, setLoading] = useState(isCloudinaryRawAudioUrl(url));

  useEffect(() => {
    let cancelled = false;

    const revokeBlob = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    const prepareAudio = async () => {
      revokeBlob();
      setAudioSrc(url);

      if (!isCloudinaryRawAudioUrl(url)) {
        setLoading(false);
        return;
      }

      setLoading(true);
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
      } catch (error) {
        console.warn('Voice blob prepare failed, using direct URL:', error);
        if (!cancelled) setAudioSrc(url);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    prepareAudio();

    return () => {
      cancelled = true;
      revokeBlob();
    };
  }, [url]);

  return (
    <div className="mb-2 w-full min-w-[12rem] max-w-xs">
      {loading ? (
        <p
          className={`text-xs mb-1 ${
            isOwnMessage ? 'text-white/70' : 'text-[#1A3E32]/70'
          }`}
        >
          Loading voice message…
        </p>
      ) : null}
      <audio
        key={audioSrc}
        src={audioSrc}
        controls
        preload="metadata"
        className="w-full h-9"
      />
    </div>
  );
}

export default VoiceMessagePlayer;
