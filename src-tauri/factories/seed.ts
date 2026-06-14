import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";

import { createApplicationContactRows } from "./application_contacts.factory";
import { createApplicationDocumentRows } from "./application_documents.factory";
import { createApplicationTagRows } from "./application_tags.factory";
import { createApplicationRows } from "./applications.factory";
import { createCompanyRows } from "./companies.factory";
import { createCompanyTagRows } from "./company_tags.factory";
import { createConstantRows } from "./constants.factory";
import { createContactTagRows } from "./contact_tags.factory";
import { createContactRows } from "./contacts.factory";
import {
  type AppSeedEnv,
  resolveDatabaseUrlFromEnv,
  resolveSqliteFile,
  type SqliteDatabaseLike,
  type SqlValue,
} from "./db-utils";
import { createDocumentRows } from "./documents.factory";
import { createEventRows } from "./events.factory";
import { createNotificationRows } from "./notifications.factory";
import { createProductionConstantRows } from "./production/constants.factory";
import { createProductionSettingRow } from "./production/settings.factory";
import { createProductionTagRows } from "./production/tags.factory";
import { createProfileRow } from "./profiles.factory";
import {
  createSemanticRowsForSeedData,
  type SemanticDocumentRow,
  type SemanticEmbeddingRow,
} from "./semantic.factory";
import { createSettingRow } from "./settings.factory";
import { createTagRows } from "./tags.factory";

type SeedMode = "development" | "production";

interface UpsertStats {
  inserted: number;
  updated: number;
}

interface ProductionSeedResult {
  mode: SeedMode;
  tags: UpsertStats;
  constants: UpsertStats;
  settings: UpsertStats;
  semanticDocuments: UpsertStats;
  semanticEmbeddings: UpsertStats;
}

interface DevelopmentSeedResult {
  mode: SeedMode;
  seed: number;
  counts: Record<string, number>;
}

type SeedResult = DevelopmentSeedResult | ProductionSeedResult;

interface SqliteRunResult {
  changes: number;
}

interface ExistingTagRow {
  id: string;
}

interface ExistingConstantRow {
  type: string;
  value: string;
}

interface ExistingSettingRow {
  id: string;
}

interface ExistingApplicationSeedRow {
  id: string;
  company_id: string;
  title: string;
  location_text: string | null;
  description: string | null;
  interview_process: string | null;
  benefits: string | null;
}

interface ExistingContactSeedRow {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location_text: string | null;
  type: string;
  notes: string | null;
}

interface ExistingDocumentSeedRow {
  id: string;
  title: string;
  kind: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
}

interface ExistingTagSeedRow {
  id: string;
  name: string;
  color: string;
  model_type: string;
}

interface ExistingEventSeedRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
}

interface ExistingNotificationSeedRow {
  id: string;
  application_id: string | null;
  event_id: string | null;
  severity: string;
  title: string;
  body: string;
}

interface ExistingCompanySeedRow {
  id: string;
  name: string;
}

interface ExistingSemanticDocumentRow {
  id: string;
}

interface ExistingSemanticEmbeddingRow {
  document_id: string;
}

interface SemanticSettingsSnapshot {
  provider: string;
  model: string;
  dimensions: number;
}

const DatabaseCtor = Database;

function readNumber(
  env: AppSeedEnv,
  key: string,
  defaultValue: number,
  min = 0,
): number {
  const value = env[key] as string | undefined;
  if (value === undefined || value.trim().length === 0) {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }

  return Math.max(min, Math.floor(parsed));
}

function resolveSeedMode(rawMode: string | undefined): SeedMode {
  if (rawMode === "production") {
    return "production";
  }

  return "development";
}

function readSeedMode(env: AppSeedEnv, args: string[]): SeedMode {
  const modeArg = args.find((arg) => arg.startsWith("--mode="));
  if (modeArg) {
    const value = modeArg.slice("--mode=".length).trim();
    return resolveSeedMode(value);
  }

  const envMode = env.APP_SEED_MODE as string | undefined;
  return resolveSeedMode(envMode?.trim());
}

interface SeedConfig {
  seed: number;
  companyCount: number;
  contactsPerCompany: number;
  applicationsPerCompany: number;
  tagCount: number;
  documentCount: number;
  tagsPerApplication: number;
  tagsPerCompany: number;
  tagsPerContact: number;
  eventsPerApplication: number;
  notificationsPerApplication: number;
  documentsPerApplication: number;
  contactsPerApplication: number;
}

