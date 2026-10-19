const RoleCard = ({ imageSrc, title, description, buttonText, onClick }) => (
  <div className="w-full max-w-[450px] border-2 border-[#82828226] rounded-2xl px-6 py-8 relative bg-white shadow-sm">
    <div className="bg-[#333333] w-[70px] sm:w-[90px] p-3 rounded-full mx-auto absolute -top-10 left-1/2 transform -translate-x-1/2">
      <img src={imageSrc} alt={title} className="w-full" />
    </div>

    <div className="mt-12 text-center">
      <p className="text-2xl sm:text-3xl text-[#1A3E32] font-semibold">
        {title}
      </p>
      <p className="text-[#1A3E32] text-sm sm:text-base mt-2">{description}</p>

      <button
        onClick={onClick}
        className="bg-[#16730F] hover:bg-[#1A3E32] text-white w-full max-w-[320px] h-[48px] sm:h-[53px] rounded-3xl mt-6 text-sm sm:text-base shadow cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

export default RoleCard;
