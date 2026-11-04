import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, ChevronDown } from "lucide-react";
import {
  ELearningLayout,
  CourseCatalogCard,
} from "../../../components/elearning";
import { getAllCoursesWithProgress } from "../../../services/elearningService";

export default function ExploreCoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const partnerParam = searchParams.get("partner") || "";

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all"); // "all" | "free" | "paid"
  const [courses] = useState(() => getAllCoursesWithProgress());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (partnerParam && course.partnerId !== partnerParam) return false;
      if (priceFilter === "free" && course.isPaid) return false;
      if (priceFilter === "paid" && !course.isPaid) return false;
      if (
        levelFilter === "beginner" &&
        course.levelShort?.toLowerCase() !== "beginner"
      ) {
        return false;
      }
      if (
        levelFilter === "intermediate" &&
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
  }, [courses, query, levelFilter, priceFilter, partnerParam]);

  return (
    <ELearningLayout activeNavId="explore">
      <div className="space-y-5">
        {/* Course Catalogue Banner (matching Image 2) */}
        <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-4 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#112A20] tracking-tight">
            Course Catalogue
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#5A6D62] leading-relaxed">
            Explore industry-aligned courses designed by vetted training partners and academies.
          </p>
        </div>

        {/* Search & Filter Bar (matching Image 2) */}
        <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Search Pill */}
          <div className="relative w-full md:max-w-xl">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses by name..."
              className="w-full bg-white pl-11 pr-9 py-2.5 rounded-full border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#16730F] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: All Level Dropdown + Free / Paid Pills */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0 w-full md:w-auto">
            <div className="relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full pl-4 pr-8 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <option value="all">All level</option>
                <option value="beginner">Beginner Level</option>
                <option value="intermediate">Intermediate Level</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setPriceFilter(priceFilter === "free" ? "all" : "free")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                priceFilter === "free"
                  ? "bg-[#16730F] text-white shadow-xs"
                  : "bg-[#E2EBE2] text-gray-700 hover:bg-[#D5E2D5]"
              }`}
            >
              Free
            </button>

            <button
              type="button"
              onClick={() => setPriceFilter(priceFilter === "paid" ? "all" : "paid")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                priceFilter === "paid"
                  ? "bg-[#16730F] text-white shadow-xs"
                  : "bg-[#E2EBE2] text-gray-700 hover:bg-[#D5E2D5]"
              }`}
            >
              Paid
            </button>
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

        {/* 2-Column Course Catalog Grid (matching Image 2) */}
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
                onViewCourse={(c) =>
                  navigate(`/e-learning/jobseeker/courses/${c.id}`)
                }
                onContinueCourse={(c) =>
                  navigate(`/e-learning/jobseeker/courses/${c.id}/learn`)
                }
                onProgressCourse={(c) =>
                  navigate(`/e-learning/jobseeker/courses/${c.id}/progress`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </ELearningLayout>
  );
}

