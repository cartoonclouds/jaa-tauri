import type {
  ApplicationAttendanceType as ApplicationAttendanceTypeValue,
  ApplicationEmploymentType as ApplicationEmploymentTypeValue,
  ApplicationStatus as ApplicationStatusValue,
} from "@modules/applications/types/enums";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationStatus,
} from "@modules/applications/types/enums";
import {
  DateTimeSchema,
  NullableDateTimeSchema,
  NullableLatitudeSchema,
  NullableLongitudeSchema,
  NullableNumberSchema,
  NullableStringSchema,
  NullableUrlSchema,
  NullableUuidSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

function isApplicationAttendanceType(
  value: unknown,
): value is ApplicationAttendanceTypeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string" &&
    ApplicationAttendanceType.values().some(
      (instance) => instance.value === value.value,
    )
  );
}

function isApplicationEmploymentType(
  value: unknown,
): value is ApplicationEmploymentTypeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string" &&
    ApplicationEmploymentType.values().some(
      (instance) => instance.value === value.value,
    )
  );
}

function isApplicationStatus(value: unknown): value is ApplicationStatusValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string" &&
    ApplicationStatus.values().some(
      (instance) => instance.value === value.value,
    )
  );
}

export const ApplicationSchema = z.object({
  id: UuidSchema,
  companyId: NullableUuidSchema,
  title: z.string().min(1),
  status: z.custom<ApplicationStatusValue>(
    isApplicationStatus,
    "Invalid status",
  ),
  sourceUrl: NullableUrlSchema,
  appliedAt: NullableDateTimeSchema,
  locationText: NullableStringSchema,
  locationLat: NullableLatitudeSchema,
  locationLng: NullableLongitudeSchema,
  attendanceType: z
    .custom<ApplicationAttendanceTypeValue>(
      isApplicationAttendanceType,
      "Invalid attendance type",
    )
    .nullable(),
  employmentType: z
    .custom<ApplicationEmploymentTypeValue>(
      isApplicationEmploymentType,
      "Invalid employment type",
    )
    .nullable(),
  salaryMin: NullableNumberSchema,
  salaryMax: NullableNumberSchema,
  currency: NullableStringSchema,
  description: NullableStringSchema,
  interviewProcess: NullableStringSchema,
  benefits: NullableStringSchema,
  priority: z.number(),
  isArchived: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateApplicationSchema = ApplicationSchema.pick({
  companyId: true,
  title: true,
  status: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
}).partial({
  status: true,
  companyId: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
});

export const ApplicationFormSchema = z
  .object({
    companyId: NullableUuidSchema,
    title: z.string().min(1, "Title is required"),
    status: z.custom<ApplicationStatusValue>(
      isApplicationStatus,
      "Invalid status",
    ),
    sourceUrl: z.string().url("Invalid URL").nullable().or(z.literal("")),
    appliedAt: z.string().nullable().or(z.literal("")),
    locationText: z.string().nullable().or(z.literal("")),
    locationLat: NullableLatitudeSchema,
    locationLng: NullableLongitudeSchema,
    attendanceType: z
      .custom<ApplicationAttendanceTypeValue>(
        isApplicationAttendanceType,
        "Invalid attendance type",
      )
      .nullable(),
    employmentType: z
      .custom<ApplicationEmploymentTypeValue>(
        isApplicationEmploymentType,
        "Invalid employment type",
      )
      .nullable(),
    salaryMin: z
      .number()
      .min(0, "Salary must be positive")
      .nullable()
      .or(z.undefined()),
    salaryMax: z
      .number()
      .min(0, "Salary must be positive")
      .nullable()
      .or(z.undefined()),
    currency: z.string().max(8).nullable().or(z.literal("")),
    description: z.string().nullable().or(z.literal("")),
    interviewProcess: z.string().nullable().or(z.literal("")),
    benefits: z.string().nullable().or(z.literal("")),
    priority: z
      .number()
      .min(1, "Priority must be between 1 and 5")
      .max(5, "Priority must be between 1 and 5"),
    isArchived: z.boolean(),
  })
  .refine(
    (data) =>
      !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax,
    {
      message: "Salary minimum cannot exceed maximum",
      path: ["salaryMax"],
    },
  );

export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
