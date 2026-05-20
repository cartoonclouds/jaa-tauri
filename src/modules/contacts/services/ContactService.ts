import {
  type ContactCreatePayload,
  type ContactUpdatePayload,
  type IContactRepository,
} from "@modules/contacts/repositories/ContactRepository";

export class ContactService {
  constructor(private readonly repository: IContactRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: ContactCreatePayload) {
    if (!payload.fullName.trim()) {
      throw new Error("Contact full name is required");
    }
    return this.repository.create({
      ...payload,
      fullName: payload.fullName.trim(),
    });
  }

  update(payload: ContactUpdatePayload) {
    if (payload.fullName !== undefined && !payload.fullName.trim()) {
      throw new Error("Contact full name cannot be empty");
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
