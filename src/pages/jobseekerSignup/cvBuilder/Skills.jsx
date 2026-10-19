import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import NavigationButtons from "../../../components/NavigationButtons";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaRocket,
  FaGraduationCap,
  FaUserTie,
  FaStar,
  FaChevronDown,
} from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import Loader from "../../../components/ui/Loader";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance";
import { AutocompleteInput } from "../../../components/forms/AutocompleteInput";
import FormLabel from "../../../components/forms/FormLabel";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import {
  categoryOptions,
  experienceOptions,
} from "../../../data/skillsData";
import { SKILL_SUGGESTIONS } from "../../../utils/checksFormat";
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from "../../../hooks/usePortaledMenu";

// Skills options removed - now using text inputs
// const skillOptions = [...];
// const categoryOptions = [...];
// const experienceOptions = Array.from({ length: 51 }, (_, i) => `${i}`);

const CATEGORY_OPTIONS = [
  { value: "Entry Level", label: "Entry Level", icon: FaRocket, color: "text-blue-500" },
  { value: "Junior", label: "Junior", icon: FaGraduationCap, color: "text-[#16730F]" },
  { value: "Mid-level", label: "Mid-level", icon: FaUserTie, color: "text-yellow-500" },
  { value: "Senior", label: "Senior", icon: FaStar, color: "text-orange-500" },
  { value: "Veteran", label: "Veteran", icon: FaStar, color: "text-red-500" },
];


