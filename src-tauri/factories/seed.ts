import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

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

type Row = Record<string, unknown>;

function resolveSqliteFile(databaseUrl: string): string {
  if (databaseUrl === ":memory:") {
    return databaseUrl;
  }

  if (databaseUrl.startsWith("sqlite:")) {
    const file = databaseUrl.slice("sqlite:".length);
    if (!file) {
      throw new Error("Invalid sqlite URL. Example: sqlite:jaa.db");
    }

    return path.resolve(process.cwd(), file);
  }

  return path.resolve(process.cwd(), databaseUrl);
}

function runMigrations(db: Database.Database, migrationsDir: string): void {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec(sql);
  }
}

function insertMany(db: Database.Database, table: string, rows: Row[]): number {
  if (rows.length === 0) {
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
  const stmt = db.prepare(sql);

  let inserted = 0;
  for (const row of rows) {
    stmt.run(...columns.map((column) => row[column]));
    inserted += 1;
  }

  return inserted;
}

function deleteAllInFkSafeOrder(db: Database.Database): void {
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
  const databaseUrl = process.env.DATABASE_URL ?? "sqlite:jaa.db";
  const databaseFile = resolveSqliteFile(databaseUrl);

  const db = new Database(databaseFile);
  db.pragma("foreign_keys = ON");

  const migrationsDir = path.resolve(process.cwd(), "src-tauri", "migrations");
  runMigrations(db, migrationsDir);

  const seed = Number(process.env.SEED ?? 20260518);

  const seedTx = db.transaction((): Record<string, number> => {
    deleteAllInFkSafeOrder(db);

    const companies = createCompanyRows(12, seed + 40);
    const contacts = createContactRows(
      companies.map((c) => c.id),
      2,
      seed + 50,
    );

    const applications = createApplicationRows(
      companies.map((c) => c.id),
      2,
      seed + 60,
    );

    const tags = createTagRows(seed + 70);
    const documents = createDocumentRows(24, seed + 80);
    const settings = createSettingRow(seed + 90);
    const profile = createProfileRow(seed + 100);

    const applicationTags = createApplicationTagRows(
      applications.map((a) => a.id),
      tags.map((t) => t.id),
      2,
      seed + 110,
    );

    const events = createEventRows(
      applications.map((a) => a.id),
      contacts.map((c) => c.id),
      3,
      seed + 120,
    );

    const notifications = createNotificationRows(
      applications.map((a) => a.id),
      events.map((e) => e.id),
      1,
      seed + 130,
    );

    const applicationDocuments = createApplicationDocumentRows(
      applications.map((a) => a.id),
      documents.map((d) => d.id),
      2,
      seed + 140,
    );

    const applicationContacts = createApplicationContactRows(
      applications.map((a) => a.id),
      contacts.map((c) => c.id),
      1,
      seed + 150,
    );

    const counts = {
      companies: insertMany(db, "companies", companies),
      contacts: insertMany(db, "contacts", contacts),
      applications: insertMany(db, "applications", applications),
      tags: insertMany(db, "tags", tags),
      documents: insertMany(db, "documents", documents),
      settings: insertMany(db, "settings", [settings]),
      profiles: insertMany(db, "profiles", [profile]),
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

  console.log("Seed complete");
  console.table(counts);
  console.log(`Database: ${databaseFile}`);
  console.log(`Seed: ${seed}`);

  db.close();
}

main();
