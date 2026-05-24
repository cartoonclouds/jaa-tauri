<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
    ApplicationSelectOption,
  } from "@modules/applications/types/presentation";
  import type { Company } from "@modules/companies/domain/entities/Company";

  import { scrollDrawerContentToTop } from "@modules/applications/presentation/utils/drawerScrollUtils";
  import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
    isDeleting: false,
  });
  const emit = defineEmits<{
    "update:visible": [value: boolean];
    submit: [payload: ApplicationFormSubmitPayload];
    "request-edit": [];
    "request-delete": [id: string];
    "cancel-edit": [];
  }>();
  const ApplicationDetailsApplicationTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsApplicationTab.vue"),
  );
  const ApplicationDetailsContactTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsContactTab.vue"),
  );
  const ApplicationDetailsMapTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsMapTab.vue"),
  );
  const ApplicationDetailsFilesTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsFilesTab.vue"),
  );
  const ApplicationDetailsSummaryTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsSummaryTab.vue"),
  );

  /**
   * Defines props.
   */
  interface Props {
    visible: boolean;
    application: Application | null;
    mode: ApplicationDrawerMode;
    initialValues: ApplicationFormValues;
    companies: Company[];
    busy?: boolean;
    isDeleting?: boolean;
  }

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const companyOptions = computed<ApplicationSelectOption[]>(() =>
    props.companies.map((company) => ({
      label: company.name,
      value: company.id,
    })),
  );

  const activeTab = ref("summary");

  const drawerHeader = computed(() => {
    if (props.mode === "create") {
      return "Create Application";
    }

    if (props.mode === "edit") {
      return "Edit Application";
    }

    return "Application Details";
  });

  const companyName = computed(() => {
    if (!props.application?.companyId) {
      return "-";
    }

    const company = props.companies.find(
      (entry) => entry.id === props.application?.companyId,
    );
    return company?.name ?? props.application.companyId;
  });

  const appliedAtLabel = computed(() => {
    if (!props.application?.appliedAt) {
      return "-";
    }

    return props.application.appliedAt.toLocaleString();
  });

  watch(
    () => [props.visible, props.mode],
    ([visible, mode]) => {
      if (!visible) {
        return;
      }

      activeTab.value = mode === "view" ? "summary" : "application";

      if (mode === "create" || mode === "edit") {
        void nextTick(() => {
          scrollDrawerContentToTop("application-details-drawer");
        });
      }
    },
    { immediate: true },
  );

  /**
   * Handles on submit.
   */
  function onSubmit(payload: ApplicationFormSubmitPayload): void {
    emit("submit", payload);
  }
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    :header="drawerHeader"
    class="application-details-drawer w-full! max-w-3xl"
  >
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="summary">Summary</Tab>
        <Tab value="application">Application</Tab>
        <Tab value="contact">Contacts</Tab>
        <Tab value="map">Map</Tab>
        <Tab value="files">Files</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="summary">
          <ApplicationDetailsSummaryTab
            :application="application"
            :company-name="companyName"
            :applied-at-label="appliedAtLabel"
          />
        </TabPanel>

        <TabPanel value="application">
          <ApplicationDetailsApplicationTab
            :mode="mode"
            :application="application"
            :initial-values="initialValues"
            :companies="companyOptions"
            :busy="busy"
            :is-deleting="isDeleting"
            :company-name="companyName"
            :applied-at-label="appliedAtLabel"
            @submit="onSubmit"
            @cancel-edit="emit('cancel-edit')"
            @request-edit="emit('request-edit')"
            @request-delete="emit('request-delete', $event)"
          />
        </TabPanel>

        <TabPanel value="contact">
          <ApplicationDetailsContactTab
            :application="application"
            :company-name="companyName"
          />
        </TabPanel>

        <TabPanel value="map">
          <ApplicationDetailsMapTab :application="application" />
        </TabPanel>

        <TabPanel value="files">
          <ApplicationDetailsFilesTab :application="application" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Drawer>
</template>
