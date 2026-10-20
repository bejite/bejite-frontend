export function userIsRecruiter(userOrRole) {
  const role =
    typeof userOrRole === "string"
      ? userOrRole
      : userOrRole?.role ?? userOrRole?.author_role ?? null;
  const normalized = String(role ?? "").toLowerCase();
  return normalized === "recruiter" || normalized === "employer";
}
