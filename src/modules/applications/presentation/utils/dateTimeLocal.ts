export function formatDateTimeLocalValue(value: Date | null): string {
  if (!value) {
    return "";
  }

  const year = String(value.getFullYear());
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function parseDateTimeLocalValue(value: string): Date | null {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const dateParts = datePart.split("-");
  const timeParts = timePart.split(":");
  if (dateParts.length !== 3 || timeParts.length < 2) {
    return null;
  }

  const [yearPart = "", monthPart = "", dayPart = ""] = dateParts;
  const [hourPart = "", minutePart = ""] = timeParts;

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
