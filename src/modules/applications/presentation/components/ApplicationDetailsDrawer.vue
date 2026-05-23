<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
    ApplicationSelectOption,
  } from "@modules/applications/types/presentation";
  import type { Company } from "@modules/companies/domain/entities/Company";

  import ApplicationDetailsApplicationTab from "@modules/applications/presentation/components/tabs/ApplicationDetailsApplicationTab.vue";
  import ApplicationDetailsContactTab from "@modules/applications/presentation/components/tabs/ApplicationDetailsContactTab.vue";
  import ApplicationDetailsMapTab from "@modules/applications/presentation/components/tabs/ApplicationDetailsMapTab.vue";
  import ApplicationDetailsSummaryTab from "@modules/applications/presentation/components/tabs/ApplicationDetailsSummaryTab.vue";
  import { computed, ref, watch } from "vue";

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
    class="w-full! max-w-3xl"
  >
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="summary">Summary</Tab>
        <Tab value="application">Application</Tab>
        <Tab value="contact">Contacts</Tab>
        <Tab value="map">Map</Tab>
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
      </TabPanels>
    </Tabs>
  </Drawer>
</template>









