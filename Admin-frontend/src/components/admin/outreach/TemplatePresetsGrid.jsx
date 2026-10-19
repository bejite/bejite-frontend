import { Plus, ArrowRight, Check, Edit } from "lucide-react";

const TemplatePresetsGrid = ({
  templates = [],
  onSelectTemplate = () => {},
  onCreateTemplateCustomization = () => {},
  onEditTemplate = () => {},
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-lg font-bold text-gray-900">
            Reusable Template Presets
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Quickly instantiate campaign drafts using optimized layout presets.
          </p>
        </div>

        <button
          onClick={() => onCreateTemplateCustomization()}
          className="bg-[#16730F] hover:bg-green-700 text-white text-sm font-semibold shadow-sm px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus size={16} />
          Create New Custom Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl p-6 border border-gray-155 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-[#16730F]/10 text-[#16730F] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {tpl.category}
                </span>
                <span className="text-gray-300 text-xs font-mono font-medium">
                  #{tpl.id}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-1.5">
                {tpl.name}
              </h3>
              <p className="text-xs text-gray-400 font-medium line-clamp-1 mb-3">
                Subj: {tpl.subject}
              </p>

              <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 border border-gray-100 line-clamp-4 font-sans leading-relaxed whitespace-pre-line">
                {tpl.body}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
              {tpl.ctaText ? (
                <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 truncate max-w-[120px]">
                  <Check size={12} className="text-green-500 shrink-0" />
                  CTA: {tpl.ctaText}
                </span>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => onEditTemplate(tpl)}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                  title="Edit Template Configuration"
                >
                  <Edit size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  className="bg-[#16730F]/10 hover:bg-[#16730F] text-[#16730F] hover:text-white transition-all text-xs font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <ArrowRight size={14} />
                  Load Preset
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatePresetsGrid;
