import {
  FaCheck,
} from "react-icons/fa";

export const InputWithIcon = ({
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div className="relative w-full">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent transition-all shadow-sm ${
        type === "date" && value ? "hide-calendar-icon" : ""
      } placeholder-gray-400`}
    />
    {value && (
      <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
    )}
  </div>
);
