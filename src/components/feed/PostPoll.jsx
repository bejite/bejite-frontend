import { useState } from "react";
import { toast } from "react-toastify";

export default function PostPoll({ poll, onVote, disabled = false }) {
  const [votingOptionId, setVotingOptionId] = useState(null);

  if (!poll) return null;

  const hasVoted = Boolean(poll.votedOptionId);
  const showResults = hasVoted || poll.isClosed;
  const totalVotes = poll.totalVotes || 0;

  const handleVote = async (optionId) => {
    if (!onVote || hasVoted || poll.isClosed || disabled || votingOptionId) return;

    try {
      setVotingOptionId(optionId);
      await onVote(optionId);
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || "Failed to submit vote";
      toast.error(message);
    } finally {
      setVotingOptionId(null);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[#16730F]/20 bg-[#F5F9F4] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-[#1A3E32]">{poll.question}</p>
        {poll.isClosed && (
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            Ended
          </span>
        )}
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const isSelected = poll.votedOptionId === option.id;
          const isVoting = votingOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option.id)}
              disabled={showResults || disabled || Boolean(votingOptionId)}
              className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-[#16730F] bg-white"
                  : "border-[#16730F]/20 bg-white hover:border-[#16730F]/50"
              } ${showResults ? "cursor-default" : "cursor-pointer"}`}
            >
              {showResults && (
                <span
                  className="absolute inset-y-0 left-0 bg-[#16730F]/15 transition-all duration-300"
                  style={{ width: `${option.percent}%` }}
                />
              )}
              <span className="relative z-10 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#1A3E32]">
                  {option.text}
                  {isVoting ? "..." : ""}
                </span>
                {showResults && (
                  <span className="shrink-0 text-xs font-semibold text-[#16730F]">
                    {option.percent}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        {totalVotes} vote{totalVotes === 1 ? "" : "s"}
        {!poll.isClosed && !hasVoted ? " · Tap an option to vote" : ""}
      </p>
    </div>
  );
}
