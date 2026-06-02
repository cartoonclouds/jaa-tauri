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
  import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    ref,
    watch,
  } from "vue";

  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  const props = withDefaults(defineProps<Props>(), {
    busy: false,
    isDeleting: false,
    contactRefreshKey: 0,
  });
  const emit = defineEmits<{
    "update:visible": [value: boolean];
    submit: [payload: ApplicationFormSubmitPayload];
    "request-edit": [];
    "request-delete": [id: string];
    "request-open-company": [companyId: string];
    "request-open-contact": [contact: EditableContact];
    "request-create-contact": [payload: ApplicationContactCreatePayload];
    "request-link-contact": [contactId: string];
    "request-unlink-contact": [contactId: string];
    "cancel-edit": [];
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

  const ApplicationDetailsApplicationTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsApplicationTab.vue"),
  );
  const ApplicationDetailsContactTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsContactTab.vue"),
  );
  const ApplicationDetailsMapTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsMapTab.vue"),
  );
  const ApplicationDetailsFilesTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsFilesTab.vue"),
  );
  const ApplicationDetailsSummaryTab = defineAsyncComponent(
    () =>
      import("@modules/applications/presentation/components/tabs/ApplicationDetailsSummaryTab.vue"),
  );

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
  }

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  useBodyScrollLock(drawerVisible);

  const companyOptions = computed<ApplicationSelectOption[]>(() =>
    props.companies.map((company) => ({
      label: company.name,
      value: company.id,
    })),
  );

  const activeTab = ref("summary");
  const drawerWidthPx = ref(DEFAULT_DRAWER_WIDTH);
  const isResizingDrawer = ref(false);

  const drawerHeader = computed(() => {
    if (props.mode === "create") {
      return "Create Application";
    }

    if (props.mode === "edit") {
      return "Edit Application";
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

  watch(
    () => [props.visible, props.mode],
    ([visible, mode]) => {
      if (!visible) {
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
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
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
      <div class="flex w-full items-center justify-between gap-3 pr-2">
        <span>{{ drawerHeader }}</span>
        <Button
          v-if="mode === 'view' && application"
          type="button"
          size="small"
          @click="emit('request-edit')"
        >
          <Icon name="heroicons:pencil-square" class="h-4 w-4" />
          <span>Edit</span>
        </Button>
      </div>
    </template>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="summary">Summary</Tab>
        <Tab value="application">Application</Tab>
        <Tab value="contact">Contacts</Tab>
        <Tab value="map">Map</Tab>
        <Tab value="files">Files</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="summary">
          <ApplicationDetailsSummaryTab
            :application="application"
            :company-name="companyName"
            :applied-at-label="appliedAtLabel"
          />
        </TabPanel>

        <TabPanel value="application">
          <ApplicationDetailsApplicationTab
            :mode="mode"
            :application="application"
            :initial-values="initialValues"
            :companies="companyOptions"
            :busy="busy"
            :is-deleting="isDeleting"
            :company-name="companyName"
            :applied-at-label="appliedAtLabel"
            @submit="onSubmit"
            @cancel-edit="emit('cancel-edit')"
            @request-delete="emit('request-delete', $event)"
            @request-open-company="emit('request-open-company', $event)"
          />
        </TabPanel>

        <TabPanel value="contact">
          <ApplicationDetailsContactTab
            :application="application"
            :company-name="companyName"
            :refresh-key="contactRefreshKey"
            @request-create-contact="emit('request-create-contact', $event)"
            @request-link-contact="emit('request-link-contact', $event)"
            @request-unlink-contact="emit('request-unlink-contact', $event)"
            @request-open-contact="emit('request-open-contact', $event)"
          />
        </TabPanel>

        <TabPanel value="map">
          <ApplicationDetailsMapTab :application="application" />
        </TabPanel>

        <TabPanel value="files">
          <ApplicationDetailsFilesTab :application="application" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Drawer>
</template>
