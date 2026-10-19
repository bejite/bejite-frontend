export default function ChatDaySeparator({ label }) {
  if (!label) return null;

  return (
    <div
      className="sticky top-0 z-20 flex justify-center py-2 pointer-events-none"
      role="separator"
      aria-label={label}
    >
      <span
        data-chat-day={label}
        className="rounded-full bg-[#E8E8E8]/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#1A3E32] shadow-sm backdrop-blur-[2px]"
      >
        {label}
      </span>
    </div>
  );
}
