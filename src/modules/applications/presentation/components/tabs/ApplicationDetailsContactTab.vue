<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type { ContactType } from "@modules/contacts/domain/entities/Contact";
  import type { ContactCreatePayload } from "@modules/contacts/repositories/ContactRepository";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import ApplicationDetailsCard from "@modules/applications/presentation/components/cards/ApplicationDetailsCard.vue";
  import ApplicationDetailsManageContactDialog from "@modules/applications/presentation/components/dialogs/ApplicationDetailsManageContactDialog.vue";
  import ApplicationDetailsUnlinkContactDialog from "@modules/applications/presentation/components/dialogs/ApplicationDetailsUnlinkContactDialog.vue";
  import { useContact } from "@modules/contacts";
  import { computed, ref, watch } from "vue";

  import LocationMapFull from "@/components/ui/LocationMapFull.vue";

  /**
   * Defines linked contact.
   */
  interface LinkedContact {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    locationLat: number | null;
    locationLng: number | null;
    type: "company" | "recruiter";
    notes: string | null;
  }

  /**
   * Defines linked contact section.
   */
  interface LinkedContactSection {
    contact: LinkedContact;
    companyName: string | null;
  }

  interface ContactLinkOption {
    label: string;
    value: string;
    fullName: string;
    type: ContactType;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    notes: string | null;
  }

  /**
   * Defines contact lookup service.
   */
  interface ContactLookupService {
    list(): Promise<LinkedContact[]>;
    listByApplicationId(applicationId: string): Promise<LinkedContactSection[]>;
  }

  /**
   * Payload for creating a new contact from the application contacts tab.
   */
  export type ApplicationContactCreatePayload = Pick<
    ContactCreatePayload,
    | "fullName"
    | "type"
    | "email"
    | "phone"
    | "linkedinUrl"
    | "locationText"
    | "notes"
  >;

  interface ContactCreateFormState {
    fullName: string;
    type: ContactType;
    email: string;
    phone: string;
    linkedinUrl: string;
    locationText: string;
    notes: string;
  }

  /**
   * Defines props.
   */
  interface Props {
    application: Application | null;
    companyName: string;
    refreshKey?: number;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    "request-open-contact": [contact: EditableContact];
    "request-create-contact": [payload: ApplicationContactCreatePayload];
    "request-link-contact": [contactId: string];
    "request-unlink-contact": [contactId: string];
  }>();

  const { service } = useContact();
  const contactService = service as ContactLookupService;

  const linkedContacts = ref<LinkedContactSection[]>([]);
  const loading = ref(false);
  const errorMessage = ref<string | null>(null);
  const isManageContactDialogVisible = ref(false);
  const isUnlinkConfirmVisible = ref(false);
  const isLoadingAvailableContacts = ref(false);
  const availableContactsError = ref<string | null>(null);
  const pendingUnlinkContactId = ref<string | null>(null);
  const pendingUnlinkContactName = ref<string>("");
  const selectedContactId = ref<string | null>(null);
  const availableContacts = ref<LinkedContact[]>([]);
  const createForm = ref<ContactCreateFormState>({
    fullName: "",
    type: "company",
    email: "",
    phone: "",
    linkedinUrl: "",
    locationText: "",
    notes: "",
  });

  const hasApplication = computed(() => Boolean(props.application?.id));

  const unlinkedContactOptions = computed<ContactLinkOption[]>(() => {
    const linkedIds = new Set(
      linkedContacts.value.map((item) => item.contact.id),
    );

    return availableContacts.value
      .filter((contact) => !linkedIds.has(contact.id))
      .map((contact) => ({
        label: contact.email
          ? `${contact.fullName} (${contact.email})`
          : contact.fullName,
        value: contact.id,
        fullName: contact.fullName,
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        linkedinUrl: contact.linkedinUrl,
        locationText: contact.locationText,
        notes: contact.notes,
      }));
  });

  /**
   * Handles load contacts.
   */
  async function loadContacts(applicationId: string): Promise<void> {
    loading.value = true;
    errorMessage.value = null;

    try {
      linkedContacts.value =
        await contactService.listByApplicationId(applicationId);
    } catch (error: unknown) {
      linkedContacts.value = [];
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage.value = `Unable to load contacts: ${message}`;
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => [props.application?.id, props.refreshKey],
    async ([applicationId]) => {
      if (typeof applicationId !== "string") {
        linkedContacts.value = [];
        errorMessage.value = null;
        return;
      }

      await loadContacts(applicationId);
    },
    { immediate: true },
  );

  /**
   * Handles open add contact dialog.
   */
  async function openManageContactDialog(): Promise<void> {
    if (!props.application?.id) {
      return;
    }

    isManageContactDialogVisible.value = true;
    selectedContactId.value = null;
    createForm.value = {
      fullName: "",
      type: "company",
      email: "",
      phone: "",
      linkedinUrl: "",
      locationText: "",
      notes: "",
    };
    availableContactsError.value = null;
    isLoadingAvailableContacts.value = true;

    try {
      availableContacts.value = await contactService.list();
    } catch (error: unknown) {
      availableContacts.value = [];
      const message = error instanceof Error ? error.message : "Unknown error";
      availableContactsError.value = `Unable to load contacts: ${message}`;
    } finally {
      isLoadingAvailableContacts.value = false;
    }
  }

  /**
   * Handles submit add contact dialog.
   */
  function submitManageContact(): void {
    if (selectedContactId.value) {
      emit("request-link-contact", selectedContactId.value);
      isManageContactDialogVisible.value = false;
      selectedContactId.value = null;
      return;
    }

    const fullName = createForm.value.fullName.trim();
    if (!fullName) {
      return;
    }

    emit("request-create-contact", {
      fullName,
      type: createForm.value.type,
      email: createForm.value.email.trim() || null,
      phone: createForm.value.phone.trim() || null,
      linkedinUrl: createForm.value.linkedinUrl.trim() || null,
      locationText: createForm.value.locationText.trim() || null,
      notes: createForm.value.notes.trim() || null,
    });

    isManageContactDialogVisible.value = false;
  }

  /**
   * Opens the unlink confirmation dialog for a contact.
   */
  function requestUnlinkContact(contact: LinkedContact): void {
    pendingUnlinkContactId.value = contact.id;
    pendingUnlinkContactName.value = contact.fullName;
    isUnlinkConfirmVisible.value = true;
  }

  /**
   * Confirms contact unlink action.
   */
  function confirmUnlinkContact(): void {
    if (!pendingUnlinkContactId.value) {
      return;
    }

    emit("request-unlink-contact", pendingUnlinkContactId.value);
    isUnlinkConfirmVisible.value = false;
    pendingUnlinkContactId.value = null;
    pendingUnlinkContactName.value = "";
  }
</script>

<template>
  <div class="space-y-4">
    <div v-if="hasApplication" class="flex justify-end">
      <Button type="button" size="small" @click="openManageContactDialog">
        <Icon name="heroicons:plus" class="h-4 w-4" />
        <span>Add Contact</span>
      </Button>
    </div>

    <Message v-if="!hasApplication" severity="info">
      Contact information is available after selecting an application.
    </Message>

    <Message v-else-if="errorMessage" severity="error">
      {{ errorMessage }}
    </Message>

    <Message v-else-if="loading" severity="info">Loading contacts...</Message>

    <Message v-else-if="linkedContacts.length === 0" severity="info">
      No contacts are associated with this application yet.
    </Message>

    <div v-else class="space-y-4">
      <section
        v-for="item in linkedContacts"
        :key="item.contact.id"
        class="rounded-xl border border-surface-200 bg-surface-0 p-4"
      >
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-surface-900">
                {{ item.contact.fullName }}
              </h3>
              <Button
                type="button"
                text
                size="small"
                aria-label="Edit contact"
                @click="emit('request-open-contact', item.contact)"
              >
                <Icon name="heroicons:pencil-square" class="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button
                type="button"
                text
                size="small"
                severity="danger"
                aria-label="Remove contact"
                @click="requestUnlinkContact(item.contact)"
              >
                <Icon name="heroicons:trash" class="h-4 w-4" />
                <span>Remove</span>
              </Button>
            </div>
            <p class="text-sm text-surface-600">
              {{ item.companyName || companyName || "-" }}
            </p>
          </div>
          <Tag :value="item.contact.type" severity="secondary" />
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <ApplicationDetailsCard title="Email" compact>
            <p class="text-sm text-surface-700">
              {{ item.contact.email || "-" }}
            </p>
          </ApplicationDetailsCard>

          <ApplicationDetailsCard title="Phone" compact>
            <p class="text-sm text-surface-700">
              {{ item.contact.phone || "-" }}
            </p>
          </ApplicationDetailsCard>

          <ApplicationDetailsCard title="LinkedIn" compact>
            <a
              v-if="item.contact.linkedinUrl"
              :href="item.contact.linkedinUrl"
              target="_blank"
              rel="noreferrer"
              class="text-sm font-medium text-primary-600 hover:underline"
            >
              {{ item.contact.linkedinUrl }}
            </a>
            <p v-else class="text-sm text-surface-700">-</p>
          </ApplicationDetailsCard>

          <ApplicationDetailsCard title="Location" compact>
            <p class="text-sm text-surface-700">
              {{ item.contact.locationText || "-" }}
            </p>
          </ApplicationDetailsCard>
        </div>

        <LocationMapFull
          class="mt-4"
          :latitude="item.contact.locationLat"
          :longitude="item.contact.locationLng"
          :location-text="item.contact.locationText"
          :title="`Map for ${item.contact.fullName}`"
          height-class="h-56"
        />

        <ApplicationDetailsCard
          v-if="item.contact.notes"
          class="mt-3"
          title="Notes"
          compact
        >
          <p class="whitespace-pre-line text-sm text-surface-700">
            {{ item.contact.notes }}
          </p>
        </ApplicationDetailsCard>
      </section>
    </div>

    <ApplicationDetailsManageContactDialog
      v-model:visible="isManageContactDialogVisible"
      v-model:create-form="createForm"
      v-model:selected-contact-id="selectedContactId"
      :available-contacts-error="availableContactsError"
      :is-loading-available-contacts="isLoadingAvailableContacts"
      :unlinked-contact-options="unlinkedContactOptions"
      @submit="submitManageContact"
    />

    <ApplicationDetailsUnlinkContactDialog
      v-model:visible="isUnlinkConfirmVisible"
      :contact-name="pendingUnlinkContactName"
      @confirm="confirmUnlinkContact"
    />
  </div>
</template>
