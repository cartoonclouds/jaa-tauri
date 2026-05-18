import type { DatabaseDriver } from "~/services/database/DatabaseDriver";
import type {
  CreateProjectInput,
  Project,
  ProjectRow,
  UpdateProjectInput,
} from "../types";

import { mapProjectRow } from "./projectMapper";

export class ProjectRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async all(): Promise<Project[]> {
    const rows = await this.db.select<ProjectRow>(
      `
      SELECT id, name, description, created_at, updated_at
      FROM projects
      ORDER BY created_at DESC
      `,
    );

    return rows.map(mapProjectRow);
  }

  async find(id: string): Promise<Project | null> {
    const rows = await this.db.select<ProjectRow>(
      `
      SELECT id, name, description, created_at, updated_at
      FROM projects
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db.execute(
      `
      INSERT INTO projects (
        id,
        name,
        description,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [id, input.name, input.description ?? null, now, now],
    );

    const project = await this.find(id);

    if (!project) {
      throw new Error(`Failed to create project ${id}`);
    }

    return project;
  }

  async update(input: UpdateProjectInput): Promise<Project> {
    const existing = await this.find(input.id);

    if (!existing) {
      throw new Error(`Project ${input.id} not found`);
    }

    await this.db.execute(
      `
      UPDATE projects
      SET
        name = $1,
        description = $2,
        updated_at = $3
      WHERE id = $4
      `,
      [
        input.name ?? existing.name,
        input.description === undefined
          ? existing.description
          : input.description,
        new Date().toISOString(),
        input.id,
      ],
    );

    const project = await this.find(input.id);

    if (!project) {
      throw new Error(`Project ${input.id} not found after update`);
    }

    return project;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(
      `
      DELETE FROM projects
      WHERE id = $1
      `,
      [id],
    );
  }
}
