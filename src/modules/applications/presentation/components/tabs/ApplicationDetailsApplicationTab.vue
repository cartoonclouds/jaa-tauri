<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
    ApplicationSelectOption,
  } from "@modules/applications/types/presentation";

  import ApplicationDetailsView from "@modules/applications/presentation/components/ApplicationDetailsView.vue";
  import ApplicationForm from "@modules/applications/presentation/components/ApplicationForm.vue";

  /**
   * Defines props.
   */
  interface Props {
    mode: ApplicationDrawerMode;
    application: Application | null;
    initialValues: ApplicationFormValues;
    companies: ApplicationSelectOption[];
    busy?: boolean;
    isDeleting?: boolean;
    companyName: string;
    appliedAtLabel: string;
  }

  withDefaults(defineProps<Props>(), {
    busy: false,
    isDeleting: false,
  });

  const emit = defineEmits<{
    submit: [payload: ApplicationFormSubmitPayload];
    "request-edit": [];
    "request-delete": [id: string];
    "cancel-edit": [];
  }>();

  /**
   * Handles on submit.
   */
  function onSubmit(payload: ApplicationFormSubmitPayload): void {
    emit("submit", payload);
  }

  /**
   * Handles on delete.
   */
  function onDelete(application: Application): void {
    emit("request-delete", application.id);
  }
</script>

<template>
  <div v-if="mode !== 'view'" class="space-y-4">
    <ApplicationForm
      :mode="mode === 'create' ? 'create' : 'edit'"
      :initial-values="initialValues"
      :busy="busy"
      :companies="companies"
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
    @request-delete="onDelete(application)"
  />

  <Message v-else severity="info">
    No application details are currently available.
  </Message>
</template>









