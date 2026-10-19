import { Edit3, X, Save } from "lucide-react";
import RecruiterSelect from "../RecruiterSelect";

const TemplateEditorModal = ({
  isOpen,
  onClose,
  templateForm,
  setTemplateForm,
  onSubmit,
  editingTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleIn text-left border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
            <Edit3 size={18} className="text-[#16730F]" />
            {editingTemplateId ? "Edit Layout Template" : "Save New Template Preset"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          <div>
            <RecruiterSelect
              label="Template Category"
              name="category"
              value={templateForm.category}
              onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
              options={[
                { value: "Job Alert", label: "Job Alert" },
                { value: "Employer Outreach", label: "Employer Outreach" },
                { value: "Newsletter", label: "Newsletter" },
                { value: "Engagement", label: "Engagement" },
              ]}
              placeholder="Select Category"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Template Preset Title
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly Health Opportunities Alert"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#16730F] text-gray-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Subject Line Header
            </label>
            <input
              type="text"
              placeholder="e.g. New {Profession} jobs matching your bio!"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#16730F] text-gray-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Email Message Body Layout
            </label>
            <textarea
              rows="6"
              placeholder="Dear {First Name},&#10;&#10;Here are the top openings for {Profession}..."
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#16730F] text-gray-900 font-medium leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                CTA Button Label
              </label>
              <input
                type="text"
                placeholder="e.g. Apply Now"
                value={templateForm.ctaText}
                onChange={(e) => setTemplateForm({ ...templateForm, ctaText: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#16730F]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                CTA Button URL Link
              </label>
              <input
                type="text"
                readOnly
                value="https://bejite.com/"
                title="Outreach buttons always open the Bejite homepage"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#16730F] hover:bg-green-700 text-white text-xs font-bold rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              {editingTemplateId ? "Save Changes" : "Save Template Preset"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TemplateEditorModal;
