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

export const APPLICATION_ATTENDANCE_OPTIONS: ApplicationSelectOption[] =
  ApplicationAttendanceType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance.value,
  }));

export const APPLICATION_EMPLOYMENT_OPTIONS: ApplicationSelectOption[] =
  ApplicationEmploymentType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance.value,
  }));
