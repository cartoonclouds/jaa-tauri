import type { ApplicationFormValues } from "@modules/applications/types";

import { ApplicationStatus } from "@modules/applications/domain/enums/ApplicationEnums";

/**
 * Build the default empty application form values.
 */
export function createEmptyApplicationFormValues(): ApplicationFormValues {
  return {
    companyId: null,
    title: "",
    status: ApplicationStatus.Saved,
    url: "",
    appliedAt: "",
    locationText: "",
    locationLat: null,
    locationLng: null,
    attendanceType: null,
    employmentType: null,
    salaryMin: null,
    salaryMax: null,
    currency: "",
    description: "",
    interviewProcess: "",
    benefits: "",
    tagIds: [],
    priority: 3,
    isArchived: false,
  };
}
