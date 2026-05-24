import type { ApplicationSelectOption } from "@modules/applications/types/presentation";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/types/enums";

/** Select options used for application status fields. */
export const APPLICATION_STATUS_OPTIONS: ApplicationSelectOption<ApplicationStatus>[] =
  ApplicationStatus.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

/** Select options used for attendance type fields. */
export const APPLICATION_ATTENDANCE_OPTIONS: ApplicationSelectOption<ApplicationAttendanceType>[] =
  ApplicationAttendanceType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

/** Select options used for event flow status fields. */
export const APPLICATION_EVENT_FLOW_STATUS_OPTIONS: ApplicationSelectOption<ApplicationEventFlowStatus>[] =
  ApplicationEventFlowStatus.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

/** Select options used for employment type fields. */
export const APPLICATION_EMPLOYMENT_OPTIONS: ApplicationSelectOption<ApplicationEmploymentType>[] =
  ApplicationEmploymentType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));
