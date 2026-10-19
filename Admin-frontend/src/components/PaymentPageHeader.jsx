import { FaChevronLeft } from "react-icons/fa";

export default function PaymentPageHeader() {
  return (
    <header className="bg-[#F5F5F5] w-full relative z-50 px-3 sm:px-4 py-3 sm:py-3.5">
      <div className="max-w-[1440px] w-full mx-auto flex flex-row items-center justify-between px-2 sm:px-6 py-2 sm:py-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-4 sm:gap-7 min-w-0">
          <img
            src="/assets/images/logo.png"
            alt="Logo"
            className="h-8 sm:h-10 md:h-14 lg:h-16 shrink-0"
          />
          <FaChevronLeft className="cursor-pointer shrink-0 text-sm sm:text-base" />
        </div>
        <p className="text-xs sm:text-sm text-[#1A3E32] whitespace-nowrap shrink-0">
          Step 1 of 3
        </p>
      </div>
    </header>
  );
}
