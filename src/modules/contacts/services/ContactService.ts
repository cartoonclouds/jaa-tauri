import type { DatatablePageQuery } from "@shared/types";

import { ContactSchema } from "@modules/contacts/domain/zod/contact.schema";
import {
  type ApplicationLinkedContact,
  type ContactCreatePayload,
  type ContactUpdatePayload,
  type IContactRepository,
} from "@modules/contacts/repositories/ContactRepository";

export class ContactService {
  constructor(private readonly repository: IContactRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedContact[]> {
    return this.repository.listByApplicationId(applicationId);
  }

  create(payload: ContactCreatePayload) {
    const result = ContactSchema.pick({
      fullName: true,
      type: true,
      locationText: true,
      locationLat: true,
      locationLng: true,
    }).safeParse(payload);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return this.repository.create(payload);
  }

  update(payload: ContactUpdatePayload) {
    if (
      payload.fullName !== undefined ||
      payload.type !== undefined ||
      payload.locationText !== undefined ||
      payload.locationLat !== undefined ||
      payload.locationLng !== undefined
    ) {
      const validatePayload = {
        fullName: payload.fullName,
        type: payload.type,
        locationText: payload.locationText,
        locationLat: payload.locationLat,
        locationLng: payload.locationLng,
      };
      const result = ContactSchema.pick({
        fullName: true,
        type: true,
        locationText: true,
        locationLat: true,
        locationLng: true,
      })
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
