import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StepTabs from "../StepTabs";
import ProgressBar from "../ProgressBar";

const OnboardingLayout = ({
  children,
  steps,
  currentStep,
  handleStepClick,
  getPath,
  isEditMode,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, currentStep]);

  return (
    <header
      style={{ fontFamily: "NunitoSemi" }}
      className="w-full px-4 pb-6 pt-2 font-nunito-semi max-w-screen-xl mx-auto "
    >
      <button
        type="button"
        className="bg-transparent cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigate("/news-feed")}
        aria-label="Go to News Feed"
      >
        <img
          src="/assets/images/logo.png"
          alt="Bejite Logo"
          className="h-10"
        />
      </button>
      <div className="bg-white relative z-10">
        {steps && (
          <>
            <StepTabs
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              getPath={getPath}
              isEditMode={isEditMode}
            />
            <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
          </>
        )}
        {children}
      </div>
    </header>
  );
};

export default OnboardingLayout;
