<script setup lang="ts">
  import type { Company } from "@modules/companies/domain/entities/Company";
  import type {
    CompanyAssociatedApplication,
    CompanyAssociatedContact,
  } from "@modules/companies/types";

  import { useCompany } from "@modules/companies";
  import { formatNullableDisplayDateTime } from "@shared/utils/toDate";
  import { computed, ref, watch } from "vue";

  import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog.vue";

  interface Props {
    visible: boolean;
    company: Company | null;
    busy?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "request-edit": [company: Company];
    "request-delete": [companyId: string];
    "request-open-contact": [contactId: string];
    "request-open-application": [applicationId: string];
  }>();

  const { service: companyService } = useCompany();
  const associatedContacts = ref<CompanyAssociatedContact[]>([]);
  const associatedApplications = ref<CompanyAssociatedApplication[]>([]);
  const isLoadingAssociations = ref(false);
  const associationsError = ref<string | null>(null);
  const isDeleteConfirmVisible = ref(false);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const associatedContactCount = computed(
    () => associatedContacts.value.length,
  );
  const associatedApplicationCount = computed(
    () => associatedApplications.value.length,
  );

  const totalAssociationCount = computed(
    () => associatedContactCount.value + associatedApplicationCount.value,
  );

  const deleteConfirmationMessage = computed(() => {
    return `This company has ${String(associatedContactCount.value)} contact association(s) and ${String(associatedApplicationCount.value)} application association(s), for ${String(totalAssociationCount.value)} total associations. This action cannot be undone.`;
  });

  watch(
    () => [props.visible, props.company?.id] as const,
    async ([visible, companyId]) => {
      if (!visible || typeof companyId !== "string") {
        associatedContacts.value = [];
        associatedApplications.value = [];
        associationsError.value = null;
        isLoadingAssociations.value = false;
        isDeleteConfirmVisible.value = false;
        return;
      }

      isLoadingAssociations.value = true;
      associationsError.value = null;

      try {
        const [contacts, applications] = await Promise.all([
          companyService.listAssociatedContacts(companyId),
          companyService.listAssociatedApplications(companyId),
        ]);

        associatedContacts.value = contacts;
        associatedApplications.value = applications;
      } catch (error: unknown) {
        associatedContacts.value = [];
        associatedApplications.value = [];
        const message =
          error instanceof Error ? error.message : "Unknown error";
        associationsError.value = `Unable to load company associations: ${message}`;
      } finally {
        isLoadingAssociations.value = false;
      }
    },
    { immediate: true },
  );

  function requestEdit(): void {
    if (!props.company) {
      return;
    }

    emit("request-edit", props.company);
  }

  function openDeleteConfirm(): void {
    if (!props.company) {
      return;
    }

    isDeleteConfirmVisible.value = true;
  }

  function requestDelete(): void {
    if (!props.company) {
      return;
    }

    emit("request-delete", props.company.id);
    isDeleteConfirmVisible.value = false;
  }

  function requestOpenContact(contactId: string): void {
    emit("request-open-contact", contactId);
  }

  function requestOpenApplication(applicationId: string): void {
    emit("request-open-application", applicationId);
  }
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :block-scroll="true"
    :draggable="true"
    header="Company"
    class="w-[95vw] max-w-2xl"
  >
    <div v-if="company" class="space-y-4 p-2">
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs text-surface-500">Name</div>
          <div class="text-sm font-medium">{{ company.name }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">Industry</div>
          <div class="text-sm font-medium">{{ company.industry || "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">Size</div>
          <div class="text-sm font-medium">{{ company.size || "-" }}</div>
        </div>
        <div class="md:col-span-2">
          <div class="text-xs text-surface-500">Location</div>
          <div class="text-sm font-medium">
            {{ company.locationText || "-" }}
          </div>
        </div>
      </div>

      <div class="rounded-md border border-surface-200 p-3 text-sm">
        <div v-if="isLoadingAssociations" class="text-surface-500">
          Loading associations...
        </div>
        <div v-else-if="associationsError" class="text-red-500">
          {{ associationsError }}
        </div>
        <div v-else class="space-y-4">
          <div>
            <div class="mb-2 font-medium text-surface-700">
              Contacts ({{ String(associatedContactCount) }})
            </div>
            <DataTable
              :value="associatedContacts"
              data-key="id"
              show-gridlines
              size="small"
              table-style="min-width: 40rem"
            >
              <Column field="fullName" header="Name" />
              <Column field="type" header="Type" />
              <Column field="email" header="Email" />
              <Column field="phone" header="Phone" />
              <Column header="Actions">
                <template #body="slotProps">
                  <Button
                    size="small"
                    severity="secondary"
                    label="Open"
                    @click="
                      requestOpenContact(
                        (slotProps.data as CompanyAssociatedContact).id,
                      )
                    "
                  />
                </template>
              </Column>
            </DataTable>
          </div>

          <div>
            <div class="mb-2 font-medium text-surface-700">
              Applications ({{ String(associatedApplicationCount) }})
            </div>
            <DataTable
              :value="associatedApplications"
              data-key="id"
              show-gridlines
              size="small"
              table-style="min-width: 40rem"
            >
              <Column field="title" header="Title" />
              <Column field="status" header="Status" />
              <Column header="Applied At">
                <template #body="slotProps">
                  {{
                    formatNullableDisplayDateTime(
                      (slotProps.data as CompanyAssociatedApplication).appliedAt,
                    )
                  }}
                </template>
              </Column>
              <Column header="Actions">
                <template #body="slotProps">
                  <Button
                    size="small"
                    severity="secondary"
                    label="Open"
                    @click="
                      requestOpenApplication(
                        (slotProps.data as CompanyAssociatedApplication).id,
                      )
                    "
                  />
                </template>
              </Column>
            </DataTable>
          </div>

          <div class="text-surface-700">
            Total associations: {{ String(totalAssociationCount) }}
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-surface-200 pt-3">
        <Button
          type="button"
          severity="secondary"
          label="Edit"
          :disabled="busy"
          @click="requestEdit"
        />
        <Button
          type="button"
          severity="danger"
          label="Delete"
          :disabled="busy"
          @click="openDeleteConfirm"
        />
      </div>
    </div>

    <ConfirmActionDialog
      v-model:visible="isDeleteConfirmVisible"
      title="Delete company?"
      :message="deleteConfirmationMessage"
      confirm-label="Delete"
      confirm-severity="danger"
      :busy="busy"
      @confirm="requestDelete"
    />
  </Dialog>
</template>
