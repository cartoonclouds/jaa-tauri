interface SemanticApplicationSource {
  id: string;
  company_id: string;
  title: string;
  location_text: string | null;
  description: string | null;
  interview_process: string | null;
  benefits: string | null;
}

interface SemanticCompanySource {
  id: string;
  name: string;
  website_url?: string | null;
  linkedin_url?: string | null;
  industry?: string | null;
  size?: string | null;
  location_text?: string | null;
  notes?: string | null;
}

interface SemanticContactSource {
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

interface SemanticDocumentSource {
  id: string;
  title: string;
  kind: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
}

interface SemanticTagSource {
  id: string;
  name: string;
  color: string;
  model_type: string;
}

interface SemanticEventSource {
  id: string;
  type: string;
  title: string;
  description: string | null;
}

interface SemanticNotificationSource {
  id: string;
  application_id: string | null;
  event_id: string | null;
  severity: string;
  title: string;
  body: string;
}

interface SemanticProfileSource {
  id: string;
  full_name: string;
  headline: string | null;
  summary: string | null;
  location_text: string | null;
  skills: string;
  work_eligibility: string;
  remote_preference: string;
}

interface SemanticSettingSource {
  id: string;
  theme: string;
  locale: string;
  semantic_embedding_provider: string;
  semantic_embedding_model: string;
  semantic_embedding_dimensions: number;
  semantic_enable_sqlite_vec: number;
}

/**
 * Row payload persisted into semantic_documents.
 */
export interface SemanticDocumentRow {
  id: string;
  module_key: string;
  entity_type: string;
  entity_id: string;
  title: string;
  content: string;
  metadata_json: string;
  created_at: string;
  updated_at: string;
}

/**
 * Row payload persisted into semantic_embeddings.
 */
export interface SemanticEmbeddingRow {
  document_id: string;
  embedding_model: string;
  embedding_dimensions: number;
  embedding_json: string;
  embedded_at: string;
}

interface SemanticFactoryOptions {
  provider: string;
  model: string;
  dimensions: number;
  timestamp: string;
}

/**
 * Create semantic rows for all application records.
 */
export function createApplicationSemanticRows(
  applications: SemanticApplicationSource[],
  companies: SemanticCompanySource[],
  options: SemanticFactoryOptions,
): {
  documents: SemanticDocumentRow[];
  embeddings: SemanticEmbeddingRow[];
} {
  const companyById = new Map(
    companies.map((company) => [company.id, company]),
  );

  const documents: SemanticDocumentRow[] = [];
  const embeddings: SemanticEmbeddingRow[] = [];

  for (const application of applications) {
    const company = companyById.get(application.company_id) ?? null;
    const documentId = application.id;
    const content = [
      company ? `Company: ${company.name}` : null,
      `Role: ${application.title}`,
      application.location_text
        ? `Location: ${application.location_text}`
        : null,
      application.description
        ? `Application Notes: ${application.description}`
        : null,
      application.interview_process
        ? `Interview Process: ${application.interview_process}`
        : null,
      application.benefits ? `Benefits: ${application.benefits}` : null,
    ]
      .filter((entry): entry is string => Boolean(entry))
      .join("\n");

    documents.push({
      id: documentId,
      module_key: "applications",
      entity_type: "application",
      entity_id: application.id,
      title: application.title,
      content,
      metadata_json: JSON.stringify({
        provider: options.provider,
        companyName: company?.name ?? null,
      }),
      created_at: options.timestamp,
      updated_at: options.timestamp,
    });

    embeddings.push({
      document_id: documentId,
      embedding_model: options.model,
      embedding_dimensions: options.dimensions,
      embedding_json: JSON.stringify(
        createDeterministicEmbedding(content, options.dimensions),
      ),
      embedded_at: options.timestamp,
    });
  }

  return {
    documents,
    embeddings,
  };
}

/**
 * Create semantic rows for all seeded entities across modules.
 */
export function createSemanticRowsForSeedData(options: {
  applications: SemanticApplicationSource[];
  companies: SemanticCompanySource[];
  contacts: SemanticContactSource[];
  documents: SemanticDocumentSource[];
  tags: SemanticTagSource[];
  events: SemanticEventSource[];
  notifications: SemanticNotificationSource[];
  profile: SemanticProfileSource | null;
  settings: SemanticSettingSource | null;
  semantic: SemanticFactoryOptions;
}): {
  documents: SemanticDocumentRow[];
  embeddings: SemanticEmbeddingRow[];
} {
  const allDocuments: SemanticDocumentRow[] = [];

  const companyById = new Map(
    options.companies.map((company) => [company.id, company]),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "applications",
      "application",
      options.applications,
      (application) => ({
        entityId: application.id,
        title: application.title,
        content: [
          companyById.get(application.company_id)
            ? `Company: ${companyById.get(application.company_id)?.name ?? ""}`
            : null,
          `Role: ${application.title}`,
          application.location_text
            ? `Location: ${application.location_text}`
            : null,
          application.description
            ? `Application Notes: ${application.description}`
            : null,
          application.interview_process
            ? `Interview Process: ${application.interview_process}`
            : null,
          application.benefits ? `Benefits: ${application.benefits}` : null,
        ],
        metadata: {
          provider: options.semantic.provider,
          companyName: companyById.get(application.company_id)?.name ?? null,
        },
      }),
      options.semantic.timestamp,
    ),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "companies",
      "company",
      options.companies,
      (company) => ({
        entityId: company.id,
        title: company.name,
        content: [
          `Company: ${company.name}`,
          company.industry ? `Industry: ${company.industry}` : null,
          company.size ? `Size: ${company.size}` : null,
          company.location_text ? `Location: ${company.location_text}` : null,
          company.website_url ? `Website: ${company.website_url}` : null,
          company.linkedin_url ? `LinkedIn: ${company.linkedin_url}` : null,
          company.notes ? `Notes: ${company.notes}` : null,
        ],
      }),
      options.semantic.timestamp,
    ),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "contacts",
      "contact",
      options.contacts,
      (contact) => ({
        entityId: contact.id,
        title: contact.full_name,
        content: [
          `Contact: ${contact.full_name}`,
          `Type: ${contact.type}`,
          contact.email ? `Email: ${contact.email}` : null,
          contact.phone ? `Phone: ${contact.phone}` : null,
          contact.linkedin_url ? `LinkedIn: ${contact.linkedin_url}` : null,
          contact.location_text ? `Location: ${contact.location_text}` : null,
          contact.notes ? `Notes: ${contact.notes}` : null,
          companyById.get(contact.company_id)
            ? `Company: ${companyById.get(contact.company_id)?.name ?? ""}`
            : null,
        ],
      }),
      options.semantic.timestamp,
    ),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "documents",
      "document",
      options.documents,
      (document) => ({
        entityId: document.id,
        title: document.title,
        content: [
          `Document: ${document.title}`,
          `Kind: ${document.kind}`,
          `Path: ${document.file_path}`,
          document.mime_type ? `Mime: ${document.mime_type}` : null,
          document.size_bytes !== null
            ? `Size Bytes: ${document.size_bytes.toString()}`
            : null,
        ],
      }),
      options.semantic.timestamp,
    ),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "tags",
      "tag",
      options.tags,
      (tag) => ({
        entityId: tag.id,
        title: tag.name,
        content: [
          `Tag: ${tag.name}`,
          `Color: ${tag.color}`,
          `Model Type: ${tag.model_type}`,
        ],
      }),
      options.semantic.timestamp,
    ),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "events",
      "event",
      options.events,
      (event) => ({
        entityId: event.id,
        title: event.title,
        content: [
          `Event: ${event.title}`,
          `Stage Type: ${event.type}`,
          event.description ? `Description: ${event.description}` : null,
        ],
      }),
      options.semantic.timestamp,
    ),
  );

  allDocuments.push(
    ...toSemanticDocuments(
      "notifications",
      "notification",
      options.notifications,
      (notification) => ({
        entityId: notification.id,
        title: notification.title,
        content: [
          `Notification: ${notification.title}`,
          `Severity: ${notification.severity}`,
          notification.body ? `Body: ${notification.body}` : null,
          notification.application_id
            ? `Application ID: ${notification.application_id}`
            : null,
        ],
      }),
      options.semantic.timestamp,
    ),
  );

  if (options.profile) {
    allDocuments.push(
      ...toSemanticDocuments(
        "profile",
        "profile",
        [options.profile],
        (profile) => ({
          entityId: profile.id,
          title: profile.full_name,
          content: [
            `Profile: ${profile.full_name}`,
            profile.headline ? `Headline: ${profile.headline}` : null,
            profile.summary ? `Summary: ${profile.summary}` : null,
            profile.location_text ? `Location: ${profile.location_text}` : null,
            profile.skills ? `Skills: ${profile.skills}` : null,
            profile.work_eligibility
              ? `Work Eligibility: ${profile.work_eligibility}`
              : null,
            profile.remote_preference
              ? `Remote Preference: ${profile.remote_preference}`
              : null,
          ],
        }),
        options.semantic.timestamp,
      ),
    );
  }

  if (options.settings) {
    allDocuments.push(
      ...toSemanticDocuments(
        "settings",
        "setting",
        [options.settings],
        (settings) => ({
          entityId: settings.id,
          title: "Application Settings",
          content: [
            `Theme: ${settings.theme}`,
            `Locale: ${settings.locale}`,
            `Embedding Provider: ${settings.semantic_embedding_provider}`,
            `Embedding Model: ${settings.semantic_embedding_model}`,
            `Embedding Dimensions: ${settings.semantic_embedding_dimensions.toString()}`,
            `SQLite Vec Enabled: ${settings.semantic_enable_sqlite_vec.toString()}`,
          ],
        }),
        options.semantic.timestamp,
      ),
    );
  }

  const embeddings = allDocuments.map((document) => ({
    document_id: document.id,
    embedding_model: options.semantic.model,
    embedding_dimensions: options.semantic.dimensions,
    embedding_json: JSON.stringify(
      createDeterministicEmbedding(
        document.content,
        options.semantic.dimensions,
      ),
    ),
    embedded_at: options.semantic.timestamp,
  }));

  return {
    documents: allDocuments,
    embeddings,
  };
}

