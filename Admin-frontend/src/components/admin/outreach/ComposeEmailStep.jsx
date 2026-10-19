import { useRef, useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Upload,
  ChevronUp,
  ChevronDown,
  ArrowDownToLine,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import FontSelectorDropdown from "./FontSelectorDropdown";

const FONT_SIZE_LABELS = {
  1: "X-Small",
  2: "Small",
  3: "Normal",
  4: "Large",
  5: "X-Large",
  6: "Huge",
  7: "Giant",
};

let globalImgCounter = 0;
const getNextImageId = () => {
  globalImgCounter += 1;
  return `camp-img-${globalImgCounter}`;
};

const ComposeEmailStep = ({
  campaignForm = {},
  setCampaignForm = () => {},
  onNavigateTemplates = () => {},
}) => {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const selectedImgRef = useRef(null);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [currentFontName, setCurrentFontName] = useState("Sans-Serif (Clean)");
  const [selectedImgId, setSelectedImgId] = useState(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    h1: false,
    h2: false,
    h3: false,
    ul: false,
    ol: false,
  });
  const [fontSize, setFontSize] = useState(3);

  useEffect(() => {
    if (
      editorRef.current &&
      campaignForm.body &&
      editorRef.current.innerHTML !== campaignForm.body
    ) {
      editorRef.current.innerHTML = campaignForm.body;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateActiveFormats = () => {
    if (!editorRef.current) return;
    const blockVal = document.queryCommandValue("formatBlock");
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      h1: blockVal === "h1" || blockVal === "H1",
      h2: blockVal === "h2" || blockVal === "H2",
      h3: blockVal === "h3" || blockVal === "H3",
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
    const sizeVal = document.queryCommandValue("fontSize");
    if (sizeVal) setFontSize(parseInt(sizeVal, 10));
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) updateActiveFormats();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setCampaignForm((prev) => ({
        ...prev,
        body: editorRef.current.innerHTML,
      }));
    }
  }, [setCampaignForm]);

  const handleEditorClick = (e) => {
    if (e.target.tagName === "IMG") {
      selectedImgRef.current = e.target;
      setSelectedImgId(e.target.id || "selected-img");
    } else {
      selectedImgRef.current = null;
      setSelectedImgId(null);
    }
    updateActiveFormats();
  };

  const runCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput();
    if (editorRef.current) editorRef.current.focus();
    updateActiveFormats();
  };

  const insertPlaceholder = (placeholder) => {
    runCommand("insertText", placeholder);
  };

  const handleInsertImage = (url) => {
    const html = `<img src="${url}" alt="" style="width:100%;display:block;margin:16px auto;border-radius:12px" id="${getNextImageId()}" />&nbsp;`;
    runCommand("insertHTML", html);
  };

  const handleImageFileLoad = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        ev.target?.result && handleInsertImage(ev.target.result);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const deleteSelectedImage = () => {
    if (selectedImgRef.current) {
      selectedImgRef.current.remove();
      selectedImgRef.current = null;
      setSelectedImgId(null);
      handleEditorInput();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    Array.from(e.dataTransfer.files || []).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.info("Only images can be dropped into the email body.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) =>
        ev.target?.result && handleInsertImage(ev.target.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileLoad}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Compose email</h3>
          <p className="text-gray-500 text-xs">
            Write the message. Placeholders are replaced per recipient on send.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateTemplates}
          className="text-[#16730F] text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <Sparkles size={14} />
          Load template
        </button>
      </div>

      <div className="space-y-4">
        <div className="text-left">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Insert placeholder
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "{First Name}",
              "{Profession}",
              "{Job Link}",
              "{Unsubscribe Link}",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertPlaceholder(tag)}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
              >
                + {tag.replace("{", "").replace("}", "")}
              </button>
            ))}
          </div>
          {campaignForm.audienceSource === "external" ? (
            <p className="text-[11px] text-gray-500 mt-2">
              {"{First Name}"} uses the name from your list when provided;
              otherwise it becomes “there”. {"{Profession}"} uses the optional
              label from the audience step. The button still opens bejite.com
              so recipients can sign up.
            </p>
          ) : null}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDrop}
          className={`border rounded-2xl overflow-hidden shadow-sm transition-all relative ${
            isDraggingFile
              ? "border-dashed border-green-500 bg-green-50/20 border-2"
              : "border-gray-300 bg-white"
          }`}
        >
          {isDraggingFile && (
            <div className="absolute inset-0 bg-green-50/90 flex flex-col items-center justify-center z-50 text-[#16730F] pointer-events-none">
              <ArrowDownToLine size={40} className="mb-2" />
              <span className="font-bold text-sm">Drop image into body</span>
            </div>
          )}

          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 flex flex-wrap items-center gap-1.5">
            <FontSelectorDropdown
              currentFontName={currentFontName}
              onSelectFont={(font) => {
                setCurrentFontName(font.name);
                runCommand("fontName", font.value);
              }}
            />
            <span className="h-4 w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("bold")}
              className={`p-1.5 rounded cursor-pointer ${
                activeFormats.bold
                  ? "bg-[#16730F] text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("italic")}
              className={`p-1.5 rounded cursor-pointer ${
                activeFormats.italic
                  ? "bg-[#16730F] text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Italic size={16} />
            </button>
            <span className="h-4 w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next = Math.min(7, fontSize + 1);
                setFontSize(next);
                runCommand("fontSize", String(next));
              }}
              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              <ChevronUp size={16} />
            </button>
            <span className="text-xs font-bold text-gray-500 min-w-[70px] text-center">
              {FONT_SIZE_LABELS[fontSize] || "Normal"}
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next = Math.max(1, fontSize - 1);
                setFontSize(next);
                runCommand("fontSize", String(next));
              }}
              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              <ChevronDown size={16} />
            </button>
            <span className="h-4 w-px bg-gray-300 mx-1" />
            {["h1", "h2", "h3"].map((h) => (
              <button
                key={h}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand("formatBlock", `<${h}>`)}
                className={`p-1.5 rounded text-xs font-extrabold uppercase cursor-pointer ${
                  activeFormats[h]
                    ? "bg-[#16730F] text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {h}
              </button>
            ))}
            <span className="h-4 w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand("insertUnorderedList")}
              className={`p-1.5 rounded cursor-pointer ${
                activeFormats.ul
                  ? "bg-[#16730F] text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-[#16730F] flex items-center gap-1 cursor-pointer text-xs font-semibold"
            >
              <ImageIcon size={16} />
              <Upload size={12} />
              Image
            </button>
            {selectedImgId && (
              <button
                type="button"
                onClick={deleteSelectedImage}
                className="p-1.5 rounded text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer text-xs font-semibold"
              >
                <Trash2 size={14} />
                Remove image
              </button>
            )}
          </div>

          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onClick={handleEditorClick}
            className="w-full min-h-[280px] max-h-[480px] overflow-y-auto px-6 py-4 bg-white focus:outline-none text-sm text-gray-900 leading-relaxed text-left [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1.5"
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 text-left">
          <h4 className="text-sm font-bold text-gray-900">Call to action button</h4>
          <p className="text-xs text-gray-500 -mt-2">
            Shown as a button under the body when both fields are filled. Also
            powers the {"{Job Link}"} placeholder.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Button label
              </label>
              <input
                type="text"
                placeholder="e.g. Apply Now"
                value={campaignForm.ctaText || ""}
                onChange={(e) =>
                  setCampaignForm({ ...campaignForm, ctaText: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#16730F] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Button URL
              </label>
              <input
                type="url"
                readOnly
                value="https://bejite.com/"
                title="Outreach buttons always open the Bejite homepage"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                All outreach email buttons open https://bejite.com/
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailStep;
