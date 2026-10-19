import { RecruiterSelect } from "../recruiter/recruiterOnboardingUi";

export default function SelectWithIcon({ name, value, onChange, options, placeholder }) {
  return (
    <RecruiterSelect
      name={name}
      value={value}
      onChange={onChange}
      options={options || []}
      placeholder={placeholder || "Select option"}
    />
  );
}
