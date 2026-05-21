<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import { computed } from "vue";

  interface Props {
    visible: boolean;
    application: Application | null;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<(e: "update:visible", value: boolean) => void>();

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    header="Application Details"
  >
    <div v-if="application" class="space-y-4">
      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Title</p>
        <p class="text-sm font-medium">{{ application.title }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Status</p>
        <p class="text-sm">{{ application.status }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Location</p>
        <p class="text-sm">{{ application.locationText || "-" }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Latitude</p>
        <p class="text-sm">{{ application.locationLat ?? "-" }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">
          Longitude
        </p>
        <p class="text-sm">{{ application.locationLng ?? "-" }}</p>
      </div>
    </div>
  </Drawer>
</template>
