import type { DatatablePageQuery } from "@shared/types";

import { ContactSchema } from "@modules/contacts/domain/zod/contact.schema";
import {
  type ApplicationLinkedContact,
  type ContactAssociatedCompany,
  type ContactCreatePayload,
  type ContactUpdatePayload,
  type IContactRepository,
} from "@modules/contacts/repositories/ContactRepository";
import { mergeResolvedLocation } from "@shared/utils/geocoding";
import { parseWithSchema } from "@shared/utils/zodValidation";

/**
 * Implements contact service.
 */
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

  listAssociatedCompanies(
    contactId: string,
  ): Promise<ContactAssociatedCompany[]> {
    return this.repository.listAssociatedCompanies(contactId);
  }

  linkToApplication(applicationId: string, contactId: string): Promise<void> {
    return this.repository.linkToApplication(applicationId, contactId);
  }

  unlinkFromApplication(
    applicationId: string,
    contactId: string,
  ): Promise<void> {
    return this.repository.unlinkFromApplication(applicationId, contactId);
  }

  async create(payload: ContactCreatePayload) {
    parseWithSchema(
      ContactSchema.pick({
        fullName: true,
        type: true,
        locationText: true,
        locationLat: true,
        locationLng: true,
      }),
      payload,
    );

    return this.repository.create(await mergeResolvedLocation(payload));
  }

  async update(payload: ContactUpdatePayload) {
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
      parseWithSchema(
        ContactSchema.pick({
          fullName: true,
          type: true,
          locationText: true,
          locationLat: true,
          locationLng: true,
        }).partial(),
        validatePayload,
      );
    }

    if (payload.locationText === undefined) {
      return this.repository.update(payload);
    }

    return this.repository.update(await mergeResolvedLocation(payload));
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
