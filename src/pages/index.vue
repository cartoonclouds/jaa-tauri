<script setup lang="ts">
  import type { SearchResult } from "@modules/search/types";

  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";
  import { useProfile } from "@modules/profile";
  import QuickSearchInput from "@modules/search/presentation/components/QuickSearchInput.vue";
  import { openSearchResult } from "@modules/search/utils/openSearchResult";
  import { getSetting } from "@modules/settings";
  import InsightsSection from "@modules/insights/presentation/components/InsightsSection.vue";
  import { SETTINGS_REFRESHED_TOPIC } from "@shared/constants/pubsubTopics";
  import { nextTick, ref } from "vue";

  import EntityLocationsMapBrowser from "@/components/ui/EntityLocationsMapBrowser.vue";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
  import { useContactsDialog } from "@/composables/useContactsDialog";
  import { usePubSub } from "@/composables/usePubSub";
  import { formatProfileName } from "@/shared/utils/strings";
  import { getTimeOfDay } from "@/shared/utils/toDate";

  /**
   * Type alias for top section view.
   */
  type TopSectionView = "overview" | "map";
  /**
   * Defines top section option.
   */
  interface TopSectionOption {
    label: string;
    value: TopSectionView;
  }

  const { service: profileService } = useProfile();
  const { openContactsDialog } = useContactsDialog();
  const { openCompaniesDialog } = useCompaniesDialog();
  const { subscribe } = usePubSub();

  const profile = await profileService.getProfile();
  const showOverview = ref(await getSetting("showOverview"));

  const topView = ref<TopSectionView>("overview");

  const selectedApplicationId = ref<string | null>(null);

  const topViewOptions: TopSectionOption[] = [
    { label: "Overview", value: "overview" },
    { label: "Map", value: "map" },
  ];

  subscribe(SETTINGS_REFRESHED_TOPIC, async () => {
    showOverview.value = await getSetting("showOverview");
  });

  async function onQuickSearchSelect(result: SearchResult): Promise<void> {
    await openSearchResult(result, {
      async applications(applicationId: string): Promise<void> {
        topView.value = "overview";
        selectedApplicationId.value = null;
        await nextTick();
        selectedApplicationId.value = applicationId;
      },
      contacts(contactId: string): void {
        topView.value = "overview";
        openContactsDialog(contactId);
      },
      companies(companyId: string): void {
        topView.value = "overview";
        openCompaniesDialog(companyId);
      },
    });
  }
</script>

<template>
  <main
    :class="[
      'flex flex-col bg-slate-950 p-6 text-slate-100 ',
      topView === 'map' ? 'h-dvh' : 'min-h-screen',
    ]"
  >
    <div class="mx-auto mb-6 flex justify-between w-full">
      <div>
        <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Icon name="heroicons:briefcase" class="text-emerald-400" />
          {{ getTimeOfDay() }}, {{ formatProfileName(profile.fullName) }}
        </h1>

        <p class="text-slate-300 mt-2">Here's your application overview.</p>
      </div>

      <SelectButton
        v-model="topView"
        :options="topViewOptions"
        option-label="label"
        option-value="value"
        aria-label="Home view"
      />
    </div>

    <div v-if="topView === 'overview'" class="mx-auto space-y-6 w-full">
      <QuickSearchInput @select="onQuickSearchSelect" />

      <ClientOnly>
        <section v-if="showOverview" class="mx-auto mb-8 w-full">
          <InsightsSection title="Job Hunt Overview" />
        </section>
      </ClientOnly>

      <ClientOnly>
        <ApplicationComponent :initial-application-id="selectedApplicationId" />
      </ClientOnly>
    </div>

    <div v-else class="mx-auto flex min-h-0 flex-1 w-full">
      <ClientOnly>
        <EntityLocationsMapBrowser class="h-full w-full" />
      </ClientOnly>
    </div>
  </main>
</template>
