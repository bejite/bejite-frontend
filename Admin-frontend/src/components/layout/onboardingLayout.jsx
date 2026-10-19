import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StepTabs from "../StepTabs";
import ProgressBar from "../ProgressBar";
import { navigateBack } from "../../utils/navigateBack";

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
      className="w-full px-4 py-6 font-nunito-semi max-w-screen-xl mx-auto "
    >
      <button
        className=" bg-transparent "
        onClick={() => {
          if (currentStep <= 1) {
            const isRecruiterPath = pathname.startsWith("/corporate") ||
              pathname.startsWith("/edit-profile/recruiter");
            navigateBack(
              navigate,
              isEditMode
                ? "/news-feed"
                : isRecruiterPath
                  ? "/employer-option"
                  : "/resume",
            );
          } else if (typeof getPath === "function") {
            navigate(getPath(currentStep - 1));
          } else {
            navigateBack(navigate, "/news-feed");
          }
        }}
      >
        <img
          src="/assets/images/logo.png"
          alt="logo"
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