const InputWithIcon = ({ value, onChange, placeholder }) => (
  <div className="relative w-full">
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-12 border-2 rounded-[10px] pl-4 pr-10 focus:outline-1 focus:outline-[#16730F] ${value ? "border-[#828282]" : "border-[#F5F5F5]"
        }`}
    />
    {value && (
      <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16730F] text-lg" />
    )}
  </div>
);


// Autocomplete Input Component for Skills
const AutocompleteSkillInput = ({ value, onChange, placeholder, suggestions, onAddNew }) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen: showSuggestions,
    onClose: () => setShowSuggestions(false),
    maxHeight: 240,
    extraContainRefs: [wrapperRef],
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(e);

    if (newValue.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    onChange({ target: { value: suggestion } });
    setShowSuggestions(false);
  };

  const handleAddNew = () => {
    if (inputValue.trim()) {
      handleSelectSuggestion(inputValue.trim());
      if (onAddNew) onAddNew(inputValue.trim());
      toast.success(`Added new skill: ${inputValue}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ position: "relative", zIndex: 20 }}>
      <input
        ref={triggerRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.trim()) {
            const filtered = SKILL_SUGGESTIONS.filter(suggestion =>
              suggestion.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredSuggestions(filtered.slice(0, 10));
            setShowSuggestions(true);
          } else {
            setFilteredSuggestions(SKILL_SUGGESTIONS.slice(0, 10));
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className="w-full h-12 border-2 rounded-[10px] pl-4 pr-10 focus:outline-1 focus:outline-[#16730F] transition-all bg-white"
      />
      {inputValue && (
        <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16730F] text-lg pointer-events-none" />
      )}

      {showSuggestions &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto nfl-scroll"
            style={{
              ...getPortaledMenuStyle(menuPos),
              maxHeight: menuPos.maxHeight,
            }}
          >
            {filteredSuggestions.length > 0 ? (
              <>
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
                {inputValue.trim() && !filteredSuggestions.includes(inputValue.trim()) && (
                  <div
                    onClick={handleAddNew}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-[#16730F] font-medium transition-colors flex items-center gap-2 border-t border-gray-100"
                  >
                    <FaPlus className="text-xs" />
                    Add "{inputValue}"
                  </div>
                )}
              </>
            ) : (
              inputValue.trim() && (
                <div
                  onClick={handleAddNew}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-[#16730F] font-medium transition-colors flex items-center gap-2"
                >
                  <FaPlus className="text-xs" />
                  Add "{inputValue}"
                </div>
              )
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

// Enhanced Category Select Component with Icons
const CategorySelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen,
    onClose: () => setIsOpen(false),
    maxHeight: 320,
    extraContainRefs: [wrapperRef],
  });

  const selectedCategory = CATEGORY_OPTIONS.find(opt => opt.value === value);
  const SelectedIcon = selectedCategory?.icon;

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ position: "relative", zIndex: 15 }}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 border-2 rounded-[10px] pl-4 pr-10 flex items-center justify-between cursor-pointer focus:outline-1 focus:outline-[#16730F] ${value ? "border-[#828282]" : "border-[#F5F5F5]"
          } bg-white`}
      >
        <div className="flex items-center gap-2">
          {SelectedIcon && <SelectedIcon className={`text-lg ${selectedCategory?.color}`} />}
          <span className={value ? "text-gray-700" : "text-gray-400"}>
            {value || "Select category"}
          </span>
        </div>
        {value ? (
          <FaCheck className="text-[#16730F] text-lg" />
        ) : (
          <FaChevronDown className={`text-gray-400 text-lg transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>

      {isOpen &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            style={{
              ...getPortaledMenuStyle(menuPos),
              maxHeight: menuPos.maxHeight,
            }}
          >
            {CATEGORY_OPTIONS.map((option) => {
              const OptionIcon = option.icon;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <OptionIcon className={`text-lg ${option.color}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-700">{option.label}</div>
                    <div className="text-xs text-gray-400">
                      {option.value === "Entry Level" && "0-2 years experience"}
                      {option.value === "Junior" && "2-4 years experience"}
                      {option.value === "Mid-level" && "4-7 years experience"}
                      {option.value === "Senior" && "7-10 years experience"}
                      {option.value === "Veteran" && "10+ years experience"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

function Skills() {
  const navigate = useNavigate();
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



  const [skillsData, setSkillsData] = useState({
    userId: "",
    skillSector: "",
    category: "",
    experience: "",
  });

  const [allFilled, setAllFilled] = useState(false);
  const { user } = useAuth();
  const [allSkill, setAllSkill] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [skillSuggestionsList, setSkillSuggestionsList] = useState(SKILL_SUGGESTIONS);

  // Load existing skills data when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      cvData?.skills &&
      cvData.skills.length > 0 &&
      !dataLoaded
    ) {
      console.log("Loading skills data:", cvData.skills);
      const existingSkills = cvData.skills.map((skill) => ({
        id: skill.id,
        userId: user?.id,
        skillSector: skill.skill_sector,
        category: skill.category,
        experience: skill.experience,
      }));
      console.log("Mapped skills:", existingSkills);
      setAllSkill(existingSkills);
      setDataLoaded(true);
    }
  }, [isEditMode, cvData, user?.id, dataLoaded]);

  useEffect(() => {
    setSkillsData((prev) => ({ ...prev, userId: user?.id || "" }));
  }, [user?.id]);

  useEffect(() => {
    setAllFilled(skillsData.skillSector && skillsData.category && skillsData.experience);
  }, [skillsData.skillSector, skillsData.category, skillsData.experience]);

  const clearForm = () => {
    setSkillsData((prev) => ({
      ...prev,
      skillSector: "",
      category: "",
      experience: "",
    }));
  };

  const location = useLocation();

  const { email, firstName, lastName, role, mode, followings } =
    location.state || {};

  const addMore = async () => {
    if (!allFilled) {
      toast.error("Please complete all fields");
      return;
    }

    const newEntry = {
      userId: user?.id,
      skillSector: skillsData.skillSector,
      category: skillsData.category,
      experience: skillsData.experience,
    };

    const isDuplicate = allSkill.some(
      (item) =>
        item.skillSector.toLowerCase() === newEntry.skillSector.toLowerCase() &&
        item.category === newEntry.category,
    );

    if (isDuplicate) {
      toast.warning("This skill entry already exists");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/api/cv-builder/skills/`,
        newEntry,
      );
      const savedId = data?.data?.id;
      setAllSkill((prev) => [...prev, { ...newEntry, id: savedId }]);
      if (!skillSuggestionsList.includes(skillsData.skillSector)) {
        setSkillSuggestionsList((prev) => [...prev, skillsData.skillSector]);
      }
      clearForm();
      toast.success("Skill saved!");
    } catch (err) {
      console.error("Error saving skill:", err);
      toast.error("Failed to save skill. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const category = CATEGORY_OPTIONS.find(opt => opt.value === categoryName);
    if (category) {
      const Icon = category.icon;
      return <Icon className={`text-lg ${category.color}`} />;
    }
    return null;
  };

  const getCategoryBadgeColor = (categoryName) => {
    switch (categoryName) {
      case "Entry Level": return "bg-blue-100 text-blue-700";
      case "Junior": return "bg-[#16730F]/10 text-[#16730F]";
      case "Mid-level": return "bg-yellow-100 text-yellow-700";
      case "Senior": return "bg-orange-100 text-orange-700";
      case "Veteran": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
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
        <div className="max-w-3xl mx-auto mt-6 px-4 text-[#16730F] text-2xl font-semibold">
          Skills
        </div>
        <p className="max-w-3xl mx-auto px-4 text-[#333] text-sm mb-6">
          Highlight what you&apos;re great at. This helps employers match you to
          the right role
        </p>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
          <div className="bg-[#fff] overflow-visible p-3 rounded-2xl space-y-1">
            <div className="bg-[#fff] rounded-2xl p-4">
              <FormLabel
                label="SKILL"
                required={true}
                tooltip="Specific technical or professional skills you possess (e.g. React, Project Management)"
              />
              <p className="text-[11px] text-gray-500 mb-2">Enter or select a skill name and category, then use add more button</p>
              <AutocompleteSkillInput
                value={skillsData.skillSector}
                onChange={(e) =>
                  setSkillsData((prev) => ({ ...prev, skillSector: e.target.value }))
                } placeholder="Enter or select skill name"
                suggestions={skillSuggestionsList}
              />
              {/* <InputWithIcon
                value={skillsData.skillSector}
                onChange={(e) =>
                  setSkillsData((prev) => ({ ...prev, skillSector: e.target.value }))
                }
                placeholder="Enter skill name"
              /> */}
            </div>

            <div className="bg-[#fff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <FormLabel
                  label="CATEGORY"
                  required={true}
                  tooltip="Your proficiency level for this skill (e.g. Entry Level, Junior, Mid-level, Senior, Veteran)"
                />
                <AutocompleteInput
                  value={skillsData.category}
                  onChange={(e) =>
                    setSkillsData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Enter or select category"
                  formName="skills"
                  fieldName="category"
                  staticOptions={categoryOptions}
                />
              </div>
              <div className="flex-1">
                <FormLabel
                  label="YEARS OF EXPERIENCE"
                  required={true}
                  tooltip="Number of years you have actively practiced or worked with this skill"
                />
                <AutocompleteInput
                  value={skillsData.experience}
                  onChange={(e) =>
                    setSkillsData((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  placeholder="Enter or select years of experience"
                  formName="skills"
                  fieldName="experience"
                  staticOptions={experienceOptions}
                />
              </div>
            </div>

            <div className="max-w-full md:max-w-2xs mx-2 bg-[#00000040] mt-3 rounded-2xl flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-end">
                <button
                  type="button"
                  onClick={addMore}
                  disabled={!allFilled}
                  className={`flex-1 h-16 flex items-center justify-center gap-2 text-white border-2 rounded-lg text-sm ${
                    allFilled
                      ? "bg-[#16730F] cursor-pointer border-[#16730F] hover:bg-[#145a0c]"
                      : "bg-transparent border-[#F5F5F5]"
                  }`}
                >
                  ADD MORE <FaPlus />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Display Added Skills */}
        {allSkill.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <h3 className="text-lg font-semibold text-[#16730F] mb-4 px-4">
              Your Skills ({allSkill.length})
            </h3>
            <div className="space-y-3 px-4">
              {allSkill.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-bold text-[#16730F] text-lg">
                          {item.skillSector}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        {getCategoryIcon(item.category)}
                        <span className="text-sm">
                          {item.experience} {parseInt(item.experience) === 1 ? 'year' : 'years'} of experience
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (item.id) {
                          try {
                            await axiosInstance.delete(
                              `/api/cv-builder/skills/${user?.id}/${item.id}`,
                            );
                            toast.success("Skill deleted successfully!");
                          } catch (err) {
                            console.error("Error deleting skill:", err);
                            toast.error("Failed to delete skill");
                            return;
                          }
                        }
                        setAllSkill((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                      aria-label="Delete skill"
                    >
                      <FaTrash />
                    </button>
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
            let skillsToSave = [...allSkill];

            if (allFilled) {
              const currentEntry = {
                userId: user?.id,
                skillSector: skillsData.skillSector,
                category: skillsData.category,
                experience: skillsData.experience,
              };

              const exists = skillsToSave.some(
                (item) =>
                  item.skillSector.toLowerCase() === currentEntry.skillSector.toLowerCase() &&
                  item.category === currentEntry.category,
              );

              if (!exists) {
                skillsToSave.push(currentEntry);
              }
            }

            if (skillsToSave.length === 0) {
              toast.error("Please add at least one skill before continuing.");
              return;
            }

            setIsLoading(true);

            try {
              for (const item of skillsToSave) {
                if (item.id) {
                  await axiosInstance.put(
                    `/api/cv-builder/skills/${user?.id}/${item.id}`,
                    item,
                  );
                } else {
                  await axiosInstance.post(`/api/cv-builder/skills/`, item);
                }
              }
              setIsLoading(false);
              toast.success("Skills saved successfully!");

              if (isEditMode) {
                navigate(getPath(currentStep + 1));
              } else {
                navigate("/work-history", {
                  state: {
                    email,
                    firstName,
                    lastName,
                    role,
                    mode,
                    followings,
                  },
                });
              }
            } catch (err) {
              setIsLoading(false);
              console.error("Error:", err);
              toast.error("Failed to save Skills. Try again.");
            }
          }}
          showSkip={true}
          onSkip={() => {
            if (isEditMode) {
              navigate(getPath(currentStep + 1));
            } else {
              navigate("/work-history", {
                state: {
                  email,
                  firstName,
                  lastName,
                  role,
                  mode,
                  followings,
                },
              });
            }
          }}
        />

        <Loader show={isLoading} />
    </OnboardingLayout>
  );
}

export default Skills;
