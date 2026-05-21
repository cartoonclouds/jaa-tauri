export const ApplicationAttendanceType = Object.freeze({
  Remote: "remote",
  Hybrid: "hybrid",
  OnSite: "on-site",
} as const);

export type ApplicationAttendanceType =
  (typeof ApplicationAttendanceType)[keyof typeof ApplicationAttendanceType];

export const ApplicationEmploymentType = Object.freeze({
  PartTime: "part-time",
  Contract: "contract",
  Internship: "internship",
  FullTime: "full-time",
  Volunteer: "volunteer",
} as const);

export type ApplicationEmploymentType =
  (typeof ApplicationEmploymentType)[keyof typeof ApplicationEmploymentType];
