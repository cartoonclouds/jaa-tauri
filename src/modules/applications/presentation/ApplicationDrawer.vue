<script setup lang="ts">
  import Button from "primevue/button";
  import Drawer from "primevue/drawer";
  import Tag from "primevue/tag";
  import { ref, watch } from "vue";

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

  const props = defineProps<{
    application: JobApplication | null;
  }>();

  watch(
    () => props.application,
    (newApp) => {
      drawerVisible.value = newApp !== null;
    },
    { deep: true },
  );

  const drawerVisible = ref(false);

  function closeApplication() {
    drawerVisible.value = false;
  }
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    :modal="false"
    :dismissable="true"
    style="width: 520px; background-color: white"
  >
    <template #header>
      <div v-if="application" class="drawer-header">
        <div>
          <h2>{{ application.company }}</h2>
          <p>{{ application.role }}</p>
        </div>
      </div>
    </template>

    <div v-if="application" class="application-detail">
      <section class="detail-card">
        <h3>Current Stage</h3>
        <p>{{ application.stage }}</p>
      </section>

      <section class="detail-grid">
        <div class="detail-card">
          <h3>Status</h3>
          <Tag :value="application.status" />
        </div>

        <div class="detail-card">
          <h3>Updated</h3>
          <p>{{ application.updatedAt }}</p>
        </div>
      </section>

      <section class="detail-card">
        <h3>Location</h3>
        <p>{{ application.location ?? "Not recorded" }}</p>
      </section>

      <section class="detail-card">
        <h3>Notes</h3>
        <p>{{ application.notes ?? "No notes yet." }}</p>
      </section>

      <div class="drawer-actions">
        <Button label="Edit" icon="pi pi-pencil" />
        <Button
          label="Close"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="closeApplication"
        />
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
  .drawer-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .drawer-header p {
    margin: 0.25rem 0 0;
    color: var(--p-text-muted-color);
  }

  .application-detail {
    display: grid;
    gap: 1rem;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .detail-card {
    padding: 1rem;
    border: 1px solid var(--p-content-border-color);
    border-radius: 1rem;
    background: var(--p-content-background);
  }

  .detail-card h3 {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    color: var(--p-text-muted-color);
  }

  .detail-card p {
    margin: 0;
  }

  .drawer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
  }
</style>
