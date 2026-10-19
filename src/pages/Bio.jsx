

import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import StepTabs from '../components/StepTabs';
import ProgressBar from '../components/ProgressBar';
import ImageUpload from '../components/ImageUpload';
import FieldGroup from '../components/FieldGroup';
import NavigationButtons from '../components/NavigationButtons';
import Header from '../components/Header';

const Bio = () => {
  const navigate = useNavigate();
  const { currentStep } = useOutletContext();
  const steps = ["Bio", "Education", "Skills", "Work history", "Certificate", "Links"];

const countries = [
  "Nigeria", "United States", "Canada", "United Kingdom", "Germany", "France",
  "India", "China", "South Africa", "Brazil", "Australia", "Italy", "Japan",
  "Kenya", "Mexico", "Netherlands", "Russia", "Spain", "Sweden",
  "Argentina", "Egypt", "Turkey", "South Korea", "Norway", "Poland",
  "Indonesia", "Saudi Arabia", "Thailand", "Vietnam", "Philippines", "Malaysia",
  "Greece", "Ukraine", "Pakistan", "Bangladesh", "New Zealand", "Colombia",
  "Chile", "Peru", "Finland", "Portugal", "Denmark", "Switzerland", "Belgium",
  "Austria", "Ireland", "Czech Republic", "Hungary"
];

  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nickname: "", phone: "", gender: "", maritalStatus: "",
    age: "", dob: "", country: "", street: "", city: "", tribe: "", zip: "", bio: "",
  });

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const requiredFields = [
    "nickname",
    "phone",
    "gender",
    "maritalStatus",
    "country",
    "street",
    "city",
    "bio",
  ];

  const isFormComplete =
    requiredFields.every((key) => {
      const v = formData[key];
      const str = typeof v === "string" ? v : String(v || "");
      return str.trim() !== "";
    }) && imagePreview;

  return (
    <div className="bg-white">
     <Header/>

      <StepTabs steps={steps} currentStep={currentStep} />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <section className="max-w-3xl mx-auto px-4 text-[#E63357] text-2xl font-semibold">
        Bio/Personal Information
      </section>
      <p className="max-w-3xl mx-auto px-4 text-[#333] text-[15px]">
        Tell us who you are. This is the first impression employers get.
      </p>

      <div className="max-w-4xl mx-auto border-2 border-[#E0E0E0] flex flex-col lg:flex-row gap-8 p-4">
        <ImageUpload
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          bio={formData.bio}
          onBioChange={handleChange}
        />

        <FieldGroup
          formData={formData}
          handleChange={handleChange}
          countries={countries}
        />
      </div>

      <NavigationButtons
        isFormComplete={isFormComplete}
        onBack={() => navigate(-1)}
        onNext={() => isFormComplete && navigate("/education")}
      />
    </div>
  );
};

export default Bio;
