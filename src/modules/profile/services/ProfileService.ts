import {
  type ProfileCreatePayload,
  type ProfileRepository,
  type ProfileUpdatePayload,
} from "@modules/profile/repositories/ProfileRepository";

export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: ProfileCreatePayload) {
    if (!payload.fullName.trim()) {
      throw new Error("Profile full name is required");
    }
    return this.repository.create({
      ...payload,
      fullName: payload.fullName.trim(),
    });
  }

  update(payload: ProfileUpdatePayload) {
    if (payload.fullName !== undefined && !payload.fullName.trim()) {
      throw new Error("Profile full name cannot be empty");
    }
    return this.repository.update({
      ...payload,
      fullName: payload.fullName?.trim(),
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
