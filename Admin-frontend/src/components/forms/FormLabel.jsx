const FormLabel = ({
  label,
  required = false,
  optional = false,
  className = "text-gray-600",
}) => {
  return (
    <label
      style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}
      className={`block mb-1.5 text-[11px] font-bold    ${className}`}
    >
      <span style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}>
        {label}
      </span>

      {required && (
        <span
          style={{ fontFamily: "NunitoBold", fontWeight: "bold" }}
          className="ml-1 text-red-500"
        >
          *
        </span>
      )}

      {optional && (
        <span
          style={{ fontFamily: "NunitoSemi", fontWeight: "bold" }}
          className="ml-1 text-gray-400 font-medium normal-case"
        >
          (Optional)
        </span>
      )}
    </label>
  );
};

export default FormLabel;
