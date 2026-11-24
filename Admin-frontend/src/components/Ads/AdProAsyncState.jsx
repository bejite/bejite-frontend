import Loader from "../ui/Loader";

export function AdProLoadingSpinner() {
  return <Loader fullscreen={false} description="Loading campaign details..." />;
}

export function AdProErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function AdProNotFound({ message = "Campaign not found.", onBack }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 px-6 py-12 text-center">
      <p className="text-gray-600 mb-4">{message}</p>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-[#1A3E32] hover:underline"
        >
          Return to dashboard
        </button>
      )}
    </div>
  );
}
