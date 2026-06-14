import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  SemanticDocumentInput,
  SemanticSearchMatch,
} from "@modules/search/types.semantic";

import { cosineSimilarity } from "@shared/utils/cosineSimilarity";

interface SemanticSearchStoredRow {
  documentId: string;
  moduleKey: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  metadataJson: string | null;
  embeddingJson: string;
}

interface SemanticVecSearchStoredRow {
  documentId: string;
  moduleKey: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  metadataJson: string | null;
  distance: number;
}

interface SemanticDocumentLookupRow {
  id: string;
  rowid: number;
}

/**
 * Persists semantic search documents and embeddings.
 */
export class SemanticSearchRepository {
  private readonly vecCapabilityByDimensions = new Map<number, boolean>();

  constructor(
    private readonly db: DatabaseDriver,
    private readonly options: { enableSqliteVec?: boolean } = {},
  ) {}

  async upsertDocumentWithEmbedding(options: {
    document: SemanticDocumentInput;
    model: string;
    dimensions: number;
    embedding: number[];
  }): Promise<void> {
    const metadataJson = options.document.metadata
      ? JSON.stringify(options.document.metadata)
      : null;
    const embeddingJson = JSON.stringify(options.embedding);

    await this.db.transaction(async (tx) => {
      await tx.execute(
        `
          INSERT INTO semantic_documents (
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
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT(module_key, entity_type, entity_id)
          DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            metadata_json = excluded.metadata_json,
            updated_at = CURRENT_TIMESTAMP
        `,
        [
          crypto.randomUUID(),
          options.document.moduleKey,
          options.document.entityType,
          options.document.entityId,
          options.document.title,
          options.document.content,
          metadataJson,
        ],
      );

      const documentRows = await tx.select<SemanticDocumentLookupRow>(
        `
          SELECT id, rowid
          FROM semantic_documents
          WHERE module_key = $1
            AND entity_type = $2
            AND entity_id = $3
          LIMIT 1
        `,
        [
          options.document.moduleKey,
          options.document.entityType,
          options.document.entityId,
        ],
      );

      const documentId = documentRows[0]?.id;
      if (!documentId) {
        return;
      }

      const documentRowId = documentRows[0]?.rowid;
      if (documentRowId) {
        const vecTableName = this.getVecTableName(options.dimensions);
        const vecReady = await this.ensureVecTable(
          tx,
          vecTableName,
          options.dimensions,
        );

        if (vecReady) {
          await tx.execute(
            `DELETE FROM ${vecTableName} WHERE rowid = $1`,
            [documentRowId],
          );
          await tx.execute(
            `INSERT INTO ${vecTableName}(rowid, embedding) VALUES ($1, $2)`,
            [documentRowId, embeddingJson],
          );
        }
      }

      await tx.execute(
        `
          INSERT INTO semantic_embeddings (
            document_id,
            embedding_model,
            embedding_dimensions,
            embedding_json,
            embedded_at
          )
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT(document_id)
          DO UPDATE SET
            embedding_model = excluded.embedding_model,
            embedding_dimensions = excluded.embedding_dimensions,
            embedding_json = excluded.embedding_json,
            embedded_at = CURRENT_TIMESTAMP
        `,
        [documentId, options.model, options.dimensions, embeddingJson],
      );
    });
  }

  async deleteByEntity(options: {
    moduleKey: string;
    entityType: string;
    entityId: string;
  }): Promise<void> {
    await this.db.execute(
      `
        DELETE FROM semantic_documents
        WHERE module_key = $1
          AND entity_type = $2
          AND entity_id = $3
      `,
      [options.moduleKey, options.entityType, options.entityId],
    );
  }

  async search(options: {
    moduleKey: string;
    model: string;
    dimensions: number;
    queryEmbedding: number[];
    limit: number;
    entityTypes?: string[];
  }): Promise<SemanticSearchMatch[]> {
    const vecMatches = await this.searchUsingSqliteVec(options);
    if (vecMatches) {
      return vecMatches;
    }

    return this.searchUsingJsonCosine(options);
  }

  private async searchUsingJsonCosine(options: {
    moduleKey: string;
    model: string;
    dimensions: number;
    queryEmbedding: number[];
    limit: number;
    entityTypes?: string[];
  }): Promise<SemanticSearchMatch[]> {
    const bindings: (string | number)[] = [
      options.moduleKey,
      options.model,
      options.dimensions,
    ];

    let entityTypeClause = "";
    if (options.entityTypes && options.entityTypes.length > 0) {
      const placeholders = options.entityTypes.map(
        (_, index) => `$${(bindings.length + index + 1).toString()}`,
      );
      entityTypeClause = ` AND d.entity_type IN (${placeholders.join(", ")})`;
      bindings.push(...options.entityTypes);
    }

    const rows = await this.db.select<SemanticSearchStoredRow>(
      `
        SELECT
          d.id AS documentId,
          d.module_key AS moduleKey,
          d.entity_type AS entityType,
          d.entity_id AS entityId,
          d.title,
          d.content,
          d.metadata_json AS metadataJson,
          e.embedding_json AS embeddingJson
        FROM semantic_documents d
        INNER JOIN semantic_embeddings e ON e.document_id = d.id
        WHERE d.module_key = $1
          AND e.embedding_model = $2
          AND e.embedding_dimensions = $3
          ${entityTypeClause}
      `,
      bindings,
    );

    const matches: SemanticSearchMatch[] = [];

    for (const row of rows) {
      const embedding = this.parseEmbedding(
        row.embeddingJson,
        options.dimensions,
      );
      if (!embedding) {
        continue;
      }

      const similarity = cosineSimilarity(options.queryEmbedding, embedding);
      matches.push({
        documentId: row.documentId,
        moduleKey: row.moduleKey,
        entityType: row.entityType,
        entityId: row.entityId,
        title: row.title,
        content: row.content,
        metadata: this.parseMetadata(row.metadataJson),
        similarity,
        distance: 1 - similarity,
      });
    }

    matches.sort((left, right) => right.similarity - left.similarity);
    return matches.slice(0, Math.max(options.limit, 1));
  }

