<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
  } from "@modules/applications/types/presentation";
  import type { Company } from "@modules/companies/domain/entities/Company";

  import ApplicationDetailsView from "@modules/applications/presentation/components/ApplicationDetailsView.vue";
  import ApplicationForm from "@modules/applications/presentation/components/ApplicationForm.vue";
  import { computed } from "vue";

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

  const companyOptions = computed(() =>
    props.companies.map((company) => ({
      label: company.name,
      value: company.id,
    })),
  );

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

  function onSubmit(payload: ApplicationFormSubmitPayload): void {
    emit("submit", payload);
  }

  function onDelete(): void {
    if (!props.application) {
      return;
    }

    emit("request-delete", props.application.id);
  }
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    :header="drawerHeader"
    class="w-full! max-w-3xl"
  >
    <div class="rounded-2xl border border-surface-200 bg-white p-3 shadow-sm">
      <div v-if="mode !== 'view'" class="space-y-4">
        <ApplicationForm
          :mode="mode === 'create' ? 'create' : 'edit'"
          :initial-values="initialValues"
          :busy="busy"
          :companies="companyOptions"
          :show-cancel="mode === 'edit'"
          @submit="onSubmit"
          @cancel="emit('cancel-edit')"
        />
      </div>

      <ApplicationDetailsView
        v-else-if="application"
        :application="application"
        :company-name="companyName"
        :applied-at-label="appliedAtLabel"
        :is-deleting="isDeleting"
        @request-edit="emit('request-edit')"
        @request-delete="onDelete"
      />
    </div>
  </Drawer>
</template>
