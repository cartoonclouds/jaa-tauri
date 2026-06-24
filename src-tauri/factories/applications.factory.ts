import { faker } from "@faker-js/faker";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "../../src/modules/applications/domain/enums/ApplicationEnums.ts";
import { createLondonLocationSeed } from "./location.factory";

export interface ApplicationRow {
  id: string;
  company_id: string;
  title: string;
  url: string | null;
  applied_at: string;
  location_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  attendance_type: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description: string | null;
  interview_process: string | null;
  benefits: string | null;
  priority: number;
  is_archived: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ApplicationLifecycleProfile {
  isArchived: number;
  priorityRange: {
    min: number;
    max: number;
  };
}

const APPLICATION_LIFECYCLE_PROFILES: ApplicationLifecycleProfile[] = [
  {
    isArchived: 0,
    priorityRange: { min: 1, max: 2 },
  },
  {
    isArchived: 0,
    priorityRange: { min: 2, max: 3 },
  },
  {
    isArchived: 0,
    priorityRange: { min: 3, max: 4 },
  },
  {
    isArchived: 0,
    priorityRange: { min: 3, max: 5 },
  },
  {
    isArchived: 0,
    priorityRange: { min: 3, max: 4 },
  },
  {
    isArchived: 0,
    priorityRange: { min: 4, max: 5 },
  },
  {
    isArchived: 1,
    priorityRange: { min: 1, max: 2 },
  },
];

export function createApplicationRows(
  companyIds: string[],
  applicationsPerCompany = 2,
  seed = 1200,
): ApplicationRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return companyIds.flatMap((companyId, companyIndex) =>
    Array.from({ length: applicationsPerCompany }, (_, index) => {
      faker.seed(seed + companyIndex * 100 + index);
      const createdAt = faker.date.recent({ days: 60 });
      const salaryMin = faker.number.int({ min: 30000, max: 90000 });
      const salaryMax =
        salaryMin + faker.number.int({ min: 10000, max: 30000 });
      const lifecycle =
        APPLICATION_LIFECYCLE_PROFILES[
          (companyIndex * applicationsPerCompany + index) %
            APPLICATION_LIFECYCLE_PROFILES.length
        ] ?? APPLICATION_LIFECYCLE_PROFILES[0];

      const location = createLondonLocationSeed();

      return {
        id: faker.string.uuid(),
        company_id: companyId,
        title: faker.person.jobTitle(),
        url: faker.internet.url(),
        applied_at: createdAt.toISOString(),
        location_text: location.locationText,
        location_lat: location.locationLat,
        location_lng: location.locationLng,
        attendance_type: faker.helpers
          .arrayElement([
            ApplicationAttendanceType.Remote,
            ApplicationAttendanceType.Hybrid,
            ApplicationAttendanceType.OnSite,
          ])
          .toString(),
        employment_type: faker.helpers
          .arrayElement([
            ApplicationEmploymentType.PartTime,
            ApplicationEmploymentType.Contract,
            ApplicationEmploymentType.Internship,
            ApplicationEmploymentType.FullTime,
            ApplicationEmploymentType.Volunteer,
          ])
          .toString(),
        salary_min: salaryMin,
        salary_max: salaryMax,
        currency: "GBP",
        description: faker.lorem.paragraph(),
        interview_process: faker.lorem.sentence(),
        benefits: faker.lorem.sentence(),
        priority: faker.number.int(lifecycle.priorityRange),
        is_archived: lifecycle.isArchived,
        deleted_at: null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      };
    }),
  );
}
