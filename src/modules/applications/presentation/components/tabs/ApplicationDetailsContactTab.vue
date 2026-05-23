<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import { useContactService } from "@modules/contacts";
  import { computed, ref, watch } from "vue";

  import LocationMapFull from "@/components/ui/LocationMapFull.vue";

  interface LinkedContact {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    locationLat: number | null;
    locationLng: number | null;
    type: "company" | "recruiter";
    notes: string | null;
  }

  interface LinkedContactSection {
    contact: LinkedContact;
    companyName: string | null;
  }

  interface ContactLookupService {
    listByApplicationId(applicationId: string): Promise<LinkedContactSection[]>;
  }

  interface Props {
    application: Application | null;
    companyName: string;
  }

  const props = defineProps<Props>();

  const contactService = useContactService() as ContactLookupService;

  const linkedContacts = ref<LinkedContactSection[]>([]);
  const loading = ref(false);
  const errorMessage = ref<string | null>(null);

  const hasApplication = computed(() => Boolean(props.application?.id));

  async function loadContacts(applicationId: string): Promise<void> {
    loading.value = true;
    errorMessage.value = null;

    try {
      linkedContacts.value =
        await contactService.listByApplicationId(applicationId);
    } catch (error: unknown) {
      linkedContacts.value = [];
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage.value = `Unable to load contacts: ${message}`;
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => props.application?.id,
    async (applicationId) => {
      if (!applicationId) {
        linkedContacts.value = [];
        errorMessage.value = null;
        return;
      }

      await loadContacts(applicationId);
    },
    { immediate: true },
  );
</script>

<template>
  <div class="space-y-4">
    <Message v-if="!hasApplication" severity="info">
      Contact information is available after selecting an application.
    </Message>

    <Message v-else-if="errorMessage" severity="error">
      {{ errorMessage }}
    </Message>

    <Message v-else-if="loading" severity="info">Loading contacts...</Message>

    <Message v-else-if="linkedContacts.length === 0" severity="info">
      No contacts are associated with this application yet.
    </Message>

    <div v-else class="space-y-4">
      <section
        v-for="item in linkedContacts"
        :key="item.contact.id"
        class="rounded-xl border border-surface-200 bg-surface-0 p-4"
      >
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-surface-900">
              {{ item.contact.fullName }}
            </h3>
            <p class="text-sm text-surface-600">
              {{ item.companyName || companyName || "-" }}
            </p>
          </div>
          <Tag :value="item.contact.type" severity="secondary" />
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <Card :pt="{ root: 'p-3' }">
            <template #title>
              <span class="text-xs uppercase tracking-wide text-surface-500"
                >Email</span
              >
            </template>
            <template #content>
              <p class="text-sm text-surface-700">
                {{ item.contact.email || "-" }}
              </p>
            </template>
          </Card>

          <Card :pt="{ root: 'p-3' }">
            <template #title>
              <span class="text-xs uppercase tracking-wide text-surface-500"
                >Phone</span
              >
            </template>
            <template #content>
              <p class="text-sm text-surface-700">
                {{ item.contact.phone || "-" }}
              </p>
            </template>
          </Card>

          <Card :pt="{ root: 'p-3' }">
            <template #title>
              <span class="text-xs uppercase tracking-wide text-surface-500"
                >LinkedIn</span
              >
            </template>
            <template #content>
              <a
                v-if="item.contact.linkedinUrl"
                :href="item.contact.linkedinUrl"
                target="_blank"
                rel="noreferrer"
                class="text-sm font-medium text-primary-600 hover:underline"
              >
                {{ item.contact.linkedinUrl }}
              </a>
              <p v-else class="text-sm text-surface-700">-</p>
            </template>
          </Card>

          <Card :pt="{ root: 'p-3' }">
            <template #title>
              <span class="text-xs uppercase tracking-wide text-surface-500"
                >Location</span
              >
            </template>
            <template #content>
              <p class="text-sm text-surface-700">
                {{ item.contact.locationText || "-" }}
              </p>
            </template>
          </Card>
        </div>

        <LocationMapFull
          class="mt-4"
          :latitude="item.contact.locationLat"
          :longitude="item.contact.locationLng"
          :location-text="item.contact.locationText"
          :title="`Map for ${item.contact.fullName}`"
          height-class="h-56"
        />

        <Card v-if="item.contact.notes" class="mt-3" :pt="{ root: 'p-3' }">
          <template #title>
            <span class="text-xs uppercase tracking-wide text-surface-500"
              >Notes</span
            >
          </template>
          <template #content>
            <p class="whitespace-pre-line text-sm text-surface-700">
              {{ item.contact.notes }}
            </p>
          </template>
        </Card>
      </section>
    </div>
  </div>
</template>
