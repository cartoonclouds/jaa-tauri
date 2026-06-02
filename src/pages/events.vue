<script setup lang="ts">
  import EventInteractionTree from "@modules/events/presentation/components/EventInteractionTree.vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });
</script>

<template>
  <EventInteractionTree />
</template>



