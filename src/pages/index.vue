<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";
  import { useProfile } from "@modules/profile";
  import StatisticsSection from "@modules/statistics/presentation/components/StatisticsSection.vue";
  import { ref } from "vue";

  import EntityLocationsMapBrowser from "@/components/ui/EntityLocationsMapBrowser.vue";
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

  const profile = await profileService.getProfile();

  const topView = ref<TopSectionView>("overview");

  const topViewOptions: TopSectionOption[] = [
    { label: "Overview", value: "overview" },
    { label: "Map", value: "map" },
  ];
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

    <div v-if="topView === 'overview'" class="mx-auto space-y-6">
      <ClientOnly>
        <section class="mx-auto mb-8">
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
