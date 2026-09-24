import {
  Sparkles,
  Users,
  Briefcase,
  Settings,
  Building,
  Zap,
} from "lucide-react";

/** Discover filter chips for Pitch Hub */
export const CATEGORIES = [
  { id: "For You", label: "For You", icon: Sparkles },
  { id: "Talents", label: "Talents", icon: Users },
  { id: "Hiring", label: "Hiring", icon: Briefcase },
  { id: "Services", label: "Services", icon: Settings },
  { id: "Companies", label: "Companies", icon: Building },
  { id: "Opportunity", label: "Opportunity", icon: Zap },
];

export const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};
