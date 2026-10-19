import React from 'react';
import { BadgeX } from 'lucide-react';
import VerifiedBadgeIcon from './VerifiedBadgeIcon';
import {
  getUnverifiedRecruiterLabel,
  getVerifiedBadgeLabel,
} from '../utils/verifiedBadge';

/**
 * Green verified badge pill (distinct from email verification).
 * Recruiter listings without approval show the Unverified variant.
 */
export default function VerifiedBadge({
  size = 'sm',
  showLabel = true,
  className = '',
  user = null,
  role = null,
  label = null,
  unverified = false,
  /** On small screens show icon only; full labelled pill from sm up */
  responsiveLabel = false,
}) {
  const sizes = {
    xs: {
      icon: 'w-3 h-3',
      text: 'text-[8px] leading-tight',
      gap: 'gap-0.5',
      pad: 'px-1.5 py-0.5',
      width: unverified
        ? 'w-max min-w-[4.5rem] sm:min-w-[5.25rem]'
        : 'w-max min-w-[5.75rem] sm:min-w-[6.75rem]',
    },
    sm: {
      icon: 'w-3.5 h-3.5',
      text: 'text-[10px] leading-tight',
      gap: 'gap-1',
      pad: 'px-2 py-0.5',
      width: unverified
        ? 'w-max min-w-[5.25rem] sm:min-w-[6rem]'
        : 'w-max min-w-[6.5rem] sm:min-w-[7.5rem]',
    },
    md: {
      icon: 'w-4 h-4',
      text: 'text-xs leading-tight',
      gap: 'gap-1',
      pad: 'px-2.5 py-1',
      width: unverified
        ? 'w-max min-w-[5.75rem] sm:min-w-[6.5rem]'
        : 'w-max min-w-[7.25rem] sm:min-w-[8.25rem]',
    },
  };
  const s = sizes[size] || sizes.sm;
  const displayLabel = unverified
    ? (label ?? getUnverifiedRecruiterLabel())
    : (label ?? getVerifiedBadgeLabel(role ?? user));
  const Icon = unverified ? BadgeX : VerifiedBadgeIcon;
  const toneClass = unverified
    ? 'bg-gray-100 text-gray-600 border-gray-300'
    : 'bg-[#E8F5E9] text-[#16730F] border-[#16730F]/20';
  const iconTone = unverified ? 'text-gray-500' : 'text-[#16730F]';
  const pillClass = `inline-flex items-center justify-center ${s.gap} ${s.pad} ${s.width} rounded-full ${toneClass} border font-semibold ${s.text} whitespace-nowrap shrink-0 max-w-full ${className}`;

  if (!showLabel) {
    return (
      <Icon
        className={`${s.icon} ${iconTone} shrink-0 inline-block ${className}`}
        aria-label={displayLabel}
        title={displayLabel}
      />
    );
  }

  if (responsiveLabel) {
    return (
      <>
        <Icon
          className={`${s.icon} ${iconTone} shrink-0 sm:hidden ${className}`}
          aria-label={displayLabel}
          title={displayLabel}
        />
        <span
          className={`hidden sm:inline-flex items-center justify-center ${s.gap} ${s.pad} ${s.width} rounded-full ${toneClass} border font-semibold ${s.text} whitespace-nowrap shrink-0 max-w-full ${className}`}
          title={displayLabel}
          aria-label={displayLabel}
        >
          <Icon className={`${s.icon} shrink-0`} aria-hidden />
          {displayLabel}
        </span>
      </>
    );
  }

  return (
    <span
      className={pillClass}
      title={displayLabel}
      aria-label={displayLabel}
    >
      <Icon className={`${s.icon} shrink-0`} aria-hidden />
      {displayLabel}
    </span>
  );
}
