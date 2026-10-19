import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmailCheck() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      {/* Logo Header */}
      <div className="w-full px-4 py-6 flex justify-start items-center max-w-screen-xl mx-auto">
        <img src="/assets/images/logo.png" alt="logo" className="h-10" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full px-4 flex-1">
        <div className="w-full max-w-md flex flex-col items-center space-y-6 mt-4">
          <img
            src="/assets/images/Verifyillus.svg"
            alt="email-check"
            className="w-28 sm:w-32 md:w-36"
          />

          <h1 className="text-2xl sm:text-3xl font-norican font-semibold text-[#16730F] text-center">
            Check Your Email
          </h1>

          <p className="text-center text-sm sm:text-base text-[#333">
            We’ve sent a password reset link to your inbox.
            <br className="hidden sm:block" />
            Follow the instructions to reset your password.
          </p>

          <button className="w-full max-w-xs py-3 rounded-xl text-white bg-[#16730F] font-semibold transition shadow-md">
            Resend Email
          </button>

          <div
            className="flex items-center gap-2 text-[#1A3E32] font-medium cursor-pointer mt-4"
            onClick={() => navigate("/")}
          >
            <ChevronLeft />
            <span>Go Back To Login</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailCheck;
