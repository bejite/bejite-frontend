import { FaBriefcase, FaBuilding, FaUsers } from "react-icons/fa";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#16730F] to-[#1A3E32] p-5 sm:p-8 md:p-12 text-white mb-4 sm:mb-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
          Find Your Next Opportunity
        </h1>
        <p className="text-green-100 max-w-2xl text-xs sm:text-sm md:text-base">
          Discover thousands of job vacancies from top companies across Africa.
          Apply instantly and get matched using Bejite&apos;s Advanced Search
          Engine (ASE).
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <FaBriefcase className="shrink-0" /> 1,200+ Jobs
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <FaBuilding className="shrink-0" /> 500+ Companies
          </div>
          {/* <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <FaUsers className="shrink-0" /> 10k+ Candidates
          </div> */}
        </div>
      </div>
    </div>
  );
};
