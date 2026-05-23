<script setup lang="ts">
  import EventInteractionTree from "@modules/events/presentation/components/EventInteractionTree.vue";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });
</script>

<template>
  <EventInteractionTree />
</template>



