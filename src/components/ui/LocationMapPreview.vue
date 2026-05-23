<script setup lang="ts">
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
