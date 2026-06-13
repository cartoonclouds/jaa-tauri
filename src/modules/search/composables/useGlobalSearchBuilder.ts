import type { SearchJoinMode, SearchScope } from "@modules/search/types";

import {
  createSearchCondition,
  getActiveConditions,
  SEARCH_FIELDS_BY_SCOPE,
} from "@modules/search/utils/searchUtils";
import { computed, ref } from "vue";

/**
 * Manages state and mutations for the global search builder.
 */
export function useGlobalSearchBuilder() {
  const joinMode = ref<SearchJoinMode>("all");
  const conditions = ref([createSearchCondition("applications")]);

  const hasActiveQuery = computed(
    () => getActiveConditions(conditions.value).length > 0,
  );

  /**
   * Resets join mode and conditions to initial defaults.
   */
  function resetBuilder(): void {
    joinMode.value = "all";
    conditions.value = [createSearchCondition("applications")];
  }

  /**
   * Returns available field options for the given scope.
   */
  function getFieldOptions(scope: SearchScope) {
    return [...SEARCH_FIELDS_BY_SCOPE[scope]];
  }

  /**
   * Updates condition scope and resets field to the scope default.
   */
  function onScopeChange(conditionId: string, nextScope: SearchScope): void {
    conditions.value = conditions.value.map((condition) => {
      if (condition.id !== conditionId) {
        return condition;
      }

      const defaultField = SEARCH_FIELDS_BY_SCOPE[nextScope][0]?.value ?? "";

      return {
        ...condition,
        scope: nextScope,
        field: defaultField,
      };
    });
  }

  /**
   * Adds a new default condition row.
   */
  function addCondition(): void {
    conditions.value = [
      ...conditions.value,
      createSearchCondition("applications"),
    ];
  }

  /**
   * Removes a condition row; preserves at least one row.
   */
  function removeCondition(conditionId: string): void {
    if (conditions.value.length <= 1) {
      resetBuilder();
      return;
    }

    conditions.value = conditions.value.filter(
      (condition) => condition.id !== conditionId,
    );
  }

  return {
    joinMode,
    conditions,
    hasActiveQuery,
    resetBuilder,
    getFieldOptions,
    onScopeChange,
    addCondition,
    removeCondition,
  };
}
