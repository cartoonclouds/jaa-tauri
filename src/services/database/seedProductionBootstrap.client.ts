import type { DatabaseDriver } from "./DatabaseDriver";
import type { SemanticDocumentInput } from "@modules/search/types.semantic";

import { INSIGHT_METRIC_IDS } from "@modules/insights/domain/constants/insightMetricIds";
import { SemanticSearchRepository } from "@modules/search/repositories/SemanticSearchRepository";
import { DeterministicEmbeddingProvider } from "@modules/search/services/DeterministicEmbeddingProvider";
import {
  buildLocationRecords,
  buildLocationSemanticSummary,
  joinSearchContent,
  toSearchText,
} from "@modules/search/utils/searchUtils";
import { TAG_MODEL_TYPES } from "@modules/tags/domain/enums/TagModelType";

interface ProductionTagSeed {
  id: string;
  name: string;
  color: string;
  modelType: string;
}

interface TagNameRow {
  id: string;
}

interface CountRow {
  count: number;
}

interface SettingsSemanticConfigRow {
  semantic_embedding_model: string | null;
  semantic_embedding_dimensions: number | null;
  semantic_enable_sqlite_vec: number | boolean | null;
}

interface ApplicationSemanticSourceRow {
  id: string;
  title: string;
  status: string | null;
  event_flow_status: string | null;
  location_text: string | null;
  description: string | null;
  interview_process: string | null;
  benefits: string | null;
  company_id: string | null;
}

interface ContactSemanticSourceRow {
  id: string;
  full_name: string;
  type: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location_text: string | null;
  notes: string | null;
}

interface CompanySemanticSourceRow {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  location_text: string | null;
  notes: string | null;
}

const APP_SETTINGS_ID = "app-settings";
const DEFAULT_SEMANTIC_MODEL = "bge-small-en";
const DEFAULT_SEMANTIC_DIMENSIONS = 384;

const PRODUCTION_TAG_SEEDS: readonly ProductionTagSeed[] = [
  {
    id: "90dd3dca-f0e2-49f8-9475-0f636e5c2bd1",
    name: "urgent",
    color: "rgb(220, 38, 38)",
    modelType: TAG_MODEL_TYPES.general,
  },
  {
    id: "c354a4cb-e36b-4260-870d-a70cdb35258d",
    name: "follow-up",
    color: "rgb(37, 99, 235)",
    modelType: TAG_MODEL_TYPES.general,
  },
  {
    id: "b1a2e3f4-0001-4000-8000-000000000001",
    name: "important",
    color: "rgb(234, 88, 12)",
    modelType: TAG_MODEL_TYPES.general,
  },
  {
    id: "b1a2e3f4-0001-4000-8000-000000000002",
    name: "archived",
    color: "rgb(107, 114, 128)",
    modelType: TAG_MODEL_TYPES.general,
  },
  {
    id: "ac895249-1177-4f3d-8f1f-3fda068b96a3",
    name: "referral",
    color: "rgb(22, 163, 74)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "28c48639-3ae4-45fb-b8f5-c10ce282f8e4",
    name: "dream-role",
    color: "rgb(251, 146, 60)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "03e6f1a3-e030-42fb-bd0e-47568cf73db6",
    name: "remote",
    color: "rgb(14, 116, 144)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "f3c8b00e-6a58-4f4f-9ed8-b6325546b8d3",
    name: "hybrid",
    color: "rgb(2, 132, 199)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "44eb3110-f3fc-43f5-a4bd-580f0f8dc31e",
    name: "junior",
    color: "rgb(217, 70, 239)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "03be3587-3f96-48bb-8e3f-5f465840d76f",
    name: "senior",
    color: "rgb(126, 34, 206)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000001",
    name: "on-site",
    color: "rgb(15, 118, 110)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000002",
    name: "contract",
    color: "rgb(161, 98, 7)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000003",
    name: "full-time",
    color: "rgb(30, 64, 175)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000004",
    name: "part-time",
    color: "rgb(107, 33, 168)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000005",
    name: "internship",
    color: "rgb(190, 18, 60)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000006",
    name: "high-pay",
    color: "rgb(21, 128, 61)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000007",
    name: "quick-apply",
    color: "rgb(3, 105, 161)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000008",
    name: "requires-visa",
    color: "rgb(154, 52, 18)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000009",
    name: "no-cover-letter",
    color: "rgb(22, 101, 52)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-00000000000a",
    name: "recruiter-reach-out",
    color: "rgb(56, 189, 248)",
    modelType: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000001",
    name: "startup",
    color: "rgb(234, 88, 12)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000002",
    name: "enterprise",
    color: "rgb(30, 64, 175)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000003",
    name: "series-a",
    color: "rgb(22, 163, 74)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000004",
    name: "series-b",
    color: "rgb(21, 128, 61)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000005",
    name: "public",
    color: "rgb(2, 132, 199)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000006",
    name: "remote-first",
    color: "rgb(14, 116, 144)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000007",
    name: "great-culture",
    color: "rgb(217, 70, 239)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000008",
    name: "fast-growing",
    color: "rgb(251, 146, 60)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000009",
    name: "well-known",
    color: "rgb(37, 99, 235)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-00000000000a",
    name: "good-benefits",
    color: "rgb(15, 118, 110)",
    modelType: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000001",
    name: "recruiter",
    color: "rgb(37, 99, 235)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000002",
    name: "hiring-manager",
    color: "rgb(22, 163, 74)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000003",
    name: "interviewer",
    color: "rgb(126, 34, 206)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000004",
    name: "referrer",
    color: "rgb(21, 128, 61)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000005",
    name: "mentor",
    color: "rgb(14, 116, 144)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000006",
    name: "networking",
    color: "rgb(2, 132, 199)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000007",
    name: "warm-lead",
    color: "rgb(234, 88, 12)",
    modelType: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000008",
    name: "cold-contact",
    color: "rgb(107, 114, 128)",
    modelType: TAG_MODEL_TYPES.contact,
  },
] as const;

