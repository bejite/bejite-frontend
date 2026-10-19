import { FaCheck } from "react-icons/fa";

const RecruitmentForm = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  datalistId,
  options = [],
  type = "text",
}) => (
  <div className="w-full p-3 sm:p-4 rounded-lg">
    <label
      htmlFor={id}
      className="text-[#16730F] text-sm sm:text-[15px] font-medium block mb-1"
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        list={datalistId}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white text-gray-800 text-sm sm:text-base"
        placeholder={placeholder}
      />
      {value && (
        <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
      )}
      {datalistId && (
        <datalist id={datalistId}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      )}
    </div>
  </div>
);

export default RecruitmentForm;
