import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';

const PICKER_HEIGHT = 360;
const PICKER_Z_INDEX = 10050;

export default function EmojiPickerButton({
  onEmojiSelect,
  disabled = false,
  placement = 'top',
  className = '',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const [pickerWidth, setPickerWidth] = useState(320);
  const [pickerCoords, setPickerCoords] = useState(null);
  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      setPickerWidth(Math.min(320, Math.max(260, window.innerWidth - 32)));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!open) {
      setPickerCoords(null);
      return undefined;
    }

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const margin = 8;
      let top =
        placement === 'top'
          ? rect.top - PICKER_HEIGHT - margin
          : rect.bottom + margin;

      if (placement === 'top' && top < margin) {
        top = rect.bottom + margin;
      }

      const left = Math.min(
        Math.max(margin, rect.right - pickerWidth),
        window.innerWidth - pickerWidth - margin,
      );

      setPickerCoords({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, pickerWidth, placement]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      const inButton = buttonRef.current?.contains(event.target);
      const inPicker = pickerRef.current?.contains(event.target);
      if (!inButton && !inPicker) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
  };

  const pickerPortal =
    open &&
    pickerCoords &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={pickerRef}
        className="fixed rounded-xl shadow-lg overflow-hidden"
        style={{
          top: pickerCoords.top,
          left: pickerCoords.left,
          zIndex: PICKER_Z_INDEX,
        }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width={pickerWidth}
          height={PICKER_HEIGHT}
          searchPlaceholder="Search emojis…"
          previewConfig={{ showPreview: false }}
        />
      </div>,
      document.body,
    );

  return (
    <>
      <div className={`relative inline-flex ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setOpen((value) => !value)}
          disabled={disabled}
          className={`inline-flex items-center justify-center shrink-0 hover:opacity-80 disabled:opacity-50 ${buttonClassName}`}
          aria-label="Add emoji"
          aria-expanded={open}
        >
          <img
            src="/assets/images/Smily.svg"
            alt=""
            className="block w-5 h-5"
          />
        </button>
      </div>
      {pickerPortal}
    </>
  );
}
