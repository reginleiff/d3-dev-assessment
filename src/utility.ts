/**
 * isValidEmail validates an email string.
 * {@link https://www.regular-expressions.info/email.html}
 * @param email to be validated
 */
export const isValidEmail = (email: string) => {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length == 0) return false;
  const lower = trimmed.toLowerCase();
  const emailRegex = /\b[a-z0-9._%+-]{3,255}@[a-z0-9.-]+.[a-z]{2,}\b/;
  return emailRegex.test(lower);
};

/**
 * areValidEmails check if all of the provided emails are valid.
 * @param emails to be validated
 */
export const areValidEmails = (emails: string[]) =>
  emails.reduce((valid, email) => (valid ? isValidEmail(email) : valid), true);

/**
 * parseTaggedEmails parses a message to extract emails tagged with @.
 * @param message to parse
 */
export const parseTaggedEmails = (message: string): string[] => {
  const splitted: string[] = message.split(/\s+@|\s+/);
  return splitted.reduce((emails: string[], section: string) => {
    const trimmed = section.trim();
    if (isValidEmail(trimmed)) {
      emails.push(trimmed);
    }
    return emails;
  }, []);
};

export default {
  areValidEmails,
  isValidEmail,
  parseTaggedEmails,
};
