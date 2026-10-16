export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_REQUIREMENTS =
  "Passwords must be at least 10 characters long and include at least one number, one special character, one uppercase letter, and one lowercase letter.";

export function isValidPassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9\s]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password)
  );
}
