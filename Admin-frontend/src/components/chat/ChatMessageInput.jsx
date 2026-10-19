import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';
import { inferUploadKind, simpleAudioMime } from '../../utils/chatAttachmentUtils';
import {
  createLiveAnalyser,
  formatVoiceDuration,
  getLiveWaveformLevels,
} from '../../utils/voiceWaveform';
import messagingService from '../../services/messagingService';
import VoiceWaveform from './VoiceWaveform';
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from '../../hooks/usePortaledMenu';

function ChatMessageInput({
  message,
  setMessage,
  onSend,
  onSendAttachment,
  disabled = false,
  sending = false,
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState(null);
  const [liveLevels, setLiveLevels] = useState([]);
  const [recordElapsed, setRecordElapsed] = useState(0);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordChunksRef = useRef([]);
  const sendRecordingRef = useRef(false);
  const recordStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const recordStartRef = useRef(0);
  const emojiRef = useRef(null);
  const attachRef = useRef(null);
  const emojiMenu = usePortaledMenu({
    isOpen: showEmoji,
    onClose: () => setShowEmoji(false),
    minWidth: 280,
    maxHeight: 400,
    extraContainRefs: [emojiRef],
  });
  const attachMenu = usePortaledMenu({
    isOpen: showAttachMenu,
    onClose: () => setShowAttachMenu(false),
    minWidth: 140,
    maxHeight: 160,
    extraContainRefs: [attachRef],
  });

  const cleanupAnalyser = async () => {
    analyserRef.current = null;
    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (!recording) return undefined;

    let rafId;
    const tick = () => {
      if (analyserRef.current) {
        setLiveLevels(getLiveWaveformLevels(analyserRef.current));
      }
      setRecordElapsed((Date.now() - recordStartRef.current) / 1000);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [recording]);

  const insertEmoji = (emoji) => {
    setMessage((prev) => `${prev || ''}${emoji}`);
  };

  const handleEmojiClick = (emojiData) => {
    insertEmoji(emojiData.emoji);
  };

  const uploadAndSend = async (file, kindOverride) => {
    if (!file || uploading || disabled) return;
    try {
      setUploading(true);
      setRecordError(null);
      const kind = kindOverride || inferUploadKind(file);
      const uploaded = await messagingService.uploadChatMedia(file, kind);
      const label =
        kind === 'image'
          ? ''
          : kind === 'video'
            ? '🎬 Video'
            : kind === 'audio'
              ? '🎤 Voice message'
              : `📎 ${uploaded.name || file.name || 'Document'}`;
      await onSendAttachment(uploaded.url, label, {
        kind: uploaded.kind || kind,
        name: uploaded.name || file.name || null,
        mime: uploaded.mime || file.type || null,
      });
    } catch (err) {
      console.error('Upload failed:', err);
      setRecordError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
      setShowAttachMenu(false);
    }
  };

  const handleFileChange = (e, kindOverride) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadAndSend(file, kindOverride);
  };

  const startRecording = async () => {
    if (recording || uploading || disabled) return;
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const recorder = audioMime
        ? new MediaRecorder(stream, { mimeType: audioMime })
        : new MediaRecorder(stream);
      recordChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        recordStreamRef.current?.getTracks().forEach((t) => t.stop());
        recordStreamRef.current = null;
        await cleanupAnalyser();

        const shouldSend = sendRecordingRef.current;
        sendRecordingRef.current = false;
        setRecording(false);
        setLiveLevels([]);
        setRecordElapsed(0);

        if (!shouldSend || recordChunksRef.current.length === 0) {
          recordChunksRef.current = [];
          return;
        }

        const mime = simpleAudioMime(recorder.mimeType);
        const ext = mime.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob(recordChunksRef.current, { type: mime });
        recordChunksRef.current = [];
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mime });
        await uploadAndSend(file, 'audio');
      };
      mediaRecorderRef.current = recorder;
      recordStreamRef.current = stream;
      sendRecordingRef.current = false;

      const { audioContext, analyser } = createLiveAnalyser(stream);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      recordStartRef.current = Date.now();
      setLiveLevels(getLiveWaveformLevels(analyser));
      setRecordElapsed(0);

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setRecordError('Microphone access denied or unavailable');
    }
  };

  const finishRecording = (send) => {
    sendRecordingRef.current = send;
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVoiceClick = () => {
    if (recording) {
      finishRecording(false);
    } else {
      startRecording();
    }
  };

  const handleSendClick = () => {
    if (recording) {
      finishRecording(true);
      return;
    }
    if (message.trim() && !sending && !uploading) {
      onSend();
    }
  };

  const canSend = recording || message.trim();

  const busy = sending || uploading || disabled;

  return (
    <div className="shrink-0 z-20 p-2 md:p-4 bg-gray-100 border-t border-gray-200 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {recordError && (
        <p className="text-red-500 text-xs mb-2 px-1">{recordError}</p>
      )}
      {recording && (
        <p className="text-[#16730F] text-xs mb-2 px-1 font-medium">
          Recording voice message
        </p>
      )}
      {uploading && (
        <p className="text-gray-500 text-xs mb-2 px-1">Uploading attachment…</p>
      )}

      <div className="flex flex-col gap-1 md:gap-2 border border-[#D3D3D3] rounded-2xl px-3 md:px-4 py-2 md:py-3 bg-gray-100 shadow-sm">
        {recording ? (
          <div className="flex min-h-[2.5rem] items-center gap-3 py-1">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 animate-pulse"
              aria-hidden="true"
            />
            <VoiceWaveform
              levels={liveLevels}
              isOwnMessage={false}
              className="max-w-none"
            />
            <span className="shrink-0 text-xs font-medium tabular-nums text-[#1A3E32]">
              {formatVoiceDuration(recordElapsed)}
            </span>
          </div>
        ) : (
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendClick()}
            placeholder="Type a message"
            disabled={busy}
            className="flex-1 outline-none text-xs md:text-sm bg-transparent placeholder-gray-400 disabled:opacity-50"
          />
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 md:space-x-2">
            <div className="relative" ref={emojiRef}>
              <button
                ref={emojiMenu.triggerRef}
                type="button"
                onClick={() => {
                  setShowEmoji((v) => !v);
                  setShowAttachMenu(false);
                }}
                disabled={busy}
                className="text-gray-500 hover:text-green-600 text-base md:text-lg disabled:opacity-50"
                aria-label="Add emoji"
              >
                😊
              </button>
              {showEmoji &&
                emojiMenu.menuPos &&
                createPortal(
                  <div
                    ref={emojiMenu.menuRef}
                    className="rounded-xl shadow-lg overflow-hidden"
                    style={getPortaledMenuStyle(emojiMenu.menuPos)}
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={Math.min(320, emojiMenu.menuPos.width)}
                      height={Math.min(400, emojiMenu.menuPos.maxHeight)}
                      searchPlaceholder="Search emojis…"
                      previewConfig={{ showPreview: false }}
                    />
                  </div>,
                  document.body,
                )}
            </div>

            <div className="relative" ref={attachRef}>
              <button
                ref={attachMenu.triggerRef}
                type="button"
                onClick={() => {
                  setShowAttachMenu((v) => !v);
                  setShowEmoji(false);
                }}
                disabled={busy}
                className="text-gray-500 hover:text-green-600 text-base md:text-lg disabled:opacity-50"
                aria-label="Attach file"
              >
                ＋
              </button>
              {showAttachMenu &&
                attachMenu.menuPos &&
                createPortal(
                  <div
                    ref={attachMenu.menuRef}
                    className="bg-white border border-gray-200 rounded-xl shadow-lg py-1"
                    style={getPortaledMenuStyle(attachMenu.menuPos)}
                  >
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Document
                    </button>
                  </div>,
                  document.body,
                )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'image')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'video')}
              />
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'document')}
              />
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={uploading || disabled}
              className={`text-base md:text-lg disabled:opacity-50 ${
                recording
                  ? 'text-red-500 animate-pulse'
                  : 'text-gray-500 hover:text-green-600'
              }`}
              aria-label={recording ? 'Cancel recording' : 'Record voice'}
            >
              🎤
            </button>
            <button
              type="button"
              onClick={handleSendClick}
              disabled={busy || !canSend}
              className="bg-gray-700 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-full p-1 md:p-2 transition"
              aria-label={recording ? 'Send voice message' : 'Send message'}
            >
              {sending ? '...' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessageInput;
