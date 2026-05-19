import {
  type TagCreatePayload,
  type TagRepository,
  type TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

export class TagService {
  constructor(private readonly repository: TagRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: TagCreatePayload) {
    if (!payload.name.trim()) {
      throw new Error("Tag name is required");
    }
    return this.repository.create({ ...payload, name: payload.name.trim() });
  }

  update(payload: TagUpdatePayload) {
    if (payload.name !== undefined && !payload.name.trim()) {
      throw new Error("Tag name cannot be empty");
    }
    return this.repository.update({ ...payload, name: payload.name?.trim() });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
