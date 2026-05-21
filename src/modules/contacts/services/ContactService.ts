import {
  type ContactCreatePayload,
  type ContactUpdatePayload,
  type IContactRepository,
} from "@modules/contacts/repositories/ContactRepository";
import { ContactSchema } from "@shared/domain/zod/contact.schema";

export class ContactService {
  constructor(private readonly repository: IContactRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: ContactCreatePayload) {
    const result = ContactSchema.pick({ fullName: true, type: true }).safeParse(
      payload,
    );
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return this.repository.create(payload);
  }

  update(payload: ContactUpdatePayload) {
    if (payload.fullName !== undefined || payload.type !== undefined) {
      const validatePayload = {
        fullName: payload.fullName,
        type: payload.type,
      };
      const result = ContactSchema.pick({ fullName: true, type: true })
        .partial()
        .safeParse(validatePayload);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }
    }
    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
