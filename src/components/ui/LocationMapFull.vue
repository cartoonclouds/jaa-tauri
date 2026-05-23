<script setup lang="ts">
  import { computed } from "vue";

  interface Props {
    latitude: number | null;
    longitude: number | null;
    locationText: string | null;
    title?: string;
    heightClass?: string;
    showOpenLink?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: "Location map",
    heightClass: "h-72",
    showOpenLink: true,
  });

  function buildOsmEmbedUrl(latitude: number, longitude: number): string {
    const delta = 0.02;
    const minLon = Math.max(-180, longitude - delta);
    const maxLon = Math.min(180, longitude + delta);
    const minLat = Math.max(-90, latitude - delta);
    const maxLat = Math.min(90, latitude + delta);

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon.toString()}%2C${minLat.toString()}%2C${maxLon.toString()}%2C${maxLat.toString()}&layer=mapnik&marker=${latitude.toString()}%2C${longitude.toString()}`;
  }

  const mapEmbedUrl = computed(() => {
    const hasCoordinates =
      typeof props.latitude === "number" && typeof props.longitude === "number";

    if (hasCoordinates) {
      return buildOsmEmbedUrl(props.latitude, props.longitude);
    }

    return null;
  });

  const openMapUrl = computed(() => {
    const hasCoordinates =
      typeof props.latitude === "number" && typeof props.longitude === "number";

    if (hasCoordinates) {
      return `https://www.openstreetmap.org/?mlat=${props.latitude.toString()}&mlon=${props.longitude.toString()}#map=14/${props.latitude.toString()}/${props.longitude.toString()}`;
    }

    if (props.locationText) {
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(props.locationText)}`;
    }

    return null;
  });
</script>

<template>
  <div class="space-y-2">
    <div class="overflow-hidden rounded-lg border border-surface-200">
      <iframe
        v-if="mapEmbedUrl"
        :src="mapEmbedUrl"
        :class="['w-full', heightClass]"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        :title="title"
      />
      <div v-else class="p-3 text-sm text-surface-600">
        No location data available.
      </div>
    </div>

    <a
      v-if="showOpenLink && openMapUrl"
      :href="openMapUrl"
      target="_blank"
      rel="noreferrer"
      class="inline-flex text-sm font-medium text-primary-600 hover:underline"
    >
      Open in map
    </a>
  </div>
</template>
