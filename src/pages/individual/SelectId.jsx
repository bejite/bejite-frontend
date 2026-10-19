import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import NavigationButtons from "../../components/NavigationButtons";
import Header from "../../components/Header";
import { ChevronDown } from "lucide-react";
import useRecruiterProfile from "../../services/recruiterProfile";
import { RecruiterSelect } from "../../components/recruiter/recruiterOnboardingUi";

const SelectId = () => {
  const navigate = useNavigate();
  const { isEditMode, recruiterData, getPath } = useOutletContext();
  const { updateIdType } = useRecruiterProfile();

  const [formData, setFormData] = useState({
    id_type: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && recruiterData?.id_type) {
      setFormData({ id_type: recruiterData.id_type });
    }
  }, [isEditMode, recruiterData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormComplete = formData.id_type.trim() !== "";

  const handleNextStep = async () => {
    if (!isFormComplete || submitting) return;

    setSubmitting(true);
    try {
      await toast.promise(updateIdType(formData.id_type), {
        pending: "Saving ID type...",
        success: "ID type saved",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });
      navigate(getPath(6), { state: { id_type: formData.id_type } });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white px-4 flex flex-col w-full min-w-0 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full flex flex-col justify-center py-6 sm:py-10">
        <div className="max-w-xl mx-auto w-full flex flex-col items-center justify-center p-4">
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <RecruiterSelect
              label="SELECT ID TYPE"
              name="id_type"
              value={formData.id_type}
              onChange={handleChange}
              options={[
                { value: "NIN", label: "National Identification Number (NIN)" },
                { value: "International Passport", label: "International Passport" },
                { value: "Driver's License", label: "Driver's License" },
                { value: "PVC", label: "Permanent Voter's Card (PVC)" },
                { value: "National Identity Card", label: "National Identity Card" },
              ]}
              placeholder="Select ID Type"
            />
          </div>
        </div>
      </main>

      <div className="pb-8">
        <NavigationButtons
          isFormComplete={isFormComplete && !submitting}
          onBack={() => navigate(-1)}
          nextLabel="Next"
          onNext={handleNextStep}
        />
      </div>
    </div>
  );
};

export default SelectId;
