import { FaSearch } from "react-icons/fa";

export const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-2 sm:p-4 mb-4 sm:mb-8">
      <div className="relative">
        <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
        <input
          type="text"
          placeholder="Search jobs, companies, skills..."
          className="w-full border-0 pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-4 text-sm sm:text-lg focus:ring-0 outline-none rounded-lg sm:rounded-xl"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
