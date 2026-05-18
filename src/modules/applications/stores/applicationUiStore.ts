import { defineStore } from "pinia";
import { ref } from "vue";

export const useApplicationUiStore = defineStore("application-ui", () => {
  const selectedApplicationId = ref<string | null>(null);
  const detailsPanelOpen = ref(false);

  function selectApplication(id: string | null) {
    selectedApplicationId.value = id;
    detailsPanelOpen.value = id !== null;
  }

  function toggleDetailsPanel() {
    detailsPanelOpen.value = !detailsPanelOpen.value;
  }

  return {
    selectedApplicationId,
    detailsPanelOpen,
    selectApplication,
    toggleDetailsPanel,
  };
});