function readSeedConfig(env: AppSeedEnv): SeedConfig {
  return {
    seed: readNumber(env, "APP_SEED_BASE", 20260518),
    companyCount: readNumber(env, "APP_SEED_COMPANIES_COUNT", 12),
    contactsPerCompany: readNumber(env, "APP_SEED_CONTACTS_PER_COMPANY", 2),
    applicationsPerCompany: readNumber(
      env,
      "APP_SEED_APPLICATIONS_PER_COMPANY",
      2,
    ),
    tagCount: readNumber(env, "APP_SEED_TAGS_COUNT", 8),
    documentCount: readNumber(env, "APP_SEED_DOCUMENTS_COUNT", 24),
    tagsPerApplication: readNumber(env, "APP_SEED_TAGS_PER_APPLICATION", 2),
    tagsPerCompany: readNumber(env, "APP_SEED_TAGS_PER_COMPANY", 1),
    tagsPerContact: readNumber(env, "APP_SEED_TAGS_PER_CONTACT", 1),
    eventsPerApplication: readNumber(env, "APP_SEED_EVENTS_PER_APPLICATION", 3),
    notificationsPerApplication: readNumber(
      env,
      "APP_SEED_NOTIFICATIONS_PER_APPLICATION",
      1,
    ),
    documentsPerApplication: readNumber(
      env,
      "APP_SEED_DOCUMENTS_PER_APPLICATION",
      2,
    ),
    contactsPerApplication: readNumber(
      env,
      "APP_SEED_CONTACTS_PER_APPLICATION",
      1,
    ),
  };
}

