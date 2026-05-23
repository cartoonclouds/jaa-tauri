import type { ApplicationSelectOption } from "@modules/applications/types/presentation";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationStatus,
} from "@modules/applications/types/enums";

export const APPLICATION_STATUS_OPTIONS: ApplicationSelectOption<ApplicationStatus>[] =
  ApplicationStatus.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

export const APPLICATION_ATTENDANCE_OPTIONS: ApplicationSelectOption<ApplicationAttendanceType>[] =
  ApplicationAttendanceType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

export const APPLICATION_EMPLOYMENT_OPTIONS: ApplicationSelectOption<ApplicationEmploymentType>[] =
  ApplicationEmploymentType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));
