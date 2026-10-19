import { MultiAutocompleteField } from "../forms/MultiAutocompleteField";
import {
  INDUSTRY_OPTIONS,
  JOB_TITLE_OPTIONS,
} from "../../data/jobTypeData";

export default function ProfessionalTargetingSection({ audience, onUpdate }) {
  const jobTitles = audience.jobTitles || [];
  const industries = audience.industries || [];

  return (
    <>
      <MultiAutocompleteField
        label="Job Titles"
        placeholder="Enter or select job title"
        formName="job-type"
        fieldName="job_title"
        staticOptions={JOB_TITLE_OPTIONS}
        selectedValues={jobTitles}
        onChange={(values) => onUpdate("jobTitles", values)}
      />

      <MultiAutocompleteField
        label="Industries"
        placeholder="Enter or select industry"
        formName="employer-job"
        fieldName="industry_sector"
        staticOptions={INDUSTRY_OPTIONS}
        selectedValues={industries}
        onChange={(values) => onUpdate("industries", values)}
      />
    </>
  );
}
