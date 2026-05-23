<script setup lang="ts">
  import type { PersistedConstantType } from "@modules/settings/constants/persistedConstantTypes";
  import type { FormSubmitEvent } from "@primevue/forms";

  import { logError } from "@infra/logging/tauriLog.client";
  import {
    PERSISTED_CONSTANT_TYPES,
    useSettingService,
  } from "@modules/settings";
  import { Form } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { computed, reactive, ref, watch } from "vue";
  import { z } from "zod";

  interface Props {
    visible: boolean;
  }

  interface GeneralFormValues {
    theme: "dark" | "light" | "system";
    locale: string;
    notificationsEnabled: boolean;
    developerMode: boolean;
  }

  interface ConstantEditorRow {
    isNew: boolean;
    label: string;
    originalValue: string;
    value: string;
  }

  interface ConstantGroup {
    key: string;
    label: string;
    type: PersistedConstantType;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const settingService = useSettingService();

  const modalVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const constantGroups = computed<ConstantGroup[]>(() => {
    return Object.entries(PERSISTED_CONSTANT_TYPES).map(([key, type]) => ({
      key,
      label: key
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      type,
    }));
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

  function resolveRows(type: PersistedConstantType): ConstantEditorRow[] {
    return constantRowsByType[type] ?? [];
  }

  function addConstantRow(type: PersistedConstantType): void {
    const rows = resolveRows(type);
    rows.push({
      isNew: true,
      label: "",
      originalValue: "",
      value: "",
    });
    constantRowsByType[type] = rows;
  }

  async function loadState(): Promise<void> {
    isBusy.value = true;

    try {
      const [settings, constantRowsByGroup] = await Promise.all([
        settingService.list(),
        Promise.all(
          constantGroups.value.map(async (group) => ({
            rows: await settingService.listConstantRows(group.type),
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

  async function saveConstantRow(
    type: PersistedConstantType,
    row: ConstantEditorRow,
  ): Promise<void> {
    isBusy.value = true;

    try {
      const nextValue = row.value.trim();
      if (nextValue.length === 0) {
        return;
      }

      await settingService.upsertConstantRow({
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

  async function removeConstantRow(
    type: PersistedConstantType,
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
                      class="grid gap-2 rounded-flow-md border border-flow-border p-3 md:grid-cols-[1fr_1fr_auto_auto]"
                    >
                      <InputText
                        v-model="row.value"
                        placeholder="Value"
                        fluid
                      />
                      <InputText
                        v-model="row.label"
                        placeholder="Label (optional)"
                        fluid
                      />
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
