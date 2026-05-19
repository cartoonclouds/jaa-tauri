import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { createApplicationDocumentRows } from "./application_documents.factory";
import { createApplicationEventRows } from "./application_events.factory";
import { createApplicationTagRows } from "./application_tags.factory";
import { createApplicationTaskRows } from "./application_tasks.factory";
import { createApplicationRows } from "./applications.factory";
import { createCompanyRows } from "./companies.factory";
import { createCompanyContactRows } from "./company_contacts.factory";
import { createDocumentRows } from "./documents.factory";
import { createJobSourceRows } from "./job_sources.factory";
import { createTagRows } from "./tags.factory";
import { createTaskRows } from "./tasks.factory";

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
  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
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
    "application_tasks",
    "application_events",
    "application_tags",
    "documents",
    "applications",
    "company_contacts",
    "tags",
    "job_sources",
    "tasks",
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

  const seedTx = db.transaction(() => {
    deleteAllInFkSafeOrder(db);

    const jobSources = createJobSourceRows(seed + 30);
    const companies = createCompanyRows(12, seed + 40);
    const contacts = createCompanyContactRows(
      companies.map((c) => c.id),
      2,
      seed + 50,
    );

    const applications = createApplicationRows(
      companies.map((c) => ({ id: c.id, name: c.name })),
      jobSources.map((s) => s.id),
      2,
      seed + 60,
    );

    const tags = createTagRows(seed + 70);
    const documents = createDocumentRows(24, seed + 80);

    const applicationTags = createApplicationTagRows(
      applications.map((a) => a.id),
      tags.map((t) => t.id),
      2,
      seed + 90,
    );

    const applicationEvents = createApplicationEventRows(
      applications.map((a) => a.id),
      contacts.map((c) => c.id),
      3,
      seed + 100,
    );

    const applicationTasks = createApplicationTaskRows(
      applications.map((a) => a.id),
      2,
      seed + 110,
    );

    const applicationDocuments = createApplicationDocumentRows(
      applications.map((a) => a.id),
      documents.map((d) => d.id),
      2,
      seed + 120,
    );

    const counts = {
      tasks: insertMany(db, "tasks", projectTasks),
      job_sources: insertMany(db, "job_sources", jobSources),
      companies: insertMany(db, "companies", companies),
      company_contacts: insertMany(db, "company_contacts", contacts),
      applications: insertMany(db, "applications", applications),
      tags: insertMany(db, "tags", tags),
      documents: insertMany(db, "documents", documents),
      application_tags: insertMany(db, "application_tags", applicationTags),
      application_events: insertMany(
        db,
        "application_events",
        applicationEvents,
      ),
      application_tasks: insertMany(db, "application_tasks", applicationTasks),
      application_documents: insertMany(
        db,
        "application_documents",
        applicationDocuments,
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
