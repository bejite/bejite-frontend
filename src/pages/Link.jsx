import { useState, useEffect } from "react";
import Header from "../components/Header";
import StepTabs from "../components/StepTabs";
import ProgressBar from "../components/ProgressBar";
import { useOutletContext, useNavigate } from "react-router-dom";
import NavigationButtons from "../components/NavigationButtons";

function Link() {
  const navigate = useNavigate();
  const { currentStep } = useOutletContext();
  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
  ];

  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [_allFilled, _setAllFilled] = useState(false);

  useEffect(() => {
    _setAllFilled(linkedin || twitter || instagram || portfolio);
  }, [linkedin, twitter, instagram, portfolio]);

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4">
      <Header />
      <StepTabs steps={steps} currentStep={currentStep} />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <div className="max-w-3xl mx-auto mt-6 text-[#E63357] text-2xl font-semibold">
        Links
      </div>
      <p className="max-w-3xl mx-auto text-[#333] text-sm mb-6">
        Add at least one link to your online presence. Employers love to see
        your work, projects, or portfolio.
      </p>

      <div className="max-w-full md:max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4">
        <div className="bg-[#E0E0E0] w-full max-w-2xl mx-auto p-8 rounded-2xl">
          <div className="bg-[#16730F] p-4 rounded-2xl">
            <div className="space-y-6">
              <div className="w-full">
                <p className="text-[#D9D9D9] text-[15px] font-semibold mb-1">
                  LinkedIn
                </p>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="Enter your profile url"
                  className="h-[48px] w-full rounded-[10px] bg-[#D9D9D9] p-3"
                />
              </div>

              <div className="w-full">
                <p className="text-black text-[15px] font-bold mb-1">X</p>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Enter your profile url"
                  className="h-[48px] w-full rounded-[10px] bg-[#D9D9D9] p-3"
                />
              </div>

              <div className="w-full">
                <p className="text-[#D9D9D9] text-[15px] font-bold mb-1">
                  Instagram
                </p>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Enter your profile url"
                  className="h-[48px] w-full rounded-[10px] bg-[#D9D9D9] p-3"
                />
              </div>

              <div className="w-full">
                <p className="text-[#D9D9D9] text-[15px] font-bold mb-1">
                  Portfolio website
                </p>
                <input
                  type="text"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="Enter your profile url"
                  className="h-[48px] w-full rounded-[10px] bg-[#D9D9D9] p-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        isFormComplete={true}
        onBack={() => navigate(-1)}
        onNext={() => {
          console.log("Link.jsx - Next clicked, navigating to /job-type");
          navigate("/job-type");
        }}

      />
    </div>
  );
}

export default Link;
