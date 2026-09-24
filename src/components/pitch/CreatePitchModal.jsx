import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { PITCH_TYPES } from "./modal/pitchModalConstants";
import PitchModalHeader from "./modal/PitchModalHeader";
import PitchModalStepper from "./modal/PitchModalStepper";
import PitchModalFooter from "./modal/PitchModalFooter";
import PitchSuccessView from "./modal/PitchSuccessView";
import PitchLeaveConfirmModal from "./modal/PitchLeaveConfirmModal";
import Step1PitchType from "./modal/steps/Step1PitchType";
import Step2RecordUpload from "./modal/steps/Step2RecordUpload";
import Step3Details from "./modal/steps/Step3Details";
import Step4Audience from "./modal/steps/Step4Audience";
import Step5Cta from "./modal/steps/Step5Cta";
import Step6Review from "./modal/steps/Step6Review";
import {
  createPitch,
  updatePitch,
  uploadPitchMedia,
  apiErrorMessage,
} from "../../services/pitchesApi";
import { VIDEO_MAX_BYTES, formatBytesAsMb } from "../../utils/uploadLimits";

function resolveDurationSeconds(videoEl, durationText, fallbackSeconds) {
  const fromEl = videoEl?.duration;
  if (fromEl && Number.isFinite(fromEl) && fromEl > 0) {
    return Math.round(fromEl);
  }
  const match = String(durationText || "").match(/(\d+)\s*seconds?/i);
  if (match) return parseInt(match[1], 10);
  if (fallbackSeconds > 0) return fallbackSeconds;
  return null;
}

