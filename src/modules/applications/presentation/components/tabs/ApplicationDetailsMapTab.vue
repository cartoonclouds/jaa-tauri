<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import LocationMapFull from "@/components/ui/LocationMapFull.vue";

  /**
   * Defines props.
   */
  interface Props {
    application: Application | null;
  }

  defineProps<Props>();
</script>

<template>
  <div class="space-y-3">
    <Card v-if="application" :pt="{ root: 'p-3' }">
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Location</span
        >
      </template>
      <template #content>
        <p class="text-sm text-surface-700">
          {{ application.locationText || "-" }}
        </p>
        <p class="mt-1 text-sm text-surface-600">
          Lat: {{ application.locationLat ?? "-" }} | Lng:
          {{ application.locationLng ?? "-" }}
        </p>

        <LocationMapFull
          class="mt-4"
          :latitude="application.locationLat"
          :longitude="application.locationLng"
          :location-text="application.locationText"
          :title="`Map for ${application.title}`"
          height-class="h-64"
        />
      </template>
    </Card>

    <Message v-else severity="info">
      Map information is available after selecting an application.
    </Message>
  </div>
</template>









