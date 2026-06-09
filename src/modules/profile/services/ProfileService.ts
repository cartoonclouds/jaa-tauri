import type { DatatablePageQuery } from "@shared/types";

import { ProfileSchema } from "@modules/profile/domain/zod/profile.schema";
import {
  type IProfileRepository,
  type ProfileCreatePayload,
  type ProfileUpdatePayload,
} from "@modules/profile/types";
import { parseTrimmedWithSchema } from "@shared/utils/zodValidation";

const ProfileNameSchema = ProfileSchema.pick({ fullName: true });

/**
 * Implements profile service.
 */
export class ProfileService {
  constructor(private readonly repository: IProfileRepository) {}

  async getProfile() {
    return (await this.repository.list())[0];
  }

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  create(payload: ProfileCreatePayload) {
    const parsedFullName = parseTrimmedWithSchema(
      ProfileNameSchema,
      {
        fullName: payload.fullName,
      },
      ["fullName"],
      {
        fallbackMessage: "Invalid profile full name",
        useFirstIssueMessage: true,
      },
    );

    return this.repository.create({
      ...payload,
      fullName: parsedFullName.fullName,
    });
  }

  update(payload: ProfileUpdatePayload) {
    let fullName = payload.fullName;

    if (fullName !== undefined) {
      const parsedFullName = parseTrimmedWithSchema(
        ProfileNameSchema,
        {
          fullName,
        },
        ["fullName"],
        {
          fallbackMessage: "Invalid profile full name",
          useFirstIssueMessage: true,
        },
      );

      fullName = parsedFullName.fullName;
    }

    return this.repository.update({
      ...payload,
      fullName,
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
