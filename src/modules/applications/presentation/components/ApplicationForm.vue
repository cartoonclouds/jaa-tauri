<script setup lang="ts">
  import type {
    ApplicationAttendanceType,
    ApplicationEmploymentType,
    ApplicationEventFlowStatus,
    ApplicationStatus,
  } from "@modules/applications/types/enums";

  import { ApplicationFormSchema } from "@modules/applications/domain/zod/application.schema";
  import {
    APPLICATION_ATTENDANCE_OPTIONS,
    APPLICATION_EMPLOYMENT_OPTIONS,
    APPLICATION_EVENT_FLOW_STATUS_OPTIONS,
    APPLICATION_STATUS_OPTIONS,
  } from "@modules/applications/presentation/constants/applicationFormOptions";
  import {
    formatApplicationStatusLabel,
    getApplicationPriorityClass,
    getApplicationStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";
  import {
    ApplicationEventFlowStatus as ApplicationEventFlowStatusEnum,
    ApplicationStatus as ApplicationStatusEnum,
  } from "@modules/applications/types/enums";
  import {
    type ApplicationFormSubmitPayload,
    type ApplicationFormValues,
    type ApplicationSelectOption,
  } from "@modules/applications/types/presentation";
  import TagMultiSelect from "@modules/tags/presentation/components/TagMultiSelect.vue";
  import { Form, type FormSubmitEvent } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { computed, ref, watch } from "vue";

  /**
   * Defines props.
   */
  interface Props {
    initialValues?: Partial<ApplicationFormValues>;
    mode?: "create" | "edit";
    busy?: boolean;
    companies?: ApplicationSelectOption[];
    showCancel?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    initialValues: () => ({}),
    mode: "create",
    busy: false,
    companies: () => [],
    showCancel: true,
  });

  const emit = defineEmits<{
    submit: [payload: ApplicationFormSubmitPayload];
    cancel: [];
  }>();

  const selectedTagIds = ref<string[]>([]);
  const pendingTagNames = ref<string[]>([]);
  const isEditMode = computed(() => props.mode === "edit");

  watch(
    () => props.initialValues.tagIds,
    (tagIds) => {
      selectedTagIds.value = [...(tagIds ?? [])];
      pendingTagNames.value = [];
    },
    { immediate: true },
  );

  const formValues = computed(() => {
    return {
      companyId: props.initialValues.companyId ?? null,
      title: props.initialValues.title ?? "",
      status: props.initialValues.status ?? ApplicationStatusEnum.Saved,
      eventFlowStatus:
        props.initialValues.eventFlowStatus ??
        ApplicationEventFlowStatusEnum.Applied,
      sourceUrl: props.initialValues.sourceUrl ?? "",
      appliedAt: props.initialValues.appliedAt ?? "",
      locationText: props.initialValues.locationText ?? "",
      locationLat: props.initialValues.locationLat ?? null,
      locationLng: props.initialValues.locationLng ?? null,
      attendanceType: props.initialValues.attendanceType ?? null,
      employmentType: props.initialValues.employmentType ?? null,
      salaryMin: props.initialValues.salaryMin ?? null,
      salaryMax: props.initialValues.salaryMax ?? null,
      currency: props.initialValues.currency ?? "",
      description: props.initialValues.description ?? "",
      interviewProcess: props.initialValues.interviewProcess ?? "",
      benefits: props.initialValues.benefits ?? "",
      tagIds: props.initialValues.tagIds ?? [],
      priority: props.initialValues.priority ?? 3,
      isArchived: props.initialValues.isArchived ?? false,
    };
  });

  /**
   * Handles get status preview class.
   */
  function getStatusPreviewClass(status: ApplicationStatus | undefined | null) {
    /**
     * Gets status preview class.
     */
    /**
     * Gets status preview class.
     */
    return getApplicationStatusClass(status);
  }

  /**
   * Handles get status preview label.
   */
  function getStatusPreviewLabel(status: ApplicationStatus | undefined | null) {
    /**
     * Gets status preview label.
     */
    /**
     * Gets status preview label.
     */
    return formatApplicationStatusLabel(status);
  }

  /**
   * Handles get priority preview class.
   */
  function getPriorityPreviewClass(priority: number | undefined | null) {
    /**
     * Gets priority preview class.
     */
    /**
     * Gets priority preview class.
     */
    return priority
      ? getApplicationPriorityClass(priority)
      : "bg-slate-100 text-slate-800 ring-slate-200";
  }

  /**
   * Handles on form submit.
   */
  function onFormSubmit(event: FormSubmitEvent): void {
    if (!event.valid) return;

    const values = event.values as Record<string, unknown> | undefined;
    if (!values) return;

    emit("submit", {
      companyId: (values.companyId as string) || null,
      title: (values.title as string).trim(),
      status: values.status as ApplicationStatus,
      eventFlowStatus: values.eventFlowStatus as ApplicationEventFlowStatus,
      sourceUrl: values.sourceUrl ? (values.sourceUrl as string).trim() : null,
      appliedAt: values.appliedAt ? (values.appliedAt as string) : null,
      locationText: values.locationText
        ? (values.locationText as string).trim()
        : null,
      locationLat: isEditMode.value
        ? (props.initialValues.locationLat ?? null)
        : ((values.locationLat as number | null) ?? null),
      locationLng: isEditMode.value
        ? (props.initialValues.locationLng ?? null)
        : ((values.locationLng as number | null) ?? null),
      attendanceType: values.attendanceType as ApplicationAttendanceType | null,
      employmentType: values.employmentType as ApplicationEmploymentType | null,
      salaryMin: values.salaryMin as number | null,
      salaryMax: values.salaryMax as number | null,
      currency: values.currency
        ? (values.currency as string).trim().toUpperCase()
        : null,
      description: values.description
        ? (values.description as string).trim()
        : null,
      interviewProcess: values.interviewProcess
        ? (values.interviewProcess as string).trim()
        : null,
      benefits: values.benefits ? (values.benefits as string).trim() : null,
      tagIds: selectedTagIds.value.filter(Boolean),
      pendingTagNames: [...pendingTagNames.value],
      priority: values.priority as number,
      isArchived: values.isArchived as boolean,
    });
  }

  /**
   * Handles on cancel.
   */
  function onCancel(): void {
    emit("cancel");
  }
