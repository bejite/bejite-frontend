import { FileText, Trash2 } from "lucide-react";

const AttachmentsList = ({ attachments = [], onRemove = () => {} }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left space-y-3 shadow-inner">
      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
        File Attachments ({attachments.length}):
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {attachments.map((doc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={18} className="text-red-500 shrink-0" />
              <div className="min-w-0">
                <p
                  className="text-xs font-bold text-gray-800 truncate"
                  title={doc.name}
                >
                  {doc.name}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">
                  {doc.size} • Attached
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
              title="Remove Attachment"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentsList;