function runMigrations(db: SqliteDatabaseLike, migrationsDir: string): void {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  db.exec(`
    CREATE TABLE IF NOT EXISTS __seed_migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const appliedRows = db
    .prepare("SELECT name FROM __seed_migrations")
    .all() as {
    name: string;
  }[];
  const appliedMigrations = new Set(appliedRows.map((row) => row.name));

  if (appliedMigrations.size === 0) {
    const existingTables = db
      .prepare(
        `
          SELECT name
          FROM sqlite_master
          WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
            AND name NOT IN ('__seed_migrations')
        `,
      )
      .all() as { name: string }[];

    if (existingTables.length > 0) {
      const recordMigration = db.prepare(
        "INSERT OR IGNORE INTO __seed_migrations (name) VALUES (?)",
      );

      for (const file of files) {
        recordMigration.run(file);
        appliedMigrations.add(file);
      }
    }
  }

  const recordMigration = db.prepare(
    "INSERT OR IGNORE INTO __seed_migrations (name) VALUES (?)",
  );

  for (const file of files) {
    if (appliedMigrations.has(file)) {
      continue;
    }

    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec(sql);
    recordMigration.run(file);
  }
}

function ensureSettingsSemanticColumns(db: SqliteDatabaseLike): void {
  const tableInfoRows = db.prepare("PRAGMA table_info(settings)").all() as {
    name: string;
  }[];
  const columnNames = new Set(tableInfoRows.map((row) => row.name));

  if (!columnNames.has("semantic_embedding_provider")) {
    db.prepare(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_provider TEXT NOT NULL DEFAULT 'ollama'",
    ).run();
  }

  if (!columnNames.has("semantic_embedding_model")) {
    db.prepare(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_model TEXT NOT NULL DEFAULT 'bge-small-en'",
    ).run();
  }

  if (!columnNames.has("semantic_embedding_dimensions")) {
    db.prepare(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_dimensions INTEGER NOT NULL DEFAULT 384",
    ).run();
  }

  if (!columnNames.has("semantic_embedding_base_url")) {
    db.prepare(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_base_url TEXT NOT NULL DEFAULT 'http://127.0.0.1:11434'",
    ).run();
  }

  if (!columnNames.has("semantic_embedding_api_key")) {
    db.prepare(
      "ALTER TABLE settings ADD COLUMN semantic_embedding_api_key TEXT",
    ).run();
  }

  if (!columnNames.has("semantic_enable_sqlite_vec")) {
    db.prepare(
      "ALTER TABLE settings ADD COLUMN semantic_enable_sqlite_vec INTEGER NOT NULL DEFAULT 1",
    ).run();
  }
}

function insertMany(
  db: SqliteDatabaseLike,
  table: string,
  rows: object[],
): number {
  if (rows.length === 0) {
    return 0;
  }

  const firstRecord = rows[0] as Record<string, unknown>;
  const columns = Object.keys(firstRecord);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
  const stmt = db.prepare(sql);

  let inserted = 0;
  for (const row of rows) {
    const record = row as Record<string, unknown>;
    stmt.run(...columns.map((column) => (record[column] as SqlValue) ?? null));
    inserted += 1;
  }

  return inserted;
}

function deleteAllInFkSafeOrder(db: SqliteDatabaseLike): void {
  const tables = [
    "semantic_embeddings",
    "semantic_documents",
    "constants",
    "application_documents",
    "application_contacts",
    "application_events",
    "notifications",
    "events",
    "application_tags",
    "company_tags",
    "contact_tags",
    "profiles",
    "settings",
    "documents",
    "applications",
    "contacts",
    "tags",
    "companies",
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
}

function readSemanticSettingsSnapshot(
  db: SqliteDatabaseLike,
): SemanticSettingsSnapshot {
  const row = db
    .prepare(
      `SELECT
         semantic_embedding_provider,
         semantic_embedding_model,
         semantic_embedding_dimensions
       FROM settings
       WHERE id = ?
       LIMIT 1`,
    )
    .get("app-settings") as
    | {
        semantic_embedding_provider?: unknown;
        semantic_embedding_model?: unknown;
        semantic_embedding_dimensions?: unknown;
      }
    | undefined;

  const provider =
    typeof row?.semantic_embedding_provider === "string" &&
    row.semantic_embedding_provider.trim().length > 0
      ? row.semantic_embedding_provider
      : "deterministic";

  const model =
    typeof row?.semantic_embedding_model === "string" &&
    row.semantic_embedding_model.trim().length > 0
      ? row.semantic_embedding_model
      : provider === "deterministic"
        ? "deterministic-token-v1"
        : "bge-small-en";

  const rawDimensions = Number(row?.semantic_embedding_dimensions);
  const dimensions =
    Number.isFinite(rawDimensions) && rawDimensions > 0
      ? Math.floor(rawDimensions)
      : 384;

  return {
    provider,
    model,
    dimensions,
  };
}

function upsertSemanticDocuments(
  db: SqliteDatabaseLike,
  rows: SemanticDocumentRow[],
): UpsertStats {
  const selectExisting = db.prepare(
    "SELECT id FROM semantic_documents WHERE id = ?",
  );
  const insertDocument = db.prepare(
    `INSERT INTO semantic_documents (
       id,
       module_key,
       entity_type,
       entity_id,
       title,
       content,
       metadata_json,
       created_at,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const updateDocument = db.prepare(
    `UPDATE semantic_documents
     SET
       module_key = ?,
       entity_type = ?,
       entity_id = ?,
       title = ?,
       content = ?,
       metadata_json = ?,
       updated_at = ?
     WHERE id = ?`,
  );

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = selectExisting.get(row.id) as
      | ExistingSemanticDocumentRow
      | undefined;
    if (!existing) {
      insertDocument.run(
        row.id,
        row.module_key,
        row.entity_type,
        row.entity_id,
        row.title,
        row.content,
        row.metadata_json,
        row.created_at,
        row.updated_at,
      );
      inserted += 1;
      continue;
    }

    const result = updateDocument.run(
      row.module_key,
      row.entity_type,
      row.entity_id,
      row.title,
      row.content,
      row.metadata_json,
      row.updated_at,
      row.id,
    ) as SqliteRunResult;

    if (result.changes > 0) {
      updated += 1;
    }
  }

  return { inserted, updated };
}

function upsertSemanticEmbeddings(
  db: SqliteDatabaseLike,
  rows: SemanticEmbeddingRow[],
): UpsertStats {
  const selectExisting = db.prepare(
    "SELECT document_id FROM semantic_embeddings WHERE document_id = ?",
  );
  const insertEmbedding = db.prepare(
    `INSERT INTO semantic_embeddings (
       document_id,
       embedding_model,
       embedding_dimensions,
       embedding_json,
       embedded_at
     )
     VALUES (?, ?, ?, ?, ?)`,
  );
  const updateEmbedding = db.prepare(
    `UPDATE semantic_embeddings
     SET
       embedding_model = ?,
       embedding_dimensions = ?,
       embedding_json = ?,
       embedded_at = ?
     WHERE document_id = ?`,
  );

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = selectExisting.get(row.document_id) as
      | ExistingSemanticEmbeddingRow
      | undefined;

    if (!existing) {
      insertEmbedding.run(
        row.document_id,
        row.embedding_model,
        row.embedding_dimensions,
        row.embedding_json,
        row.embedded_at,
      );
      inserted += 1;
      continue;
    }

    const result = updateEmbedding.run(
      row.embedding_model,
      row.embedding_dimensions,
      row.embedding_json,
      row.embedded_at,
      row.document_id,
    ) as SqliteRunResult;

    if (result.changes > 0) {
      updated += 1;
    }
  }

  return { inserted, updated };
}

