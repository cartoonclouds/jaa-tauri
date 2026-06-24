<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import ApplicationBadge from "@modules/applications/presentation/components/badges/ApplicationBadge.vue";
  import ApplicationDetailsCard from "@modules/applications/presentation/components/cards/ApplicationDetailsCard.vue";

  /**
   * Defines props.
   */
  interface Props {
    application: Application;
    companyName: string;
    appliedAtLabel: string;
    isDeleting?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    isDeleting: false,
  });

  const emit = defineEmits<{
    "request-delete": [];
    "request-open-company": [companyId: string];
  }>();
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailsCard title="Company" compact>
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-medium text-surface-900">
            {{ companyName }}
          </p>
          <Button
            v-if="application.companyId"
            type="button"
            text
            size="small"
            class="shrink-0"
            aria-label="Edit linked company"
            @click="emit('request-open-company', application.companyId)"
          >
            <Icon name="heroicons:pencil-square" class="h-4 w-4" />
            <span>Edit</span>
          </Button>
        </div>
      </ApplicationDetailsCard>
      <ApplicationDetailsCard title="Status" compact>
        <div class="mt-1">
          <ApplicationBadge kind="status" :status="application.status" />
        </div>
      </ApplicationDetailsCard>
      <ApplicationDetailsCard title="Applied At" compact>
        <p class="text-sm font-medium text-surface-900">
          {{ appliedAtLabel }}
        </p>
      </ApplicationDetailsCard>
      <ApplicationDetailsCard title="Priority" compact>
        <div class="mt-1">
          <ApplicationBadge kind="priority" :priority="application.priority" />
        </div>
      </ApplicationDetailsCard>
    </div>

    <ApplicationDetailsCard title="Title">
      <p class="text-sm font-medium text-surface-900">
        {{ application.title }}
      </p>
    </ApplicationDetailsCard>

    <ApplicationDetailsCard title="URL">
      <a
        v-if="application.url"
        :href="application.url"
        target="_blank"
        rel="noreferrer"
        class="text-sm font-medium text-primary-600 hover:underline"
      >
        {{ application.url }}
      </a>
      <p v-else class="text-sm">-</p>
    </ApplicationDetailsCard>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailsCard title="Attendance Type" compact>
        <div class="mt-1">
          <ApplicationBadge
            v-if="application.attendanceType"
            kind="attendance"
            :attendance-type="application.attendanceType"
          />
          <span v-else class="text-sm">-</span>
        </div>
      </ApplicationDetailsCard>
      <ApplicationDetailsCard title="Employment Type" compact>
        <div class="mt-1">
          <ApplicationBadge
            v-if="application.employmentType"
            kind="employment"
            :employment-type="application.employmentType"
          />
          <span v-else class="text-sm">-</span>
        </div>
      </ApplicationDetailsCard>
    </div>

    <ApplicationDetailsCard title="Location">
      <p class="text-sm">{{ application.locationText || "-" }}</p>
    </ApplicationDetailsCard>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailsCard title="Latitude" compact>
        <p class="text-sm">{{ application.locationLat ?? "-" }}</p>
      </ApplicationDetailsCard>
      <ApplicationDetailsCard title="Longitude" compact>
        <p class="text-sm">{{ application.locationLng ?? "-" }}</p>
      </ApplicationDetailsCard>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailsCard title="Salary Min" compact>
        <p class="text-sm">{{ application.salaryMin ?? "-" }}</p>
      </ApplicationDetailsCard>
      <ApplicationDetailsCard title="Salary Max" compact>
        <p class="text-sm">{{ application.salaryMax ?? "-" }}</p>
      </ApplicationDetailsCard>
    </div>

    <ApplicationDetailsCard title="Currency">
      <p class="text-sm">{{ application.currency ?? "-" }}</p>
    </ApplicationDetailsCard>

    <ApplicationDetailsCard title="Description">
      <p class="whitespace-pre-line text-sm">
        {{ application.description || "-" }}
      </p>
    </ApplicationDetailsCard>

    <ApplicationDetailsCard title="Interview Process">
      <p class="whitespace-pre-line text-sm">
        {{ application.interviewProcess || "-" }}
      </p>
    </ApplicationDetailsCard>

    <ApplicationDetailsCard title="Benefits">
      <p class="whitespace-pre-line text-sm">
        {{ application.benefits || "-" }}
      </p>
    </ApplicationDetailsCard>

    <ApplicationDetailsCard title="Archived">
      <div class="mt-1">
        <ApplicationBadge kind="archived" :archived="application.isArchived" />
      </div>
    </ApplicationDetailsCard>

    <div class="flex justify-end gap-2 border-t border-surface-200 pt-4">
      <Button
        type="button"
        label="Delete"
        severity="danger"
        outlined
        class="px-5"
        :loading="isDeleting"
        @click="emit('request-delete')"
      />
    </div>
  </div>
</template>
