import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  SemanticDocumentInput,
  SemanticSearchServiceContract,
} from "@modules/search";

import { buildApplicationSemanticContent } from "@modules/applications/application/utils/buildApplicationSemanticContent";
import { toNullableString } from "@shared/utils/database-mapping/mapperValueUtils";

const APPLICATIONS_SEMANTIC_MODULE_KEY = "applications";
const APPLICATION_ENTITY_TYPE = "application";

/**
 * Rendered semantic search result for applications.
 */
export interface ApplicationSemanticSearchResult {
  applicationId: string;
  title: string;
  content: string;
  companyName: string | null;
  similarity: number;
  distance: number;
}

interface ApplicationSemanticSearchDependencies {
  semanticSearchService: SemanticSearchServiceContract;
  loadApplications: () => Promise<Application[]>;
  loadCompanies: () => Promise<{ id: string; name: string }[]>;
}

/**
 * Module adapter that indexes and searches applications semantically.
 */
export class ApplicationSemanticSearchService {
  constructor(
    private readonly dependencies: ApplicationSemanticSearchDependencies,
  ) {}

  async rebuildIndex(): Promise<void> {
    const [applications, companies] = await Promise.all([
      this.dependencies.loadApplications(),
      this.dependencies.loadCompanies(),
    ]);

    const companyNameById = new Map(
      companies.map((company) => [company.id, company.name]),
    );

    const documents: SemanticDocumentInput[] = applications.map(
      (application) => {
        const companyName = application.companyId
          ? (companyNameById.get(application.companyId) ?? null)
          : null;

        return {
          moduleKey: APPLICATIONS_SEMANTIC_MODULE_KEY,
          entityType: APPLICATION_ENTITY_TYPE,
          entityId: application.id,
          title: application.title,
          content: buildApplicationSemanticContent({
            application,
            companyName,
          }),
          metadata: {
            companyName,
            status: String(application.status),
            eventFlowStatus: String(application.eventFlowStatus),
          },
        };
      },
    );

    await this.dependencies.semanticSearchService.upsertDocuments(documents);
  }

  removeFromIndex(applicationId: string): Promise<void> {
    return this.dependencies.semanticSearchService.removeDocumentByEntity({
      moduleKey: APPLICATIONS_SEMANTIC_MODULE_KEY,
      entityType: APPLICATION_ENTITY_TYPE,
      entityId: applicationId,
    });
  }

  async searchByQuery(
    query: string,
    options?: { limit?: number; excludeApplicationId?: string },
  ): Promise<ApplicationSemanticSearchResult[]> {
    const matches = await this.dependencies.semanticSearchService.search({
      moduleKey: APPLICATIONS_SEMANTIC_MODULE_KEY,
      entityTypes: [APPLICATION_ENTITY_TYPE],
      query,
      limit: options?.limit ?? 10,
    });

    return matches
      .filter((match) => match.entityId !== options?.excludeApplicationId)
      .map((match) => ({
        applicationId: match.entityId,
        title: match.title,
        content: match.content,
        companyName: toNullableString(match.metadata?.companyName),
        similarity: match.similarity,
        distance: match.distance,
      }));
  }

  async searchSimilarToApplication(
    applicationId: string,
    options?: { limit?: number },
  ): Promise<ApplicationSemanticSearchResult[]> {
    const applications = await this.dependencies.loadApplications();
    const target = applications.find(
      (application) => application.id === applicationId,
    );
    if (!target) {
      return [];
    }

    const companies = await this.dependencies.loadCompanies();
    const companyName = target.companyId
      ? (companies.find((entry) => entry.id === target.companyId)?.name ?? null)
      : null;
    const query = buildApplicationSemanticContent({
      application: target,
      companyName,
    });

    return this.searchByQuery(query, {
      limit: options?.limit ?? 5,
      excludeApplicationId: target.id,
    });
  }
}