function upsertTags(
  db: SqliteDatabaseLike,
  rows: ReturnType<typeof createProductionTagRows>,
): UpsertStats {
  const selectExisting = db.prepare("SELECT id FROM tags WHERE name = ?");
  const insertTag = db.prepare(
    "INSERT INTO tags (id, name, color, model_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const updateTag = db.prepare(
    "UPDATE tags SET color = ?, model_type = ?, updated_at = ? WHERE name = ?",
  );

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = selectExisting.get(row.name) as ExistingTagRow | undefined;
    if (!existing) {
      insertTag.run(
        row.id,
        row.name,
        row.color,
        row.model_type,
        row.created_at,
        row.updated_at,
      );
      inserted += 1;
      continue;
    }

    const result = updateTag.run(
      row.color,
      row.model_type,
      row.updated_at,
      row.name,
    ) as SqliteRunResult;
    if (result.changes > 0) {
      updated += 1;
    }
  }

  return { inserted, updated };
}

function upsertConstants(
  db: SqliteDatabaseLike,
  rows: ReturnType<typeof createProductionConstantRows>,
): UpsertStats {
  const selectExisting = db.prepare(
    "SELECT type, value FROM constants WHERE type = ? AND value = ?",
  );
  const insertConstant = db.prepare(
    "INSERT INTO constants (settings_label, type, value, label, is_visible) VALUES (?, ?, ?, ?, ?)",
  );
  const updateConstant = db.prepare(
    "UPDATE constants SET settings_label = ?, label = ?, is_visible = ? WHERE type = ? AND value = ?",
  );

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = selectExisting.get(row.type, row.value) as
      | ExistingConstantRow
      | undefined;

    if (!existing) {
      insertConstant.run(
        row.settings_label,
        row.type,
        row.value,
        row.label,
        row.is_visible,
      );
      inserted += 1;
      continue;
    }

    const result = updateConstant.run(
      row.settings_label,
      row.label,
      row.is_visible,
      row.type,
      row.value,
    ) as SqliteRunResult;

    if (result.changes > 0) {
      updated += 1;
    }
  }

  return { inserted, updated };
}