function toSemanticDocuments<T>(
  moduleKey: string,
  entityType: string,
  entries: T[],
  projector: (entry: T) => {
    entityId: string;
    title: string;
    content: (string | null)[];
    metadata?: Record<string, unknown>;
  },
  timestamp: string,
): SemanticDocumentRow[] {
  return entries.map((entry) => {
    const projection = projector(entry);
    const content = projection.content
      .filter((value): value is string => Boolean(value))
      .join("\n");

    return {
      id: `${moduleKey}:${projection.entityId}`,
      module_key: moduleKey,
      entity_type: entityType,
      entity_id: projection.entityId,
      title: projection.title,
      content,
      metadata_json: JSON.stringify(projection.metadata ?? {}),
      created_at: timestamp,
      updated_at: timestamp,
    };
  });
}

/**
 * Deterministic embedding used by seed factories.
 */
function createDeterministicEmbedding(
  text: string,
  dimensions: number,
): number[] {
  const normalized = text.toLowerCase().trim();
  if (!normalized || dimensions <= 0) {
    return new Array<number>(Math.max(dimensions, 0)).fill(0);
  }

  const vector = new Array<number>(dimensions).fill(0);
  const tokens = normalized.split(/\s+/g).filter((token) => token.length > 0);

  for (const token of tokens) {
    const hash = fnv1a(token);
    const bucket = Math.abs(hash % dimensions);
    const sign = (hash & 1) === 0 ? 1 : -1;
    const weight = 1 + Math.min(token.length, 12) / 16;
    vector[bucket] = (vector[bucket] ?? 0) + sign * weight;
  }

  let sumSquares = 0;
  for (const value of vector) {
    sumSquares += value * value;
  }

  if (sumSquares <= 0) {
    return vector;
  }

  const magnitude = Math.sqrt(sumSquares);
  return vector.map((value) => value / magnitude);
}

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash | 0;
}
