import { AlertTriangle } from "lucide-react";

const DeleteCampaignConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleIn text-center border border-gray-100">
        <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-lg">Confirm Campaign Deletion</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this campaign historical record?
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-red-700 transition-colors"
          >
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCampaignConfirmModal;