function upsertSettings(
  db: SqliteDatabaseLike,
  row: ReturnType<typeof createProductionSettingRow>,
): UpsertStats {
  const existing = db
    .prepare("SELECT id FROM settings WHERE id = ?")
    .get(row.id) as ExistingSettingRow | undefined;

  if (!existing) {
    db.prepare(
      `INSERT INTO settings (
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
         created_at,
         updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      row.id,
      row.theme,
      row.locale,
      row.notifications_enabled,
      row.developer_mode,
      row.semantic_embedding_provider,
      row.semantic_embedding_model,
      row.semantic_embedding_dimensions,
      row.semantic_embedding_base_url,
      row.semantic_embedding_api_key,
      row.semantic_enable_sqlite_vec,
      row.recent_searches,
      row.table_column_visibility,
      row.stats_visibility,
      row.onboarding_completed,
      row.profile_id,
      row.created_at,
      row.updated_at,
    );

    return { inserted: 1, updated: 0 };
  }

  const result = db
    .prepare(
      `UPDATE settings
       SET
         theme = ?,
         locale = ?,
         notifications_enabled = ?,
         developer_mode = ?,
         semantic_embedding_provider = ?,
         semantic_embedding_model = ?,
         semantic_embedding_dimensions = ?,
         semantic_embedding_base_url = ?,
         semantic_embedding_api_key = ?,
         semantic_enable_sqlite_vec = ?,
         recent_searches = ?,
         table_column_visibility = ?,
         stats_visibility = ?,
         onboarding_completed = ?,
         profile_id = ?,
         updated_at = ?
       WHERE id = ?`,
    )
    .run(
      row.theme,
      row.locale,
      row.notifications_enabled,
      row.developer_mode,
      row.semantic_embedding_provider,
      row.semantic_embedding_model,
      row.semantic_embedding_dimensions,
      row.semantic_embedding_base_url,
      row.semantic_embedding_api_key,
      row.semantic_enable_sqlite_vec,
      row.recent_searches,
      row.table_column_visibility,
      row.stats_visibility,
      row.onboarding_completed,
      row.profile_id,
      row.updated_at,
      row.id,
    ) as SqliteRunResult;

  return { inserted: 0, updated: result.changes > 0 ? 1 : 0 };
}

function main(): void {
  const env = loadEnv("", process.cwd(), "");
  const seedMode = readSeedMode(env, process.argv.slice(2));

  const databaseUrl =
    env.DATABASE_URL && env.DATABASE_URL.trim().length > 0
      ? env.DATABASE_URL
      : resolveDatabaseUrlFromEnv(env);
  const databaseFile = resolveSqliteFile(databaseUrl);

  const db = new DatabaseCtor(databaseFile);
  db.pragma("foreign_keys = ON");

  const migrationsDir = path.resolve(process.cwd(), "src-tauri", "migrations");
  runMigrations(db, migrationsDir);
  ensureSettingsSemanticColumns(db);

  const seedTx = db.transaction((): SeedResult => {
    if (seedMode === "production") {
      const timestamp = new Date().toISOString();
      const tags = upsertTags(db, createProductionTagRows(timestamp));
      const constants = upsertConstants(db, createProductionConstantRows());
      const settings = upsertSettings(
        db,
        createProductionSettingRow(timestamp),
      );

      const applications = db
        .prepare(
          `SELECT id, company_id, title, location_text, description, interview_process, benefits
         FROM applications
         WHERE deleted_at IS NULL`,
        )
        .all() as ExistingApplicationSeedRow[];
      const contacts = db
        .prepare(
          `SELECT id, company_id, full_name, email, phone, linkedin_url, location_text, type, notes
           FROM contacts`,
        )
        .all() as ExistingContactSeedRow[];
      const documents = db
        .prepare(
          `SELECT id, title, kind, file_path, mime_type, size_bytes
           FROM documents`,
        )
        .all() as ExistingDocumentSeedRow[];
      const tagsForSemantic = db
        .prepare("SELECT id, name, color, model_type FROM tags")
        .all() as ExistingTagSeedRow[];
      const eventsForSemantic = db
        .prepare("SELECT id, type, title, description FROM events")
        .all() as ExistingEventSeedRow[];
      const notificationsForSemantic = db
        .prepare(
          "SELECT id, application_id, event_id, severity, title, body FROM notifications",
        )
        .all() as ExistingNotificationSeedRow[];
      const companies = db
        .prepare("SELECT id, name FROM companies")
        .all() as ExistingCompanySeedRow[];
      const semanticSettings = readSemanticSettingsSnapshot(db);
      const semanticRows = createSemanticRowsForSeedData({
        applications,
        companies,
        contacts,
        documents,
        tags: tagsForSemantic,
        events: eventsForSemantic,
        notifications: notificationsForSemantic,
        profile: null,
        settings: null,
        semantic: {
          provider: semanticSettings.provider,
          model: semanticSettings.model,
          dimensions: semanticSettings.dimensions,
          timestamp,
        },
      });
      const semanticDocuments = upsertSemanticDocuments(
        db,
        semanticRows.documents,
      );
      const semanticEmbeddings = upsertSemanticEmbeddings(
        db,
        semanticRows.embeddings,
      );

      return {
        mode: "production",
        tags,
        constants,
        settings,
        semanticDocuments,
        semanticEmbeddings,
      };
    }

    const seedConfig = readSeedConfig(env);
    const seed = seedConfig.seed;

    deleteAllInFkSafeOrder(db);

    const companies = createCompanyRows(seedConfig.companyCount, seed + 40);
    const contacts = createContactRows(
      companies.map((c) => c.id),
      seedConfig.contactsPerCompany,
      seed + 50,
    );

    const applications = createApplicationRows(
      companies.map((c) => c.id),
      seedConfig.applicationsPerCompany,
      seed + 60,
    );

    const tags = createTagRows(seedConfig.tagCount, seed + 70);
    const documents = createDocumentRows(seedConfig.documentCount, seed + 80);
    const profile = createProfileRow(seed + 100);
    const settings = createSettingRow(profile.id, seed + 90);
    const constants = createConstantRows();

    const applicationTags = createApplicationTagRows(
      applications.map((a) => a.id),
      tags.map((t) => t.id),
      seedConfig.tagsPerApplication,
      seed + 110,
    );

    const companyTags = createCompanyTagRows(
      companies.map((company) => company.id),
      tags.map((tag) => tag.id),
      seedConfig.tagsPerCompany,
      seed + 111,
    );

    const contactTags = createContactTagRows(
      contacts.map((contact) => contact.id),
      tags.map((tag) => tag.id),
      seedConfig.tagsPerContact,
      seed + 112,
    );

    const events = createEventRows(seed + 120);

    const applicationEvents = applications.flatMap((application) =>
      events.map((eventRow, stageIndex) => {
        const completedWindow = Math.max(seedConfig.eventsPerApplication, 0);
        const completedAt =
          stageIndex < completedWindow
            ? new Date(
                Date.UTC(2026, 0, 1, Math.min(stageIndex, 23), 0, 0),
              ).toISOString()
            : null;

        return {
          application_id: application.id,
          event_id: eventRow.id,
          event_at: completedAt,
          sort_order: stageIndex + 1,
          created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, 0)).toISOString(),
        };
      }),
    );

    const completedApplicationEvents = applicationEvents.filter(
      (row) => row.event_at !== null,
    );

    const notificationEventInputs = completedApplicationEvents
      .map((applicationEventRow) => {
        const event = events.find(
          (eventRow) => eventRow.id === applicationEventRow.event_id,
        );
        if (!event) {
          return null;
        }

        return {
          id: event.id,
          application_id: applicationEventRow.application_id,
          type: event.type,
          title: event.title,
        };
      })
      .filter(
        (
          row,
        ): row is {
          id: string;
          application_id: string;
          type: string;
          title: string;
        } => row !== null,
      );

    const notifications = createNotificationRows(
      applications.map((application) => ({ id: application.id })),
      notificationEventInputs,
      seedConfig.notificationsPerApplication,
      seed + 130,
    );

    const semanticRowsWithEvents = createSemanticRowsForSeedData({
      applications,
      companies,
      contacts,
      documents,
      tags,
      events,
      notifications,
      profile,
      settings,
      semantic: {
        provider: settings.semantic_embedding_provider,
        model: settings.semantic_embedding_model,
        dimensions: settings.semantic_embedding_dimensions,
        timestamp: settings.updated_at,
      },
    });

    const applicationDocuments = createApplicationDocumentRows(
      applications.map((a) => a.id),
      documents.map((document) => ({ id: document.id, kind: document.kind })),
      seedConfig.documentsPerApplication,
      seed + 140,
    );

    const applicationsWithCompany = applications.map((application) => ({
      id: application.id,
      company_id: application.company_id,
    }));

    const contactsWithCompany = contacts.map((contact) => ({
      id: contact.id,
      company_id: contact.company_id,
    }));

    const applicationContacts = createApplicationContactRows(
      applicationsWithCompany,
      contactsWithCompany,
      seedConfig.contactsPerApplication,
      seed + 150,
    );

    const counts = {
      constants: insertMany(db, "constants", constants),
      companies: insertMany(db, "companies", companies),
      contacts: insertMany(db, "contacts", contacts),
      applications: insertMany(db, "applications", applications),
      tags: insertMany(db, "tags", tags),
      documents: insertMany(db, "documents", documents),
      profiles: insertMany(db, "profiles", [profile]),
      settings: insertMany(db, "settings", [settings]),
      application_tags: insertMany(db, "application_tags", applicationTags),
      company_tags: insertMany(db, "company_tags", companyTags),
      contact_tags: insertMany(db, "contact_tags", contactTags),
      events: insertMany(db, "events", events),
      application_events: insertMany(
        db,
        "application_events",
        applicationEvents,
      ),
      notifications: insertMany(db, "notifications", notifications),
      application_documents: insertMany(
        db,
        "application_documents",
        applicationDocuments,
      ),
      application_contacts: insertMany(
        db,
        "application_contacts",
        applicationContacts,
      ),
      semantic_documents: insertMany(
        db,
        "semantic_documents",
        semanticRowsWithEvents.documents,
      ),
      semantic_embeddings: insertMany(
        db,
        "semantic_embeddings",
        semanticRowsWithEvents.embeddings,
      ),
    };

    return {
      mode: "development",
      seed,
      counts,
    };
  });

  const result = seedTx();

  process.stdout.write("Seed complete\n");
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`Database: ${databaseFile}\n`);

  db.close();
}

main();
