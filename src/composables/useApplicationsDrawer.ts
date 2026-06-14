import { computed, ref } from "vue";

const applicationDrawerVisible = ref(false);
const pendingApplicationId = ref<string | null>(null);

/**
 * Manage global visibility state for opening the application drawer.
 */
export function useApplicationsDrawer() {
  const isApplicationDrawerVisible = computed({
    get: () => applicationDrawerVisible.value,
    set: (value: boolean) => {
      applicationDrawerVisible.value = value;
    },
  });

  function openApplicationDrawer(applicationId?: string | null): void {
    pendingApplicationId.value =
      typeof applicationId === "string" && applicationId.trim().length > 0
        ? applicationId
        : null;
    applicationDrawerVisible.value = true;
  }

  function closeApplicationDrawer(): void {
    applicationDrawerVisible.value = false;
  }

  function consumePendingApplicationId(): string | null {
    const nextApplicationId = pendingApplicationId.value;
    pendingApplicationId.value = null;

    return nextApplicationId;
  }

  return {
    isApplicationDrawerVisible,
    openApplicationDrawer,
    closeApplicationDrawer,
    consumePendingApplicationId,
  };
}
