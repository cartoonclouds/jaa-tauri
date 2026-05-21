<script setup lang="ts">
  import {
    APPLICATION_ATTENDANCE_OPTIONS,
    APPLICATION_EMPLOYMENT_OPTIONS,
    APPLICATION_STATUS_OPTIONS,
  } from "@modules/applications/presentation/constants/applicationFormOptions";
  import {
    validateApplicationLatitude,
    validateApplicationLongitude,
    validateApplicationSalaryRange,
    validateApplicationSourceUrl,
    validateApplicationTitle,
  } from "@modules/applications/presentation/utils/applicationFormValidation";
  import {
    type ApplicationFormSubmitPayload,
    type ApplicationFormValues,
    type ApplicationSelectOption,
    createEmptyApplicationFormValues,
  } from "@modules/applications/types/presentation";
  import { reactive, watch } from "vue";

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

  const form = reactive<ApplicationFormValues>(
    createEmptyApplicationFormValues(),
  );

  const errors = reactive({
    title: "",
    sourceUrl: "",
    salaryRange: "",
    locationLat: "",
    locationLng: "",
  });

  function resetErrors(): void {
    errors.title = "";
    errors.sourceUrl = "";
    errors.salaryRange = "";
    errors.locationLat = "";
    errors.locationLng = "";
  }

  function applyValues(values?: Partial<ApplicationFormValues>): void {
    form.companyId = values?.companyId ?? null;
    form.title = values?.title ?? "";
    form.status = values?.status ?? "saved";
    form.sourceUrl = values?.sourceUrl ?? "";
    form.appliedAt = values?.appliedAt ?? "";
    form.locationText = values?.locationText ?? "";
    form.locationLat = values?.locationLat ?? null;
    form.locationLng = values?.locationLng ?? null;
    form.attendanceType = values?.attendanceType ?? null;
    form.employmentType = values?.employmentType ?? null;
    form.salaryMin = values?.salaryMin ?? null;
    form.salaryMax = values?.salaryMax ?? null;
    form.currency = values?.currency ?? "";
    form.description = values?.description ?? "";
    form.interviewProcess = values?.interviewProcess ?? "";
    form.benefits = values?.benefits ?? "";
    form.priority = values?.priority ?? 3;
    form.isArchived = values?.isArchived ?? false;

    resetErrors();
  }

  watch(
    () => props.initialValues,
    (values) => {
      applyValues(values);
    },
    { immediate: true, deep: true },
  );

  function validate(): boolean {
    resetErrors();

    errors.title = validateApplicationTitle(form.title);
    errors.sourceUrl = validateApplicationSourceUrl(form.sourceUrl);
    errors.salaryRange = validateApplicationSalaryRange(
      form.salaryMin,
      form.salaryMax,
    );
    errors.locationLat = validateApplicationLatitude(form.locationLat);
    errors.locationLng = validateApplicationLongitude(form.locationLng);

    return (
      !errors.title &&
      !errors.sourceUrl &&
      !errors.salaryRange &&
      !errors.locationLat &&
      !errors.locationLng
    );
  }

  function onSubmit(): void {
    if (!validate()) {
      return;
    }

    emit("submit", {
      companyId: form.companyId,
      title: form.title.trim(),
      status: form.status,
      sourceUrl: form.sourceUrl.trim() || null,
      appliedAt: form.appliedAt || null,
      locationText: form.locationText.trim() || null,
      locationLat: form.locationLat,
      locationLng: form.locationLng,
      attendanceType: form.attendanceType,
      employmentType: form.employmentType,
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      currency: form.currency.trim().toUpperCase() || null,
      description: form.description.trim() || null,
      interviewProcess: form.interviewProcess.trim() || null,
      benefits: form.benefits.trim() || null,
      priority: form.priority,
      isArchived: form.isArchived,
    });
  }

  function onCancel(): void {
    emit("cancel");
  }
</script>

