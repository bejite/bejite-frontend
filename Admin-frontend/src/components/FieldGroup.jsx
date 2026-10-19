import { useMemo } from "react";
import FormLabel from "./forms/FormLabel";
import PhoneInput from "./forms/PhoneInput";
import RecruiterSelect from "./admin/RecruiterSelect";

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
        width: "w-full sm:w-[calc(50%-0.5rem)]",
      },
      {
        name: "phone",
        label: "PHONE NUMBER",
        optional: false,
        type: "phone",
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
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
      },
      {
        name: "maritalStatus",
        label: "MARITAL STATUS",
        optional: false,
        type: "select",
        options: ["Single", "Married", "Divorced", "Widowed"],
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
      },
      {
        name: "age",
        label: "AGE",
        optional: true,
        type: "select",
        options: bioAges,
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
      },
    ],
    [
      {
        name: "country",
        label: "COUNTRY OF ORIGIN",
        optional: false,
        type: "select",
        options: countries,
        width: "w-full sm:w-[calc(40%-0.5rem)]",
      },
      {
        name: "street",
        label: "STREET ADDRESS",
        placeholder: "e.g 11, Bawo Street.",
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
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
      },
      {
        name: "tribe",
        label: "TRIBE",
        type: "datalist",
        options: ["Yoruba", "Hausa", "Igbo", "Ibibio"],
        placeholder: "Enter or select your tribe",
        width: "w-full sm:w-[calc(33.33%-0.67rem)]",
        optional: true,
      },
      {
        name: "zip",
        label: "ZIP CODE",
        optional: true,
        placeholder: "e.g 60094",
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
              />
              {/* <label className="block mb-1.5 text-[11px] font-bold text-gray-600 tracking-wide">{f.label}</label> */}
              {f.type === "select" ? (
                <RecruiterSelect
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  options={f.options || []}
                  placeholder={f.placeholder || "Select"}
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
