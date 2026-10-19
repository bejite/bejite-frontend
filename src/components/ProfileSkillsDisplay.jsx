import React from 'react';
import {
  normalizeProfileSkills,
  resolveProfileSkillSource,
} from '../utils/profileSkills';

const categoryBadgeClass = (variant) =>
  variant === 'panel'
    ? 'bg-[#556B1F] text-[#F5F5F5] text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium'
    : 'bg-[#E8F5E6] text-[#1A3E32] text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium border border-[#C5E1BF]';

/**
 * Skills list for View Profile (panel) and View Full Profile (card).
 *
 * @param {{ skills?: unknown, cv?: object, candidate?: object, variant?: 'panel' | 'card' }} props
 */
const ProfileSkillsDisplay = ({
  skills: skillsProp,
  cv = null,
  candidate = null,
  variant = 'card',
}) => {
  const source =
    skillsProp ?? resolveProfileSkillSource({ cv, candidate });
  const items = normalizeProfileSkills(source);

  if (items.length === 0) return null;

  if (variant === 'panel') {
    return (
      <div className="px-4 sm:px-8 pb-6 space-y-3">
        {items.map((skill) => (
          <div
            key={skill.id}
            className="bg-[#1A3E32] rounded-xl px-4 py-3 border border-[#2A5A48]"
          >
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <span className="text-[14px] font-semibold text-white">
                {skill.name}
              </span>
              {skill.category && (
                <span className={categoryBadgeClass(variant)}>
                  {skill.category}
                </span>
              )}
            </div>
            {skill.experienceLabel && (
              <p className="text-[11px] text-[#FFB547] mt-1.5">
                {skill.experienceLabel} of experience
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((skill) => (
        <li
          key={skill.id}
          className="rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-emerald-300 p-3 sm:p-3.5 transition-all duration-200 shadow-2xs hover:shadow-xs group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#16730F] transition-colors">
              {skill.name}
            </span>
            {skill.category && (
              <span className={categoryBadgeClass(variant)}>
                {skill.category}
              </span>
            )}
          </div>
          {skill.experienceLabel && (
            <p className="text-xs font-semibold text-[#16730F] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] shrink-0"></span>
              <span>{skill.experienceLabel} of experience</span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ProfileSkillsDisplay;
