import React, { useRef, useState, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  FileVideo,
  FileText,
  Headphones,
  Maximize2,
  Pause,
  Play,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";

const BLOCK_OPTIONS = [
  {
    type: "video",
    title: "Video Block",
    description: "Upload MP4, WebM or MOV video",
    accept: "video/*,.mp4,.webm,.mov",
    badgeLabel: "Video Content",
    headerLabel: "Video Block",
    dropzoneLabel: "Video",
    formatHint: "Supported formats: MP4, WebM, MOV (up to 250MB)",
    replaceLabel: "Replace Video",
  },
  {
    type: "audio",
    title: "Audio Block",
    description: "Upload MP3, WAV audio lecture",
    accept: "audio/*,.mp3,.wav",
    badgeLabel: "Audio Content",
    headerLabel: "Audio Block",
    dropzoneLabel: "Audio",
    formatHint: "Supported formats: MP3, WAV (up to 100MB)",
    replaceLabel: "Replace Audio",
  },
  {
    type: "pdf",
    title: "PDF Document",
    description: "Viewable document in lesson reader",
    accept: "application/pdf,.pdf",
    badgeLabel: "PDF Document",
    headerLabel: "PDF Document",
    dropzoneLabel: "PDF Document",
    formatHint: "Supported formats: PDF (up to 50MB)",
    replaceLabel: "Replace PDF",
  },
];

/**
 * Reusable Step 3 Content & Media Editor component matching Figma Image 2 and Image 4.
 */
export default function LessonMediaContentEditor({
  modules = [],
  selectedModuleIndex = 0,
  selectedLessonIndex = 0,
  onSelectLesson,
  onUpdateLesson,
}) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const menuRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setBlockMenuOpen(false);
      }
    }
    if (blockMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [blockMenuOpen]);

  // Flatten all lessons across modules for the left sidebar with global index
  const flatLessons = [];
  let globalCount = 0;
  modules.forEach((mod, mIdx) => {
    (mod.lessons || []).forEach((les, lIdx) => {
      globalCount += 1;
      flatLessons.push({
        globalNumber: globalCount,
        moduleId: mod.id || mIdx,
        moduleNumber: mIdx + 1,
        moduleTitle: mod.title,
        moduleIndex: mIdx,
        lessonIndex: lIdx,
        lesson: les,
      });
    });
  });

  const activeItem =
    flatLessons.find(
      (item) =>
        item.moduleIndex === selectedModuleIndex &&
        item.lessonIndex === selectedLessonIndex
    ) || flatLessons[0];

  const activeLesson = activeItem?.lesson;
  const activeModuleNumber = activeItem?.moduleNumber || 1;
  const activeModuleTitle = activeItem?.moduleTitle || "Introduction";

  const mediaType =
    activeLesson?.mediaType ||
    (activeLesson?.type === "Video" ? "video" : "video");
  const activeOption =
    BLOCK_OPTIONS.find((opt) => opt.type === mediaType) || BLOCK_OPTIONS[0];
  const hasMedia = Boolean(
    activeLesson?.mediaFileName ||
      activeLesson?.mediaUrl ||
      activeLesson?.videoUrl
  );

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 250 * 1024 * 1024) {
      toast.error("File size exceeds 250MB limit.");
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const isAudio = file.type.startsWith("audio");
    let detectedType = "video";
    if (isPdf) detectedType = "pdf";
    else if (isAudio) detectedType = "audio";

    const objectUrl = URL.createObjectURL(file);

    onUpdateLesson?.(selectedModuleIndex, selectedLessonIndex, {
      mediaType: detectedType,
      mediaUrl: objectUrl,
      videoUrl: detectedType === "video" ? objectUrl : activeLesson?.videoUrl,
      mediaFileName: file.name,
      mediaFileSize: `${sizeInMb} MB`,
      mediaDuration: detectedType === "pdf" ? "PDF Document" : "15:10",
      mediaFormat:
        file.type ||
        (detectedType === "pdf"
          ? "application/pdf"
          : `${detectedType}/mp4`),
      mediaStatus: "Ready",
    });

    toast.success(`${file.name} uploaded successfully.`);
  };

  const handleRemoveMedia = () => {
    onUpdateLesson?.(selectedModuleIndex, selectedLessonIndex, {
      mediaUrl: "",
      videoUrl: "",
      mediaFileName: "",
      mediaFileSize: "",
      mediaDuration: "",
      mediaFormat: "",
      mediaStatus: "",
    });
    setIsPlaying(false);
    toast.info("Media block content removed.");
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const currentTakeaways =
    activeLesson?.takeawaysText ??
    (Array.isArray(activeLesson?.takeaways) && activeLesson.takeaways.length > 0
      ? `By the end of the course, the learner should be able to:\n${activeLesson.takeaways
          .map((t, idx) => `e.g ${idx + 1}. ${t}`)
          .join("\n")}`
      : "By the end of the course, the learner should be able to:\ne.g 1.");

  return (
    <div className="space-y-6">
      {/* Sage Header Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Learning Content & Media
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Add instructional text, upload video and audio files, and manage lesson
          resources.
        </p>
      </div>

      {/* 2-Column Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Course Lessons Sidebar */}
        <div className="lg:col-span-4 rounded-2xl sm:rounded-3xl bg-white border border-[#E6ECE8] p-4 sm:p-5 shadow-2xs">
          {/* Sidebar Top Header */}
          <div className="flex items-center justify-between gap-2 pb-3.5 sm:pb-4 mb-3 border-b border-[#EEF3EF]">
            <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#122B20] uppercase">
              <BookOpen className="w-4 h-4 text-[#16730F]" />
              Course Lessons
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {flatLessons.length} {flatLessons.length === 1 ? "lesson" : "lessons"}
            </span>
          </div>

          {/* Lessons List */}
          <div className="space-y-2.5 max-h-[300px] lg:max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar pr-0.5">
            {flatLessons.map((item) => {
              const isSelected =
                item.moduleIndex === selectedModuleIndex &&
                item.lessonIndex === selectedLessonIndex;
              const hasContent = Boolean(
                item.lesson?.mediaFileName ||
                  item.lesson?.mediaUrl ||
                  item.lesson?.videoUrl ||
                  item.lesson?.bodyText
              );
              const lessonMediaType = item.lesson?.mediaType || "video";

              return (
                <div
                  key={`${item.moduleId}-${item.lessonIndex}`}
                  onClick={() => onSelectLesson?.(item.moduleIndex, item.lessonIndex)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-l-[4px] border-l-[#16730F] border border-[#DCE8DC] shadow-xs"
                      : "bg-[#FAFCFA] hover:bg-[#F2F6F3] border border-transparent"
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold text-[#122B20]">
                    <span className="text-[#64786C] font-extrabold mr-1">
                      #{item.globalNumber}
                    </span>
                    {item.lesson?.title}
                  </div>

                  <p className="mt-1 text-[11px] text-[#6B7B73] line-clamp-2 leading-relaxed">
                    {item.lesson?.summary ||
                      item.lesson?.description ||
                      "Core concepts and learning takeaways."}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    {hasContent ? (
                      <span className="rounded-full bg-[#EAF5EC] text-[#16730F] text-[10px] font-bold px-2.5 py-0.5">
                        {lessonMediaType === "audio"
                          ? "Audio Content"
                          : lessonMediaType === "pdf"
                          ? "PDF Document"
                          : "Video Content"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F0F2F1] text-[#718077] text-[10px] font-medium px-2.5 py-0.5">
                        No Content Added
                      </span>
                    )}

                    <span className="rounded-full bg-[#EFF5EF] text-[#5A6D62] text-[10px] font-semibold px-2.5 py-0.5">
                      Module {item.moduleNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson Content Editor */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Title & Block Dropdown Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A6D62]">
                MODULE {activeModuleNumber}: {activeModuleTitle.toUpperCase()}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#122B20] mt-0.5">
                {activeLesson?.title || "Lesson Content"}
              </h2>
            </div>

            {/* Block Type Dropdown Button Matching Image 1 & 2 */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setBlockMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-4 py-2 transition-colors shadow-xs cursor-pointer"
              >
                <span>{activeOption.title}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    blockMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {blockMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-36px)] rounded-2xl bg-white border border-[#E5EAE5] shadow-[0_12px_36px_rgba(0,0,0,0.14)] p-2 z-30 space-y-1">
                  {BLOCK_OPTIONS.map((opt) => {
                    const isSelected = mediaType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          onUpdateLesson?.(
                            selectedModuleIndex,
                            selectedLessonIndex,
                            {
                              mediaType: opt.type,
                            }
                          );
                          setBlockMenuOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#EFF6EF] text-[#122B20]"
                            : "hover:bg-[#F5F8F5] text-[#122B20]"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#14261C] leading-tight">
                          {opt.title}
                        </p>
                        <p className="text-xs text-[#6B7B73] mt-1 leading-normal">
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Media Content Card */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#122B20]">
                <span className="text-[#64786C]">#1</span>
                {mediaType === "audio" ? (
                  <Headphones className="w-4 h-4 text-[#16730F]" />
                ) : mediaType === "pdf" ? (
                  <FileText className="w-4 h-4 text-[#16730F]" />
                ) : (
                  <FileVideo className="w-4 h-4 text-[#16730F]" />
                )}
                <span>{activeOption.headerLabel}</span>
              </div>

              {hasMedia && (
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  aria-label="Remove media"
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={activeOption.accept}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Video Player OR Audio Player OR PDF Preview OR Upload Dropzone */}
            {hasMedia && activeLesson?.mediaUrl ? (
              mediaType === "pdf" ? (
                /* PDF Document Preview Card */
                <div className="relative rounded-2xl border border-[#DCE8DC] bg-[#F7FAF7] p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#EAF5EC] text-[#16730F] flex items-center justify-center mx-auto shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#122B20]">
                      {activeLesson?.mediaFileName || "course_document.pdf"}
                    </p>
                    <p className="text-xs text-[#5A6D62] mt-1">
                      PDF Document ready for lesson reader
                    </p>
                  </div>
                  {activeLesson?.mediaUrl && (
                    <div>
                      <a
                        href={activeLesson.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open PDF in new tab ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : mediaType === "audio" ? (
                /* Audio Block Player Card */
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#122F22] to-[#1E4D38] p-8 text-center text-white space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm text-[#A6E88E] flex items-center justify-center mx-auto shadow-xs animate-pulse">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">
                      {activeLesson?.mediaFileName || "Audio Lecture.mp3"}
                    </p>
                    <p className="text-xs text-[#A1BDB0] mt-1">
                      Upload MP3, WAV audio lecture
                    </p>
                  </div>
                  {activeLesson?.mediaUrl && (
                    <div className="max-w-md mx-auto pt-2">
                      <audio
                        controls
                        src={activeLesson.mediaUrl}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Video Block Player Card */
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video group shadow-sm flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={activeLesson.mediaUrl}
                    poster={activeLesson?.coverImage || undefined}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Video Play/Pause Overlay Controls */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col justify-between p-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current?.requestFullscreen) {
                            videoRef.current.requestFullscreen();
                          }
                        }}
                        className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 fill-white" />
                        ) : (
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-white text-xs font-medium">
                      <span>0:00</span>
                      <div className="flex-1 mx-3 h-1 bg-white/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[#16730F] w-1/4" />
                      </div>
                      <span>{activeLesson?.mediaDuration || "15:10"}</span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Dashed Upload Dropzone (Image 2) */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#D5E1D7] hover:border-[#16730F]/60 bg-[#FCFDFC] p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#EAF5EC] text-[#16730F] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="mt-3 text-sm font-bold text-[#122B20]">
                  Drag & drop your {activeOption.dropzoneLabel}, or{" "}
                  <span className="text-[#16730F] underline">browse</span>
                </div>
                <div className="mt-1 text-xs text-[#6B7B73]">
                  {activeOption.formatHint}
                </div>
                <div className="mt-2 text-[11px] text-gray-400">
                  Max file size: 250MB
                </div>
              </div>
            )}

            {/* Bottom File Information Bar */}
            {hasMedia && (
              <div className="rounded-xl border border-[#E6ECE8] bg-[#FAFDFB] p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#122B20]">
                      {activeLesson?.mediaFileName || "lesson_content_file"}
                    </span>
                    <span className="rounded-full bg-[#EAF5EC] text-[#16730F] text-[10px] font-bold px-2 py-0.5">
                      {activeLesson?.mediaStatus || "Ready"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7B73]">
                    Size: {activeLesson?.mediaFileSize || "62.1 MB"} • Duration:{" "}
                    {activeLesson?.mediaDuration ||
                      (mediaType === "pdf" ? "PDF Document" : "15:10")}{" "}
                    • Format:{" "}
                    {activeLesson?.mediaFormat ||
                      (mediaType === "pdf"
                        ? "application/pdf"
                        : mediaType === "audio"
                        ? "audio/mp3"
                        : "video/mp4")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#5D7E2B] hover:bg-[#506D24] text-white text-xs font-bold px-4 py-2 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {activeOption.replaceLabel}
                </button>
              </div>
            )}
          </div>

          {/* Key Takeaways (Checkpoints) Card */}
          <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs space-y-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#122B20]">
                KEY TAKEAWAYS (CHECKPOINTS)
              </h3>
              <p className="mt-0.5 text-xs text-[#6B7B73]">
                Summarise key points learners should remember after this lesson.
              </p>
            </div>

            <textarea
              rows={4}
              value={currentTakeaways}
              onChange={(e) =>
                onUpdateLesson?.(selectedModuleIndex, selectedLessonIndex, {
                  takeawaysText: e.target.value,
                })
              }
              placeholder="By the end of the course, the learner should be able to:&#10;e.g 1."
              className="w-full rounded-2xl border border-[#74B570] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 p-4 text-xs sm:text-sm text-gray-800 outline-none resize-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

