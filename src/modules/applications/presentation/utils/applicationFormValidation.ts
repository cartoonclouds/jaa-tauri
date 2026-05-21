/**
 * Validate the application title field.
 */
export function validateApplicationTitle(value: string): string {
  if (!value.trim()) {
    return "Title is required.";
  }

  return "";
}

/**
 * Validate the optional source URL field.
 */
export function validateApplicationSourceUrl(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    if (!parsedUrl.protocol.startsWith("http")) {
      return "Source URL must use http or https.";
    }
  } catch {
    return "Source URL must be a valid URL.";
  }

  return "";
}

/**
 * Validate the relationship between minimum and maximum salary values.
 */
export function validateApplicationSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null,
): string {
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
    return "Salary max must be greater than or equal to salary min.";
  }

  return "";
}

/**
 * Validate latitude values used by the application form.
 */
export function validateApplicationLatitude(value: number | null): string {
  if (value !== null && (value < -90 || value > 90)) {
    return "Latitude must be between -90 and 90.";
  }

  return "";
}

/**
 * Validate longitude values used by the application form.
 */
export function validateApplicationLongitude(value: number | null): string {
  if (value !== null && (value < -180 || value > 180)) {
    return "Longitude must be between -180 and 180.";
  }

  return "";
}
