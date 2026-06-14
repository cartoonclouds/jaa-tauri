import type { Application } from "@modules/applications/domain/entities/Application";
import type { ApplicationSelectOption } from "@modules/applications/types";
import type { Company } from "@modules/companies/domain/entities/Company";
import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type { LocationFields, WithId } from "@shared/types";

/**
 * Search scopes supported by the global search builder.
 */
export type SearchScope =
  | "applications"
  | "contacts"
  | "companies"
  | "locations";

/**
 * Canonical ordered list of supported search scopes.
 */
export const SEARCH_SCOPES: SearchScope[] = [
  "applications",
  "contacts",
  "companies",
  "locations",
];

/**
 * Generic map keyed by search scope.
 */
export type SearchScopeMap<TValue> = Record<SearchScope, TValue>;

/**
 * Scope-keyed map of free-text query strings.
 */
export type SearchScopeQueryMap = SearchScopeMap<string>;

/**
 * Operators supported by search conditions.
 */
export type SearchOperator = "contains" | "equals" | "startsWith";

/**
 * Join mode used to evaluate multiple conditions.
 */
export type SearchJoinMode = "all" | "any";

/**
 * Label/value option shape used by select controls.
 */
export type SearchOption = ApplicationSelectOption;

/**
 * A single search condition configured by the user.
 */
export interface SearchCondition extends WithId {
  scope: SearchScope;
  field: string;
  operator: SearchOperator;
  value: string;
}

/**
 * Shared source shape for records that can contribute location search data.
 */
export type SearchLocationSource = WithId &
  Pick<LocationFields, "locationText">;

/**
 * Aggregated location record derived from search datasets.
 */
export interface LocationRecord extends SearchLocationSource {
  applicationCount: number;
  companyCount: number;
  contactCount: number;
}

/**
 * Unified result row rendered in each search result section.
 */
export interface SearchResult
  extends WithId, Pick<LocationFields, "locationText"> {
  entityType: SearchScope;
  title: string;
  subtitle: string;
  detail: string | null;
  targetId: string | null;
}

/**
 * Dataset used by the global search service.
 */
export interface GlobalSearchDataset {
  applications: Application[];
  contacts: Contact[];
  companies: Company[];
  locations: LocationRecord[];
}

/**
 * Result sections returned by the global search service.
 */
export interface GlobalSearchResultSections {
  applications: SearchResult[];
  contacts: SearchResult[];
  companies: SearchResult[];
  locations: SearchResult[];
  totalCount: number;
}

/**
 * Contract for global search dataset/result orchestration.
 */
export interface GlobalSearchServiceContract {
  loadDataset(): Promise<GlobalSearchDataset>;
  buildResultSections(options: {
    dataset: GlobalSearchDataset;
    conditions: SearchCondition[];
    joinMode: SearchJoinMode;
  }): Promise<GlobalSearchResultSections>;
}

/**
 * Contract for side effects triggered by selected search results.
 */
export interface GlobalSearchActionServiceContract {
  handleResultSelection(result: SearchResult): Promise<void>;
}

/**
 * Per-scope field metadata used by the search builder.
 */
export type SearchFieldsByScope = Readonly<
  Record<SearchScope, readonly SearchOption[]>
>;
