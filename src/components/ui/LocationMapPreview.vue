<script setup lang="ts">
  /**
   * Minimal props needed for the compact map preview variant.
   */
  interface Props {
    latitude: number | null;
    longitude: number | null;
    locationText: string | null;
    title?: string;
  }

  withDefaults(defineProps<Props>(), {
    title: "Location preview",
  });
</script>

<template>
  <LocationMapFull
    :latitude="latitude"
    :longitude="longitude"
    :location-text="locationText"
    :title="title"
    height-class="h-28"
    :show-open-link="false"
  />
</template>
