import React, { useMemo } from "react";
import FormLabel from "./forms/FormLabel";
import PhoneInput from "./forms/PhoneInput";
import DobCalendarPicker from "./forms/DobCalendarPicker";
import { RecruiterSelect } from "./recruiter/recruiterOnboardingUi";

const FieldGroup = ({ formData, handleChange, countries }) => {
  const bioAges = useMemo(() => {
    const ages = [];
    for (let i = 18; i <= 70; i++) {
      ages.push(i.toString());
    }
    return ages;
  }, []);

  const fieldGroups = [
    [
      {
        name: "nickname",
        label: "NICKNAME",
        optional: false,
        placeholder: "e.g code healer",
        tooltip: "What you want people to know you as (e.g. professional handle or preferred name)",
        width: "w-full sm:w-[calc(50%-0.5rem)]",
      },
      {
        name: "phone",
        label: "PHONE NUMBER",
        optional: false,
        type: "phone",
        tooltip: "Your active contact number with country code for recruiter outreach",
        width: "w-full sm:w-[calc(50%-0.5rem)]",
      },
    ],
    [
      {
        name: "gender",
        label: "GENDER",
        optional: false,
        type: "select",
        options: ["Male", "Female"],
        tooltip: "Your gender for demographic and identity records",
        width: "w-full sm:w-[calc(50%-0.5rem)]",
      },
      {
        name: "maritalStatus",
        label: "MARITAL STATUS",
        optional: false,
        type: "select",
        options: ["Single", "Married", "Divorced", "Widowed"],
        tooltip: "Your marital status for personal records",
        width: "w-full sm:w-[calc(50%-0.5rem)]",
      },
    ],
    [
      {
        name: "dob",
        label: "DATE OF BIRTH",
        optional: true,
        type: "dob",
        tooltip: "Your date of birth to calculate age and verify eligibility",
        width: "w-full sm:w-[calc(65%-0.5rem)]",
      },
      {
        name: "age",
        label: "AGE",
        optional: true,
        type: "select",
        options: bioAges,
        tooltip: "Your age in years",
        width: "w-full sm:w-[calc(35%-0.5rem)]",
      },
    ],
    [
      {
        name: "country",
        label: "COUNTRY OF ORIGIN",
        optional: false,
        type: "select",
        options: countries,
        tooltip: "Your country of origin or residence for job location matching",
        width: "w-full sm:w-[calc(40%-0.5rem)]",
      },
      {
        name: "street",
        label: "STREET ADDRESS",
        placeholder: "e.g 11, Bawo Street.",
        tooltip: "Your street or residential address",
        width: "w-full sm:w-[calc(60%-0.5rem)]",
        optional: false,
      },
    ],
    [
      {
        name: "city",
        label: "CITY/TOWN",
        optional: false,
        placeholder: "e.g Calabar",
        tooltip: "Your current city or town of residence",
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
      },
      {
        name: "tribe",
        label: "TRIBE",
        type: "datalist",
        options: ["Yoruba", "Hausa", "Igbo", "Ibibio"],
        placeholder: "Enter or select your tribe",
        tooltip: "Your ethnic group or tribe (optional)",
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
        optional: true,
      },
      {
        name: "zip",
        label: "ZIP CODE",
        optional: true,
        placeholder: "e.g 60094",
        tooltip: "Your postal or zip code (optional)",
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
      },
    ],
  ];

  return (
    <div className="w-full flex-1 space-y-5">
      {fieldGroups.map((group, i) => (
        <div key={i} className="flex flex-wrap gap-4">
          {group.map((f) => (
            <div key={f.name} className={`${f.width}`}>
              <FormLabel
                label={f.label}
                optional={f.optional}
                required={!f.optional}
                tooltip={f.tooltip}
              />
              {f.type === "select" ? (
                <RecruiterSelect
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  options={f.options || []}
                  placeholder={f.placeholder || "Select"}
                />
              ) : f.type === "dob" ? (
                <DobCalendarPicker
                  name={f.name}
                  value={formData[f.name] || ""}
                  onChange={handleChange}
                  onAgeChange={(calculatedAge) => {
                    handleChange({ target: { name: "age", value: calculatedAge } });
                  }}
                />
              ) : f.type === "datalist" ? (
                <div className="relative">
                  <input
                    list={`${f.name}-list`}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent transition-all shadow-sm"
                  />
                  <datalist id={`${f.name}-list`}>
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              ) : f.type === "phone" ? (
                <PhoneInput
                  value={formData.phone}
                  countryName={formData.country}
                  onChange={(e164) =>
                    handleChange({ target: { name: "phone", value: e164 } })
                  }
                />
              ) : (
                <input
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent transition-all shadow-sm placeholder-gray-400"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FieldGroup;
