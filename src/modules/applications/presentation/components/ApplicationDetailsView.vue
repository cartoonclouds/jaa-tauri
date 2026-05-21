<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import {
    formatApplicationStatusLabel,
    getApplicationArchivedClass,
    getApplicationPriorityClass,
    getApplicationStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";
  import Card from "primevue/card";

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
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Company</span
          >
        </template>
        <template #content>
          <p class="text-sm font-medium text-surface-900">{{ companyName }}</p>
        </template>
      </Card>
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Status</span
          >
        </template>
        <template #content>
          <div class="mt-1">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
              :class="getApplicationStatusClass(application.status)"
            >
              {{ formatApplicationStatusLabel(application.status) }}
            </span>
          </div>
        </template>
      </Card>
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Applied At</span
          >
        </template>
        <template #content>
          <p class="text-sm font-medium text-surface-900">
            {{ appliedAtLabel }}
          </p>
        </template>
      </Card>
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Priority</span
          >
        </template>
        <template #content>
          <div class="mt-1">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
              :class="getApplicationPriorityClass(application.priority)"
            >
              P{{ application.priority }}
            </span>
          </div>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Title</span
        >
      </template>
      <template #content>
        <p class="text-sm font-medium text-surface-900">
          {{ application.title }}
        </p>
      </template>
    </Card>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Source URL</span
        >
      </template>
      <template #content>
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
      </template>
    </Card>

    <div class="grid gap-3 md:grid-cols-2">
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Attendance Type</span
          >
        </template>
        <template #content>
          <p class="text-sm">{{ application.attendanceType ?? "-" }}</p>
          <!-- enum, but display as string -->
        </template>
      </Card>
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Employment Type</span
          >
        </template>
        <template #content>
          <p class="text-sm">{{ application.employmentType ?? "-" }}</p>
          <!-- enum, but display as string -->
        </template>
      </Card>
    </div>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Location</span
        >
      </template>
      <template #content>
        <p class="text-sm">{{ application.locationText || "-" }}</p>
      </template>
    </Card>

    <div class="grid gap-3 md:grid-cols-2">
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Latitude</span
          >
        </template>
        <template #content>
          <p class="text-sm">{{ application.locationLat ?? "-" }}</p>
        </template>
      </Card>
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Longitude</span
          >
        </template>
        <template #content>
          <p class="text-sm">{{ application.locationLng ?? "-" }}</p>
        </template>
      </Card>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Salary Min</span
          >
        </template>
        <template #content>
          <p class="text-sm">{{ application.salaryMin ?? "-" }}</p>
        </template>
      </Card>
      <Card :pt="{ root: 'p-3' }">
        <template #title>
          <span class="text-xs uppercase tracking-wide text-surface-500"
            >Salary Max</span
          >
        </template>
        <template #content>
          <p class="text-sm">{{ application.salaryMax ?? "-" }}</p>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Currency</span
        >
      </template>
      <template #content>
        <p class="text-sm">{{ application.currency ?? "-" }}</p>
      </template>
    </Card>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Description</span
        >
      </template>
      <template #content>
        <p class="whitespace-pre-line text-sm">
          {{ application.description || "-" }}
        </p>
      </template>
    </Card>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Interview Process</span
        >
      </template>
      <template #content>
        <p class="whitespace-pre-line text-sm">
          {{ application.interviewProcess || "-" }}
        </p>
      </template>
    </Card>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Benefits</span
        >
      </template>
      <template #content>
        <p class="whitespace-pre-line text-sm">
          {{ application.benefits || "-" }}
        </p>
      </template>
    </Card>

    <Card>
      <template #title>
        <span class="text-xs uppercase tracking-wide text-surface-500"
          >Archived</span
        >
      </template>
      <template #content>
        <div class="mt-1">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="getApplicationArchivedClass(application.isArchived)"
          >
            {{ application.isArchived ? "Archived" : "Active" }}
          </span>
        </div>
      </template>
    </Card>

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
