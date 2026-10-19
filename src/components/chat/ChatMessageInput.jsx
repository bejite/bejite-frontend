import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';
import { inferUploadKind } from '../../utils/chatAttachmentUtils';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import messagingService from '../../services/messagingService';
import { formatVoiceDuration } from '../../utils/voiceWaveform';
import VoiceWaveform from './VoiceWaveform';
import ChatQuotePreview from './ChatQuotePreview';
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from '../../hooks/usePortaledMenu';

function ChatMessageInput({
  message,
  setMessage,
  onSend,
  onSendAttachment,
  onRecordingChange,
  disabled = false,
  sending = false,
  replyTo = null,
  onCancelReply,
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const emojiRef = useRef(null);
  const attachRef = useRef(null);
  const textareaRef = useRef(null);
  const inputBarRef = useRef(null);
  const [emojiPickerSize, setEmojiPickerSize] = useState({ width: 300, height: 320 });
  const emojiMenu = usePortaledMenu({
    isOpen: showEmoji,
    onClose: () => setShowEmoji(false),
    minWidth: 240,
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

  const uploadingRef = useRef(false);
  const disabledRef = useRef(disabled);
  const setRecordErrorRef = useRef(() => {});

  useEffect(() => {
    uploadingRef.current = uploading;
  }, [uploading]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const uploadAndSend = useCallback(
    async (file, kindOverride) => {
      if (!file || uploadingRef.current || disabledRef.current) {
        return;
      }

      try {
        setUploading(true);
        uploadingRef.current = true;
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
        setRecordErrorRef.current(
          err.response?.data?.error || 'Failed to upload file'
        );
      } finally {
        uploadingRef.current = false;
        setUploading(false);
        setShowAttachMenu(false);
      }
    },
    [onSendAttachment]
  );

  const {
    recording,
    error: recordError,
    setError: setRecordError,
    liveLevels,
    recordElapsed,
    stopRecording,
    toggleRecording,
  } = useVoiceRecorder({
    disabled: uploading || disabled,
    onRecordingChange,
    onRecorded: (file) => uploadAndSend(file, 'audio'),
  });

  useEffect(() => {
    setRecordErrorRef.current = setRecordError;
  }, [setRecordError]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    if (!replyTo?.id) return;
    textareaRef.current?.focus();
  }, [replyTo?.id]);

  const computeEmojiPickerSize = useCallback(() => ({
    width: Math.min(320, Math.max(240, window.innerWidth - 24)),
    height: Math.min(400, Math.max(220, Math.floor(window.innerHeight * 0.38))),
  }), []);

  // Keep the composer above the mobile virtual keyboard without re-rendering on
  // every visualViewport tick (which caused jumpy layout while typing).
  useEffect(() => {
    const viewport = window.visualViewport;
    const bar = inputBarRef.current;
    if (!viewport || !bar) return undefined;

    const syncComposerWithKeyboard = () => {
      const keyboardOffset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      bar.style.transform =
        keyboardOffset > 0 ? `translateY(-${keyboardOffset}px)` : '';
    };

    syncComposerWithKeyboard();
    viewport.addEventListener('resize', syncComposerWithKeyboard);
    viewport.addEventListener('scroll', syncComposerWithKeyboard);

    return () => {
      viewport.removeEventListener('resize', syncComposerWithKeyboard);
      viewport.removeEventListener('scroll', syncComposerWithKeyboard);
      bar.style.transform = '';
    };
  }, []);

  const handleFileChange = (e, kindOverride) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadAndSend(file, kindOverride);
  };

  const handleSendClick = () => {
    if (recording) {
      stopRecording();
      return;
    }
    if (message.trim() && !sending && !uploading) {
      onSend();
    }
  };

  const canSend = recording || Boolean(message.trim());
  const busy = sending || uploading || disabled;

  return (
    <div
      ref={inputBarRef}
      className="shrink-0 z-20 px-2 pt-2 md:px-4 md:pt-3 bg-gray-100 border-t border-gray-200 pb-[max(0.25rem,env(safe-area-inset-bottom))] will-change-transform"
    >
      {recordError && (
        <p className="text-red-500 text-xs mb-2 px-1">{recordError}</p>
      )}
      {uploading && (
        <p className="text-gray-500 text-xs mb-2 px-1">Uploading voice message…</p>
      )}

      <div className="flex flex-col gap-0.5 sm:gap-1 border border-[#16730F] rounded-3xl sm:rounded-[2rem] px-3 sm:px-4 md:px-5 pt-2 pb-1.5 sm:pt-2.5 sm:pb-2 md:pt-3 md:pb-2.5 bg-[#F3F3F3] shadow-sm">
        {replyTo?.id && !recording ? (
          <ChatQuotePreview quote={replyTo} onDismiss={onCancelReply} />
        ) : null}
        {recording ? (
          <div className="flex min-h-[2rem] items-center gap-3 py-1">
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
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            enterKeyHint="enter"
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
                return;
              }
              // Phone/tablet Return should insert a new line. Send with the button.
              if (window.matchMedia('(pointer: coarse)').matches) {
                return;
              }
              e.preventDefault();
              handleSendClick();
            }}
            placeholder="Type a message"
            disabled={busy}
            className="w-full outline-none text-xs md:text-sm bg-transparent text-[#1A3E32] placeholder:text-[#A89B72] disabled:opacity-50 leading-normal resize-none overflow-y-auto max-h-32 break-words"
          />
        )}

        <div className="flex justify-between items-center min-h-0 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
            <div className="relative shrink-0" ref={emojiRef}>
              <button
                ref={emojiMenu.triggerRef}
                type="button"
                onClick={() => {
                  setEmojiPickerSize(computeEmojiPickerSize());
                  setShowEmoji((v) => !v);
                  setShowAttachMenu(false);
                }}
                disabled={busy}
                className="inline-flex items-center justify-center shrink-0 min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 p-1 hover:opacity-80 disabled:opacity-50"
                aria-label="Add emoji"
              >
                <img
                  src="/assets/images/Smily.svg"
                  alt=""
                  className="block w-[18px] h-[18px] sm:w-5 sm:h-5"
                />
              </button>
              {showEmoji &&
                emojiMenu.menuPos &&
                typeof document !== 'undefined' &&
                createPortal(
                  <div
                    ref={emojiMenu.menuRef}
                    className="rounded-xl shadow-lg overflow-hidden"
                    style={{
                      ...getPortaledMenuStyle(emojiMenu.menuPos),
                      width: Math.min(
                        emojiPickerSize.width,
                        emojiMenu.menuPos.width,
                      ),
                    }}
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setMessage((prev) => `${prev || ''}${emojiData.emoji}`)
                      }
                      width={Math.min(
                        emojiPickerSize.width,
                        emojiMenu.menuPos.width,
                      )}
                      height={Math.min(
                        emojiPickerSize.height,
                        emojiMenu.menuPos.maxHeight,
                      )}
                      searchPlaceholder="Search emojis…"
                      previewConfig={{ showPreview: false }}
                    />
                  </div>,
                  document.body,
                )}
            </div>

            <div className="relative shrink-0" ref={attachRef}>
              <button
                ref={attachMenu.triggerRef}
                type="button"
                onClick={() => {
                  setShowAttachMenu((v) => !v);
                  setShowEmoji(false);
                }}
                disabled={busy}
                className="inline-flex items-center justify-center shrink-0 min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 p-1 hover:opacity-80 disabled:opacity-50"
                aria-label="Attach file"
              >
                <img
                  src="/assets/images/Plus_Icon.svg"
                  alt=""
                  className="block w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
              </button>
              {showAttachMenu &&
                attachMenu.menuPos &&
                typeof document !== 'undefined' &&
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

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={uploading || disabled}
              className={`inline-flex items-center justify-center shrink-0 min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 p-1 disabled:opacity-50 ${
                recording ? 'animate-pulse opacity-80' : 'hover:opacity-80'
              }`}
              aria-label={recording ? 'Stop and send voice message' : 'Record voice'}
            >
              <img
                src="/assets/images/microphone.png"
                alt=""
                className={`block w-[18px] h-[18px] sm:w-5 sm:h-5 ${recording ? 'opacity-70' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={handleSendClick}
              disabled={busy || !canSend}
              className="inline-flex items-center justify-center shrink-0 min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 p-0.5 disabled:opacity-50 transition"
              aria-label={recording ? 'Send voice message' : 'Send message'}
            >
              {sending ? (
                <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A3E32] text-white text-xs">
                  ...
                </span>
              ) : (
                <img
                  src="/assets/images/chat_send.svg"
                  alt=""
                  className="block w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessageInput;
