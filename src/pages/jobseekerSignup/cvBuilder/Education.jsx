import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import NavigationButtons from "../../../components/NavigationButtons";
import useAuth from "../../../hooks/useAuth";

import {
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "../../../components/ui/Loader";
import axiosInstance from "../../../utils/axiosInstance";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import FormLabel from "../../../components/forms/FormLabel";
import { AutocompleteInput } from "../../../components/forms/AutocompleteInput";
import {
  optionsEdu,
  optionsInst,
  optionsLoc,
  optionsField,
  optionsDegree,
} from "../../../data/educationData";
import { formatDateForInput, formatDateRange } from "../../../utils/checksFormat";

const buildEducationApiPayload = (edu) => ({
  userId: edu.userId,
  educationLevel: edu.educationLevel,
  institutionName: edu.institutionName,
  location: edu.location,
  fieldOfStudy: edu.fieldOfStudy,
  degree: edu.degree,
  startDate: edu.startDate || null,
  endDate: edu.isCurrentlyStudying || !edu.endDate ? null : edu.endDate,
});

function Education() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentStep, isEditMode, cvData, getPath } = useOutletContext();

  const handleStepClick = (path) => {
    navigate(path);
  };
  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
    "Job Type",
  ];

  const [educationLevel, setEducationLevel] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [userLocation, setLocation] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [degree, setDegree] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);
  const [allFilled, setAllFilled] = useState(false);
  const [allEducation, setAllEducation] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load existing education data when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      cvData?.education &&
      cvData.education.length > 0 &&
      !dataLoaded
    ) {
      console.log("Loading education data:", cvData.education);
      const existingEducation = cvData.education.map((edu) => ({
        id: edu.id,
        userId: user?.id,
        educationLevel: edu.education_level,
        institutionName: edu.institution_name,
        location: edu.location,
        fieldOfStudy: edu.field_of_study,
        degree: edu.degree,
        startDate: formatDateForInput(edu.start_date),
        endDate: formatDateForInput(edu.end_date),
        // startDate: edu.start_date,
        // endDate: edu.end_date,
        isCurrentlyStudying: !edu.end_date, // If no end date, they're currently studying
      }));
      console.log("Mapped education:", existingEducation);
      setAllEducation(existingEducation);
      setDataLoaded(true);
    }
  }, [isEditMode, cvData, user?.id, dataLoaded]);

  useEffect(() => {
    setAllFilled(
      Boolean(
        educationLevel &&
          institutionName &&
          userLocation &&
          fieldOfStudy &&
          degree &&
          startDate &&
          (isCurrentlyStudying || endDate),
      ),
    );
  }, [
    educationLevel,
    institutionName,
    userLocation,
    fieldOfStudy,
    degree,
    startDate,
    endDate,
    isCurrentlyStudying,
  ]);

  const clearForm = () => {
    setEducationLevel("");
    setInstitutionName("");
    setLocation("");
    setFieldOfStudy("");
    setDegree("");
    setStartDate("");
    setEndDate("");
    setIsCurrentlyStudying(false);
  };

  const location = useLocation();

  const { email, firstName, lastName, role, mode, followings } =
    location.state || {};

  const [isLoading, setIsLoading] = useState(false);

  const addMore = async () => {
    if (!allFilled) {
      toast.error("Please complete all fields");
      return;
    }

    const newEntry = {
      userId: user?.id,
      educationLevel,
      institutionName,
      location: userLocation,
      fieldOfStudy,
      degree,
      startDate,
      endDate: isCurrentlyStudying ? null : endDate,
      isCurrentlyStudying,
    };

    // Check for duplicates
    const isDuplicate = allEducation.some(
      (item) =>
        item.educationLevel === newEntry.educationLevel &&
        item.institutionName === newEntry.institutionName &&
        item.location === newEntry.location &&
        item.fieldOfStudy === newEntry.fieldOfStudy &&
        item.degree === newEntry.degree &&
        item.startDate === newEntry.startDate &&
        (isCurrentlyStudying ? !item.endDate : item.endDate === newEntry.endDate)
    );

    if (isDuplicate) {
      toast.warning("This education entry already exists");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/api/cv-builder/education`,
        buildEducationApiPayload(newEntry),
      );
      const savedId = data?.data?.id;
      setAllEducation((prev) => [...prev, { ...newEntry, id: savedId }]);
      clearForm();
      toast.success("Education saved!");
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Failed to save education. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <div className="pb-10">
        <section className="max-w-3xl text-center md:text-left mx-auto px-4 mt-4 text-[#16730F] text-2xl font-semibold">
          Education
        </section>
        <p className="max-w-3xl text-center md:text-left mx-auto px-4 text-[#333] text-[15px] mb-6">
          Your academic background shows your foundation.
        </p>

        <div className="max-w-4xl mx-auto mt-8 bg-white md:border border-gray-200 rounded-2xl md:shadow-sm flex flex-col gap-6 p-4 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <FormLabel
                className="text-[#000]"
                label="EDUCATIONAL LEVEL"
                required={false}
                tooltip="The highest level of education you have attained (e.g. Bachelor's, Master's, High School)"
              />
              <AutocompleteInput
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="Enter or select educational level"
                formName="education"
                fieldName="education_level"
                staticOptions={optionsEdu}
              />
            </div>
            <div className="flex-1">
              <FormLabel
                label="INSTITUTION NAME"
                tooltip="The name of the school, college, or university you attended"
              />
              <AutocompleteInput
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Enter or select institution name"
                formName="education"
                fieldName="institution_name"
                staticOptions={optionsInst}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <FormLabel
                label="LOCATION"
                tooltip="The city, state, or country where your educational institution is located"
              />
              <AutocompleteInput
                value={userLocation}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter or select location"
                formName="education"
                fieldName="location"
                staticOptions={optionsLoc}
              />
            </div>
            <div className="flex-1">
              <FormLabel
                label="FIELD OF STUDY"
                tooltip="Your major, course, or primary subject area of study"
              />
              <AutocompleteInput
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="Enter or select field of study"
                formName="education"
                fieldName="field_of_study"
                staticOptions={optionsField}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <FormLabel
                label="DEGREE"
                tooltip="The qualification or degree obtained (e.g. B.Sc, B.A, HND, OND)"
              />
              <AutocompleteInput
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Enter or select degree"
                formName="education"
                fieldName="degree"
                staticOptions={optionsDegree}
              />
            </div>
            <div className="flex-1">
              <FormLabel
                label="START DATE"
                tooltip="The month and year you commenced your studies"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <FormLabel
                  label="END DATE"
                  tooltip="The month and year you graduated or expected graduation date"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrentlyStudying}
                    onChange={(e) => {
                      setIsCurrentlyStudying(e.target.checked);
                      if (e.target.checked) {
                        setEndDate("");
                      }
                    }}
                    className="w-4 h-4 text-[#16730F] rounded border-gray-300 focus:ring-[#16730F]"
                  />
                  <span className="text-sm text-gray-600">Currently studying</span>
                </label>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrentlyStudying}
                className={`w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm ${isCurrentlyStudying ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
              />
            </div>
            <div className="flex-1 flex items-end">
              <button
                onClick={addMore}
                disabled={!allFilled}
                className={`w-full h-11 cursor-pointer flex items-center justify-center gap-2 text-white font-semibold rounded-xl text-sm transition-all shadow-sm ${allFilled
                  ? "bg-[#16730F] hover:bg-[#145a0c]"
                  : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                ADD MORE <FaPlus />
              </button>
            </div>
          </div>
        </div>

        {allEducation.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 px-2 md:px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#16730F]/10 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#16730F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Education</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEducation.map((item, idx) => (
                <div
                  key={idx}
                  className="relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                >
                  <button
                    onClick={async () => {
                      if (item.id) {
                        try {
                          await axiosInstance.delete(
                            `/api/cv-builder/education/${user?.id}/${item.id}`
                          );
                          toast.success("Education deleted successfully!");
                        } catch (error) {
                          console.error("Error deleting education:", error);
                          toast.error("Failed to delete education");
                          return;
                        }
                      }
                      setAllEducation((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>

                  <div className="pr-5">
                    <div className="mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.fieldOfStudy || '—'}
                      </h4>
                      {item.degree && (
                        <p className="text-gray-500 text-xs mt-0.5">{item.degree}</p>
                      )}
                    </div>

                    <p className="text-gray-600 text-xs mb-1 truncate">
                      {item.institutionName}
                    </p>

                    <p className="text-gray-400 text-xs">
                      {formatDateRange(item.startDate, item.endDate, item.isCurrentlyStudying)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <NavigationButtons
          isFormComplete={true}
          onBack={() => {
            if (isEditMode) {
              navigate(getPath(currentStep - 1));
            } else {
              navigate(-1);
            }
          }}
          onNext={async () => {
            let educationToSave = [...allEducation];

            if (allFilled) {
              const currentEducation = {
                userId: user?.id,
                educationLevel,
                institutionName,
                location: userLocation,
                fieldOfStudy,
                degree,
                startDate,
                endDate: isCurrentlyStudying ? null : endDate,
                isCurrentlyStudying,
              };

              const exists = educationToSave.some(
                (item) =>
                  item.educationLevel === currentEducation.educationLevel &&
                  item.institutionName === currentEducation.institutionName &&
                  item.fieldOfStudy === currentEducation.fieldOfStudy &&
                  item.degree === currentEducation.degree &&
                  item.startDate === currentEducation.startDate &&
                  (isCurrentlyStudying ? !item.endDate : item.endDate === currentEducation.endDate)
              );

              if (!exists) {
                educationToSave.push(currentEducation);
              }
            }

            setIsLoading(true);

            try {
              for (const edu of educationToSave) {
                const payload = buildEducationApiPayload(edu);
                if (edu.id) {
                  await axiosInstance.put(
                    `/api/cv-builder/education/${user?.id}/${edu.id}`,
                    payload,
                  );
                } else {
                  await axiosInstance.post(`/api/cv-builder/education`, payload);
                }
              }

              setIsLoading(false);
              toast.success("Education saved successfully!");

              if (isEditMode) {
                navigate(getPath(currentStep + 1));
              } else {
                navigate("/skills", {
                  state: { email, firstName, lastName, role, mode, followings },
                });
              }
            } catch (error) {
              setIsLoading(false);
              console.error("Error:", error);
              toast.error("Failed to save education. Try again.");
            }
          }}
          showSkip={true}
          onSkip={() => {
            if (isEditMode) {
              navigate(getPath(currentStep + 1));
            } else {
              navigate("/skills", {
                state: { email, firstName, lastName, role, mode, followings },
              });
            }
          }}
        />

        <Loader show={isLoading} />
      </div>
    </OnboardingLayout>
  );
}

export default Education;

