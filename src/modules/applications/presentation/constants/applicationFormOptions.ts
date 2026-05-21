import type { ApplicationSelectOption } from "@modules/applications/types/presentation";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "@modules/applications/types/enums";

export const APPLICATION_STATUS_OPTIONS: ApplicationSelectOption[] = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
];

export const APPLICATION_ATTENDANCE_OPTIONS: ApplicationSelectOption[] = [
  { label: "Remote", value: ApplicationAttendanceType.Remote },
  { label: "Hybrid", value: ApplicationAttendanceType.Hybrid },
  { label: "On-site", value: ApplicationAttendanceType.OnSite },
];

export const APPLICATION_EMPLOYMENT_OPTIONS: ApplicationSelectOption[] = [
  { label: "Full-time", value: ApplicationEmploymentType.FullTime },
  { label: "Part-time", value: ApplicationEmploymentType.PartTime },
  { label: "Contract", value: ApplicationEmploymentType.Contract },
  { label: "Internship", value: ApplicationEmploymentType.Internship },
  { label: "Volunteer", value: ApplicationEmploymentType.Volunteer },
];
