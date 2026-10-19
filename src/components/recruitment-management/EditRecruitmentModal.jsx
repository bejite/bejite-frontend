import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import { AutocompleteInput } from "../forms/AutocompleteInput";
import { INDUSTRY_OPTIONS } from "../../data/jobTypeData";
import { RecruiterSelect } from "../recruiter/recruiterOnboardingUi";

const DEPARTMENT_SUGGESTIONS = INDUSTRY_OPTIONS.filter(
  (opt) => opt && opt !== "Not Available",
);

export default function EditRecruitmentModal({
  isOpen,
  onClose,
  exercise,
  onSave,
  submitting = false,
}) {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("Open");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (exercise) {
      setTitle(exercise.title || "");
      setPosition(exercise.position || "");
      setDepartment(exercise.department || "");
      setStatus(exercise.status || "Open");
      setDescription(exercise.description || "");
    }
  }, [exercise]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const result = onSave
      ? await onSave({
          ...exercise,
          title,
          position,
          department: department.trim() || "Engineering",
          status,
          description,
          lastUpdated: "Just now",
        })
      : true;
    if (result === false) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden p-5 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none disabled:opacity-50 z-10"
          aria-label="Close modal"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4 shrink-0 pr-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E6F4EA] text-[#16730F] flex items-center justify-center text-lg sm:text-xl shrink-0">
            <FaPencilAlt />
          </div>
          <div>
            <h3 className="text-l[16px] sm:text-xl font-bold text-[#1A3E32] tracking-tight">
              Edit Recruitment Exercise
            </h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              Edit recruitment exercise details to update job parameters and
              status.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto nfl-scroll pr-1 sm:pr-2 flex-1 min-h-0 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                Recruitment Title
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-[#16730F] text-gray-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                  Job Position
                </label>
                <input
                  type="text"
                  disabled={submitting}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium disabled:opacity-60"
                />
              </div>
              <div className="relative z-20">
                <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                  Department
                </label>
                <AutocompleteInput
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter or select department"
                  formName="employer-job"
                  fieldName="industry_sector"
                  staticOptions={DEPARTMENT_SUGGESTIONS}
                />
              </div>
            </div>

            <div>
              <RecruiterSelect
                label="Recruitment Status"
                name="status"
                value={status}
                disabled={submitting}
                onChange={(e) => setStatus(e.target.value)}
                options={["Open", "Closed"]}
                placeholder="Select status"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                Description
              </label>
              <textarea
                rows={4}
                disabled={submitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm p-3.5 sm:p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium resize-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-gray-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-[#E5E7EB] w-full sm:w-1/2 hover:bg-gray-300 text-gray-800 font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-colors active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#16730F] w-full sm:w-1/2 hover:bg-[#125B0C] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-colors shadow-md active:scale-95 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
