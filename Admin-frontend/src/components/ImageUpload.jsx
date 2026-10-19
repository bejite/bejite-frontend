const ImageUpload = ({
  imagePreview,
  handleImageChange,
  bio,
  onBioChange,
  textareaLabel = "SHORT BIO",
  maxLength,
}) => (
  <div className="w-full lg:w-64 flex flex-col items-center">
    <div className="relative group cursor-pointer">
      <label className="w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#1A3E32] hover:bg-gray-100 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#1A3E32] transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mb-2 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs font-semibold text-center px-2">
              Upload Photo
            </span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          onChange={handleImageChange}
          accept="image/png, image/jpeg, image/jpg"
        />
      </label>
    </div>

    <p className="text-[11px] text-gray-500 text-center font-medium mt-3">
      Allowed: PNG, JPEG <br /> Max size: 100kb
    </p>

    {bio !== undefined && onBioChange && (
      <div className="w-full mt-6">
        <label className="block text-[11px] font-bold text-gray-600 tracking-wide mb-1.5 pl-1">
          {textareaLabel}
        </label>
        <textarea
          name="bio"
          value={bio}
          onChange={onBioChange}
          placeholder="Write a short bio about yourself..."
          maxLength={maxLength}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 h-32 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent transition-all shadow-sm resize-none"
        />
        {maxLength != null && (
          <p className="text-xs text-gray-400 text-right mt-1">
            {String(bio || "").length}/{maxLength}
          </p>
        )}
      </div>
    )}
  </div>
);

export default ImageUpload;
