<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";
  import { useProfile } from "@modules/profile";
  import { getSetting } from "@modules/settings";
  import StatisticsSection from "@modules/statistics/presentation/components/StatisticsSection.vue";
  import { SETTINGS_REFRESHED_TOPIC } from "@shared/constants/pubsubTopics";
  import { ref } from "vue";

  import EntityLocationsMapBrowser from "@/components/ui/EntityLocationsMapBrowser.vue";
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
  const { subscribe } = usePubSub();

  const profile = await profileService.getProfile();
  const showOverview = ref(await getSetting("showOverview"));

  const topView = ref<TopSectionView>("overview");

  const topViewOptions: TopSectionOption[] = [
    { label: "Overview", value: "overview" },
    { label: "Map", value: "map" },
  ];

  subscribe(SETTINGS_REFRESHED_TOPIC, async () => {
    showOverview.value = await getSetting("showOverview");
  });
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
      <ClientOnly>
        <section v-if="showOverview" class="mx-auto mb-8 w-full">
          <StatisticsSection title="Job Hunt Overview" />
        </section>
      </ClientOnly>

      <ClientOnly>
        <ApplicationComponent />
      </ClientOnly>
    </div>

    <div v-else class="mx-auto flex min-h-0 flex-1 w-full">
      <ClientOnly>
        <EntityLocationsMapBrowser class="h-full w-full" />
      </ClientOnly>
    </div>
  </main>
</template>
