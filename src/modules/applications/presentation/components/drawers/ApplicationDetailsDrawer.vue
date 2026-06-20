<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
    ApplicationSelectOption,
  } from "@modules/applications/types";
  import type { Company } from "@modules/companies/domain/entities/Company";
  import type { ContactType } from "@modules/contacts/domain/entities/Contact";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import { scrollDrawerContentToTop } from "@modules/applications/presentation/utils/drawerScrollUtils";
  import { formatDisplayDateTime } from "@shared/utils/toDate";
  import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

  import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog.vue";
  import { useUnsavedChangesGuard } from "@/composables/useUnsavedChangesGuard";

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
    isDeleting: false,
    contactRefreshKey: 0,
    hasUnsavedChanges: false,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    submit: [payload: ApplicationFormSubmitPayload];
    "request-edit": [];
    "request-close": [];
    "request-delete": [id: string];
    "request-open-company": [companyId: string];
    "request-open-contact": [contact: EditableContact];
    "request-create-contact": [payload: ApplicationContactCreatePayload];
    "request-link-contact": [contactId: string];
    "request-unlink-contact": [contactId: string];
    "cancel-edit": [];
    "dirty-change": [value: boolean];
  }>();

  const DEFAULT_DRAWER_WIDTH = 768;
  const MIN_DRAWER_WIDTH = 520;
  const MAX_DRAWER_WIDTH = 1200;
  const VIEWPORT_GUTTER = 24;
  const KEYBOARD_RESIZE_STEP = 24;

  interface ApplicationContactCreatePayload {
    fullName: string;
    type: ContactType;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    notes: string | null;
  }

  interface TabSwitchIntent {
    type: "switch-tab";
    tab: string;
  }

  /**
   * Defines props.
   */
  interface Props {
    visible: boolean;
    application: Application | null;
    mode: ApplicationDrawerMode;
    initialValues: ApplicationFormValues;
    companies: Company[];
    busy?: boolean;
    isDeleting?: boolean;
    contactRefreshKey?: number;
    hasUnsavedChanges?: boolean;
  }

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      if (
        !value &&
        props.hasUnsavedChanges &&
        (props.mode === "create" || props.mode === "edit")
      ) {
        emit("request-close");
        return;
      }

      emit("update:visible", value);
    },
  });

  const companyOptions = computed<ApplicationSelectOption[]>(() =>
    props.companies.map((company) => ({
      label: company.name,
      value: company.id,
    })),
  );

  const activeTab = ref("summary");
  const drawerWidthPx = ref(DEFAULT_DRAWER_WIDTH);
  const isResizingDrawer = ref(false);
  const {
    isConfirmVisible: isDiscardChangesConfirmVisible,
    confirmMessage: discardChangesMessage,
    requestConfirmation: requestDiscardChangesConfirmation,
    confirmAndGetIntent,
    cancelConfirmation: onDiscardChangesCancel,
    clearConfirmation,
  } = useUnsavedChangesGuard<TabSwitchIntent>(() => {
    return "You have unsaved edits in the application form. Switch tabs and discard them?";
  });

  const drawerHeader = computed(() => {
    const role = props.application?.title ?? props.initialValues.title;
    const normalizedRole = role.trim();
    const hasCompany = companyName.value !== "-";
    const hasRole = normalizedRole.length > 0;

    if (props.mode === "create") {
      if (hasCompany && hasRole) {
        return `Create Application | ${companyName.value} - ${normalizedRole}`;
      }

      if (hasRole) {
        return `Create Application | ${normalizedRole}`;
      }

      return "Create Application";
    }

    if (props.mode === "edit") {
      if (hasCompany && hasRole) {
        return `Edit Application | ${companyName.value} - ${normalizedRole}`;
      }

      if (hasRole) {
        return `Edit Application | ${normalizedRole}`;
      }

      return "Edit Application";
    }

    if (hasCompany && hasRole) {
      return `Application Details | ${companyName.value} - ${normalizedRole}`;
    }

    if (hasRole) {
      return `Application Details | ${normalizedRole}`;
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

    return formatDisplayDateTime(props.application.appliedAt);
  });

  const drawerInlineStyle = computed(() => ({
    width: `min(${String(drawerWidthPx.value)}px, calc(100vw - 1rem))`,
    maxWidth: "100vw",
  }));

  const CREATE_MODE_LOCKED_TAB_TOOLTIP =
    "Finish creating the application first. These tabs become available after the application is saved.";

  function isCreateModeLockedTab(tabValue: string): boolean {
    return props.mode === "create" && tabValue !== "application";
  }

  function tabTooltip(tabValue: string): string | undefined {
    if (!isCreateModeLockedTab(tabValue)) {
      return undefined;
    }

    return CREATE_MODE_LOCKED_TAB_TOOLTIP;
  }

  function getClientX(event: MouseEvent | PointerEvent): number {
    return event.clientX;
  }

  function clampDrawerWidth(width: number): number {
    const viewportMax = import.meta.client
      ? Math.max(MIN_DRAWER_WIDTH, window.innerWidth - VIEWPORT_GUTTER)
      : MAX_DRAWER_WIDTH;
    const maxWidth = Math.min(MAX_DRAWER_WIDTH, viewportMax);
    return Math.min(Math.max(width, MIN_DRAWER_WIDTH), maxWidth);
  }

  function syncDrawerWidthToViewport(): void {
    drawerWidthPx.value = clampDrawerWidth(drawerWidthPx.value);
  }

  function stopDrawerResize(): void {
    if (!import.meta.client || !isResizingDrawer.value) {
      return;
    }

    isResizingDrawer.value = false;
    window.removeEventListener("pointermove", onDrawerResizeMove);
    window.removeEventListener("pointerup", stopDrawerResize);
  }

  function onDrawerResizeMove(event: PointerEvent): void {
    if (!isResizingDrawer.value || !import.meta.client) {
      return;
    }

    const width = window.innerWidth - getClientX(event);
    drawerWidthPx.value = clampDrawerWidth(width);
  }

  function startDrawerResize(event: PointerEvent): void {
    if (!import.meta.client) {
      return;
    }

    event.preventDefault();
    isResizingDrawer.value = true;
    window.addEventListener("pointermove", onDrawerResizeMove);
    window.addEventListener("pointerup", stopDrawerResize);
  }

  function onResizeHandleKeydown(event: KeyboardEvent): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const delta =
      event.key === "ArrowLeft" ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP;
    drawerWidthPx.value = clampDrawerWidth(drawerWidthPx.value + delta);
  }

  /**
   * Handles tab changes with unsaved-change protection when leaving the form tab.
   */
  function onTabChange(nextTab: string | number): void {
    const nextTabValue = String(nextTab);
    const isEditing = props.mode === "create" || props.mode === "edit";
    const leavingApplicationTab =
      activeTab.value === "application" && nextTabValue !== "application";

    if (isEditing && props.hasUnsavedChanges && leavingApplicationTab) {
      requestDiscardChangesConfirmation({
        type: "switch-tab",
        tab: nextTabValue,
      });
      return;
    }

    activeTab.value = nextTabValue;
  }

  /**
   * Confirms discarding changes and applies the pending tab switch.
   */
  function confirmDiscardAndSwitchTab(): void {
    const intent = confirmAndGetIntent();
    emit("dirty-change", false);

    if (intent?.type === "switch-tab") {
      activeTab.value = intent.tab;
    }
  }

  watch(
    () => [props.visible, props.mode],
    ([visible, mode]) => {
      if (!visible) {
        clearConfirmation();
        return;
      }

      activeTab.value = mode === "view" ? "summary" : "application";

      if (mode === "create" || mode === "edit") {
        void nextTick(() => {
          scrollDrawerContentToTop("application-details-drawer");
        });
      }

      syncDrawerWidthToViewport();
    },
    { immediate: true },
  );

  if (import.meta.client) {
    window.addEventListener("resize", syncDrawerWidthToViewport);
  }

  onBeforeUnmount(() => {
    if (!import.meta.client) {
      return;
    }

    stopDrawerResize();
    window.removeEventListener("resize", syncDrawerWidthToViewport);
  });

  /**
   * Handles on submit.
   */
  function onSubmit(payload: ApplicationFormSubmitPayload): void {
    emit("submit", payload);
  }

  /**
   * Triggers form submission from header button.
   */
  function triggerFormSubmit(): void {
    const formElement = document.getElementById(
      "application-editor-form",
    ) as HTMLFormElement | null;
    if (formElement) {
      formElement.requestSubmit();
    }
  }

  /**
   * Triggers form cancellation from header button.
   */
  function triggerFormCancel(): void {
    emit("cancel-edit");
  }
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
    :block-scroll="true"
    :draggable="true"
    position="right"
    class="application-details-drawer relative"
    :style="drawerInlineStyle"
  >
    <button
      type="button"
      class="absolute top-0 left-0 z-10 h-full w-2 -translate-x-1/2 cursor-ew-resize"
      aria-label="Resize drawer"
      @pointerdown="startDrawerResize"
      @keydown="onResizeHandleKeydown"
    />

    <template #header>
      <div
        class="sticky top-0 z-20 flex w-full items-center justify-between gap-3 pr-2 bg-surface-0"
      >
        <span>{{ drawerHeader }}</span>
        <div
          v-if="props.mode === 'create' || props.mode === 'edit'"
          class="flex gap-2"
        >
          <Button
            type="button"
            size="small"
            :label="props.mode === 'edit' ? 'Update' : 'Create'"
            :loading="busy"
            @click="triggerFormSubmit"
          />
          <Button
            type="button"
            size="small"
            severity="secondary"
            outlined
            label="Cancel"
            :disabled="busy"
            @click="triggerFormCancel"
          />
        </div>
        <Button
          v-else-if="props.mode === 'view' && props.application"
          type="button"
          size="small"
          @click="emit('request-edit')"
        >
          <Icon name="heroicons:pencil-square" class="h-4 w-4" />
          <span>Edit</span>
        </Button>
      </div>
    </template>

    <Tabs :value="activeTab" @update:value="onTabChange">
      <TabList>
        <Tab
          v-tooltip.bottom="tabTooltip('summary')"
          value="summary"
          :disabled="isCreateModeLockedTab('summary')"
        >
          Summary
        </Tab>
        <Tab
          v-tooltip.bottom="tabTooltip('flow')"
          value="flow"
          :disabled="isCreateModeLockedTab('flow')"
        >
          Flow
        </Tab>
        <Tab value="application">Application</Tab>
        <Tab
          v-tooltip.bottom="tabTooltip('contact')"
          value="contact"
          :disabled="isCreateModeLockedTab('contact')"
        >
          Contacts
        </Tab>
        <Tab
          v-tooltip.bottom="tabTooltip('map')"
          value="map"
          :disabled="isCreateModeLockedTab('map')"
        >
          Map
        </Tab>
        <Tab
          v-tooltip.bottom="tabTooltip('files')"
          value="files"
          :disabled="isCreateModeLockedTab('files')"
        >
          Files
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="summary">
          <LazyApplicationDetailsSummaryTab
            :application="props.application"
            :company-name="companyName"
            :applied-at-label="appliedAtLabel"
          />
        </TabPanel>

        <TabPanel value="flow">
          <LazyApplicationDetailsStagesTab :application="props.application" />
        </TabPanel>

        <TabPanel value="application">
          <LazyApplicationDetailsApplicationTab
            :mode="props.mode"
            :application="props.application"
            :initial-values="props.initialValues"
            :companies="companyOptions"
            :busy="props.busy"
            :is-deleting="props.isDeleting"
            :company-name="companyName"
            :applied-at-label="appliedAtLabel"
            @submit="onSubmit"
            @cancel-edit="emit('cancel-edit')"
            @dirty-change="emit('dirty-change', $event)"
            @request-delete="emit('request-delete', $event)"
            @request-open-company="emit('request-open-company', $event)"
          />
        </TabPanel>

        <TabPanel value="contact">
          <LazyApplicationDetailsContactTab
            :application="props.application"
            :company-name="companyName"
            :refresh-key="props.contactRefreshKey"
            @request-create-contact="emit('request-create-contact', $event)"
            @request-link-contact="emit('request-link-contact', $event)"
            @request-unlink-contact="emit('request-unlink-contact', $event)"
            @request-open-contact="emit('request-open-contact', $event)"
          />
        </TabPanel>

        <TabPanel value="map">
          <LazyApplicationDetailsMapTab :application="props.application" />
        </TabPanel>

        <TabPanel value="files">
          <LazyApplicationDetailsFilesTab :application="props.application" />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <ConfirmActionDialog
      v-model:visible="isDiscardChangesConfirmVisible"
      title="Discard unsaved changes?"
      :message="discardChangesMessage"
      confirm-label="Discard"
      confirm-severity="warn"
      @confirm="confirmDiscardAndSwitchTab"
      @cancel="onDiscardChangesCancel"
    />
  </Drawer>
</template>
