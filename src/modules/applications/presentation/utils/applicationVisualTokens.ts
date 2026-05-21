/**
 * Resolve the Tailwind classes used to render an application status badge.
 */
export function getApplicationStatusClass(
  status: string | undefined | null,
): string {
  if (!status) {
    return "bg-slate-100 text-slate-800 ring-slate-200";
  }
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "applied") {
    return "bg-blue-100 text-blue-800 ring-blue-200";
  }

  if (normalizedStatus === "interview") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (normalizedStatus === "offer") {
    return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }

  if (normalizedStatus === "rejected") {
    return "bg-rose-100 text-rose-800 ring-rose-200";
  }

  return "bg-slate-100 text-slate-800 ring-slate-200";
}

/**
 * Format a raw status value into a display label.
 */
export function formatApplicationStatusLabel(
  status: string | undefined | null,
): string {
  if (!status) {
    return "Unknown";
  }
  const trimmedStatus = status.trim();
  if (!trimmedStatus) {
    return "Unknown";
  }

  return trimmedStatus.charAt(0).toUpperCase() + trimmedStatus.slice(1);
}

/**
 * Resolve the Tailwind classes used to render application priority.
 */
export function getApplicationPriorityClass(priority: number): string {
  if (priority >= 5) {
    return "bg-rose-100 text-rose-800 ring-rose-200";
  }

  if (priority >= 4) {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (priority >= 3) {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  return "bg-slate-100 text-slate-800 ring-slate-200";
}

/**
 * Resolve the Tailwind classes used to render the archived state.
 */
export function getApplicationArchivedClass(isArchived: boolean): string {
  if (isArchived) {
    return "bg-zinc-200 text-zinc-800 ring-zinc-300";
  }

  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}
