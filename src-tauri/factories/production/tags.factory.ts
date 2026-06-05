import {
  TAG_MODEL_TYPES,
  type TagModelTypeValue,
} from "../../../src/modules/tags/types";

/**
 * Deterministic production tag definition.
 */
interface ProductionTagDefinition {
  id: string;
  name: string;
  color: string;
  model_type: TagModelTypeValue;
}

/**
 * Persisted tag row payload for production bootstrap.
 */
export interface ProductionTagRow {
  id: string;
  name: string;
  color: string;
  model_type: TagModelTypeValue;
  created_at: string;
  updated_at: string;
}

/**
 * Canonical tags that should always exist in production.
 */
const PRODUCTION_TAGS: readonly ProductionTagDefinition[] = [
  // ── General (apply to any model) ────────────────────────────────────────
  {
    id: "90dd3dca-f0e2-49f8-9475-0f636e5c2bd1",
    name: "urgent",
    color: "rgb(220, 38, 38)",
    model_type: TAG_MODEL_TYPES.general,
  },
  {
    id: "c354a4cb-e36b-4260-870d-a70cdb35258d",
    name: "follow-up",
    color: "rgb(37, 99, 235)",
    model_type: TAG_MODEL_TYPES.general,
  },
  {
    id: "b1a2e3f4-0001-4000-8000-000000000001",
    name: "important",
    color: "rgb(234, 88, 12)",
    model_type: TAG_MODEL_TYPES.general,
  },
  {
    id: "b1a2e3f4-0001-4000-8000-000000000002",
    name: "archived",
    color: "rgb(107, 114, 128)",
    model_type: TAG_MODEL_TYPES.general,
  },

  // ── Application-specific ────────────────────────────────────────────────
  {
    id: "ac895249-1177-4f3d-8f1f-3fda068b96a3",
    name: "referral",
    color: "rgb(22, 163, 74)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "28c48639-3ae4-45fb-b8f5-c10ce282f8e4",
    name: "dream-role",
    color: "rgb(251, 146, 60)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "03e6f1a3-e030-42fb-bd0e-47568cf73db6",
    name: "remote",
    color: "rgb(14, 116, 144)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "f3c8b00e-6a58-4f4f-9ed8-b6325546b8d3",
    name: "hybrid",
    color: "rgb(2, 132, 199)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "44eb3110-f3fc-43f5-a4bd-580f0f8dc31e",
    name: "junior",
    color: "rgb(217, 70, 239)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "03be3587-3f96-48bb-8e3f-5f465840d76f",
    name: "senior",
    color: "rgb(126, 34, 206)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000001",
    name: "on-site",
    color: "rgb(15, 118, 110)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000002",
    name: "contract",
    color: "rgb(161, 98, 7)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000003",
    name: "full-time",
    color: "rgb(30, 64, 175)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000004",
    name: "part-time",
    color: "rgb(107, 33, 168)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000005",
    name: "internship",
    color: "rgb(190, 18, 60)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000006",
    name: "high-pay",
    color: "rgb(21, 128, 61)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000007",
    name: "quick-apply",
    color: "rgb(3, 105, 161)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000008",
    name: "requires-visa",
    color: "rgb(154, 52, 18)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-000000000009",
    name: "no-cover-letter",
    color: "rgb(22, 101, 52)",
    model_type: TAG_MODEL_TYPES.application,
  },
  {
    id: "b1a2e3f4-0002-4000-8000-00000000000a",
    name: "recruiter-reach-out",
    color: "rgb(56, 189, 248)",
    model_type: TAG_MODEL_TYPES.application,
  },

  // ── Company-specific ────────────────────────────────────────────────────
  {
    id: "b1a2e3f4-0003-4000-8000-000000000001",
    name: "startup",
    color: "rgb(234, 88, 12)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000002",
    name: "enterprise",
    color: "rgb(30, 64, 175)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000003",
    name: "series-a",
    color: "rgb(22, 163, 74)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000004",
    name: "series-b",
    color: "rgb(21, 128, 61)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000005",
    name: "public",
    color: "rgb(2, 132, 199)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000006",
    name: "remote-first",
    color: "rgb(14, 116, 144)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000007",
    name: "great-culture",
    color: "rgb(217, 70, 239)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000008",
    name: "fast-growing",
    color: "rgb(251, 146, 60)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-000000000009",
    name: "well-known",
    color: "rgb(37, 99, 235)",
    model_type: TAG_MODEL_TYPES.company,
  },
  {
    id: "b1a2e3f4-0003-4000-8000-00000000000a",
    name: "good-benefits",
    color: "rgb(15, 118, 110)",
    model_type: TAG_MODEL_TYPES.company,
  },

  // ── Contact-specific ────────────────────────────────────────────────────
  {
    id: "b1a2e3f4-0004-4000-8000-000000000001",
    name: "recruiter",
    color: "rgb(37, 99, 235)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000002",
    name: "hiring-manager",
    color: "rgb(22, 163, 74)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000003",
    name: "interviewer",
    color: "rgb(126, 34, 206)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000004",
    name: "referrer",
    color: "rgb(21, 128, 61)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000005",
    name: "mentor",
    color: "rgb(14, 116, 144)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000006",
    name: "networking",
    color: "rgb(2, 132, 199)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000007",
    name: "warm-lead",
    color: "rgb(234, 88, 12)",
    model_type: TAG_MODEL_TYPES.contact,
  },
  {
    id: "b1a2e3f4-0004-4000-8000-000000000008",
    name: "cold-contact",
    color: "rgb(107, 114, 128)",
    model_type: TAG_MODEL_TYPES.contact,
  },
] as const;

/**
 * Create deterministic production rows for default tags.
 */
export function createProductionTagRows(
  timestamp = "2026-01-01T00:00:00.000Z",
): ProductionTagRow[] {
  return PRODUCTION_TAGS.map((tag) => ({
    ...tag,
    created_at: timestamp,
    updated_at: timestamp,
  }));
}
