import React from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES, SKILL_SUGGESTIONS } from "../pitchModalConstants";
import Button from "../../../ui/Button";

export default function Step3Details({
  headline,
  setHeadline,
  description,
  setDescription,
  category,
  setCategory,
  skills,
  customSkillInput,
  setCustomSkillInput,
  onAddSkill,
  onRemoveSkill,
}) {
  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          Tell People What You&apos;re Pitching
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Add enough professional context to help the right employers, clients, or collaborators understand your value.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1 sm:mb-1.5">
          <span>PITCH HEADLINE / TITLE</span>
          <span className="text-gray-400 font-normal text-[10px] sm:text-xs">
            {headline.length}/100
          </span>
        </div>
        <input
          type="text"
          maxLength={100}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Senior UI/UX Designer | Turning complex financial systems into simple user apps"
          className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 focus:border-[#16730F] focus:outline-none text-xs sm:text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1 sm:mb-1.5">
          <span>DESCRIPTION</span>
          <span className="text-gray-400 font-normal text-[10px] sm:text-xs">
            {description.length}/280
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={280}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What should viewers know about this Pitch? Summarize your skills, achievements, or what makes this opportunity compelling..."
          className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 focus:border-[#16730F] focus:outline-none text-xs sm:text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1 sm:mb-1.5">
          CATEGORY
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 sm:p-3 pr-10 rounded-xl border border-gray-300 focus:border-[#16730F] focus:outline-none text-xs sm:text-sm appearance-none bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1 sm:mb-1.5">
          CORE SKILLS
        </label>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5E9] text-[#16730F] border border-green-200"
            >
              {s}
              <button
                type="button"
                onClick={() => onRemoveSkill(s)}
                className="hover:text-red-500 font-bold ml-0.5 cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-2.5 sm:mb-3">
          <input
            type="text"
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSkill(customSkillInput);
              }
            }}
            placeholder="Type a skill and press Enter..."
            className="flex-1 p-2 sm:p-2.5 rounded-xl border border-gray-300 focus:border-[#16730F] focus:outline-none text-xs sm:text-sm"
          />
          <Button
            onClick={() => onAddSkill(customSkillInput)}
            variant="primary"
            size="sm"
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold"
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <span className="text-[11px] sm:text-xs text-gray-500 font-medium mr-1">
            Suggestions:
          </span>
          {SKILL_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onAddSkill(sug)}
              className="px-2.5 sm:px-3 py-1 rounded-full bg-[#1A3E32] text-white text-[10px] sm:text-xs font-medium hover:bg-[#122A23] transition-colors cursor-pointer"
            >
              + {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
