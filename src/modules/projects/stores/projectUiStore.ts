import { defineStore } from "pinia";
import { ref } from "vue";

export const useProjectUiStore = defineStore("project-ui", () => {
  const selectedProjectId = ref<string | null>(null);
  const sidebarOpen = ref(true);

  function selectProject(id: string | null) {
    selectedProjectId.value = id;
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  return {
    selectedProjectId,
    sidebarOpen,
    selectProject,
    toggleSidebar,
  };
});
