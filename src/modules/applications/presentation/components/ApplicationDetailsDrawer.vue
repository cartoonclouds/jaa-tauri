<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
  } from "@modules/applications/types/presentation";
  import type { Company } from "@modules/companies/domain/entities/Company";

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
    class="w-full max-w-3xl"
  >
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

    <div v-else-if="application" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Company
          </p>
          <p class="text-sm">{{ companyName }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">Status</p>
          <p class="text-sm">{{ application.status }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Applied At
          </p>
          <p class="text-sm">{{ appliedAtLabel }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Priority
          </p>
          <p class="text-sm">{{ application.priority }}</p>
        </div>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Title</p>
        <p class="text-sm font-medium">{{ application.title }}</p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">
          Source URL
        </p>
        <a
          v-if="application.sourceUrl"
          :href="application.sourceUrl"
          target="_blank"
          rel="noreferrer"
          class="text-sm text-primary-600 hover:underline"
        >
          {{ application.sourceUrl }}
        </a>
        <p v-else class="text-sm">-</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Attendance Type
          </p>
          <p class="text-sm">{{ application.attendanceType ?? "-" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Employment Type
          </p>
          <p class="text-sm">{{ application.employmentType ?? "-" }}</p>
        </div>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Location</p>
        <p class="text-sm">{{ application.locationText || "-" }}</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Latitude
          </p>
          <p class="text-sm">{{ application.locationLat ?? "-" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Longitude
          </p>
          <p class="text-sm">{{ application.locationLng ?? "-" }}</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Salary Min
          </p>
          <p class="text-sm">{{ application.salaryMin ?? "-" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-surface-500">
            Salary Max
          </p>
          <p class="text-sm">{{ application.salaryMax ?? "-" }}</p>
        </div>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Currency</p>
        <p class="text-sm">{{ application.currency ?? "-" }}</p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">
          Description
        </p>
        <p class="whitespace-pre-line text-sm">
          {{ application.description || "-" }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">
          Interview Process
        </p>
        <p class="whitespace-pre-line text-sm">
          {{ application.interviewProcess || "-" }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Benefits</p>
        <p class="whitespace-pre-line text-sm">
          {{ application.benefits || "-" }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-wide text-surface-500">Archived</p>
        <p class="text-sm">{{ application.isArchived ? "Yes" : "No" }}</p>
      </div>

      <div class="flex gap-2 border-t border-surface-200 pt-4">
        <Button type="button" label="Edit" @click="emit('request-edit')" />
        <Button
          type="button"
          label="Delete"
          severity="danger"
          outlined
          :loading="isDeleting"
          @click="onDelete"
        />
      </div>
    </div>
  </Drawer>
</template>
