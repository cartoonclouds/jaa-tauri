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
import { createDocumentRows } from "./documents.factory";
import { createEventRows } from "./events.factory";
import { createNotificationRows } from "./notifications.factory";
import { createProductionConstantRows } from "./production/constants.factory";
import { createProductionTagRows } from "./production/tags.factory";
import { createProfileRow } from "./profiles.factory";
import { createSettingRow } from "./settings.factory";
import { createTagRows } from "./tags.factory";
import { FactoryConfigurationError } from "./errors";

type SqlValue = string | number | bigint | Uint8Array | null;

type SeedMode = "development" | "production";

interface UpsertStats {
  inserted: number;
  updated: number;
}

interface ProductionSeedResult {
  mode: SeedMode;
  tags: UpsertStats;
  constants: UpsertStats;
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

interface SqliteStatement {
  run(...params: SqlValue[]): unknown;
  all(...params: SqlValue[]): unknown[];
  get(...params: SqlValue[]): unknown;
}

interface SqliteDatabaseLike {
  exec(sql: string): unknown;
  prepare(sql: string): SqliteStatement;
  pragma(sql: string): unknown;
  transaction<T>(callback: () => T): () => T;
  close(): void;
}

const DatabaseCtor = Database;

type AppSeedEnv = Record<string, string>;

function readNumber(
  env: AppSeedEnv,
  key: string,
  defaultValue: number,
  min = 0,
): number {
  const value = env[key];
  if (value === undefined || value.trim().length === 0) {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }

  return Math.max(min, Math.floor(parsed));
}

function resolveDatabaseUrlFromEnv(env: AppSeedEnv): string {
  const explicitUrl = env.APP_DATABASE_URL;
  if (explicitUrl && explicitUrl.trim().length > 0) {
    return explicitUrl;
  }

  const driver = env.APP_DATABASE_DRIVER ?? "sqlite";
  const name = env.APP_DATABASE_NAME ?? "applyflow.db";

  if (driver === "memory" || driver === "in-memory") {
    return ":memory:";
  }

  return `${driver}:${name}`;
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

  const envMode = env.APP_SEED_MODE;
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

function resolveSqliteFile(databaseUrl: string): string {
  if (databaseUrl === ":memory:") {
    return databaseUrl;
  }

  if (databaseUrl.startsWith("sqlite:")) {
    const file = databaseUrl.slice("sqlite:".length);
    if (!file) {
      throw new FactoryConfigurationError(
        "Invalid sqlite URL. Example: sqlite:applyflow.db",
      );
    }

    return path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.resolve(process.cwd(), databaseUrl);
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

function upsertTags(
  db: SqliteDatabaseLike,
  rows: ReturnType<typeof createProductionTagRows>,
): UpsertStats {
  const selectExisting = db.prepare("SELECT id FROM tags WHERE name = ?");
  const insertTag = db.prepare(
    "INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
  );
  const updateTag = db.prepare(
    "UPDATE tags SET color = ?, updated_at = ? WHERE name = ?",
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
        row.created_at,
        row.updated_at,
      );
      inserted += 1;
      continue;
    }

    const result = updateTag.run(
      row.color,
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

  const seedTx = db.transaction((): SeedResult => {
    if (seedMode === "production") {
      const timestamp = new Date().toISOString();
      const tags = upsertTags(db, createProductionTagRows(timestamp));
      const constants = upsertConstants(db, createProductionConstantRows());

      return {
        mode: "production",
        tags,
        constants,
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

    const applicationDocuments = createApplicationDocumentRows(
      applications.map((a) => a.id),
      documents.map((document) => ({ id: document.id, kind: document.kind })),
      seedConfig.documentsPerApplication,
      seed + 140,
    );

    const applicationContacts = createApplicationContactRows(
      applications.map((application) => ({
        id: application.id,
        company_id: application.company_id,
      })),
      contacts.map((contact) => ({
        id: contact.id,
        company_id: contact.company_id,
      })),
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
