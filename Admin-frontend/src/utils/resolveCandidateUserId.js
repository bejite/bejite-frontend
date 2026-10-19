/**
 * Resolve the auth User id for a candidate row (connections use User.id, not candidates.id).
 */
export function resolveCandidateUserId(candidateOrRow) {
  if (!candidateOrRow) return null;
  const raw =
    candidateOrRow.user_id ??
    candidateOrRow.userId ??
    candidateOrRow.user?.id ??
    null;
  if (raw == null || raw === "") return null;
  return String(raw);
}
