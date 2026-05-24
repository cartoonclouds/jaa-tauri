/**
 * Minimal shape needed to resolve IDs from tag names.
 */
interface TagLookupItem {
  id: string;
  name: string;
}

/**
 * Service contract used by pending tag resolution helpers.
 */
interface TagResolutionService {
  list(): Promise<TagLookupItem[]>;
  create(payload: { name: string; color: string | null }): Promise<unknown>;
}

/**
 * Normalize tag names for case-insensitive comparisons.
 */
export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Merge selected tag IDs with IDs resolved from pending tag names.
 */
export async function resolveTagIdsWithPendingTags(params: {
  selectedTagIds: string[];
  pendingTagNames?: string[];
  tagService: TagResolutionService;
}): Promise<string[]> {
  const normalizedPendingNames = [
    ...new Set(
      (params.pendingTagNames ?? [])
        .map((name) => normalizeTagName(name))
        .filter(Boolean),
    ),
  ];

  if (normalizedPendingNames.length) {
    for (const name of normalizedPendingNames) {
      try {
        await params.tagService.create({ name, color: null });
      } catch {
        // Existing names can fail unique constraints; list() resolves IDs below.
      }
    }
  }

  const allTags = await params.tagService.list();
  const tagIdByName = new Map(
    allTags.map((tag) => [normalizeTagName(tag.name), tag.id]),
  );

  const pendingTagIds = normalizedPendingNames
    .map((name) => tagIdByName.get(name))
    .filter((id): id is string => Boolean(id));

  return [
    ...new Set([...params.selectedTagIds, ...pendingTagIds].filter(Boolean)),
  ];
}
