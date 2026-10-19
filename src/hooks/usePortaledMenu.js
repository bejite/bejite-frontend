import { useCallback, useEffect, useRef, useState } from "react";

export const PORTALED_MENU_Z_INDEX = 10060;

export function getPortaledMenuStyle(menuPos, zIndex = PORTALED_MENU_Z_INDEX) {
  if (!menuPos) return null;
  return {
    position: "fixed",
    top: menuPos.top,
    bottom: menuPos.bottom,
    left: menuPos.left,
    width: menuPos.width,
    zIndex,
  };
}

/**
 * Positions a dropdown with fixed coords and a portal-friendly menu ref
 * so overflow-hidden parents cannot clip it.
 */
export function usePortaledMenu({
  isOpen,
  onClose,
  minWidth = 140,
  maxHeight = 224,
  gap = 6,
  extraContainRefs = [],
} = {}) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);
  const onCloseRef = useRef(onClose);
  const extraContainRefsRef = useRef(extraContainRefs);
  onCloseRef.current = onClose;
  extraContainRefsRef.current = extraContainRefs;

  const close = useCallback(() => {
    onCloseRef.current?.();
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const isInside = (target) => {
      if (triggerRef.current?.contains(target)) return true;
      if (menuRef.current?.contains(target)) return true;
      return extraContainRefsRef.current.some((ref) =>
        ref?.current?.contains(target),
      );
    };

    const handlePointerDown = (event) => {
      if (!isInside(event.target)) close();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) {
      setMenuPos(null);
      return undefined;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const margin = 8;
      const width = Math.max(rect.width, minWidth);
      const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      const openUp = spaceBelow < 140 && spaceAbove > spaceBelow;

      let left = rect.left;
      if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - width - margin);
      }
      if (left < margin) left = margin;

      setMenuPos({
        top: openUp ? undefined : rect.bottom + gap,
        bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
        left,
        width,
        maxHeight: Math.max(
          80,
          Math.min(maxHeight, openUp ? spaceAbove : spaceBelow),
        ),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, minWidth, maxHeight, gap]);

  return { triggerRef, menuRef, menuPos };
}
