import { useState, useRef, useEffect } from "react";
import { FaImage, FaVideo, FaTimes, FaClock } from "react-icons/fa";
import { uploadMedia } from "../services/postsApi";
import RecruiterSelect from "./admin/RecruiterSelect";

function getDefaultSchedule() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60);
  d.setSeconds(0, 0);
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

function formatScheduledLabel(dateStr, timeStr) {
  const scheduled = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(scheduled.getTime())) return "";
  return scheduled.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PostCreationModal = ({
  isOpen,
  onClose,
  onPost,
  initialVisibility = "public",
  initialMode = "post",
}) => {
  const isPollMode = initialMode === "poll";
  const [postBody, setPostBody] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDurationDays, setPollDurationDays] = useState(7);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [postMode, setPostMode] = useState("now");
  const [scheduleDate, setScheduleDate] = useState(
    () => getDefaultSchedule().date,
  );
  const [scheduleTime, setScheduleTime] = useState(
    () => getDefaultSchedule().time,
  );
  const [minDate, setMinDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const defaults = getDefaultSchedule();
    Promise.resolve().then(() => {
      setMinDate(new Date().toISOString().slice(0, 10));
      setScheduleDate(defaults.date);
      setScheduleTime(defaults.time);
      setPostMode("now");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollDurationDays(7);
      setError(null);
      setSuccess(null);
    });
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleMediaSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      setError(null);
      const result = await uploadMedia(file);
      const newMedia = {
        kind: result.kind,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl ?? null,
      };
      setMediaFiles([...mediaFiles, newMedia]);
    } catch (err) {
      console.error(
        "Error uploading media:",
        err.response?.data || err.message,
      );
      setError(
        err.response?.data?.error ||
          "Failed to upload media. Please try again.",
      );
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const buildScheduledAt = () => {
    const scheduled = new Date(`${scheduleDate}T${scheduleTime}`);
    if (Number.isNaN(scheduled.getTime())) {
      throw new Error("Please choose a valid date and time.");
    }
    if (scheduled.getTime() <= Date.now()) {
      throw new Error("Scheduled time must be in the future.");
    }
    return scheduled.toISOString();
  };

  const updatePollOption = (index, value) => {
    setPollOptions((prev) =>
      prev.map((option, i) => (i === index ? value : option)),
    );
  };

  const addPollOption = () => {
    setPollOptions((prev) => (prev.length >= 4 ? prev : [...prev, ""]));
  };

  const removePollOption = (index) => {
    setPollOptions((prev) =>
      prev.length <= 2 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const handlePost = async () => {
    if (isPollMode) {
      const trimmedQuestion = pollQuestion.trim();
      const trimmedOptions = pollOptions
        .map((option) => option.trim())
        .filter(Boolean);
      if (!trimmedQuestion) {
        setError("Please enter a poll question.");
        return;
      }
      if (trimmedOptions.length < 2) {
        setError("Please provide at least two poll options.");
        return;
      }
    } else if (!postBody.trim() && mediaFiles.length === 0) {
      setError("Please write something or add media to your post.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload = {
        body: postBody,
        visibility,
        media: isPollMode ? [] : mediaFiles,
      };

      if (isPollMode) {
        payload.poll = {
          question: pollQuestion.trim(),
          options: pollOptions.map((option) => option.trim()).filter(Boolean),
          durationDays: pollDurationDays,
        };
      }

      if (postMode === "schedule") {
        payload.status = "scheduled";
        payload.scheduledAt = buildScheduledAt();
      } else {
        payload.status = "published";
      }

      await onPost(payload);

      if (postMode === "schedule") {
        setSuccess(
          `Post scheduled for ${formatScheduledLabel(scheduleDate, scheduleTime)}.`,
        );
        setTimeout(() => handleClose(), 1200);
      } else {
        handleClose();
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(
        err?.message ||
          err?.response?.data?.error ||
          "Failed to create post. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    const nextDefault = getDefaultSchedule();
    setPostBody("");
    setMediaFiles([]);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollDurationDays(7);
    setError(null);
    setSuccess(null);
    setPostMode("now");
    setScheduleDate(nextDefault.date);
    setScheduleTime(nextDefault.time);
    onClose();
  };

  const isScheduleMode = postMode === "schedule";
  const canSubmit = isPollMode
    ? pollQuestion.trim() &&
      pollOptions.filter((option) => option.trim()).length >= 2
    : postBody.trim() || mediaFiles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#A9A9A9]">
          <h2 className="text-lg font-semibold text-[#1A3E32]">
            {isPollMode ? "Create Poll" : "Create Post"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto nfl-scroll scroll-smooth p-4">
          {isPollMode ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A3E32]">
                  Poll question
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask something..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:border-[#16730F]"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A3E32]">
                  Options
                </label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#16730F]"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(index)}
                        className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-sm font-medium text-[#16730F] hover:underline"
                  >
                    + Add option
                  </button>
                )}
              </div>

              <div>
                <RecruiterSelect
                  label="Poll duration"
                  name="pollDurationDays"
                  value={String(pollDurationDays)}
                  onChange={(e) => setPollDurationDays(Number(e.target.value))}
                  options={[
                    { value: "1", label: "1 day" },
                    { value: "3", label: "3 days" },
                    { value: "7", label: "7 days" },
                    { value: "14", label: "14 days" },
                    { value: "30", label: "30 days" },
                  ]}
                  placeholder="Select duration"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A3E32]">
                  Additional context (optional)
                </label>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Add more details about your poll..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#16730F] resize-none text-sm"
                />
              </div>
            </div>
          ) : (
            <textarea
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#16730F] resize-none text-base"
              autoFocus
            />
          )}

          {!isPollMode && mediaFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative">
                    {media.kind === "image" ? (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center gap-2 max-w-xs">
              <img
                src="/assets/images/public-icon.svg"
                alt="Public"
                className="w-4 h-4 shrink-0"
              />
              <div className="flex-1">
                <RecruiterSelect
                  name="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  options={[
                    { value: "public", label: "Public" },
                    { value: "connections", label: "Connections Only" },
                  ]}
                  placeholder="Select Visibility"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#A9A9A9]">
          {!isPollMode && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingMedia}
                className="flex items-center gap-2 text-[#16730F] hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <FaImage className="text-lg" />
                <span className="text-sm">Add Image</span>
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingMedia}
                className="flex items-center gap-2 text-[#16730F] hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <FaVideo className="text-lg" />
                <span className="text-sm">Add Video</span>
              </button>
              {uploadingMedia && (
                <span className="text-sm text-gray-500">Uploading...</span>
              )}
            </div>
          )}

          {!isPollMode && (
            <>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
            </>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:min-w-0 sm:flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                When to publish
              </p>
              <div className="flex w-full sm:w-auto rounded-full border border-gray-200 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setPostMode("now")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    !isScheduleMode
                      ? "bg-[#16730F] text-white"
                      : "text-gray-600 hover:text-[#1A3E32]"
                  }`}
                >
                  Post now
                </button>
                <button
                  type="button"
                  onClick={() => setPostMode("schedule")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isScheduleMode
                      ? "bg-[#16730F] text-white"
                      : "text-gray-600 hover:text-[#1A3E32]"
                  }`}
                >
                  <FaClock className="text-xs shrink-0" />
                  Schedule
                </button>
              </div>

              {isScheduleMode && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm text-gray-600 mb-1 block">
                      Date
                    </span>
                    <input
                      type="date"
                      value={scheduleDate}
                      min={minDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#16730F]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600 mb-1 block">
                      Time
                    </span>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#16730F]"
                    />
                  </label>
                  <p className="sm:col-span-2 text-xs text-gray-500">
                    Will publish on{" "}
                    <span className="font-medium text-[#1A3E32]">
                      {formatScheduledLabel(scheduleDate, scheduleTime) || "—"}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handlePost}
              disabled={submitting || !canSubmit}
              className="w-full sm:w-auto bg-[#16730F] text-white px-6 py-2.5 sm:py-2 rounded-full text-sm font-medium hover:bg-[#145a0c] disabled:opacity-50 transition-colors shrink-0"
            >
              {submitting
                ? isScheduleMode
                  ? "Scheduling..."
                  : "Posting..."
                : isScheduleMode
                  ? "Schedule post"
                  : isPollMode
                    ? "Post poll"
                    : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreationModal;
