/**
 * Build a single full-name string from User firstName/lastName columns.
 * Handles legacy rows where the entire name was stored only in firstName.
 */
export function formatRecruiterFullName(firstName, lastName) {
  const first = String(firstName ?? "").trim();
  const last = String(lastName ?? "").trim();

  if (!first && !last) return "";
  if (!last) return first;
  if (!first) return last;

  if (first.endsWith(last)) {
    return first;
  }

  return `${first} ${last}`.trim();
}

/**
 * Split a full name into first / last for auth storage.
 */
export function splitRecruiterFullName(fullName) {
  const trimmed = String(fullName ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, spaceIdx).trim(),
    lastName: trimmed.slice(spaceIdx + 1).trim(),
  };
}
