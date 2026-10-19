import { useNavigate } from "react-router-dom";

const ContinueButton = ({ isEnabled }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isEnabled) {
      navigate("/");
    }
  };

  return (
    <div className="w-full flex justify-center sm:justify-end mt-10 px-4">
      <button
        className={`w-52 h-12 rounded-2xl font-bold text-white transition-all duration-300 ${
          isEnabled
            ? "bg-[#16730F]"
            : "bg-[#1A3E32] opacity-25 cursor-not-allowed"
        }`}
        disabled={!isEnabled}
        onClick={handleClick}
      >
        Continue
      </button>
    </div>
  );
};

export default ContinueButton;
