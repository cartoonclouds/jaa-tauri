import type {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationStatus,
} from "@modules/applications/types/enums";

/**
 * Resolve the Tailwind classes used to render an application status badge.
 */
export function getApplicationStatusClass(
  status: ApplicationStatus | undefined | null,
): string {
  if (!status) {
    return "bg-slate-100 text-slate-800 ring-slate-200";
  }
  const normalizedStatus = status.value;

  if (normalizedStatus === "applied") {
    return "bg-blue-100 text-blue-800 ring-blue-200";
  }

  if (normalizedStatus === "phone-screening") {
    return "bg-cyan-100 text-cyan-800 ring-cyan-200";
  }

  if (normalizedStatus === "technical") {
    return "bg-violet-100 text-violet-800 ring-violet-200";
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
  status: ApplicationStatus | undefined | null,
): string {
  if (!status) {
    return "Unknown";
  }

  return status.toLabel();
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

/**
 * Resolve the Tailwind classes used to render attendance type badges.
 */
export function getApplicationAttendanceTypeClass(
  attendanceType: ApplicationAttendanceType | null | undefined,
): string {
  if (!attendanceType) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  if (attendanceType.value === "remote") {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  if (attendanceType.value === "hybrid") {
    return "bg-violet-100 text-violet-800 ring-violet-200";
  }

  if (attendanceType.value === "on-site") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

/**
 * Resolve the Tailwind classes used to render employment type badges.
 */
export function getApplicationEmploymentTypeClass(
  employmentType: ApplicationEmploymentType | null | undefined,
): string {
  if (!employmentType) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  if (employmentType.value === "full-time") {
    return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }

  if (employmentType.value === "part-time") {
    return "bg-indigo-100 text-indigo-800 ring-indigo-200";
  }

  if (employmentType.value === "contract") {
    return "bg-orange-100 text-orange-800 ring-orange-200";
  }

  if (employmentType.value === "internship") {
    return "bg-cyan-100 text-cyan-800 ring-cyan-200";
  }

  if (employmentType.value === "volunteer") {
    return "bg-lime-100 text-lime-800 ring-lime-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

/**
 * Format attendance type values into a display label.
 */
export function formatApplicationAttendanceTypeLabel(
  attendanceType: ApplicationAttendanceType | null | undefined,
): string {
  if (!attendanceType) {
    return "-";
  }

  return attendanceType.toLabel();
}

/**
 * Format employment type values into a display label.
 */
export function formatApplicationEmploymentTypeLabel(
  employmentType: ApplicationEmploymentType | null | undefined,
): string {
  if (!employmentType) {
    return "-";
  }

  return employmentType.toLabel();
}



