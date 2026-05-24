/**
 * Deterministic production tag definition.
 */
interface ProductionTagDefinition {
  id: string;
  name: string;
  color: string;
}

/**
 * Persisted tag row payload for production bootstrap.
 */
export interface ProductionTagRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

/**
 * Canonical tags that should always exist in production.
 */
const PRODUCTION_TAGS: readonly ProductionTagDefinition[] = [
  { id: "90dd3dca-f0e2-49f8-9475-0f636e5c2bd1", name: "urgent", color: "rgb(220, 38, 38)" },
  { id: "ac895249-1177-4f3d-8f1f-3fda068b96a3", name: "referral", color: "rgb(22, 163, 74)" },
  { id: "28c48639-3ae4-45fb-b8f5-c10ce282f8e4", name: "dream-role", color: "rgb(251, 146, 60)" },
  { id: "03e6f1a3-e030-42fb-bd0e-47568cf73db6", name: "remote", color: "rgb(14, 116, 144)" },
  { id: "f3c8b00e-6a58-4f4f-9ed8-b6325546b8d3", name: "hybrid", color: "rgb(2, 132, 199)" },
  { id: "44eb3110-f3fc-43f5-a4bd-580f0f8dc31e", name: "junior", color: "rgb(217, 70, 239)" },
  { id: "03be3587-3f96-48bb-8e3f-5f465840d76f", name: "senior", color: "rgb(126, 34, 206)" },
  { id: "c354a4cb-e36b-4260-870d-a70cdb35258d", name: "follow-up", color: "rgb(37, 99, 235)" },
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
