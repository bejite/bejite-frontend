import React from 'react';
import Bej from '../../assets/logo/bej 1.png';
import Eclipse27 from '../../assets/logo/Ellipse 27.png';
import Eclipse271 from '../../assets/logo/Ellipse 27-1.png';

const SIZES = {
  sm: { container: 60, icon: 48, text: 'text-xs' },
  md: { container: 100, icon: 80, text: 'text-sm sm:text-base' },
  lg: { container: 120, icon: 100, text: 'text-base sm:text-lg' },
};

/**
 * Universal Bejite Logo Loading Component for Admin Frontend.
 * Supports fullscreen overlay, inline container placement, custom sizes, and descriptions.
 */
const Loader = ({
  show = true,
  spin = true,
  description,
  fullscreen = true,
  inline = false,
  size = "md",
  className = "",
  textColor = "text-[#1A3E32]",
}) => {
  if (!show) return null;

  const currentSize = SIZES[size] || SIZES.md;
  const isFullscreen = fullscreen && !inline;

  const loaderVisual = (
    <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
      <div
        className="relative flex justify-center items-center select-none"
        style={{ width: currentSize.container, height: currentSize.container }}
      >
        <img
          src={Bej}
          alt="Bejite Logo"
          className="absolute z-10 select-none pointer-events-none"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        />
        <img
          src={Eclipse27}
          alt="Bejite Loader Ring"
          className="absolute select-none pointer-events-none"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        />
        {spin && (
          <img
            src={Eclipse271}
            alt="Bejite Loader Spinning Ring"
            className="absolute z-20 animate-spin select-none pointer-events-none"
            style={{ width: currentSize.icon, height: currentSize.icon }}
          />
        )}
      </div>
      {description && (
        <p className={`text-center font-medium ${textColor} ${currentSize.text} max-w-xs animate-pulse leading-snug`}>
          {description}
        </p>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div
        className={`w-screen h-screen fixed inset-0 bg-white/75 flex justify-center items-center z-50 backdrop-blur-xs flex-col ${className}`}
        role="status"
        aria-label={description || "Loading"}
      >
        {loaderVisual}
      </div>
    );
  }

  return (
    <div
      className={`w-full flex justify-center items-center py-6 ${className}`}
      role="status"
      aria-label={description || "Loading"}
    >
      {loaderVisual}
    </div>
  );
};

export default Loader;
