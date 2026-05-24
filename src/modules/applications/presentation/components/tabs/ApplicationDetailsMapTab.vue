<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import ApplicationDetailsCard from "@modules/applications/presentation/components/cards/ApplicationDetailsCard.vue";

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
    <ApplicationDetailsCard v-if="application" title="Location" compact>
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
    </ApplicationDetailsCard>

    <Message v-else severity="info">
      Map information is available after selecting an application.
    </Message>
  </div>
</template>
