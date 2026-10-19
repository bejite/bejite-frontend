export const PASSWORD_POLICY_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.";

export function isPasswordPolicyValid(password) {
  return PASSWORD_POLICY_REGEX.test(password);
}