  private async searchUsingSqliteVec(options: {
    moduleKey: string;
    model: string;
    dimensions: number;
    queryEmbedding: number[];
    limit: number;
    entityTypes?: string[];
  }): Promise<SemanticSearchMatch[] | null> {
    const vecTableName = this.getVecTableName(options.dimensions);
    const vecReady = await this.ensureVecTable(
      this.db,
      vecTableName,
      options.dimensions,
    );

    if (!vecReady) {
      return null;
    }

    const bindings: (string | number)[] = [
      options.moduleKey,
      options.model,
      options.dimensions,
    ];

    let entityTypeClause = "";
    if (options.entityTypes && options.entityTypes.length > 0) {
      const placeholders = options.entityTypes.map(
        (_, index) => `$${(bindings.length + index + 1).toString()}`,
      );
      entityTypeClause = ` AND d.entity_type IN (${placeholders.join(", ")})`;
      bindings.push(...options.entityTypes);
    }

    const matchPlaceholder = `$${(bindings.length + 1).toString()}`;
    bindings.push(JSON.stringify(options.queryEmbedding));

    const limitPlaceholder = `$${(bindings.length + 1).toString()}`;
    bindings.push(Math.max(options.limit, 1));

    try {
      const rows = await this.db.select<SemanticVecSearchStoredRow>(
        `
          SELECT
            d.id AS documentId,
            d.module_key AS moduleKey,
            d.entity_type AS entityType,
            d.entity_id AS entityId,
            d.title,
            d.content,
            d.metadata_json AS metadataJson,
            v.distance AS distance
          FROM ${vecTableName} v
          INNER JOIN semantic_documents d ON d.rowid = v.rowid
          INNER JOIN semantic_embeddings e ON e.document_id = d.id
          WHERE d.module_key = $1
            AND e.embedding_model = $2
            AND e.embedding_dimensions = $3
            ${entityTypeClause}
            AND v.embedding MATCH ${matchPlaceholder}
          ORDER BY v.distance ASC
          LIMIT ${limitPlaceholder}
        `,
        bindings,
      );

      return rows.map((row) => ({
        documentId: row.documentId,
        moduleKey: row.moduleKey,
        entityType: row.entityType,
        entityId: row.entityId,
        title: row.title,
        content: row.content,
        metadata: this.parseMetadata(row.metadataJson),
        similarity: 1 - row.distance,
        distance: row.distance,
      }));
    } catch {
      this.vecCapabilityByDimensions.set(options.dimensions, false);
      return null;
    }
  }

  private async ensureVecTable(
    driver: DatabaseDriver,
    vecTableName: string,
    dimensions: number,
  ): Promise<boolean> {
    if (this.options.enableSqliteVec === false) {
      return false;
    }

    const knownValue = this.vecCapabilityByDimensions.get(dimensions);
    if (knownValue !== undefined) {
      return knownValue;
    }

    try {
      await driver.execute(
        `CREATE VIRTUAL TABLE IF NOT EXISTS ${vecTableName} USING vec0(embedding float[${dimensions.toString()}])`,
      );
      this.vecCapabilityByDimensions.set(dimensions, true);
      return true;
    } catch {
      this.vecCapabilityByDimensions.set(dimensions, false);
      return false;
    }
  }

  private getVecTableName(dimensions: number): string {
    return `semantic_embeddings_vec_${dimensions.toString()}`;
  }

  private parseEmbedding(
    rawValue: string,
    expectedDimensions: number,
  ): number[] | null {
    try {
      const parsed = JSON.parse(rawValue) as unknown;
      if (!Array.isArray(parsed) || parsed.length !== expectedDimensions) {
        return null;
      }

      const vector: number[] = [];
      for (const value of parsed) {
        if (typeof value !== "number" || Number.isNaN(value)) {
          return null;
        }

        vector.push(value);
      }

      return vector;
    } catch {
      return null;
    }
  }

  private parseMetadata(
    rawValue: string | null,
  ): Record<string, unknown> | null {
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }

      return null;
    } catch {
      return null;
    }
  }
}
