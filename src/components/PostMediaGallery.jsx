import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';
import {
  resolvePostMediaUrl,
  getVideoPosterUrl,
  isVideoMedia,
} from '../utils/postMediaUrl';

function PostMediaModal({ item, onClose }) {
  const resolvedUrl = resolvePostMediaUrl(item?.url);
  const isVideo = isVideoMedia(item);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!resolvedUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isVideo ? 'Video player' : 'Image viewer'}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={resolvedUrl}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[85vh] w-full object-contain rounded-lg bg-black"
          />
        ) : (
          <img
            src={resolvedUrl}
            alt="Post media"
            className="max-w-full max-h-[85vh] w-full object-contain rounded-lg"
          />
        )}
        <button
          type="button"
          aria-label="Close"
          className="absolute -top-2 right-0 sm:top-0 sm:right-0 text-white text-2xl bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function VideoMediaTile({ item, onOpen, showFullMedia }) {
  const videoUrl = resolvePostMediaUrl(item.url);
  const posterUrl = getVideoPosterUrl(item);
  const hoverVideoRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const interactive = typeof onOpen === 'function';
  const Wrapper = interactive ? 'button' : 'div';
  const wrapperProps = interactive
    ? {
        type: 'button',
        onClick: onOpen,
        'aria-label': 'Play video',
      }
    : {};

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
    const el = hoverVideoRef.current;
    if (!el || !videoUrl) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }, [videoUrl]);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    const el = hoverVideoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  if (!videoUrl) return null;

  if (showFullMedia) {
    const backdropUrl = posterUrl || videoUrl;

    return (
      <Wrapper
        {...wrapperProps}
        className="relative w-full h-[min(70vh,32rem)] rounded-xl overflow-hidden bg-black group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-75 saturate-150"
          />
        )}
        <div className="absolute inset-0 bg-black/20" aria-hidden />
        {posterUrl ? (
          <img
            src={posterUrl}
            alt="Video thumbnail"
            className={`absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-200 ${
              hovering ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : null}
        <video
          ref={hoverVideoRef}
          src={videoUrl}
          muted
          playsInline
          loop
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-200 ${
            hovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
        <span
          className={`absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-opacity ${
            hovering ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="w-14 h-14 rounded-full bg-black/55 flex items-center justify-center text-white">
            <FaPlay className="ml-1" size={22} />
          </span>
        </span>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...wrapperProps}
      className="relative w-full rounded-xl overflow-hidden bg-black group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt="Video thumbnail"
          className={`w-full max-h-[55vh] sm:max-h-96 object-cover transition-opacity duration-200 ${
            hovering ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        <div
          className={`w-full max-h-[55vh] sm:max-h-96 min-h-[200px] bg-neutral-900 transition-opacity duration-200 ${
            hovering ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
      <video
        ref={hoverVideoRef}
        src={videoUrl}
        muted
        playsInline
        loop
        preload="metadata"
        className={`absolute inset-0 w-full h-full max-h-[55vh] sm:max-h-96 object-contain bg-black transition-opacity duration-200 ${
          hovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <span
        className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity ${
          hovering ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="w-14 h-14 rounded-full bg-black/55 flex items-center justify-center text-white">
          <FaPlay className="ml-1" size={22} />
        </span>
      </span>
    </Wrapper>
  );
}

function ImageMediaTile({ item, onOpen, showFullMedia }) {
  const imageUrl = resolvePostMediaUrl(item.url);
  if (!imageUrl) return null;

  const interactive = typeof onOpen === 'function';
  const Wrapper = interactive ? 'button' : 'div';
  const wrapperProps = interactive
    ? {
        type: 'button',
        onClick: onOpen,
        'aria-label': 'View image',
      }
    : {};

  if (showFullMedia) {
    return (
      <Wrapper
        {...wrapperProps}
        className="relative w-full h-[min(70vh,32rem)] rounded-xl overflow-hidden bg-black cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F]"
      >
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-75 saturate-150"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden />
        <img
          src={imageUrl}
          alt="Post media"
          className="absolute inset-0 z-10 w-full h-full object-contain hover:opacity-95 transition-opacity"
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...wrapperProps}
      className="w-full rounded-xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F]"
    >
      <img
        src={imageUrl}
        alt="Post media"
        className="w-full rounded-xl max-h-[55vh] sm:max-h-96 object-cover hover:opacity-95 transition-opacity"
      />
    </Wrapper>
  );
}

export default function PostMediaGallery({ media, showFullMedia = false }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [modalItem, setModalItem] = useState(null);
  const openLightbox = showFullMedia ? (item) => setModalItem(item) : undefined;

  if (!media || media.length === 0) return null;

  const handleMediaScroll = (e) => {
    if (media.length <= 1) return;
    const container = e.currentTarget;
    const itemWidth = container.clientWidth * 0.8;
    if (!itemWidth) return;
    const idx = Math.round(container.scrollLeft / itemWidth);
    const bounded = Math.max(0, Math.min(idx, media.length - 1));
    setActiveMediaIndex(bounded);
  };

  return (
    <>
      <div className="space-y-2">
        <div
          className={
            media.length === 1
              ? 'grid grid-cols-1'
              : 'flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1'
          }
          onScroll={handleMediaScroll}
        >
          {media.map((item, index) => (
            <div
              key={item.id ?? `${item.url}-${index}`}
              className={
                media.length === 1 ? 'w-full' : 'min-w-[80%] sm:min-w-[45%] snap-start'
              }
            >
              {isVideoMedia(item) ? (
                <VideoMediaTile
                  item={item}
                  showFullMedia={showFullMedia}
                  onOpen={openLightbox ? () => openLightbox(item) : undefined}
                />
              ) : (
                <ImageMediaTile
                  item={item}
                  showFullMedia={showFullMedia}
                  onOpen={openLightbox ? () => openLightbox(item) : undefined}
                />
              )}
            </div>
          ))}
        </div>
        {media.length > 1 && (
          <div className="flex justify-center">
            <span className="text-xs font-medium text-white bg-black/60 px-2 py-1 rounded-full">
              {activeMediaIndex + 1}/{media.length}
            </span>
          </div>
        )}
      </div>

      {showFullMedia && modalItem && (
        <PostMediaModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </>
  );
}
