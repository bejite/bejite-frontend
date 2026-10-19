import { Sparkles, User, Settings, Briefcase, Smile, Users } from "lucide-react";

export const PITCH_TYPES = [
  {
    id: "skill",
    title: "Showcase My Skill",
    description: "Demonstrate what you do best and show your direct craft or technical ability.",
    icon: Sparkles,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "SKILL",
    fullBadge: "Skill Showcase",
  },
  {
    id: "intro",
    title: "Introduce Myself",
    description: "Give recruiters, employers, and collaborators a quick, human professional introduction.",
    icon: User,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    badge: "INTRO",
    fullBadge: "Personal Intro",
  },
  {
    id: "service",
    title: "Promote My Service",
    description: "Tell prospective clients and founders about the professional service you provide.",
    icon: Settings,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    badge: "SERVICE",
    fullBadge: "Service Pitch",
  },
  {
    id: "work",
    title: "Showcase My Work",
    description: "Walk through a real case study, portfolio project, product release or metric win.",
    icon: Briefcase,
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    badge: "WORK",
    fullBadge: "Work Showcase",
  },
  {
    id: "opportunity",
    title: "I'm Open to Opportunities",
    description: "Let relevant hiring managers and teams know what types of roles you are looking for.",
    icon: Smile,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    badge: "TALENT",
    fullBadge: "Talent Showcase",
  },
  {
    id: "hiring",
    title: "Hiring / Looking for Talent",
    description: "Showcase your company culture, open roles, and what makes your team exceptional.",
    icon: Users,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "HIRING",
    fullBadge: "Hiring Opportunity",
  },
];

export const AUDIENCE_OPTIONS = [
  {
    id: "everyone",
    title: "Everyone",
    description: "Broadcast broadly to the entire Bejite network",
  },
  {
    id: "employers",
    title: "Employers & Founders",
    description: "Companies seeking staff and executives",
  },
  {
    id: "recruiters",
    title: "Recruiters",
    description: "Agency and internal talent partners",
  },
  {
    id: "jobseekers",
    title: "Jobseekers",
    description: "Active professionals exploring positions",
  },
];

export const TARGET_INDUSTRIES = [
  "Technology",
  "Fintech",
  "Design",
  "Marketing",
  "Healthcare",
  "Banking",
];

export const TARGET_ROLES = [
  "Recruiter",
  "Hiring Manager",
  "Product Lead",
  "Engineering Manager",
  "Creative Director",
];

export const SKILL_SUGGESTIONS = [
  "Frontend Engineering",
  "React",
  "Typescript",
  "Node.js",
  "Product Strategy",
];

export const CATEGORIES = [
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Other",
];

export const STEP_LABELS = [
  "Pitch Type",
  "Record/Upload",
  "Details",
  "Audience",
  "Call to Action",
  "Review",
];

export const CTA_OPTIONS = [
  { id: "Hire Me", desc: "Best for freelancers, contractors, and designers seeking direct job offers" },
  { id: "Let's Connect", desc: "For general networking, mentorship, and building professional relationships" },
  { id: "Book Intro Call", desc: "Prompt viewers to schedule a 15-minute introductory meeting" },
  { id: "View Portfolio", desc: "Direct traffic to your external case studies, website, or Behance" },
  { id: "Apply Now", desc: "Used by employers, recruiters, and founders promoting an open role" },
];
