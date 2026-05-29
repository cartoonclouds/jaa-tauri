<script setup lang="ts">
  import type { Contact } from "@modules/contacts/domain/entities/Contact";

  import { computed } from "vue";

  import LocationMapFull from "@/components/ui/LocationMapFull.vue";

  interface Props {
    visible: boolean;
    contact: Contact | null;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    hide: [];
  }>();

  const visibleModel = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const mapHeader = computed(() =>
    props.contact ? `Map - ${props.contact.fullName}` : "Map",
  );

  const mapTitle = computed(() =>
    props.contact
      ? `Map for ${props.contact.fullName}`
      : "Contact location map",
  );
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :style="{ width: 'min(64rem, 92vw)' }"
    :header="mapHeader"
    @hide="emit('hide')"
  >
    <LocationMapFull
      :latitude="contact?.locationLat ?? null"
      :longitude="contact?.locationLng ?? null"
      :location-text="contact?.locationText ?? null"
      :title="mapTitle"
      height-class="h-[26rem]"
    />
  </Dialog>
</template>
