<script setup lang="ts">
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";
  import StatisticsSection from "@modules/statistics/presentation/components/StatisticsSection.vue";
  import { defineAsyncComponent, ref } from "vue";

  import { Icon } from "#components";
  import { useOnboardingNavigation } from "@/composables/useOnboardingNavigation.client";

  const EntityLocationsMapBrowser = defineAsyncComponent(
    () => import("@/components/ui/EntityLocationsMapBrowser.vue"),
  );

  const { openOnboarding } = useOnboardingNavigation();

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

  const topView = ref<TopSectionView>("overview");
  const topViewOptions: TopSectionOption[] = [
    { label: "Overview", value: "overview" },
    { label: "Map", value: "map" },
  ];
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
    <div class="mx-auto mb-6 flex justify-end">
      <div class="grow">
        <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Icon name="heroicons:briefcase" class="text-emerald-400" />
          Apply-Flow
        </h1>

        <p class="text-slate-300">
          Feature modules are wired with repository, service, query composable,
          and CRUD pages.
        </p>
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
      <div class="flex">
        <Button severity="contrast" @click="openOnboarding">
          <Icon name="heroicons:rocket-launch-solid" class="h-4 w-4" />
          <span>Open Onboarding</span>
        </Button>
      </div>

      <p
        class="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
      >
        <Icon name="heroicons:computer-desktop" />

        Device detection {{ $device.isMobile ? "Mobile" : "Desktop" }}
      </p>
    </div>

    <div v-else class="mx-auto mb-6">
      <ClientOnly>
        <EntityLocationsMapBrowser />
      </ClientOnly>
    </div>

    <ClientOnly>
      <section class="mx-auto mb-8">
        <StatisticsSection title="Job Hunt Snapshot" />
      </section>
    </ClientOnly>

    <ClientOnly>
      <ApplicationComponent />
    </ClientOnly>
  </main>
</template>
