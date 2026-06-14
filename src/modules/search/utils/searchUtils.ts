import type {
  LocationRecord,
  SearchCondition,
  SearchFieldsByScope,
  SearchJoinMode,
  SearchOperator,
  SearchOption,
  SearchScope,
} from "@modules/search/types";

/**
 * Available search scope options.
 */
export const SEARCH_SCOPE_OPTIONS: SearchOption[] = [
  { label: "Applications", value: "applications" },
  { label: "Contacts", value: "contacts" },
  { label: "Companies", value: "companies" },
  { label: "Locations", value: "locations" },
];

/**
 * Available condition operators.
 */
export const SEARCH_OPERATOR_OPTIONS: SearchOption[] = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Starts with", value: "startsWith" },
];

/**
 * Available condition join modes.
 */
export const SEARCH_JOIN_MODE_OPTIONS: SearchOption[] = [
  { label: "Match all", value: "all" },
  { label: "Match any", value: "any" },
];

/**
 * Available fields by scope.
 */
export const SEARCH_FIELDS_BY_SCOPE: SearchFieldsByScope = {
  applications: [
    { label: "Title", value: "title" },
    { label: "Status", value: "status" },
    { label: "Event Flow", value: "eventFlowStatus" },
    { label: "Location", value: "locationText" },
    { label: "Description", value: "description" },
    { label: "Interview Process", value: "interviewProcess" },
    { label: "Benefits", value: "benefits" },
  ],
  contacts: [
    { label: "Name", value: "fullName" },
    { label: "Type", value: "type" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "LinkedIn URL", value: "linkedinUrl" },
    { label: "Location", value: "locationText" },
    { label: "Notes", value: "notes" },
  ],
  companies: [
    { label: "Name", value: "name" },
    { label: "Industry", value: "industry" },
    { label: "Size", value: "size" },
    { label: "Website URL", value: "websiteUrl" },
    { label: "LinkedIn URL", value: "linkedinUrl" },
    { label: "Location", value: "locationText" },
    { label: "Notes", value: "notes" },
  ],
  locations: [{ label: "Location", value: "locationText" }],
};

/**
 * Creates a new condition with default field/operator values.
 */
export function createSearchCondition(scope: SearchScope): SearchCondition {
  const firstField = SEARCH_FIELDS_BY_SCOPE[scope][0]?.value ?? "";

  return {
    id: createSearchConditionId(),
    scope,
    field: firstField,
    operator: "contains",
    value: "",
  };
}

/**
 * Returns active conditions with a non-empty value.
 */
export function getActiveConditions(
  conditions: SearchCondition[],
): SearchCondition[] {
  return conditions.filter((condition) => condition.value.trim().length > 0);
}

/**
 * Converts unknown values into normalized searchable text.
 */
export function toSearchText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value.toString();
  }

  return String(value ?? "").trim();
}

/**
 * Filters entries by scoped conditions and join mode.
 */
export function filterEntriesByScope<T extends object>(
  scope: SearchScope,
  entries: T[],
  conditions: SearchCondition[],
  joinMode: SearchJoinMode,
): T[] {
  const scopedConditions = conditions.filter(
    (condition) => condition.scope === scope,
  );

  if (scopedConditions.length === 0) {
    return [];
  }

  return entries.filter((entry) => {
    const matches = scopedConditions.map((condition) =>
      conditionMatches(
        condition.operator,
        condition.value,
        (entry as Record<string, unknown>)[condition.field],
      ),
    );

    return matchesJoinMode(matches, joinMode);
  });
}

/**
 * Builds location records grouped across applications, contacts, and companies.
 */
export function buildLocationRecords(options: {
  applications: readonly { id: string; locationText: string | null }[];
  contacts: readonly { id: string; locationText: string | null }[];
  companies: readonly { id: string; locationText: string | null }[];
}): LocationRecord[] {
  const buckets = new Map<
    string,
    {
      locationText: string;
      applications: Set<string>;
      contacts: Set<string>;
      companies: Set<string>;
    }
  >();

  function track(
    locationText: string | null,
    entryId: string,
    scope: "applications" | "contacts" | "companies",
  ): void {
    const nextLocation = (locationText ?? "").trim();
    if (nextLocation.length === 0) {
      return;
    }

    const key = normalize(nextLocation);
    const existing = buckets.get(key) ?? {
      locationText: nextLocation,
      applications: new Set<string>(),
      contacts: new Set<string>(),
      companies: new Set<string>(),
    };

    existing[scope].add(entryId);
    buckets.set(key, existing);
  }

  options.applications.forEach((entry) => {
    track(entry.locationText, entry.id, "applications");
  });

  options.contacts.forEach((entry) => {
    track(entry.locationText, entry.id, "contacts");
  });

  options.companies.forEach((entry) => {
    track(entry.locationText, entry.id, "companies");
  });

  return Array.from(buckets.entries())
    .map(([key, value]) => ({
      id: `location:${key}`,
      locationText: value.locationText,
      applicationCount: value.applications.size,
      contactCount: value.contacts.size,
      companyCount: value.companies.size,
    }))
    .sort((left, right) => left.locationText.localeCompare(right.locationText));
}

function createSearchConditionId(): string {
  return [Date.now().toString(), Math.random().toString(36).slice(2)].join("-");
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function conditionMatches(
  operator: SearchOperator,
  queryValue: string,
  candidateValue: unknown,
): boolean {
  const candidate = normalize(toSearchText(candidateValue));
  const query = normalize(queryValue);

  if (query.length === 0) {
    return true;
  }

  if (operator === "equals") {
    return candidate === query;
  }

  if (operator === "startsWith") {
    return candidate.startsWith(query);
  }

  return candidate.includes(query);
}

function matchesJoinMode(
  matches: boolean[],
  joinMode: SearchJoinMode,
): boolean {
  if (matches.length === 0) {
    return false;
  }

  if (joinMode === "all") {
    return matches.every(Boolean);
  }

  return matches.some(Boolean);
}
