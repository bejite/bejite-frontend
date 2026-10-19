import {
  formatCandidateAvailabilityLabel,
  getCandidateAvailabilityColorClass,
} from '../../utils/candidateAvailability';

const AvailabilityStatusDot = ({
  availability,
  compact = false,
  className = '',
}) => {
  const label = formatCandidateAvailabilityLabel(availability);
  const colorClass = getCandidateAvailabilityColorClass(availability);

  return (
    <span
      className={`group/avail absolute ${className}`}
      title={label ? `Availability: ${label}` : undefined}
    >
      <span
        className={`block rounded-full border-2 border-white cursor-help ${
          compact ? 'w-3 h-3' : 'w-4 h-4'
        } ${colorClass}`}
        tabIndex={0}
        role="img"
        aria-label={label ? `Availability: ${label}` : 'Availability unknown'}
      />
      {label ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#1A3E32] text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/avail:opacity-100 group-focus-within/avail:opacity-100 transition-opacity z-20 shadow-lg">
          {label}
        </span>
      ) : null}
    </span>
  );
};

export default AvailabilityStatusDot;
