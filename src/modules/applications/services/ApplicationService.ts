import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@modules/applications/domain/types/ApplicationType";
import type { DatabaseDriver } from "~/services/database/DatabaseDriver";

import { ApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";

export class ApplicationService {
  private readonly applications: ApplicationRepository;

  constructor(db: DatabaseDriver) {
    this.applications = new ApplicationRepository(db);
  }

  listApplications(): Promise<Application[]> {
    return this.applications.all();
  }

  getApplication(id: string): Promise<Application | null> {
    return this.applications.find(id);
  }

  createApplication(input: CreateApplicationInput): Promise<Application> {
    const companyNameSnapshot = input.companyNameSnapshot.trim();
    const jobTitle = input.jobTitle.trim();

    if (!companyNameSnapshot) {
      throw new Error("Company name is required");
    }

    if (!jobTitle) {
      throw new Error("Job title is required");
    }

    return this.applications.create({
      ...input,
      companyNameSnapshot,
      jobTitle,
    });
  }

  updateApplication(input: UpdateApplicationInput): Promise<Application> {
    if (
      input.companyNameSnapshot !== undefined &&
      !input.companyNameSnapshot.trim()
    ) {
      throw new Error("Company name cannot be empty");
    }

    if (input.jobTitle !== undefined && !input.jobTitle.trim()) {
      throw new Error("Job title cannot be empty");
    }

    return this.applications.update({
      ...input,
      companyNameSnapshot: input.companyNameSnapshot?.trim(),
      jobTitle: input.jobTitle?.trim(),
    });
  }

  deleteApplication(id: string): Promise<void> {
    return this.applications.delete(id);
  }
}
