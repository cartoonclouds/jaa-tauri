import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";

import { createApplicationContactRows } from "./application_contacts.factory";
import { createApplicationDocumentRows } from "./application_documents.factory";
import { createApplicationTagRows } from "./application_tags.factory";
import { createApplicationRows } from "./applications.factory";
import { createCompanyRows } from "./companies.factory";
import { createContactRows } from "./contacts.factory";
import { createDocumentRows } from "./documents.factory";
import { createEventRows } from "./events.factory";
import { createNotificationRows } from "./notifications.factory";
import { createProfileRow } from "./profiles.factory";
import { createSettingRow } from "./settings.factory";
import { createTagRows } from "./tags.factory";

type SqlValue = string | number | bigint | Uint8Array | null;

interface SqliteStatement {
  run(...params: SqlValue[]): unknown;
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

interface SeedConfig {
  seed: number;
  companyCount: number;
  contactsPerCompany: number;
  applicationsPerCompany: number;
  tagCount: number;
  documentCount: number;
  tagsPerApplication: number;
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
      throw new Error("Invalid sqlite URL. Example: sqlite:applyflow.db");
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

  for (const file of files) {
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec(sql);
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
    "application_documents",
    "application_contacts",
    "notifications",
    "events",
    "application_tags",
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

function main(): void {
  const env = loadEnv("", process.cwd(), "");

  const databaseUrl =
    env.DATABASE_URL && env.DATABASE_URL.trim().length > 0
      ? env.DATABASE_URL
      : resolveDatabaseUrlFromEnv(env);
  const databaseFile = resolveSqliteFile(databaseUrl);

  const db = new DatabaseCtor(databaseFile);
  db.pragma("foreign_keys = ON");

  const migrationsDir = path.resolve(process.cwd(), "src-tauri", "migrations");
  runMigrations(db, migrationsDir);

  const seedConfig = readSeedConfig(env);
  const seed = seedConfig.seed;

  const seedTx = db.transaction((): Record<string, number> => {
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

    const applicationTags = createApplicationTagRows(
      applications.map((a) => a.id),
      tags.map((t) => t.id),
      seedConfig.tagsPerApplication,
      seed + 110,
    );

    const events = createEventRows(
      applications.map((application) => ({
        id: application.id,
        company_id: application.company_id,
        status: application.status,
      })),
      contacts.map((contact) => ({
        id: contact.id,
        company_id: contact.company_id,
      })),
      seedConfig.eventsPerApplication,
      seed + 120,
    );

    const notifications = createNotificationRows(
      applications.map((application) => ({ id: application.id })),
      events.map((event) => ({
        id: event.id,
        application_id: event.application_id,
        type: event.type,
        title: event.title,
      })),
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
      companies: insertMany(db, "companies", companies),
      contacts: insertMany(db, "contacts", contacts),
      applications: insertMany(db, "applications", applications),
      tags: insertMany(db, "tags", tags),
      documents: insertMany(db, "documents", documents),
      profiles: insertMany(db, "profiles", [profile]),
      settings: insertMany(db, "settings", [settings]),
      application_tags: insertMany(db, "application_tags", applicationTags),
      events: insertMany(db, "events", events),
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

    return counts;
  });

  const counts = seedTx();

  process.stdout.write("Seed complete\n");
  process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
  process.stdout.write(`Database: ${databaseFile}\n`);
  process.stdout.write(`Seed: ${String(seed)}\n`);

  db.close();
}

main();
