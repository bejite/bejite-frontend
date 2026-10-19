import { useRef, useEffect, useState } from "react";
import { Crop, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const VisualCropWorkspace = ({
  selectedImgId,
  selectedImgSrc,
  imgWidth,
  updateImageWidth = () => {},
  imgAlign,
  updateImageAlign = () => {},
  imgAspect,
  updateImageAspect = () => {},
  deleteSelectedImage = () => {},
  cropTop,
  setCropTop,
  cropRight,
  setCropRight,
  cropBottom,
  setCropBottom,
  cropLeft,
  setCropLeft,
  onUpdateStyle = () => {},
}) => {
  const workspaceRef = useRef(null);
  const [activeHandle, setActiveHandle] = useState(null);

  const startCropDrag = (e, handleName) => {
    e.preventDefault();
    setActiveHandle(handleName);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const selectedImg = selectedImgId ? document.getElementById(selectedImgId) : null;
      if (!activeHandle || !selectedImg || !workspaceRef.current) return;

      const rect = workspaceRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Translate coordinates to percentage values
      const pctX = Math.min(100, Math.max(0, (mouseX / rect.width) * 100));
      const pctY = Math.min(100, Math.max(0, (mouseY / rect.height) * 100));

      let t = cropTop;
      let r = cropRight;
      let b = cropBottom;
      let l = cropLeft;

      if (activeHandle === "left") {
        l = Math.min(100 - r - 10, Math.round(pctX));
        setCropLeft(l);
      } else if (activeHandle === "right") {
        r = Math.min(100 - l - 10, Math.round(100 - pctX));
        setCropRight(r);
      } else if (activeHandle === "top") {
        t = Math.min(100 - b - 10, Math.round(pctY));
        setCropTop(t);
      } else if (activeHandle === "bottom") {
        b = Math.min(100 - t - 10, Math.round(100 - pctY));
        setCropBottom(b);
      } else if (activeHandle === "top-left") {
        l = Math.min(100 - r - 10, Math.round(pctX));
        t = Math.min(100 - b - 10, Math.round(pctY));
        setCropLeft(l);
        setCropTop(t);
      } else if (activeHandle === "top-right") {
        r = Math.min(100 - l - 10, Math.round(100 - pctX));
        t = Math.min(100 - b - 10, Math.round(pctY));
        setCropRight(r);
        setCropTop(t);
      } else if (activeHandle === "bottom-left") {
        l = Math.min(100 - r - 10, Math.round(pctX));
        b = Math.min(100 - t - 10, Math.round(100 - pctY));
        setCropLeft(l);
        setCropBottom(b);
      } else if (activeHandle === "bottom-right") {
        r = Math.min(100 - l - 10, Math.round(100 - pctX));
        b = Math.min(100 - t - 10, Math.round(100 - pctY));
        setCropRight(r);
        setCropBottom(b);
      }

      // Apply crop to the reference element
      selectedImg.style.clipPath = `inset(${t}% ${r}% ${b}% ${l}%)`;
      onUpdateStyle();
    };

    const handleMouseUp = () => {
      setActiveHandle(null);
    };

    if (activeHandle) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    activeHandle,
    cropTop,
    cropRight,
    cropBottom,
    cropLeft,
    selectedImgId,
    setCropBottom,
    setCropLeft,
    setCropRight,
    setCropTop,
    onUpdateStyle,
  ]);

  return (
    <div className="bg-green-50/40 border border-green-200 rounded-2xl p-6 text-left space-y-5 animate-fadeIn">
      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
        <Crop size={16} className="text-[#16730F]" />
        Draggable Image Sizing & Crop Workspace
      </h4>

      <p className="text-xs text-gray-500">
        Drag the dashed crop lines inside the workspace sideways or vertically
        to crop. Adjust sizing and alignment details on the right.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Draggable Viewport */}
        <div className="lg:col-span-3 space-y-1.5">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Interactive Crop bounds (Drag handles to crop)
          </span>

          <div
            ref={workspaceRef}
            className="relative border border-green-300 rounded-xl overflow-hidden bg-gray-900 select-none flex items-center justify-center h-64 w-full"
          >
            {/* View container image */}
            <img
              src={selectedImgSrc}
              alt=""
              className="max-h-full max-w-full pointer-events-none"
              style={{
                clipPath: `inset(${cropTop}% ${cropRight}% ${cropBottom}% ${cropLeft}%)`,
              }}
            />

            {/* Overlay Resizing Guide Box */}
            <div
              className="absolute border border-dashed border-[#16730F] bg-transparent pointer-events-auto"
              style={{
                top: `${cropTop}%`,
                left: `${cropLeft}%`,
                right: `${cropRight}%`,
                bottom: `${cropBottom}%`,
                position: "absolute",
              }}
            >
              {/* Internal grid lines */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
              </div>

              {/* Draggable Borders */}
              <div
                onMouseDown={(e) => startCropDrag(e, "left")}
                className="absolute left-0 top-0 bottom-0 w-2 bg-transparent hover:bg-[#16730F]/45 cursor-ew-resize"
              />
              <div
                onMouseDown={(e) => startCropDrag(e, "right")}
                className="absolute right-0 top-0 bottom-0 w-2 bg-transparent hover:bg-[#16730F]/45 cursor-ew-resize"
              />
              <div
                onMouseDown={(e) => startCropDrag(e, "top")}
                className="absolute top-0 left-0 right-0 h-2 bg-transparent hover:bg-[#16730F]/45 cursor-ns-resize"
              />
              <div
                onMouseDown={(e) => startCropDrag(e, "bottom")}
                className="absolute bottom-0 left-0 right-0 h-2 bg-transparent hover:bg-[#16730F]/45 cursor-ns-resize"
              />

              {/* Corner handles */}
              <div
                onMouseDown={(e) => startCropDrag(e, "top-left")}
                className="absolute left-0 top-0 w-4 h-4 bg-[#16730F] border border-white rounded-full translate-x-[-50%] translate-y-[-50%] cursor-nwse-resize shadow"
              />
              <div
                onMouseDown={(e) => startCropDrag(e, "top-right")}
                className="absolute right-0 top-0 w-4 h-4 bg-[#16730F] border border-white rounded-full translate-x-[50%] translate-y-[-50%] cursor-nesw-resize shadow"
              />
              <div
                onMouseDown={(e) => startCropDrag(e, "bottom-left")}
                className="absolute left-0 bottom-0 w-4 h-4 bg-[#16730F] border border-white rounded-full translate-x-[-50%] translate-y-[50%] cursor-nesw-resize shadow"
              />
              <div
                onMouseDown={(e) => startCropDrag(e, "bottom-right")}
                className="absolute right-0 bottom-0 w-4 h-4 bg-[#16730F] border border-white rounded-full translate-x-[50%] translate-y-[50%] cursor-nwse-resize shadow"
              />
            </div>

            <div className="absolute bottom-2 left-2 bg-black/60 text-white font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
              <Crop size={10} />
              Drag Handles to Crop
            </div>
          </div>
        </div>

        {/* Configuration settings right column */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Resizing Width */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-600">
                Resize Width: {imgWidth}%
              </label>
              <input
                type="range"
                min="25"
                max="100"
                value={imgWidth}
                onChange={(e) => updateImageWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16730F]"
              />
            </div>

            {/* Align */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Align Position
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateImageAlign("left")}
                  className={`p-2 border rounded-lg hover:bg-gray-100 cursor-pointer ${imgAlign === "left" ? "bg-white border-[#16730F] text-[#16730F]" : "bg-white border-gray-200 text-gray-600"}`}
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => updateImageAlign("center")}
                  className={`p-2 border rounded-lg hover:bg-gray-100 cursor-pointer ${imgAlign === "center" ? "bg-white border-[#16730F] text-[#16730F]" : "bg-white border-gray-200 text-gray-600"}`}
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => updateImageAlign("right")}
                  className={`p-2 border rounded-lg hover:bg-gray-100 cursor-pointer ${imgAlign === "right" ? "bg-white border-[#16730F] text-[#16730F]" : "bg-white border-gray-200 text-gray-600"}`}
                >
                  <AlignRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-green-200/50 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                updateImageAspect(imgAspect === "cover" ? "contain" : "cover")
              }
              className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl cursor-pointer"
            >
              Toggle Object Fit ({imgAspect})
            </button>
            <button
              type="button"
              onClick={deleteSelectedImage}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              Delete Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualCropWorkspace;