</script>

<template>
  <Form
    v-slot="$form"
    :initial-values="formValues"
    :resolver="zodResolver(ApplicationFormSchema)"
    class="space-y-5"
    @submit="onFormSubmit"
  >
    <section
      class="grid gap-4 rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm md:grid-cols-2 md:p-5"
    >
      <div class="md:col-span-2">
        <h3 class="text-sm font-semibold text-surface-900">Core details</h3>
        <p class="text-xs text-surface-500">
          Basic information and current state of this application.
        </p>
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          for="application-company"
          class="text-sm font-medium text-surface-700"
        >
          Company
        </label>
        <Select
          name="companyId"
          :options="companies"
          option-label="label"
          option-value="value"
          show-clear
          filter
          fluid
          placeholder="Select a company"
        />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          for="application-title"
          class="text-sm font-medium text-surface-700"
        >
          Title
        </label>
        <InputText
          name="title"
          placeholder="Senior Frontend Engineer"
          fluid
          :invalid="$form.title?.invalid"
        />
        <Message
          v-if="$form.title?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.title?.error?.message }}
        </Message>
      </div>

      <div class="space-y-1 md:col-span-2">
        <label class="text-sm font-medium text-surface-700">Tags</label>
        <TagMultiSelect
          v-model="selectedTagIds"
          v-model:pending-tag-names="pendingTagNames"
          placeholder="Select tags"
          class="w-full"
        />
      </div>

      <div class="space-y-1">
        <label
          for="application-source-url"
          class="text-sm font-medium text-surface-700"
        >
          Source URL
        </label>
        <InputText
          name="sourceUrl"
          placeholder="https://company.com/jobs/role"
          fluid
          :invalid="$form.sourceUrl?.invalid"
        />
        <Message
          v-if="$form.sourceUrl?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.sourceUrl?.error?.message }}
        </Message>
      </div>

      <div class="space-y-1">
        <label
          for="application-applied-at"
          class="text-sm font-medium text-surface-700"
        >
          Applied At
        </label>
        <DatePicker
          name="appliedAt"
          show-time
          hour-format="24"
          show-icon
          show-clear
          fluid
        />
      </div>

      <div class="space-y-1">
        <label
          for="application-status"
          class="text-sm font-medium text-surface-700"
        >
          Status
        </label>
        <Select
          name="status"
          :options="APPLICATION_STATUS_OPTIONS"
          option-label="label"
          option-value="value"
          fluid
        />
        <div class="pt-1">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="getStatusPreviewClass($form.status?.value)"
          >
            {{ getStatusPreviewLabel($form.status?.value) }}
          </span>
        </div>
      </div>

      <div class="space-y-1">
        <label
          for="application-event-flow-status"
          class="text-sm font-medium text-surface-700"
        >
          Event Flow
        </label>
        <Select
          name="eventFlowStatus"
          :options="APPLICATION_EVENT_FLOW_STATUS_OPTIONS"
          option-label="label"
          option-value="value"
          fluid
        />
      </div>

      <div class="space-y-1">
        <label
          for="application-attendance"
          class="text-sm font-medium text-surface-700"
        >
          Attendance Type
        </label>
        <Select
          name="attendanceType"
          :options="APPLICATION_ATTENDANCE_OPTIONS"
          option-label="label"
          option-value="value"
          show-clear
          fluid
        />
      </div>

      <div class="space-y-1">
        <label
          for="application-employment"
          class="text-sm font-medium text-surface-700"
        >
          Employment Type
        </label>
        <Select
          name="employmentType"
          :options="APPLICATION_EMPLOYMENT_OPTIONS"
          option-label="label"
          option-value="value"
          show-clear
          fluid
        />
      </div>
    </section>

    <section
      class="grid gap-4 rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm md:grid-cols-2 md:p-5"
    >
      <div class="md:col-span-2">
        <h3 class="text-sm font-semibold text-surface-900">
          Location and compensation
        </h3>
        <p class="text-xs text-surface-500">
          Optional geo coordinates and salary ranges.
        </p>
      </div>

      <div class="space-y-1">
        <label
          for="application-location"
          class="text-sm font-medium text-surface-700"
        >
          Location
        </label>
        <InputText
          name="locationText"
          placeholder="Remote, New York, NY"
          fluid
        />
      </div>

      <div class="space-y-1">
        <label
          for="application-lat"
          class="text-sm font-medium text-surface-700"
        >
          Latitude
        </label>
        <InputNumber
          v-if="!isEditMode"
          name="locationLat"
          :use-grouping="false"
          :min="-90"
          :max="90"
          :min-fraction-digits="4"
          :max-fraction-digits="8"
          fluid
          :invalid="$form.locationLat?.invalid"
        />
        <p
          v-else
          class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
        >
          {{ props.initialValues.locationLat ?? "-" }}
        </p>
        <Message
          v-if="!isEditMode && $form.locationLat?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.locationLat?.error?.message }}
        </Message>
      </div>

      <div class="space-y-1">
        <label
          for="application-lng"
          class="text-sm font-medium text-surface-700"
        >
          Longitude
        </label>
        <InputNumber
          v-if="!isEditMode"
          name="locationLng"
          :use-grouping="false"
          :min="-180"
          :max="180"
          :min-fraction-digits="4"
          :max-fraction-digits="8"
          fluid
          :invalid="$form.locationLng?.invalid"
        />
        <p
          v-else
          class="rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700"
        >
          {{ props.initialValues.locationLng ?? "-" }}
        </p>
        <Message
          v-if="!isEditMode && $form.locationLng?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.locationLng?.error?.message }}
        </Message>
      </div>

      <div class="space-y-1">
        <label
          for="application-salary-min"
          class="text-sm font-medium text-surface-700"
        >
          Salary Min
        </label>
        <InputNumber name="salaryMin" :use-grouping="false" :min="0" fluid />
      </div>

      <div class="space-y-1">
        <label
          for="application-salary-max"
          class="text-sm font-medium text-surface-700"
        >
          Salary Max
        </label>
        <InputNumber
          name="salaryMax"
          :use-grouping="false"
          :min="0"
          fluid
          :invalid="$form.salaryMax?.invalid"
        />
        <Message
          v-if="$form.salaryMax?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.salaryMax?.error?.message }}
        </Message>
      </div>

      <div class="space-y-1">
        <label
          for="application-currency"
          class="text-sm font-medium text-surface-700"
        >
          Currency
        </label>
        <InputText name="currency" placeholder="USD" maxlength="8" fluid />
      </div>

      <div class="space-y-1">
        <label
          for="application-priority"
          class="text-sm font-medium text-surface-700"
        >
          Priority
        </label>
        <InputNumber
          name="priority"
          :use-grouping="false"
          :min="1"
          :max="5"
          fluid
        />
        <div class="pt-1">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="getPriorityPreviewClass($form.priority?.value)"
          >
            P{{ $form.priority?.value || 3 }}
          </span>
        </div>
      </div>
    </section>

    <section
      class="grid gap-4 rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm md:grid-cols-2 md:p-5"
    >
      <div class="md:col-span-2">
        <h3 class="text-sm font-semibold text-surface-900">
          Notes and preferences
        </h3>
        <p class="text-xs text-surface-500">
          Extra context for interview flow, benefits, and archived status.
        </p>
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          for="application-description"
          class="text-sm font-medium text-surface-700"
        >
          Description
        </label>
        <Textarea name="description" auto-resize rows="3" fluid />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          for="application-interview-process"
          class="text-sm font-medium text-surface-700"
        >
          Interview Process
        </label>
        <Textarea name="interviewProcess" auto-resize rows="3" fluid />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label
          for="application-benefits"
          class="text-sm font-medium text-surface-700"
        >
          Benefits
        </label>
        <Textarea name="benefits" auto-resize rows="3" fluid />
      </div>

      <div
        class="flex items-center justify-between rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 md:col-span-2"
      >
        <label
          for="application-archived"
          class="text-sm font-medium text-surface-700"
        >
          Archived
        </label>
        <ToggleSwitch name="isArchived" />
      </div>
    </section>

    <div class="flex gap-2 border-t border-surface-200 pt-4 md:col-span-2">
      <Button
        type="submit"
        :label="mode === 'edit' ? 'Update application' : 'Create application'"
        :loading="busy"
        class="px-5"
      />
      <Button
        v-if="showCancel"
        type="button"
        severity="secondary"
        outlined
        label="Cancel"
        :disabled="busy"
        class="px-5"
        @click="onCancel"
      />
    </div>
  </Form>
</template>
