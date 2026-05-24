<script setup lang="ts">
  import type { FormSubmitEvent } from "@primevue/forms";
  import type { PersistedConstantSourceType } from "@shared/constants/persistedConstants";

  import { logError } from "@infra/logging/tauriLog.client";
  import { useSettingService } from "@modules/settings";
  import { Form } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { CONSTANT_MODULE_SOURCES } from "@shared/constants/persistedConstants";
  import { computed, reactive, ref, watch } from "vue";
  import { z } from "zod";

  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  /**
   * Props accepted by the settings modal.
   */
  interface Props {
    visible: boolean;
  }

  /**
   * Form values managed by the general settings section.
   */
  interface GeneralFormValues {
    theme: "dark" | "light" | "system";
    locale: string;
    notificationsEnabled: boolean;
    developerMode: boolean;
  }

  /**
   * Editable row state for a single constant value.
   */
  interface ConstantEditorRow {
    isNew: boolean;
    isVisible: boolean;
    label: string;
    originalValue: string;
    value: string;
  }

  /**
   * Constant group metadata shown as tabs in the modal.
   */
  interface ConstantGroup {
    key: string;
    label: string;
    type: PersistedConstantSourceType;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const settingService = useSettingService();

  /**
   * Returns whether an exported constant value can be persisted.
   */
  function isPersistableConstantValue(value: unknown): boolean {
    if (value === null) {
      return true;
    }

    const valueType = typeof value;
    return (
      valueType === "string" ||
      valueType === "number" ||
      valueType === "boolean" ||
      valueType === "bigint" ||
      valueType === "object"
    );
  }

  const modalVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  useBodyScrollLock(modalVisible);

  const constantGroups = computed<ConstantGroup[]>(() => {
    const seen = new Set<string>();
    const groups: ConstantGroup[] = [];

    for (const source of CONSTANT_MODULE_SOURCES) {
      for (const [exportName, value] of Object.entries(source.module)) {
        if (!isPersistableConstantValue(value)) {
          continue;
        }

        const type = `${source.namespace}.${exportName}`;
        if (seen.has(type)) {
          continue;
        }

        seen.add(type);
        groups.push({
          key: type,
          label: exportName
            .toLowerCase()
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
          type: type as PersistedConstantSourceType,
        });
      }
    }

    return groups;
  });

  const initialGeneralValues = ref<GeneralFormValues>({
    theme: "system",
    locale: "en-GB",
    notificationsEnabled: true,
    developerMode: false,
  });
  const currentSettingId = ref<string | null>(null);
  const isBusy = ref(false);
  const rootTab = ref("general");
  const activeConstantTab = ref("");
  const generalFormVersion = ref(0);
  const constantRowsByType = reactive<Record<string, ConstantEditorRow[]>>({});

  const themeOptions: {
    label: string;
    value: GeneralFormValues["theme"];
  }[] = [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  const generalResolver = zodResolver(
    z.object({
      developerMode: z.boolean(),
      locale: z.string().min(2, "Locale is required"),
      notificationsEnabled: z.boolean(),
      theme: z.enum(["system", "light", "dark"]),
    }),
  );

  /**
   * Resolve editable rows for a constant source type.
   */
  function resolveRows(type: PersistedConstantSourceType): ConstantEditorRow[] {
    return constantRowsByType[type] ?? [];
  }

  /**
   * Append a new unsaved row to a constant group.
   */
  function addConstantRow(type: PersistedConstantSourceType): void {
    const rows = resolveRows(type);
    rows.push({
      isNew: true,
      isVisible: true,
      label: "",
      originalValue: "",
      value: "",
    });
    constantRowsByType[type] = rows;
  }

  /**
   * Returns true when the row should render a single label input.
   */
  function usesSingleLabelInput(row: ConstantEditorRow): boolean {
    const normalizedValue = row.value.trim();
    const normalizedLabel = row.label.trim();

    if (normalizedLabel.length === 0) {
      return false;
    }

    return normalizedValue === normalizedLabel;
  }

  /**
   * Keep value and label synchronized in single-input mode.
   */
  function updateSingleLabelValue(
    row: ConstantEditorRow,
    nextValue: string,
  ): void {
    row.value = nextValue;
    row.label = nextValue;
  }

  /**
   * Load persisted settings and constants into modal state.
   */
  async function loadState(): Promise<void> {
    isBusy.value = true;

    try {
      const [settings, constantRowsByGroup] = await Promise.all([
        settingService.list(),
        Promise.all(
          constantGroups.value.map(async (group) => ({
            rows: await settingService.listConstantRows(group.type, {
              includeHidden: true,
            }),
            type: group.type,
          })),
        ),
      ]);

      const current = settings[0];
      currentSettingId.value = current?.id ?? null;
      initialGeneralValues.value = {
        developerMode: current?.developerMode ?? false,
        locale: current?.locale ?? "en-GB",
        notificationsEnabled: current?.notificationsEnabled ?? true,
        theme: current?.theme ?? "system",
      };
      generalFormVersion.value += 1;

      for (const group of constantGroups.value) {
        constantRowsByType[group.type] = [];
      }

      for (const groupRows of constantRowsByGroup) {
        constantRowsByType[groupRows.type] = groupRows.rows.map((row) => ({
          isNew: false,
          isVisible: row.isVisible,
          label: row.label ?? "",
          originalValue: row.value,
          value: row.value,
        }));
      }

      activeConstantTab.value = constantGroups.value[0]?.type ?? "";
    } catch (error) {
      logError("Failed to load settings modal data:", error);
    } finally {
      isBusy.value = false;
    }
  }

  /**
   * Persist updates from the general settings form.
   */
  async function submitGeneral(event: FormSubmitEvent): Promise<void> {
    if (!event.valid) {
      return;
    }

    const values = event.values as GeneralFormValues;

    isBusy.value = true;
    try {
      const id = await settingService.upsert({
        developerMode: values.developerMode,
        id: currentSettingId.value ?? undefined,
        locale: values.locale,
        notificationsEnabled: values.notificationsEnabled,
        theme: values.theme,
      });
      currentSettingId.value = id;
    } catch (error) {
      logError("Failed to save general settings:", error);
    } finally {
      isBusy.value = false;
    }
  }

  /**
   * Save or update a single constant row.
   */
  async function saveConstantRow(
    type: PersistedConstantSourceType,
    row: ConstantEditorRow,
  ): Promise<void> {
    isBusy.value = true;

    try {
      const nextValue = row.value.trim();
      if (nextValue.length === 0) {
        return;
      }

      await settingService.upsertConstantRow({
        isVisible: row.isVisible,
        label: row.label.trim() ? row.label.trim() : null,
        previousValue: row.isNew ? undefined : row.originalValue,
        type,
        value: nextValue,
      });

      row.isNew = false;
      row.originalValue = nextValue;
      row.value = nextValue;
    } catch (error) {
      logError("Failed to save constant row:", error);
    } finally {
      isBusy.value = false;
    }
  }

  /**
   * Remove a constant row (or just discard if unsaved).
   */
  async function removeConstantRow(
    type: PersistedConstantSourceType,
    row: ConstantEditorRow,
  ): Promise<void> {
    const rows = resolveRows(type);

    if (row.isNew) {
      const index = rows.indexOf(row);
      if (index >= 0) {
        rows.splice(index, 1);
      }
      return;
    }

    isBusy.value = true;

    try {
      await settingService.deleteConstantRow(type, row.originalValue);

      const index = rows.indexOf(row);
      if (index >= 0) {
        rows.splice(index, 1);
      }
    } catch (error) {
      logError("Failed to delete constant row:", error);
    } finally {
      isBusy.value = false;
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        return;
      }

      rootTab.value = "general";
      void loadState();
    },
  );
</script>

<template>
  <Dialog
    v-model:visible="modalVisible"
    modal
    dismissable-mask
    maximizable
    :draggable="false"
    :style="{ width: 'min(90rem, 96vw)' }"
    header="Settings"
  >
    <div class="min-h-128">
      <div v-if="isBusy" class="mb-4 text-sm text-flow-muted">
        Saving or loading data...
      </div>

      <Tabs v-model:value="rootTab">
        <TabList>
          <Tab value="general">General</Tab>
          <Tab value="constants">Constants</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="general">
            <Form
              :key="generalFormVersion"
              v-slot="$form"
              :initial-values="initialGeneralValues"
              :resolver="generalResolver"
              class="grid gap-4 md:grid-cols-2"
              @submit="submitGeneral"
            >
              <div class="space-y-2">
                <label class="text-sm text-flow-muted">Theme</label>
                <Select
                  name="theme"
                  :options="themeOptions"
                  option-label="label"
                  option-value="value"
                  fluid
                />
                <Message
                  v-if="$form.theme?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.theme.error?.message }}
                </Message>
              </div>

              <div class="space-y-2">
                <label class="text-sm text-flow-muted">Locale</label>
                <InputText name="locale" fluid />
                <Message
                  v-if="$form.locale?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.locale.error?.message }}
                </Message>
              </div>

              <div class="space-y-2">
                <label class="text-sm text-flow-muted"
                  >Notifications Enabled</label
                >
                <ToggleSwitch name="notificationsEnabled" />
              </div>

              <div class="space-y-2">
                <label class="text-sm text-flow-muted">Developer Mode</label>
                <ToggleSwitch name="developerMode" />
              </div>

              <div class="md:col-span-2">
                <Button
                  type="submit"
                  label="Save General Settings"
                  :disabled="isBusy"
                />
              </div>
            </Form>
          </TabPanel>

          <TabPanel value="constants">
            <Tabs v-model:value="activeConstantTab">
              <TabList>
                <Tab
                  v-for="group in constantGroups"
                  :key="group.key"
                  :value="group.type"
                >
                  {{ group.label }}
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel
                  v-for="group in constantGroups"
                  :key="group.key"
                  :value="group.type"
                >
                  <div class="mb-4 flex items-center justify-between">
                    <div class="text-sm text-flow-muted">
                      Edit, add, or remove values for {{ group.label }}.
                    </div>
                    <Button
                      size="small"
                      label="Add Row"
                      @click="addConstantRow(group.type)"
                    />
                  </div>

                  <div class="space-y-3">
                    <div
                      v-for="(row, index) in resolveRows(group.type)"
                      :key="`${group.key}-${row.originalValue}-${index}`"
                      :class="[
                        'grid gap-2 rounded-flow-md border border-flow-border p-3',
                        usesSingleLabelInput(row)
                          ? 'md:grid-cols-[1fr_auto_auto_auto]'
                          : 'md:grid-cols-[1fr_1fr_auto_auto_auto]',
                      ]"
                    >
                      <InputText
                        v-if="!usesSingleLabelInput(row)"
                        v-model="row.value"
                        placeholder="Value"
                        fluid
                      />
                      <InputText
                        :model-value="
                          usesSingleLabelInput(row) ? row.value : row.label
                        "
                        :placeholder="
                          usesSingleLabelInput(row)
                            ? 'Label'
                            : 'Label (optional)'
                        "
                        fluid
                        @update:model-value="
                          (value) =>
                            usesSingleLabelInput(row)
                              ? updateSingleLabelValue(row, value ?? '')
                              : (row.label = value ?? '')
                        "
                      />
                      <div class="flex items-center gap-2">
                        <label class="text-xs text-flow-muted">Visible</label>
                        <ToggleSwitch v-model="row.isVisible" />
                      </div>
                      <Button
                        size="small"
                        label="Save"
                        :disabled="isBusy"
                        @click="saveConstantRow(group.type, row)"
                      />
                      <Button
                        size="small"
                        severity="danger"
                        label="Remove"
                        :disabled="isBusy"
                        @click="removeConstantRow(group.type, row)"
                      />
                    </div>

                    <div
                      v-if="resolveRows(group.type).length === 0"
                      class="rounded-flow-md border border-dashed border-flow-border p-4 text-sm text-flow-muted"
                    >
                      No values yet for this constant group.
                    </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </Dialog>
</template>
