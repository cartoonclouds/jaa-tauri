import {
  type ApplicationCreatePayload,
  type ApplicationRepository,
  type ApplicationUpdatePayload,
} from "@modules/applications/repositories/ApplicationRepository";

export class ApplicationService {
  constructor(private readonly repository: ApplicationRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: ApplicationCreatePayload) {
    const title = payload.title.trim();
    if (!title) {
      throw new Error("Application title is required");
    }

    return this.repository.create({ ...payload, title });
  }

  update(payload: ApplicationUpdatePayload) {
    if (payload.title !== undefined && !payload.title.trim()) {
      throw new Error("Application title cannot be empty");
    }

    return this.repository.update({
      ...payload,
      title: payload.title?.trim(),
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
