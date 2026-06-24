/**
 * Formats a profile name by capitalizing the first letter
 * of the first name and first letter of the last name.
 *
 * @param {string} name - The name to format.
 * @returns {string} - The formatted name.
 */
export function formatProfileName(name: string): string {
  const formattedName = name
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

  const firstName = formattedName[0];
  const lastName = formattedName[1];

  if (!firstName) {
    return "there";
  }

  if (!lastName) {
    return firstName;
  }

  return `${firstName} ${lastName.slice(0, 1)}.`;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} value - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export function ucfirst(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param {string} value - The string to capitalize.
 * @returns {string} - The string with each word capitalized.
 */
export function ucwords(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return value
    .split(" ")
    .map((word) => ucfirst(word))
    .join(" ");
}
