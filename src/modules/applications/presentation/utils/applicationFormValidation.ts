export function validateApplicationTitle(value: string): string {
  if (!value.trim()) {
    return "Title is required.";
  }

  return "";
}

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

export function validateApplicationSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null,
): string {
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
    return "Salary max must be greater than or equal to salary min.";
  }

  return "";
}

export function validateApplicationLatitude(value: number | null): string {
  if (value !== null && (value < -90 || value > 90)) {
    return "Latitude must be between -90 and 90.";
  }

  return "";
}

export function validateApplicationLongitude(value: number | null): string {
  if (value !== null && (value < -180 || value > 180)) {
    return "Longitude must be between -180 and 180.";
  }

  return "";
}
