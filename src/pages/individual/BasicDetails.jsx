import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import NavigationButtons from "../../components/NavigationButtons";
import ProgressBar from "../../components/ProgressBar";
import StepTabs from "../../components/StepTabs";
import Header from "../../components/Header";
import DobCalendarPicker from "../../components/forms/DobCalendarPicker";
import useAuth from "../../hooks/useAuth";
import useRecruiterProfile from "../../services/recruiterProfile";
import { updateUser } from "../../features/auth/authSlice";
import {
  formatRecruiterFullName,
  splitRecruiterFullName,
} from "../../utils/recruiterDisplayName";

const BasicDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const { user } = useAuth();
  const { updateBasicDetails } = useRecruiterProfile();

  const steps = ["Basic Details", "Profile Setup", "Location"];

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recruiterData) return;

    setFormData({
      full_name: formatRecruiterFullName(
        recruiterData.firstName,
        recruiterData.lastName,
      ),
      email: recruiterData.email || "",
      phone_number: recruiterData.phone_number || "",
      date_of_birth:
        recruiterData.date_of_birth ||
        recruiterData.dob ||
        "",
    });
  }, [isEditMode, recruiterData]);

  useEffect(() => {
    if (isEditMode) return;
    let storedUser = {};
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      storedUser = {};
    }

    const stateUser = location.state || {};
    const resolvedEmail =
      stateUser?.email || user?.email || storedUser?.email || "";
    const resolvedName = formatRecruiterFullName(
      stateUser?.firstName || user?.firstName || storedUser?.firstName,
      stateUser?.lastName || user?.lastName || storedUser?.lastName,
    );
    const resolvedPhone =
      user?.phone_number ||
      user?.phone ||
      storedUser?.phone_number ||
      storedUser?.phone ||
      "";
    const resolvedDob =
      user?.date_of_birth ||
      user?.dob ||
      storedUser?.date_of_birth ||
      storedUser?.dob ||
      "";

    setFormData((prev) => {
      const next = {
        full_name: prev.full_name || resolvedName,
        email: prev.email || resolvedEmail,
        phone_number: prev.phone_number || resolvedPhone,
        date_of_birth: prev.date_of_birth || resolvedDob,
      };

      if (
        prev.full_name === next.full_name &&
        prev.email === next.email &&
        prev.phone_number === next.phone_number &&
        prev.date_of_birth === next.date_of_birth
      ) {
        return prev;
      }

      return next;
    });
  }, [
    isEditMode,
    location.state,
    user?.email,
    user?.firstName,
    user?.lastName,
    user?.phone_number,
    user?.phone,
    user?.date_of_birth,
    user?.dob,
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormComplete = ["full_name", "email", "phone_number"].every(
    (key) => String(formData[key] || "").trim() !== "",
  );

  const handleNextStep = async () => {
    if (!isFormComplete || submitting) {
      if (!isFormComplete) toast.error("Please complete all fields.");
      return;
    }

    const submitData = async () => {
      const dob = formData.date_of_birth?.trim() || null;
      await updateBasicDetails({
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number,
        date_of_birth: dob,
        dob,
      });

      const { firstName, lastName } = splitRecruiterFullName(
        formData.full_name,
      );
      const phone_number = formData.phone_number;

      dispatch(
        updateUser({
          firstName,
          lastName,
          phone_number,
          phone: phone_number,
          date_of_birth: dob,
          dob,
        }),
      );

      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            firstName,
            lastName,
            phone_number,
            phone: phone_number,
            date_of_birth: dob,
            dob,
          }),
        );
      } catch {
        /* optional */
      }

      return "Basic details saved successfully!";
    };

    setSubmitting(true);
    try {
      await toast.promise(submitData(), {
        pending: "Saving basic details...",
        success: "Basic details saved successfully!",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });
      navigate(getPath(2));
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <StepTabs
        steps={steps}
        currentStep={currentStep}
        getPath={getPath}
        isEditMode={isEditMode}
      />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <section className="max-w-3xl mx-auto px-4 mt-4 text-[#16730F] text-2xl font-semibold">
        Basic Details
      </section>
      <p className="max-w-3xl mx-auto px-4 text-[#333] text-[15px]">
        Let's get to know you
      </p>

      <div className="max-w-4xl mx-auto mt-8 bg-white md:border border-gray-200 rounded-2xl md:shadow-sm p-4 md:p-8">
        <div className="w-full space-y-5">
          <div>
            <label className="font-semibold text-[12px] mb-2 block">
              FULL NAME
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="font-semibold text-[12px] mb-2 block">
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              disabled
              className="w-full h-11 bg-gray-50 border border-gray-300 rounded-xl px-3 text-gray-500 text-sm shadow-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-[12px] mb-2 block">
              PHONE NUMBER
            </label>
            <input
              type="tel"
              name="phone_number"
              placeholder="e.g +234706004000"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="font-semibold text-[12px] mb-2 block">
              DATE OF BIRTH
            </label>
            <DobCalendarPicker
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
              placeholder="Select date of birth"
            />
          </div>
        </div>
      </div>

      <NavigationButtons
        isFormComplete={isFormComplete && !submitting}
        onBack={() => {
          if (isEditMode) {
            navigate("/news-feed");
            return;
          }
          navigate(-1);
        }}
        onNext={handleNextStep}
      />
    </div>
  );
};

export default BasicDetails;
