import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, BookOpen } from "lucide-react";
import {
  ELearningLayout,
  ELearningWelcomeBanner,
  ELearningSectionHeader,
  CourseCatalogCard,
} from "../../components/elearning";
import { getAllCoursesWithProgress } from "../../services/elearningService";

const LEVEL_FILTERS = [
  { id: "all", label: "All Courses" },
  { id: "free", label: "Free Courses" },
  { id: "beginner", label: "Beginner Level" },
  { id: "intermediate", label: "Intermediate Level" },
];

export default function ExploreCoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const partnerParam = searchParams.get("partner") || "";

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [courses] = useState(() => getAllCoursesWithProgress());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (partnerParam && course.partnerId !== partnerParam) return false;
      if (activeFilter === "free" && course.isPaid) return false;
      if (
        activeFilter === "beginner" &&
        course.levelShort?.toLowerCase() !== "beginner"
      ) {
        return false;
      }
      if (
        activeFilter === "intermediate" &&
        course.levelShort?.toLowerCase() !== "intermediate"
      ) {
        return false;
      }
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.partnerName.toLowerCase().includes(q) ||
        course.summary.toLowerCase().includes(q)
      );
    });
  }, [courses, query, activeFilter, partnerParam]);

  return (
    <ELearningLayout activeNavId="explore">
      <div className="space-y-6">
        <ELearningWelcomeBanner
          title="Explore Courses"
          description="Discover guided, employer-partner curriculums designed to build practical skills, verified knowledge assessments, and recruitment-ready portfolio evidence."
        />

        {/* Search & Filter Controls */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses by title, skill category, or partner academy..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {LEVEL_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFilter(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  activeFilter === item.id
                    ? "bg-[#16730F] text-white border-[#16730F]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {partnerParam && (
          <div className="flex items-center justify-between bg-[#EFF5EF] border border-[#DCE8DC] rounded-xl px-4 py-2.5 text-xs">
            <span className="font-semibold text-[#15372B]">
              Showing courses from partner filter
            </span>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="font-bold text-[#16730F] hover:underline cursor-pointer"
            >
              Show all partners
            </button>
          </div>
        )}

        <section className="space-y-4">
          <ELearningSectionHeader
            overline="PARTNER CATALOGUE"
            overlineIcon={BookOpen}
            title="Available Partner Curriculums"
            subtitle={`${filtered.length} ${
              filtered.length === 1 ? "course" : "courses"
            } available`}
          />

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-gray-900">
                No courses matched your search
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try clearing your search query or selecting another filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((course) => (
                <CourseCatalogCard
                  key={course.id}
                  course={course}
                  onViewCourse={(c) => navigate(`/e-learning/courses/${c.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ELearningLayout>
  );
}