function createDefaultInsightsVisibility(): string {
  return JSON.stringify(
    Object.fromEntries(
      INSIGHT_METRIC_IDS.map((metricId, index) => [
        metricId,
        {
          visible: true,
          sortOrder: index,
          sort_order: index,
        },
      ]),
    ),
  );
}

async function seedSettingsOnFirstRun(database: DatabaseDriver): Promise<void> {
  await database.execute(
    `INSERT OR IGNORE INTO settings (
       id,
       theme,
       locale,
       notifications_enabled,
       developer_mode,
       semantic_embedding_provider,
       semantic_embedding_model,
       semantic_embedding_dimensions,
       semantic_embedding_base_url,
       semantic_embedding_api_key,
       semantic_enable_sqlite_vec,
       recent_searches,
       table_column_visibility,
       stats_visibility,
       onboarding_completed,
       profile_id,
       show_overview,
       created_at,
       updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      APP_SETTINGS_ID,
      "system",
      "en-GB",
      1,
      0,
      "ollama",
      "bge-small-en",
      384,
      "http://127.0.0.1:11434",
      null,
      1,
      "[]",
      "{}",
      createDefaultInsightsVisibility(),
      0,
      null,
      1,
    ],
  );
}

async function upsertDefaultTags(database: DatabaseDriver): Promise<void> {
  for (const tag of PRODUCTION_TAG_SEEDS) {
    const existing = await database.select<TagNameRow>(
      `SELECT id
       FROM tags
       WHERE LOWER(name) = LOWER($1)
         AND model_type = $2
       LIMIT 1`,
      [tag.name, tag.modelType],
    );

    if (!existing[0]?.id) {
      await database.execute(
        `INSERT INTO tags (id, name, color, model_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [tag.id, tag.name, tag.color, tag.modelType],
      );
      continue;
    }

    await database.execute(
      `UPDATE tags
       SET color = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [tag.color, existing[0].id],
    );
  }
}

function toBoolean(value: number | boolean | null | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return true;
}

function toPositiveInteger(
  value: number | null | undefined,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
}

async function seedSemanticIndexOnFirstRun(
  database: DatabaseDriver,
): Promise<void> {
  const semanticCountRows = await database.select<CountRow>(
    "SELECT COUNT(*) AS count FROM semantic_documents",
  );

  if ((semanticCountRows[0]?.count ?? 0) > 0) {
    return;
  }

  const settingsRows = await database.select<SettingsSemanticConfigRow>(
    `SELECT
       semantic_embedding_model,
       semantic_embedding_dimensions,
       semantic_enable_sqlite_vec
     FROM settings
     WHERE id = $1
     LIMIT 1`,
    [APP_SETTINGS_ID],
  );

  const semanticModel =
    settingsRows[0]?.semantic_embedding_model ?? DEFAULT_SEMANTIC_MODEL;
  const semanticDimensions = toPositiveInteger(
    settingsRows[0]?.semantic_embedding_dimensions,
    DEFAULT_SEMANTIC_DIMENSIONS,
  );
  const enableSqliteVec = toBoolean(
    settingsRows[0]?.semantic_enable_sqlite_vec,
  );

  const [applications, contacts, companies] = await Promise.all([
    database.select<ApplicationSemanticSourceRow>(
      `SELECT
         id,
         title,
         status,
         event_flow_status,
         location_text,
         description,
         interview_process,
         benefits,
         company_id
       FROM applications
       WHERE deleted_at IS NULL`,
    ),
    database.select<ContactSemanticSourceRow>(
      `SELECT
         id,
         full_name,
         type,
         email,
         phone,
         linkedin_url,
         location_text,
         notes
       FROM contacts`,
    ),
    database.select<CompanySemanticSourceRow>(
      `SELECT
         id,
         name,
         industry,
         size,
         website_url,
         linkedin_url,
         location_text,
         notes
       FROM companies`,
    ),
  ]);

  const companyNameById = new Map(
    companies.map((company) => [company.id, company.name]),
  );
  const locations = buildLocationRecords({
    applications: applications.map((application) => ({
      id: application.id,
      locationText: application.location_text,
    })),
    contacts: contacts.map((contact) => ({
      id: contact.id,
      locationText: contact.location_text,
    })),
    companies: companies.map((company) => ({
      id: company.id,
      locationText: company.location_text,
    })),
  });

  const documents: SemanticDocumentInput[] = [
    ...applications.map((application) => ({
      moduleKey: "applications",
      entityType: "application",
      entityId: application.id,
      title: toSearchText(application.title),
      content: joinSearchContent([
        application.title,
        application.description,
        application.interview_process,
        application.benefits,
        application.location_text,
      ]),
      metadata: {
        companyName: application.company_id
          ? (companyNameById.get(application.company_id) ?? null)
          : null,
        status: application.status,
        eventFlowStatus: application.event_flow_status,
      },
    })),
    ...contacts.map((contact) => ({
      moduleKey: "contacts",
      entityType: "contact",
      entityId: contact.id,
      title: toSearchText(contact.full_name),
      content: joinSearchContent([
        contact.full_name,
        contact.email,
        contact.phone,
        contact.linkedin_url,
        contact.location_text,
        contact.notes,
      ]),
    })),
    ...companies.map((company) => ({
      moduleKey: "companies",
      entityType: "company",
      entityId: company.id,
      title: toSearchText(company.name),
      content: joinSearchContent([
        company.name,
        company.industry,
        company.size,
        company.website_url,
        company.linkedin_url,
        company.location_text,
        company.notes,
      ]),
    })),
    ...locations.map((location) => ({
      moduleKey: "locations",
      entityType: "location",
      entityId: location.id,
      title: toSearchText(location.locationText),
      content: joinSearchContent(buildLocationSemanticSummary(location)),
    })),
  ].filter((document) => document.content.trim().length > 0);

  if (documents.length === 0) {
    return;
  }

  const repository = new SemanticSearchRepository(database, {
    enableSqliteVec,
  });
  const embeddingProvider = new DeterministicEmbeddingProvider({
    model: semanticModel,
    dimensions: semanticDimensions,
  });

  for (const document of documents) {
    const embedding = await embeddingProvider.embed(document.content);
    await repository.upsertDocumentWithEmbedding({
      document,
      model: embeddingProvider.model,
      dimensions: embeddingProvider.dimensions,
      embedding,
    });
  }
}

/**
 * Seed baseline production rows (settings + canonical tags) for fresh installs.
 */
export async function seedProductionBootstrapOnFirstRun(
  database: DatabaseDriver,
): Promise<void> {
  const settingsCountRows = await database.select<CountRow>(
    "SELECT COUNT(*) AS count FROM settings",
  );

  const tagsCountRows = await database.select<CountRow>(
    "SELECT COUNT(*) AS count FROM tags",
  );

  const hasAnySettings = (settingsCountRows[0]?.count ?? 0) > 0;
  const hasAnyTags = (tagsCountRows[0]?.count ?? 0) > 0;

  if (!hasAnySettings) {
    await seedSettingsOnFirstRun(database);
  }

  if (!hasAnyTags) {
    await upsertDefaultTags(database);
  }

  await seedSemanticIndexOnFirstRun(database);
}
