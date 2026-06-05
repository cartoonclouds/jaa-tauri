<script setup lang="ts">
  import type { CompanyAssociatedApplication } from "@modules/companies/repositories/CompanyRepository";

  /**
   * Defines jobs applied section props.
   */
  interface CompanyJobsAppliedSectionProps {
    isEditMode: boolean;
    showJobsAppliedForSection: boolean;
    associatedApplications: CompanyAssociatedApplication[];
    associatedApplicationsError: string | null;
    isLoadingAssociatedApplications: boolean;
  }

  defineProps<CompanyJobsAppliedSectionProps>();
</script>

<template>
  <div
    v-if="isEditMode && showJobsAppliedForSection"
    class="space-y-2 border-t border-surface-200 pt-4 md:col-span-2"
  >
    <h4 class="text-sm font-semibold text-surface-900">Jobs Applied For</h4>

    <Message v-if="associatedApplicationsError" severity="error" size="small">
      {{ associatedApplicationsError }}
    </Message>

    <Message
      v-else-if="isLoadingAssociatedApplications"
      severity="info"
      size="small"
    >
      Loading jobs applied for...
    </Message>

    <Message
      v-else-if="associatedApplications.length === 0"
      severity="info"
      size="small"
    >
      No jobs are associated with this company yet.
    </Message>

    <div v-else class="overflow-x-auto rounded-lg border border-surface-200">
      <table class="min-w-full divide-y divide-surface-200 text-sm">
        <thead class="bg-surface-50 text-left text-surface-600">
          <tr>
            <th class="px-3 py-2 font-medium">Job Title</th>
            <th class="px-3 py-2 font-medium">Status</th>
            <th class="px-3 py-2 font-medium">Applied At</th>
          </tr>
        </thead>
        <tbody
          class="divide-y divide-surface-200 bg-surface-0 text-surface-700"
        >
          <tr
            v-for="application in associatedApplications"
            :key="application.id"
          >
            <td class="px-3 py-2">{{ application.title }}</td>
            <td class="px-3 py-2 capitalize">{{ application.status }}</td>
            <td class="px-3 py-2">{{ application.appliedAt || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
