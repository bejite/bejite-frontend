import React, { useEffect, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";

const QUESTION_TYPES = [
  { id: "multiple_choice", label: "Multiple Choice" },
  { id: "single_choice", label: "Single Choice" },
  { id: "true_false", label: "True or False" },
  { id: "text_based", label: "Text-Based" },
];

const DEFAULT_OPTIONS = ["Option 1", "Option 2", "Option 3"];

/**
 * Reusable modal for both Adding and Editing an Assessment Question.
 * Matches Figma Image 3, Image 4, and Image 5.
 */
export default function CourseQuestionModal({
  isOpen,
  mode = "add",
  initialData = null,
  onClose,
  onSave,
}) {
  const [questionType, setQuestionType] = useState("single_choice");
  const [prompt, setPrompt] = useState("");
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [selectedCorrect, setSelectedCorrect] = useState([0]); // array of indices
  const [textAnswer, setTextAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setQuestionType(initialData.type || "single_choice");
        setPrompt(initialData.prompt || "");
        setPoints(initialData.points ?? 1);

        if (initialData.type === "text_based") {
          setTextAnswer(initialData.correctText || initialData.textAnswer || "");
          setOptions(DEFAULT_OPTIONS);
          setSelectedCorrect([0]);
        } else if (initialData.type === "true_false") {
          setOptions(["True", "False"]);
          const correctIdx =
            Array.isArray(initialData.correctAnswers) && initialData.correctAnswers.length > 0
              ? initialData.correctAnswers[0]
              : initialData.correctIndex ?? 0;
          setSelectedCorrect([correctIdx]);
        } else {
          const opts =
            Array.isArray(initialData.options) && initialData.options.length > 0
              ? [...initialData.options]
              : DEFAULT_OPTIONS;
          setOptions(opts);
          if (Array.isArray(initialData.correctAnswers) && initialData.correctAnswers.length > 0) {
            setSelectedCorrect(initialData.correctAnswers);
          } else if (typeof initialData.correctIndex === "number") {
            setSelectedCorrect([initialData.correctIndex]);
          } else {
            setSelectedCorrect([0]);
          }
        }
      } else {
        setQuestionType("single_choice");
        setPrompt("");
        setPoints(1);
        setOptions(DEFAULT_OPTIONS);
        setSelectedCorrect([0]);
        setTextAnswer("");
      }
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const handleTypeChange = (typeId) => {
    setQuestionType(typeId);
    if (typeId === "true_false") {
      setOptions(["True", "False"]);
      setSelectedCorrect([0]);
    } else if (typeId === "text_based") {
      if (!textAnswer && options[0]) {
        setTextAnswer("");
      }
    } else {
      if (options.length === 2 && options[0] === "True" && options[1] === "False") {
        setOptions(DEFAULT_OPTIONS);
        setSelectedCorrect([0]);
      }
    }
  };

  const handleOptionChange = (idx, value) => {
    const next = [...options];
    next[idx] = value;
    setOptions(next);
  };

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions([...options, `Option ${nextIdx}`]);
  };

  const handleRemoveOption = (idx) => {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== idx);
    setOptions(next);
    setSelectedCorrect((prev) =>
      prev
        .filter((i) => i !== idx)
        .map((i) => (i > idx ? i - 1 : i))
    );
  };

  const toggleCorrectIndex = (idx) => {
    if (questionType === "multiple_choice") {
      if (selectedCorrect.includes(idx)) {
        if (selectedCorrect.length > 1) {
          setSelectedCorrect(selectedCorrect.filter((i) => i !== idx));
        }
      } else {
        setSelectedCorrect([...selectedCorrect, idx]);
      }
    } else {
      // single_choice or true_false
      setSelectedCorrect([idx]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Please enter the question text.");
      return;
    }

    if (questionType === "text_based") {
      if (!textAnswer.trim()) {
        setError("Please enter the expected correct answer.");
        return;
      }
      onSave?.({
        ...(initialData || {}),
        id: initialData?.id || `q-${Date.now()}`,
        type: "text_based",
        prompt: trimmedPrompt,
        points: Math.max(1, Number(points) || 1),
        correctText: textAnswer.trim(),
        options: [],
        correctAnswers: [],
        correctIndex: 0,
      });
    } else {
      const cleanedOptions = options.map((opt) => opt.trim());
      if (cleanedOptions.some((opt) => !opt)) {
        setError("Please fill in all answer options.");
        return;
      }
      if (selectedCorrect.length === 0) {
        setError("Please select at least one correct answer.");
        return;
      }

      onSave?.({
        ...(initialData || {}),
        id: initialData?.id || `q-${Date.now()}`,
        type: questionType,
        prompt: trimmedPrompt,
        points: Math.max(1, Number(points) || 1),
        options: cleanedOptions,
        correctAnswers: selectedCorrect,
        correctIndex: selectedCorrect[0] ?? 0,
        correctText: "",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-question-modal-title"
    >
      <div
        className="w-full max-w-[620px] max-h-[92vh] overflow-y-auto rounded-[28px] bg-white p-6 sm:p-9 shadow-[0_24px_60px_rgba(17,42,32,0.16)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="course-question-modal-title"
              className="text-xl sm:text-2xl font-extrabold text-[#153B2E] tracking-tight"
            >
              {isEdit ? "Edit Question" : "Add Question"}
            </h2>
            <p className="mt-1 text-sm text-[#6B7B73]">
              Configure question wording, answer options, and correct selection.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-full bg-[#EFF5EF] hover:bg-[#E1ECE1] text-[#153B2E] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Question Type Radio Selector (4 Cards) */}
          <div>
            <label className="block text-sm font-bold text-[#1E293B] mb-2.5">
              Question Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {QUESTION_TYPES.map((type) => {
                const isSelected = questionType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeChange(type.id)}
                    className={`rounded-2xl p-3 text-left transition-all flex items-center justify-between gap-2 border ${
                      isSelected
                        ? "border-[#16730F] bg-white ring-1 ring-[#16730F]"
                        : "border-[#E2EAE4] bg-white hover:border-[#A2C2A6]"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? "text-[#122B20]" : "text-[#5A6D62]"
                      }`}
                    >
                      {type.label}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#16730F] text-white"
                          : "border border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label
              htmlFor="question-text-input"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Question Text <span className="text-red-500">*</span>
            </label>
            <input
              id="question-text-input"
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. What is digital marketing?"
              autoFocus
              className="w-full rounded-2xl border border-[#74B570] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition"
            />
          </div>

          {/* Answer Options Section depending on Question Type */}
          {questionType === "text_based" ? (
            /* Text-Based Answer Option (Image 3) */
            <div>
              <label
                htmlFor="text-based-answer-input"
                className="block text-sm font-bold text-[#1E293B] mb-2"
              >
                Answer Options (Enter the correct answer){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="text-based-answer-input"
                type="text"
                value={textAnswer}
                onChange={(e) => {
                  setTextAnswer(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Promoting products or services through digital channels."
                className="w-full rounded-2xl border border-[#74B570] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition"
              />
            </div>
          ) : questionType === "true_false" ? (
            /* True or False Options (Image 2) */
            <div>
              <label className="block text-sm font-bold text-[#1E293B] mb-2.5">
                Answer Options (select the correct radio answer){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {["True", "False"].map((optText, idx) => {
                  const isCorrect = selectedCorrect.includes(idx);
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={optText}
                      onClick={() => toggleCorrectIndex(idx)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCorrectIndex(idx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isCorrect
                            ? "bg-[#16730F] text-white"
                            : "border border-gray-300 hover:border-[#16730F] bg-white"
                        }`}
                        aria-label={`Mark option ${letter} as correct`}
                      >
                        {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span className="text-xs font-bold text-[#5A6D62] w-5 shrink-0">
                        {letter}.
                      </span>

                      <div className="flex-1 rounded-2xl bg-[#9FB29E] px-4 py-3.5 text-sm font-semibold text-[#112A20] select-none">
                        {optText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Multiple Choice / Single Choice Options (Image 5) */
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label className="text-sm font-bold text-[#1E293B]">
                  Answer Options (select the correct radio answer){" "}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-bold text-[#16730F] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Option
                </button>
              </div>

              <div className="space-y-2.5">
                {options.map((opt, idx) => {
                  const isCorrect = selectedCorrect.includes(idx);
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 group"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCorrectIndex(idx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isCorrect
                            ? "bg-[#16730F] text-white"
                            : "border border-gray-300 hover:border-[#16730F] bg-white"
                        }`}
                        aria-label={`Mark option ${letter} as correct`}
                      >
                        {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span className="text-xs font-bold text-[#5A6D62] w-5 shrink-0">
                        {letter}.
                      </span>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className={`flex-1 rounded-2xl border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition ${
                          isCorrect
                            ? "border-[#74B570] bg-white focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20"
                            : "border-[#E2EAE4] bg-white focus:border-[#74B570]"
                        }`}
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Delete option ${letter}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Score (Points) */}
          <div>
            <label
              htmlFor="question-score-input"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Score (Points) <span className="text-red-500">*</span>
            </label>
            <input
              id="question-score-input"
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Math.max(1, Number(e.target.value) || 1))}
              className="w-36 rounded-2xl border border-[#DCE6DF] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3 text-sm text-gray-900 outline-none transition"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#153B2E] font-bold text-sm px-8 py-3.5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-sm px-10 py-3.5 transition-colors shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

