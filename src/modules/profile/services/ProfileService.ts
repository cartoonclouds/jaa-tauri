import type { DatatablePageQuery } from "@shared/types";

import { ProfileSchema } from "@modules/profile/domain/zod/profile.schema";
import {
  type IProfileRepository,
  type ProfileCreatePayload,
  type ProfileUpdatePayload,
} from "@modules/profile/repositories/ProfileRepository";

const ProfileNameSchema = ProfileSchema.pick({ fullName: true });

/**
 * Implements profile service.
 */
export class ProfileService {
  constructor(private readonly repository: IProfileRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  create(payload: ProfileCreatePayload) {
    const parsedFullName = ProfileNameSchema.safeParse({
      fullName: payload.fullName.trim(),
    });

    if (!parsedFullName.success) {
      throw new Error(
        parsedFullName.error.issues[0]?.message ?? "Invalid profile full name",
      );
    }

    return this.repository.create({
      ...payload,
      fullName: parsedFullName.data.fullName,
    });
  }

  update(payload: ProfileUpdatePayload) {
    let fullName = payload.fullName;

    if (fullName !== undefined) {
      const parsedFullName = ProfileNameSchema.safeParse({
        fullName: fullName.trim(),
      });

      if (!parsedFullName.success) {
        throw new Error(
          parsedFullName.error.issues[0]?.message ??
            "Invalid profile full name",
        );
      }

      fullName = parsedFullName.data.fullName;
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








