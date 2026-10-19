import React from "react";
import { Camera, UploadCloud, RotateCcw, Play, Pause } from "lucide-react";
import Button from "../../../ui/Button";

export default function Step2RecordUpload({
  mediaMode,
  setMediaMode,
  videoUrl,
  isPlayingPreview,
  videoPreviewRef,
  webcamVideoRef,
  fileInputRef,
  cameraActive,
  cameraError,
  isRecording,
  recordSeconds,
  onStartCamera,
  onStopCamera,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onReplaceVideo,
  onTogglePreviewPlay,
}) {
  return (
    <div>
      <div className="mb-3.5 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          Create Your Pitch
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Record a short video or upload one from your device (up to 60 seconds).
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-4 sm:mb-5">
        <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1 border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setMediaMode("record");
              onStartCamera();
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              mediaMode === "record"
                ? "bg-white text-[#1A3E32] shadow-sm"
                : "text-gray-600 hover:text-[#1A3E32]"
            }`}
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Record Video
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaMode("upload");
              onStopCamera();
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              mediaMode === "upload"
                ? "bg-white text-[#1A3E32] shadow-sm"
                : "text-gray-600 hover:text-[#1A3E32]"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Upload Video
          </button>
        </div>
      </div>

      {/* Video preview with Replace Video button */}
      {videoUrl ? (
        <div className="flex flex-col items-center">
          <div className="relative w-[210px] xs:w-[230px] sm:w-[260px] aspect-[9/16] max-h-[380px] sm:max-h-[440px] bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-gray-800 flex items-center justify-center group">
            <video
              ref={videoPreviewRef}
              src={videoUrl}
              playsInline
              loop
              onClick={onTogglePreviewPlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Center play icon */}
            <div
              onClick={onTogglePreviewPlay}
              className="absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/40 bg-black/40 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
            >
              {isPlayingPreview ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white translate-x-0.5" />
              )}
            </div>

            {/* Bottom Replace Video overlay */}
            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center z-20">
              <Button
                onClick={onReplaceVideo}
                variant="outline"
                size="sm"
                icon={RotateCcw}
                className="bg-white text-gray-800 hover:bg-gray-50 text-[11px] sm:text-xs font-bold shadow-lg"
              >
                Replace video
              </Button>
            </div>
          </div>
        </div>
      ) : mediaMode === "record" ? (
        /* Webcam Viewfinder */
        <div className="flex flex-col items-center">
          <div className="relative w-[210px] xs:w-[230px] sm:w-[260px] aspect-[9/16] max-h-[380px] sm:max-h-[440px] bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-gray-800 flex items-center justify-center">
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
            />

            {!cameraActive && (
              <div className="text-center p-3 sm:p-4 text-white">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-[11px] sm:text-xs text-gray-400 mb-2.5 sm:mb-3">
                  {cameraError || "Camera standby. Click below to start preview."}
                </p>
                <Button
                  onClick={onStartCamera}
                  variant="primary"
                  size="sm"
                  className="text-[11px] sm:text-xs"
                >
                  Enable Camera
                </Button>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] sm:text-xs font-bold animate-pulse">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 1:00
              </div>
            )}

            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex items-center justify-center">
              {isRecording ? (
                <button
                  type="button"
                  onClick={onStopRecording}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-600 shadow-xl cursor-pointer"
                  aria-label="Stop recording"
                >
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStartRecording}
                  disabled={!cameraActive}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-600 shadow-xl cursor-pointer disabled:opacity-50"
                  aria-label="Start recording"
                >
                  <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 border-2 border-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-[#16730F] bg-gray-50/50 hover:bg-green-50/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] sm:min-h-[260px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={onFileUpload}
              className="hidden"
            />

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF5E9] text-[#16730F] flex items-center justify-center mb-3 sm:mb-4">
              <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <p className="text-xs sm:text-sm md:text-base font-bold text-[#1A3E32]">
              Drag & drop your Pitch video, or{" "}
              <span className="text-[#16730F] underline">browse</span>
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
              MP4, MOV, or WebM · Recommended 9:16 portrait orientation
            </p>
            <div className="mt-3 sm:mt-4 px-3 py-1 rounded-full bg-white border border-gray-200 text-[10px] sm:text-[11px] text-gray-600 font-medium">
              Max file size: 150MB · Recommended duration: 30–60s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
