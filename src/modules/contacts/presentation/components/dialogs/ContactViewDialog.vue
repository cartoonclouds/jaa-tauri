<script setup lang="ts">
  import type { Contact } from "@modules/contacts/domain/entities/Contact";
  import type {
    ContactAssociatedApplication,
    ContactAssociatedCompany,
  } from "@modules/contacts/repositories/ContactRepository";

  import { useContact } from "@modules/contacts";
  import { showFailedPromiseToast } from "@shared/utils/toast";
  import { formatNullableDisplayDateTime } from "@shared/utils/toDate";
  import { useToast } from "primevue/usetoast";
  import { computed, ref, watch } from "vue";

  import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog.vue";

  interface Props {
    visible: boolean;
    contact: Contact | null;
    busy?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    "request-edit": [contact: Contact];
    "request-delete": [contactId: string];
    "request-open-company": [companyId: string];
    "request-open-application": [applicationId: string];
  }>();

  const { service: contactService } = useContact();
  const toast = useToast();
  const associatedCompanies = ref<ContactAssociatedCompany[]>([]);
  const associatedApplications = ref<ContactAssociatedApplication[]>([]);
  const isLoadingAssociations = ref(false);
  const associationsError = ref<string | null>(null);
  const isDeleteConfirmVisible = ref(false);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const associatedCompanyCount = computed(
    () => associatedCompanies.value.length,
  );

  const associatedApplicationCount = computed(
    () => associatedApplications.value.length,
  );

  const totalAssociationCount = computed(
    () => associatedCompanyCount.value + associatedApplicationCount.value,
  );

  const deleteConfirmationMessage = computed(() => {
    return `This contact has ${String(associatedCompanyCount.value)} company association(s) and ${String(associatedApplicationCount.value)} application association(s), for ${String(totalAssociationCount.value)} total associations. This action cannot be undone.`;
  });

  watch(
    () => [props.visible, props.contact?.id] as const,
    async ([visible, contactId]) => {
      if (!visible || typeof contactId !== "string") {
        associatedCompanies.value = [];
        associatedApplications.value = [];
        associationsError.value = null;
        isLoadingAssociations.value = false;
        isDeleteConfirmVisible.value = false;
        return;
      }

      isLoadingAssociations.value = true;
      associationsError.value = null;

      try {
        const [companiesResult, applicationsResult] = await Promise.allSettled([
          contactService.listAssociatedCompanies(contactId),
          contactService.listAssociatedApplications(contactId),
        ]);

        associatedCompanies.value =
          companiesResult.status === "fulfilled" ? companiesResult.value : [];
        associatedApplications.value =
          applicationsResult.status === "fulfilled"
            ? applicationsResult.value
            : [];

        if (companiesResult.status === "rejected") {
          showFailedPromiseToast(
            toast,
            "Contact companies associations",
            companiesResult.reason,
          );
        }

        if (applicationsResult.status === "rejected") {
          showFailedPromiseToast(
            toast,
            "Contact applications associations",
            applicationsResult.reason,
          );
        }

        if (
          companiesResult.status === "rejected" &&
          applicationsResult.status === "rejected"
        ) {
          associationsError.value =
            "Unable to load contact associations right now.";
        }
      } catch (error: unknown) {
        associatedCompanies.value = [];
        associatedApplications.value = [];
        const message =
          error instanceof Error ? error.message : "Unknown error";
        associationsError.value = `Unable to load contact associations: ${message}`;
      } finally {
        isLoadingAssociations.value = false;
      }
    },
    { immediate: true },
  );

  function requestEdit(): void {
    if (!props.contact) {
      return;
    }

    emit("request-edit", props.contact);
  }

  function openDeleteConfirm(): void {
    if (!props.contact) {
      return;
    }

    isDeleteConfirmVisible.value = true;
  }

  function requestDelete(): void {
    if (!props.contact) {
      return;
    }

    emit("request-delete", props.contact.id);
    isDeleteConfirmVisible.value = false;
  }

  function requestOpenCompany(companyId: string): void {
    emit("request-open-company", companyId);
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
    header="Contact"
    class="w-[95vw] max-w-4xl"
  >
    <div v-if="contact" class="space-y-4 p-2">
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs text-surface-500">Name</div>
          <div class="text-sm font-medium">{{ contact.fullName }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">Type</div>
          <div class="text-sm font-medium">{{ contact.type }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">Email</div>
          <div class="text-sm font-medium">{{ contact.email || "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">Phone</div>
          <div class="text-sm font-medium">{{ contact.phone || "-" }}</div>
        </div>
        <div class="md:col-span-2">
          <div class="text-xs text-surface-500">Location</div>
          <div class="text-sm font-medium">
            {{ contact.locationText || "-" }}
          </div>
        </div>
      </div>

      <div class="rounded-md border border-surface-200 p-3 text-sm">
        <div v-if="isLoadingAssociations" class="text-surface-500">
          Loading association details...
        </div>
        <div v-else-if="associationsError" class="text-red-500">
          {{ associationsError }}
        </div>
        <div v-else class="space-y-4">
          <div>
            <div class="mb-2 font-medium text-surface-700">
              Companies ({{ String(associatedCompanyCount) }})
            </div>
            <DataTable
              :value="associatedCompanies"
              data-key="id"
              show-gridlines
              size="small"
              table-style="min-width: 40rem"
            >
              <Column field="name" header="Name" />
              <Column field="industry" header="Industry" />
              <Column field="locationText" header="Location" />
              <Column header="Actions">
                <template #body="slotProps">
                  <Button
                    size="small"
                    severity="secondary"
                    label="Open"
                    @click="
                      requestOpenCompany(
                        (slotProps.data as ContactAssociatedCompany).id,
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
              <Column field="eventFlowStatus" header="Event Flow" />
              <Column header="Applied At">
                <template #body="slotProps">
                  {{
                    formatNullableDisplayDateTime(
                      (slotProps.data as ContactAssociatedApplication)
                        .appliedAt,
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
                        (slotProps.data as ContactAssociatedApplication).id,
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
      title="Delete contact?"
      :message="deleteConfirmationMessage"
      confirm-label="Delete"
      confirm-severity="danger"
      :busy="busy"
      @confirm="requestDelete"
    />
  </Dialog>
</template>
