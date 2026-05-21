import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "@modules/applications/types/enums";
import { z } from "zod";

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
} from "./fields";

export const ApplicationSchema = z.object({
  id: UuidSchema,
  companyId: NullableUuidSchema,
  title: z.string().min(1),
  status: z.string().min(1),
  sourceUrl: NullableUrlSchema,
  appliedAt: NullableDateTimeSchema,
  locationText: NullableStringSchema,
  locationLat: NullableLatitudeSchema,
  locationLng: NullableLongitudeSchema,
  attendanceType: z
    .enum([
      ApplicationAttendanceType.Remote,
      ApplicationAttendanceType.Hybrid,
      ApplicationAttendanceType.OnSite,
    ])
    .nullable(),
  employmentType: z
    .enum([
      ApplicationEmploymentType.PartTime,
      ApplicationEmploymentType.Contract,
      ApplicationEmploymentType.Internship,
      ApplicationEmploymentType.FullTime,
      ApplicationEmploymentType.Volunteer,
    ])
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
    status: z.enum(
      [
        "saved",
        "applied",
        "phone-screening",
        "technical",
        "interview",
        "offer",
        "rejected",
      ],
      {
        errorMap: () => ({ message: "Invalid status" }),
      },
    ),
    sourceUrl: z.string().url("Invalid URL").nullable().or(z.literal("")),
    appliedAt: z.string().nullable().or(z.literal("")),
    locationText: z.string().nullable().or(z.literal("")),
    locationLat: NullableLatitudeSchema,
    locationLng: NullableLongitudeSchema,
    attendanceType: z
      .enum([
        ApplicationAttendanceType.Remote,
        ApplicationAttendanceType.Hybrid,
        ApplicationAttendanceType.OnSite,
      ])
      .nullable(),
    employmentType: z
      .enum([
        ApplicationEmploymentType.PartTime,
        ApplicationEmploymentType.Contract,
        ApplicationEmploymentType.Internship,
        ApplicationEmploymentType.FullTime,
        ApplicationEmploymentType.Volunteer,
      ])
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