export default function CreatePitchModal({
  isOpen,
  onClose,
  onPitchCreated,
  onViewInFeed,
  onGoToMyPitches,
  currentUser,
  draftToEdit,
}) {
  const [step, setStep] = useState(1);
  const [pitchType, setPitchType] = useState("skill");
  const [mediaMode, setMediaMode] = useState("upload");
  const [existingPitchId, setExistingPitchId] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState("");

  // Video state
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDurationText, setVideoDurationText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Step 3: Details
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Step 4: Audience
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Step 5: CTA
  const [ctaType, setCtaType] = useState("");

  // Modal dialog states
  const [isPublishing, setIsPublishing] = useState(false);
  const [showLiveSuccess, setShowLiveSuccess] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [publishedPitchData, setPublishedPitchData] = useState(null);

  // Refs
  const videoPreviewRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize or restore draft
  useEffect(() => {
    if (isOpen) {
      setShowLiveSuccess(false);
      setShowLeaveConfirm(false);
      setIsPublishing(false);

      if (draftToEdit) {
        setExistingPitchId(draftToEdit.id || null);
        setPitchType(draftToEdit.pitchType || "skill");
        setHeadline(draftToEdit.headline || "");
        setDescription(draftToEdit.description || "");
        setCategory(draftToEdit.category || "");
        setSkills(
          Array.isArray(draftToEdit.skills) ? draftToEdit.skills : []
        );
        setSelectedAudiences(
          Array.isArray(draftToEdit.audiences) ? draftToEdit.audiences : []
        );
        setSelectedIndustries(
          Array.isArray(draftToEdit.industries) ? draftToEdit.industries : []
        );
        setSelectedRoles(
          Array.isArray(draftToEdit.targetRoles) ? draftToEdit.targetRoles : []
        );
        setCtaType(draftToEdit.cta || "");
        setStep(draftToEdit.wizardStep || draftToEdit.step || 1);
        setVideoFile(null);
        if (draftToEdit.videoUrl) {
          setVideoUrl(draftToEdit.videoUrl);
          setUploadedVideoUrl(draftToEdit.videoUrl);
        } else {
          setVideoUrl("");
          setUploadedVideoUrl("");
        }
        setUploadedThumbnailUrl(draftToEdit.videoPoster || "");
        setPublishedPitchData(null);
        return;
      }

      // Full reset for a brand-new pitch
      setExistingPitchId(null);
      setUploadedVideoUrl("");
      setUploadedThumbnailUrl("");
      setVideoFile(null);
      setVideoUrl((prev) => {
        if (prev && String(prev).startsWith("blob:")) {
          try {
            URL.revokeObjectURL(prev);
          } catch {
            /* ignore */
          }
        }
        return "";
      });
      setStep(1);
      setPitchType("skill");
      setMediaMode("upload");
      setHeadline("");
      setDescription("");
      setCategory("");
      setSkills([]);
      setCustomSkillInput("");
      setSelectedAudiences([]);
      setSelectedIndustries([]);
      setSelectedRoles([]);
      setCtaType("");
      setVideoDurationText("");
      setIsPlayingPreview(false);
      setShowLiveSuccess(false);
      setPublishedPitchData(null);
    } else {
      stopCamera();
    }
  }, [isOpen, draftToEdit]);

  // Camera cleanup on step change
  useEffect(() => {
    if (step !== 2 || mediaMode !== "record") {
      stopCamera();
    }
  }, [step, mediaMode]);

  const startCamera = async () => {
    setCameraError("");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: true,
        });
        streamRef.current = stream;
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError("Camera not supported on this browser.");
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera unavailable. Please upload a video file instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (isRecording) {
      stopRecording();
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      startCamera().then(() => beginStreamRecording());
    } else {
      beginStreamRecording();
    }
  };

  const beginStreamRecording = () => {
    try {
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setVideoUrl((prev) => {
          if (prev && String(prev).startsWith("blob:")) {
            try {
              URL.revokeObjectURL(prev);
            } catch {
              /* ignore */
            }
          }
          return URL.createObjectURL(blob);
        });
        setVideoFile(new File([blob], "recorded_pitch.webm", { type: "video/webm" }));
        setUploadedVideoUrl("");
        setUploadedThumbnailUrl("");
        setVideoDurationText(`${recordSeconds || 4} seconds`);
        stopCamera();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 60) {
            stopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      toast.error("Could not start camera recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file.");
      return;
    }

    if (file.size > VIDEO_MAX_BYTES) {
      toast.error(`Video file must be under ${formatBytesAsMb(VIDEO_MAX_BYTES)}.`);
      return;
    }

    setVideoUrl((prev) => {
      if (prev && String(prev).startsWith("blob:")) {
        try {
          URL.revokeObjectURL(prev);
        } catch {
          /* ignore */
        }
      }
      return URL.createObjectURL(file);
    });
    setVideoFile(file);
    setUploadedVideoUrl("");
    setUploadedThumbnailUrl("");
    setVideoDurationText("Ready to stream");
    toast.success("Video loaded successfully!");
  };

  const handleReplaceVideo = () => {
    setVideoUrl((prev) => {
      if (prev && String(prev).startsWith("blob:")) {
        try {
          URL.revokeObjectURL(prev);
        } catch {
          /* ignore */
        }
      }
      return "";
    });
    setVideoFile(null);
    setUploadedVideoUrl("");
    setUploadedThumbnailUrl("");
    setIsPlayingPreview(false);
    if (mediaMode === "record") startCamera();
  };

  const handleTogglePreviewPlay = () => {
    const v = videoPreviewRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlayingPreview(true);
    } else {
      v.pause();
      setIsPlayingPreview(false);
    }
  };

  const ensureVideoUploaded = async () => {
    if (uploadedVideoUrl && !videoFile) {
      return {
        url: uploadedVideoUrl,
        thumbnailUrl: uploadedThumbnailUrl || null,
      };
    }
    if (!videoFile) return { url: uploadedVideoUrl || null, thumbnailUrl: uploadedThumbnailUrl || null };

    const uploaded = await uploadPitchMedia(videoFile);
    setUploadedVideoUrl(uploaded.url);
    setUploadedThumbnailUrl(uploaded.thumbnailUrl || "");
    setVideoFile(null);
    if (uploaded.url) setVideoUrl(uploaded.url);
    return {
      url: uploaded.url,
      thumbnailUrl: uploaded.thumbnailUrl || null,
    };
  };

  const buildPitchPayload = (status, media) => ({
    pitchType,
    status,
    headline: headline.trim(),
    description: description.trim(),
    category,
    skills,
    audiences: selectedAudiences,
    industries: selectedIndustries,
    targetRoles: selectedRoles,
    cta: ctaType,
    videoUrl: media?.url || null,
    videoThumbnailUrl: media?.thumbnailUrl || null,
    durationSeconds: resolveDurationSeconds(
      videoPreviewRef.current,
      videoDurationText,
      recordSeconds
    ),
    wizardStep: step,
  });

  const persistPitch = async (status) => {
    const media = await ensureVideoUploaded();
    if (status === "published" && !media.url) {
      throw new Error("Please upload or record a video before publishing.");
    }
    const payload = buildPitchPayload(status, media);
    if (existingPitchId) {
      return updatePitch(existingPitchId, payload);
    }
    return createPitch(payload);
  };

  const handleSaveDraft = async () => {
    try {
      setIsPublishing(true);
      const pitch = await persistPitch("draft");
      if (pitch?.id) setExistingPitchId(pitch.id);
      onPitchCreated?.(pitch, { isDraft: true });
      toast.success("Draft saved successfully!");
      return pitch;
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to save draft"));
      return null;
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCloseRequest = () => {
    if (showLiveSuccess) {
      onClose();
      return;
    }
    setShowLeaveConfirm(true);
  };

  const handleConfirmDiscard = () => {
    setShowLeaveConfirm(false);
    stopCamera();
    onClose();
  };

  const handleConfirmSaveDraft = async () => {
    const saved = await handleSaveDraft();
    if (!saved) return;
    setShowLeaveConfirm(false);
    stopCamera();
    onClose();
  };

  const addSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 8) {
      setSkills([...skills, trimmed]);
    }
    setCustomSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const toggleAudience = (id) => {
    if (id === "everyone") {
      if (selectedAudiences.includes("everyone")) {
        setSelectedAudiences([]);
      } else {
        setSelectedAudiences(["everyone", "employers", "recruiters", "jobseekers"]);
      }
      return;
    }
    if (selectedAudiences.includes(id)) {
      setSelectedAudiences(selectedAudiences.filter((a) => a !== id && a !== "everyone"));
    } else {
      setSelectedAudiences([...selectedAudiences.filter((a) => a !== "everyone"), id]);
    }
  };

  const toggleIndustry = (ind) => {
    if (selectedIndustries.includes(ind)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== ind));
    } else {
      setSelectedIndustries([...selectedIndustries, ind]);
    }
  };

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handlePublish = async () => {
    if (!videoFile && !uploadedVideoUrl && !videoUrl) {
      toast.error("Please upload or record a video before publishing.");
      return;
    }

    setIsPublishing(true);
    try {
      const pitch = await persistPitch("published");
      if (!pitch) throw new Error("Pitch was not created");
      setExistingPitchId(pitch.id);
      setPublishedPitchData(pitch);
      onPitchCreated?.(pitch, { isDraft: false });
      setShowLiveSuccess(true);
      toast.success("Pitch is live!");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to publish pitch"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShareLink = () => {
    const pitchId = publishedPitchData?.id || "latest";
    const shareUrl = `${window.location.origin}/pitch?id=${pitchId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Pitch link copied to clipboard!");
    } else {
      toast.info(`Pitch link: ${shareUrl}`);
    }
  };

  if (!isOpen) return null;

  const currentTypeObj = PITCH_TYPES.find((t) => t.id === pitchType) || PITCH_TYPES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleCloseRequest}
      />

      {/* Main Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-10 my-auto flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        {showLiveSuccess ? (
          /* ================= SUCCESS STATE: Your Pitch is Live! ================= */
          <PitchSuccessView
            publishedPitchData={publishedPitchData}
            headline={headline}
            ctaType={ctaType}
            onViewInFeed={onViewInFeed}
            onShareLink={handleShareLink}
            onGoToMyPitches={onGoToMyPitches}
            onClose={onClose}
          />
        ) : (
          /* ================= CREATION WIZARD BODY ================= */
          <>
            {/* Modal Header */}
            <PitchModalHeader
              onSaveDraft={handleSaveDraft}
              onClose={handleCloseRequest}
            />

            {/* Modal Progress Stepper */}
            <PitchModalStepper
              currentStep={step}
              totalSteps={6}
            />

            {/* Wizard Scrollable Content */}
            <div className="flex-1 overflow-y-auto nfl-scroll px-3.5 sm:px-6 py-3 sm:py-4">
              {step === 1 && (
                <Step1PitchType
                  pitchType={pitchType}
                  onSelectType={setPitchType}
                />
              )}

              {step === 2 && (
                <Step2RecordUpload
                  mediaMode={mediaMode}
                  setMediaMode={setMediaMode}
                  videoUrl={videoUrl}
                  isPlayingPreview={isPlayingPreview}
                  videoPreviewRef={videoPreviewRef}
                  webcamVideoRef={webcamVideoRef}
                  fileInputRef={fileInputRef}
                  cameraActive={cameraActive}
                  cameraError={cameraError}
                  isRecording={isRecording}
                  recordSeconds={recordSeconds}
                  onStartCamera={startCamera}
                  onStopCamera={stopCamera}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onFileUpload={handleFileUpload}
                  onReplaceVideo={handleReplaceVideo}
                  onTogglePreviewPlay={handleTogglePreviewPlay}
                />
              )}

              {step === 3 && (
                <Step3Details
                  headline={headline}
                  setHeadline={setHeadline}
                  description={description}
                  setDescription={setDescription}
                  category={category}
                  setCategory={setCategory}
                  skills={skills}
                  customSkillInput={customSkillInput}
                  setCustomSkillInput={setCustomSkillInput}
                  onAddSkill={addSkill}
                  onRemoveSkill={removeSkill}
                />
              )}

              {step === 4 && (
                <Step4Audience
                  selectedAudiences={selectedAudiences}
                  selectedIndustries={selectedIndustries}
                  selectedRoles={selectedRoles}
                  onToggleAudience={toggleAudience}
                  onToggleIndustry={toggleIndustry}
                  onToggleRole={toggleRole}
                />
              )}

              {step === 5 && (
                <Step5Cta
                  ctaType={ctaType}
                  onSelectCta={setCtaType}
                />
              )}

              {step === 6 && (
                <Step6Review
                  currentTypeObj={currentTypeObj}
                  currentUser={currentUser}
                  headline={headline}
                  description={description}
                  skills={skills}
                  ctaType={ctaType}
                  selectedAudiences={selectedAudiences}
                  videoDurationText={videoDurationText}
                  onEditStep={setStep}
                />
              )}
            </div>

            {/* Modal Footer Controls */}
            <PitchModalFooter
              step={step}
              totalSteps={6}
              isPublishing={isPublishing}
              onBack={() => setStep((s) => Math.max(1, s - 1))}
              onContinue={() => setStep((s) => Math.min(6, s + 1))}
              onPublish={handlePublish}
            />
          </>
        )}
      </div>

      {/* ================= LEAVE CONFIRMATION MODAL ================= */}
      <PitchLeaveConfirmModal
        isOpen={showLeaveConfirm}
        onContinueEditing={() => setShowLeaveConfirm(false)}
        onDiscard={handleConfirmDiscard}
        onSaveDraftAndExit={handleConfirmSaveDraft}
      />
    </div>
  );
}
