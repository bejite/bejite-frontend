const ProgressBar = ({ currentStep, totalSteps }) => {
  const width = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-[2%] py-6 px-1">
      <div className="relative w-full h-1 bg-[#E0E0E0] rounded-full">
        <div
          className="absolute top-0 left-0 h-1 bg-[#1A3E32] rounded-full transition-all duration-300"
          style={{ width: `${width}%` }}
        />
        <div className="absolute -top-4 w-full flex justify-between px-1 pointer-events-none">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center ${
                i + 1 <= currentStep
                  ? "bg-[#1A3E32] text-white"
                  : "bg-[#16730F40] text-white"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
