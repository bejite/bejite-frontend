// MediaUploader.js - Responsive
import { useState } from "react";
import { Upload, X, Image, Video, AlertCircle } from "lucide-react";
import {
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  formatBytesAsMb,
  getUploadSizeError,
} from "../../utils/uploadLimits";

export default function MediaUploader({ value, onUpload, onRemove, error }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (file) => {
    if (!file) return;

    const sizeError = getUploadSizeError(file);
    if (sizeError) {
      const isVideo = file.type.startsWith("video/");
      onUpload(
        null,
        isVideo
          ? `Video size must be less than ${formatBytesAsMb(VIDEO_MAX_BYTES)}`
          : `Image size must be less than ${formatBytesAsMb(IMAGE_MAX_BYTES)}`,
        null,
      );
      return;
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const validVideoTypes = ["video/mp4"];

    if (validImageTypes.includes(file.type)) {
      onUpload(file, null, "image");
    } else if (validVideoTypes.includes(file.type)) {
      onUpload(file, null, "video");
    } else {
      onUpload(null, "Unsupported format. Use JPG, PNG, WEBP, or MP4", null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  if (value) {
    return (
      <div className="relative group">
        <div className="rounded-xl overflow-hidden bg-gray-100">
          {value.type === "image" ? (
            <img
              src={value.preview}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
          ) : (
            <video src={value.preview} controls className="w-full max-h-64" />
          )}
        </div>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full min-h-[180px] sm:min-h-[200px] border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragOver
            ? "border-[#1A3E32] bg-green-50"
            : error
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-[#1A3E32] hover:bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center justify-center p-5 sm:p-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Upload
              className={`w-6 h-6 ${dragOver ? "text-[#1A3E32]" : "text-gray-400"}`}
            />
          </div>
          <p className="text-sm sm:text-base font-medium text-gray-700 text-center">
            {dragOver ? "Drop your file here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-gray-400 mt-1 text-center">
            JPG, PNG, WEBP, MP4 · Images {formatBytesAsMb(IMAGE_MAX_BYTES)}, videos{" "}
            {formatBytesAsMb(VIDEO_MAX_BYTES)}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Image className="w-3 h-3" /> Images
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" /> Videos
            </span>
          </div>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
      </label>
      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
