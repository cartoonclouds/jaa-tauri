import type {
  ApplicationAttendanceType as ApplicationAttendanceTypeValue,
  ApplicationEmploymentType as ApplicationEmploymentTypeValue,
  ApplicationEventFlowStatus as ApplicationEventFlowStatusValue,
  ApplicationStatus as ApplicationStatusValue,
} from "@modules/applications/types/enums";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
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

/**
 * Type guard for `ApplicationAttendanceType` enum instances.
 */
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

/**
 * Type guard for `ApplicationEmploymentType` enum instances.
 */
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

/**
 * Type guard for `ApplicationStatus` enum instances.
 */
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

/**
 * Type guard for `ApplicationEventFlowStatus` enum instances.
 */
function isApplicationEventFlowStatus(
  value: unknown,
): value is ApplicationEventFlowStatusValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string" &&
    ApplicationEventFlowStatus.values().some(
      (instance) => instance.value === value.value,
    )
  );
}

/** Runtime schema for persisted application entities. */
export const ApplicationSchema = z.object({
  id: UuidSchema,
  companyId: NullableUuidSchema,
  title: z.string().min(1),
  status: z.custom<ApplicationStatusValue>(
    isApplicationStatus,
    "Invalid status",
  ),
  eventFlowStatus: z.custom<ApplicationEventFlowStatusValue>(
    isApplicationEventFlowStatus,
    "Invalid event flow status",
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
  tagIds: z.array(UuidSchema),
  priority: z.number(),
  isArchived: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

/** Runtime schema for creating applications from external input. */
export const CreateApplicationSchema = ApplicationSchema.pick({
  companyId: true,
  title: true,
  status: true,
  eventFlowStatus: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
}).partial({
  status: true,
  eventFlowStatus: true,
  companyId: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
});

/** Repository create payload schema for application inserts. */
export const ApplicationRepositoryCreateSchema = CreateApplicationSchema;

/** Runtime schema for application form validation. */
export const ApplicationFormSchema = z
  .object({
    companyId: NullableUuidSchema,
    title: z.string().min(1, "Title is required"),
    status: z.custom<ApplicationStatusValue>(
      isApplicationStatus,
      "Invalid status",
    ),
    eventFlowStatus: z.custom<ApplicationEventFlowStatusValue>(
      isApplicationEventFlowStatus,
      "Invalid event flow status",
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
    tagIds: z.array(UuidSchema),
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

/**
 * Inferred domain entity shape for persisted applications.
 */
export type Application = z.infer<typeof ApplicationSchema>;
/**
 * Inferred input shape for creating a new application.
 */
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
