export default function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div
        className="animate-spin rounded-full h-10 w-10 border-2 border-[#1A3E32]/20 border-t-[#16730F]"
        role="status"
        aria-label="Loading page"
      />
    </div>
  );
}
