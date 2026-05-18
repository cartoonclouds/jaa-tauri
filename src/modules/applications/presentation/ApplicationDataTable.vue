<script setup lang="ts">
  import Button from "primevue/button";
  import Column from "primevue/column";
  import DataTable from "primevue/datatable";
  import Tag from "primevue/tag";
  import { ref } from "vue";

  import ApplicationDrawer from "./ApplicationDrawer.vue";

  type ApplicationStatus =
    | "Applied"
    | "Screening"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Withdrawn";

  interface JobApplication {
    id: string;
    company: string;
    role: string;
    location?: string;
    status: ApplicationStatus;
    stage: string;
    updatedAt: string;
    notes?: string;
  }

  const applications = ref<JobApplication[]>([
    {
      id: "app_1",
      company: "Stripe",
      role: "Senior Frontend Engineer",
      location: "Remote",
      status: "Interview",
      stage: "Technical Interview",
      updatedAt: "2h ago",
      notes: "Prepare system design examples and frontend performance stories.",
    },
    {
      id: "app_2",
      company: "Google",
      role: "Software Engineer II",
      location: "London",
      status: "Screening",
      stage: "Recruiter Screen",
      updatedAt: "1d ago",
    },
  ]);

  const selectedApplication = ref<JobApplication | null>(null);

  function openApplication(application: JobApplication) {
    console.log("Opening application:", application);
    selectedApplication.value = application;
  }
</script>

<template>
  <section class="applications-page">
    <DataTable
      :value="applications"
      data-key="id"
      selection-mode="single"
      row-hover
      striped-rows
      @row-click="openApplication($event.data)"
    >
      <Column field="company" header="Company" />
      <Column field="role" header="Role" />

      <Column field="status" header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" />
        </template>
      </Column>

      <Column field="stage" header="Stage" />
      <Column field="updatedAt" header="Updated" />

      <Column header="">
        <template #body="{ data }">
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            aria-label="Open application"
            @click.stop="openApplication(data)"
          />
        </template>
      </Column>
    </DataTable>

    <ApplicationDrawer :application="selectedApplication" />
  </section>
</template>

<style scoped>
  .applications-page {
    padding: 1.5rem;
  }

  :deep(.p-datatable-tbody > tr) {
    cursor: pointer;
  }
</style>
