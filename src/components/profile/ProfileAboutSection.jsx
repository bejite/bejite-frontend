import React, { useState } from "react";
import { FaChevronDown, FaQuoteLeft } from "react-icons/fa";
import SectionLabel from "./SectionLabel";

const ABOUT_CHAR_LIMIT = 240;
const ABOUT_WORD_LIMIT = 35;

const getAboutPreview = (text) => {
  if (!text) return { text: "", needsTruncation: false };
  const words = text.split(/\s+/).filter(Boolean);
  if (text.length > ABOUT_CHAR_LIMIT || words.length > ABOUT_WORD_LIMIT) {
    const truncatedByChar = text.slice(0, ABOUT_CHAR_LIMIT).trim();
    const lastSpaceIndex = truncatedByChar.lastIndexOf(" ");
    const cleanTruncated =
      lastSpaceIndex > 80
        ? truncatedByChar.slice(0, lastSpaceIndex)
        : truncatedByChar;
    return {
      text: cleanTruncated + "...",
      needsTruncation: true,
    };
  }
  return { text, needsTruncation: false };
};

/**
 * Executive About / Bio section with left accent line, quote badge, and smooth truncation.
 */
const ProfileAboutSection = ({ profileData, cvData, isRecruiterProfile = false }) => {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const aboutTextRaw =
    (typeof profileData?.bio === "string" && profileData.bio.trim()) ||
    (typeof profileData?.summary === "string" && profileData.summary.trim()) ||
    (typeof cvData?.bio?.bio === "string" && cvData.bio.bio.trim()) ||
    "";
  const aboutText = aboutTextRaw || null;

  const aboutPreview = aboutText
    ? getAboutPreview(aboutText)
    : { text: "", needsTruncation: false };
  const needsTruncation = aboutPreview.needsTruncation;

  return (
    <section className="p-6 sm:p-8">
      <SectionLabel tone="#b45309">
        {isRecruiterProfile ? "About Company" : "About"}
      </SectionLabel>
      <div className="relative">
        {aboutText ? (
          <div className="relative pl-5 border-l-2 border-amber-300/80 bg-gradient-to-r from-amber-50/30 via-slate-50/10 to-transparent py-2.5 rounded-r-md">
            <FaQuoteLeft className="w-3.5 h-3.5 text-amber-400/60 mb-2" />
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap break-words font-normal">
              {!needsTruncation || isAboutExpanded
                ? aboutText
                : aboutPreview.text}
            </p>
            {needsTruncation && (
              <button
                type="button"
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="mt-3.5 text-[#16730F] hover:text-[#145a0c] font-bold text-xs transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
              >
                <span>{isAboutExpanded ? "Read Less" : "Read More"}</span>
                <FaChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isAboutExpanded ? "rotate-180 text-[#16730F]" : ""
                  }`}
                />
              </button>
            )}
          </div>
        ) : (
          <div className="pl-4 border-l-2 border-slate-200 py-1">
            <p className="text-xs sm:text-sm text-slate-400 italic">
              No bio summary provided yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileAboutSection;