<template>
  <form class="grid gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
    <div class="space-y-1 md:col-span-2">
      <label
        for="application-company"
        class="text-sm font-medium text-surface-700"
      >
        Company
      </label>
      <Select
        id="application-company"
        v-model="form.companyId"
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
        id="application-title"
        v-model="form.title"
        fluid
        placeholder="Senior Frontend Engineer"
        :invalid="Boolean(errors.title)"
      />
      <Message
        v-if="errors.title"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ errors.title }}
      </Message>
    </div>

    <div class="space-y-1">
      <label
        for="application-source-url"
        class="text-sm font-medium text-surface-700"
      >
        Source URL
      </label>
      <InputText
        id="application-source-url"
        v-model="form.sourceUrl"
        fluid
        placeholder="https://company.com/jobs/role"
        :invalid="Boolean(errors.sourceUrl)"
      />
      <Message
        v-if="errors.sourceUrl"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ errors.sourceUrl }}
      </Message>
    </div>

    <div class="space-y-1">
      <label
        for="application-applied-at"
        class="text-sm font-medium text-surface-700"
      >
        Applied At
      </label>
      <InputText
        id="application-applied-at"
        v-model="form.appliedAt"
        type="datetime-local"
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
        id="application-status"
        v-model="form.status"
        :options="APPLICATION_STATUS_OPTIONS"
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
        id="application-attendance"
        v-model="form.attendanceType"
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
        id="application-employment"
        v-model="form.employmentType"
        :options="APPLICATION_EMPLOYMENT_OPTIONS"
        option-label="label"
        option-value="value"
        show-clear
        fluid
      />
    </div>

    <div class="space-y-1">
      <label
        for="application-location"
        class="text-sm font-medium text-surface-700"
      >
        Location
      </label>
      <InputText
        id="application-location"
        v-model="form.locationText"
        fluid
        placeholder="Remote, New York, NY"
      />
    </div>

    <div class="space-y-1">
      <label for="application-lat" class="text-sm font-medium text-surface-700">
        Latitude
      </label>
      <InputNumber
        id="application-lat"
        v-model="form.locationLat"
        fluid
        :use-grouping="false"
        :min="-90"
        :max="90"
        :min-fraction-digits="4"
        :max-fraction-digits="8"
        :invalid="Boolean(errors.locationLat)"
      />
      <Message
        v-if="errors.locationLat"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ errors.locationLat }}
      </Message>
    </div>

    <div class="space-y-1">
      <label for="application-lng" class="text-sm font-medium text-surface-700">
        Longitude
      </label>
      <InputNumber
        id="application-lng"
        v-model="form.locationLng"
        fluid
        :use-grouping="false"
        :min="-180"
        :max="180"
        :min-fraction-digits="4"
        :max-fraction-digits="8"
        :invalid="Boolean(errors.locationLng)"
      />
      <Message
        v-if="errors.locationLng"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ errors.locationLng }}
      </Message>
    </div>

    <div class="space-y-1">
      <label
        for="application-salary-min"
        class="text-sm font-medium text-surface-700"
      >
        Salary Min
      </label>
      <InputNumber
        id="application-salary-min"
        v-model="form.salaryMin"
        fluid
        :use-grouping="false"
        :min="0"
      />
    </div>

    <div class="space-y-1">
      <label
        for="application-salary-max"
        class="text-sm font-medium text-surface-700"
      >
        Salary Max
      </label>
      <InputNumber
        id="application-salary-max"
        v-model="form.salaryMax"
        fluid
        :use-grouping="false"
        :min="0"
      />
      <Message
        v-if="errors.salaryRange"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ errors.salaryRange }}
      </Message>
    </div>

    <div class="space-y-1">
      <label
        for="application-currency"
        class="text-sm font-medium text-surface-700"
      >
        Currency
      </label>
      <InputText
        id="application-currency"
        v-model="form.currency"
        fluid
        maxlength="8"
        placeholder="USD"
      />
    </div>

    <div class="space-y-1">
      <label
        for="application-priority"
        class="text-sm font-medium text-surface-700"
      >
        Priority
      </label>
      <InputNumber
        id="application-priority"
        v-model="form.priority"
        fluid
        :use-grouping="false"
        :min="1"
        :max="5"
      />
    </div>

    <div class="space-y-1 md:col-span-2">
      <label
        for="application-description"
        class="text-sm font-medium text-surface-700"
      >
        Description
      </label>
      <Textarea
        id="application-description"
        v-model="form.description"
        fluid
        auto-resize
        rows="3"
      />
    </div>

    <div class="space-y-1 md:col-span-2">
      <label
        for="application-interview-process"
        class="text-sm font-medium text-surface-700"
      >
        Interview Process
      </label>
      <Textarea
        id="application-interview-process"
        v-model="form.interviewProcess"
        fluid
        auto-resize
        rows="3"
      />
    </div>

    <div class="space-y-1 md:col-span-2">
      <label
        for="application-benefits"
        class="text-sm font-medium text-surface-700"
      >
        Benefits
      </label>
      <Textarea
        id="application-benefits"
        v-model="form.benefits"
        fluid
        auto-resize
        rows="3"
      />
    </div>

    <div
      class="flex items-center justify-between rounded-md border border-surface-200 px-3 py-2 md:col-span-2"
    >
      <label
        for="application-archived"
        class="text-sm font-medium text-surface-700"
      >
        Archived
      </label>
      <ToggleSwitch id="application-archived" v-model="form.isArchived" />
    </div>

    <div class="flex gap-2 md:col-span-2">
      <Button
        type="submit"
        :label="mode === 'edit' ? 'Update application' : 'Create application'"
        :loading="busy"
      />
      <Button
        v-if="showCancel"
        type="button"
        severity="secondary"
        outlined
        label="Cancel"
        :disabled="busy"
        @click="onCancel"
      />
    </div>
  </form>
</template>
