<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import ApplicationDetailCard from "@modules/applications/presentation/components/ApplicationDetailCard.vue";
  import {
    formatApplicationStatusLabel,
    getApplicationArchivedClass,
    getApplicationPriorityClass,
    getApplicationStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";

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
    "request-edit": [];
    "request-delete": [];
  }>();
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailCard label="Company" compact>
        <p class="text-sm font-medium text-surface-900">{{ companyName }}</p>
      </ApplicationDetailCard>
      <ApplicationDetailCard label="Status" compact>
        <div class="mt-1">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="getApplicationStatusClass(application.status)"
          >
            {{ formatApplicationStatusLabel(application.status) }}
          </span>
        </div>
      </ApplicationDetailCard>
      <ApplicationDetailCard label="Applied At" compact>
        <p class="text-sm font-medium text-surface-900">{{ appliedAtLabel }}</p>
      </ApplicationDetailCard>
      <ApplicationDetailCard label="Priority" compact>
        <div class="mt-1">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="getApplicationPriorityClass(application.priority)"
          >
            P{{ application.priority }}
          </span>
        </div>
      </ApplicationDetailCard>
    </div>

    <ApplicationDetailCard label="Title">
      <p class="text-sm font-medium text-surface-900">
        {{ application.title }}
      </p>
    </ApplicationDetailCard>

    <ApplicationDetailCard label="Source URL">
      <a
        v-if="application.sourceUrl"
        :href="application.sourceUrl"
        target="_blank"
        rel="noreferrer"
        class="text-sm font-medium text-primary-600 hover:underline"
      >
        {{ application.sourceUrl }}
      </a>
      <p v-else class="text-sm">-</p>
    </ApplicationDetailCard>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailCard label="Attendance Type" compact>
        <p class="text-sm">{{ application.attendanceType ?? "-" }}</p>
      </ApplicationDetailCard>
      <ApplicationDetailCard label="Employment Type" compact>
        <p class="text-sm">{{ application.employmentType ?? "-" }}</p>
      </ApplicationDetailCard>
    </div>

    <ApplicationDetailCard label="Location">
      <p class="text-sm">{{ application.locationText || "-" }}</p>
    </ApplicationDetailCard>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailCard label="Latitude" compact>
        <p class="text-sm">{{ application.locationLat ?? "-" }}</p>
      </ApplicationDetailCard>
      <ApplicationDetailCard label="Longitude" compact>
        <p class="text-sm">{{ application.locationLng ?? "-" }}</p>
      </ApplicationDetailCard>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <ApplicationDetailCard label="Salary Min" compact>
        <p class="text-sm">{{ application.salaryMin ?? "-" }}</p>
      </ApplicationDetailCard>
      <ApplicationDetailCard label="Salary Max" compact>
        <p class="text-sm">{{ application.salaryMax ?? "-" }}</p>
      </ApplicationDetailCard>
    </div>

    <ApplicationDetailCard label="Currency">
      <p class="text-sm">{{ application.currency ?? "-" }}</p>
    </ApplicationDetailCard>

    <ApplicationDetailCard label="Description">
      <p class="whitespace-pre-line text-sm">
        {{ application.description || "-" }}
      </p>
    </ApplicationDetailCard>

    <ApplicationDetailCard label="Interview Process">
      <p class="whitespace-pre-line text-sm">
        {{ application.interviewProcess || "-" }}
      </p>
    </ApplicationDetailCard>

    <ApplicationDetailCard label="Benefits">
      <p class="whitespace-pre-line text-sm">
        {{ application.benefits || "-" }}
      </p>
    </ApplicationDetailCard>

    <ApplicationDetailCard label="Archived">
      <div class="mt-1">
        <span
          class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="getApplicationArchivedClass(application.isArchived)"
        >
          {{ application.isArchived ? "Archived" : "Active" }}
        </span>
      </div>
    </ApplicationDetailCard>

    <div class="flex gap-2 border-t border-surface-200 pt-4">
      <Button
        type="button"
        label="Edit"
        class="px-5"
        @click="emit('request-edit')"
      />
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
