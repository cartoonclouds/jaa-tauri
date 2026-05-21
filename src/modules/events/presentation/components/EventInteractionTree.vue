<script setup lang="ts">
  import type { Event } from "@modules/events/domain/entities/Event";
  import type { EventUpdatePayload } from "@modules/events/repositories/EventRepository";
  import type { TreeNode } from "primevue/treenode";

  import { useEvent } from "@modules/events/presentation/composables/useEvent";
  import { INTERACTION_STAGES } from "@modules/events/presentation/constants/interactionStages";
  import { computed, reactive, ref, watch } from "vue";

  interface EventTreeNodeData {
    kind: "application" | "stage" | "event";
    event?: Event;
  }

  const { items, isLoading, create, update, remove } = useEvent();

  const createForm = reactive({
    applicationId: "",
    type: INTERACTION_STAGES[0] ?? "Application/Saved",
    title: "",
    description: "",
    eventAt: "",
  });

  const isEditDialogVisible = ref(false);
  const isSavingEdit = ref(false);
  const isSavingCreate = ref(false);
  const editForm = reactive({
    id: "",
    type: "",
    title: "",
    description: "",
    eventAt: "",
  });

  const expandedKeys = ref<Map<string, boolean>>(new Map());

  const stageSuggestions = computed(() => INTERACTION_STAGES);

  function toDateTimeLocalValue(value: Date | null): string {
    if (!value) {
      return "";
    }

    const year = String(value.getFullYear());
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hour = String(value.getHours()).padStart(2, "0");
    const minute = String(value.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  function parseDateTimeLocal(value: string): Date | null {
    if (!value.trim()) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  function buildTreeNodes(events: Event[]): TreeNode[] {
    const sorted = [...events].sort((a, b) => {
      const left = a.eventAt?.getTime() ?? a.createdAt.getTime();
      const right = b.eventAt?.getTime() ?? b.createdAt.getTime();
      return left - right;
    });

    const applicationNodeMap = new Map<string, TreeNode>();

    for (const event of sorted) {
      const applicationKey = `application:${event.applicationId}`;
      let applicationNode = applicationNodeMap.get(applicationKey);

      if (!applicationNode) {
        applicationNode = {
          key: applicationKey,
          label: `Application ${event.applicationId}`,
          data: { kind: "application" } satisfies EventTreeNodeData,
          children: [],
        };
        applicationNodeMap.set(applicationKey, applicationNode);
      }

      let currentChildren = applicationNode.children ?? [];
      applicationNode.children = currentChildren;
      const stageParts = event.type
        .split("/")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      let stagePath = "";
      for (const part of stageParts) {
        stagePath = stagePath ? `${stagePath}/${part}` : part;
        const stageKey = `${applicationKey}:stage:${stagePath}`;
        let stageNode = currentChildren.find((node) => node.key === stageKey);

        if (!stageNode) {
          stageNode = {
            key: stageKey,
            label: part,
            data: { kind: "stage" } satisfies EventTreeNodeData,
            children: [],
          };
          currentChildren.push(stageNode);
        }

        currentChildren = stageNode.children ?? [];
        stageNode.children = currentChildren;
      }

      const eventDateLabel = event.eventAt
        ? event.eventAt.toLocaleDateString()
        : event.createdAt.toLocaleDateString();
      currentChildren.push({
        key: `event:${event.id}`,
        label: `${event.title} (${eventDateLabel})`,
        data: {
          kind: "event",
          event,
        } satisfies EventTreeNodeData,
        leaf: true,
      });
    }

    return Array.from(applicationNodeMap.values());
  }

  const treeNodes = computed(() => buildTreeNodes(items.value));

  function expandAllNodes(
    nodes: TreeNode[],
    target: Map<string, boolean>,
  ): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0 && node.key) {
        target.set(node.key, true);
        expandAllNodes(node.children, target);
      }
    }
  }

  watch(
    treeNodes,
    (nodes) => {
      const allExpanded = new Map<string, boolean>();
      expandAllNodes(nodes, allExpanded);
      expandedKeys.value = allExpanded;
    },
    { immediate: true },
  );

  function formatNodeMeta(event: Event | undefined): string {
    if (!event) {
      return "";
    }

    const eventAtLabel = event.eventAt
      ? event.eventAt.toLocaleString()
      : event.createdAt.toLocaleString();
    return `${eventAtLabel} | ${event.type}`;
  }

  function onNodeDblClick(node: TreeNode): void {
    const data = node.data as EventTreeNodeData | undefined;
    if (data?.kind !== "event" || !data.event) {
      return;
    }

    editForm.id = data.event.id;
    editForm.type = data.event.type;
    editForm.title = data.event.title;
    editForm.description = data.event.description ?? "";
    editForm.eventAt = toDateTimeLocalValue(data.event.eventAt);
    isEditDialogVisible.value = true;
  }

  async function submitCreate(): Promise<void> {
    if (
      !createForm.applicationId.trim() ||
      !createForm.title.trim() ||
      !createForm.type.trim()
    ) {
      return;
    }

    isSavingCreate.value = true;
    try {
      await create({
        applicationId: createForm.applicationId.trim(),
        contactId: null,
        type: createForm.type.trim(),
        title: createForm.title.trim(),
        description: createForm.description.trim() || null,
        eventAt: parseDateTimeLocal(createForm.eventAt),
      });

      createForm.title = "";
      createForm.description = "";
      createForm.eventAt = "";
    } finally {
      isSavingCreate.value = false;
    }
  }

  async function submitEdit(): Promise<void> {
    if (!editForm.id || !editForm.title.trim() || !editForm.type.trim()) {
      return;
    }

    isSavingEdit.value = true;
    try {
      const payload: EventUpdatePayload = {
        id: editForm.id,
        type: editForm.type.trim(),
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        eventAt: parseDateTimeLocal(editForm.eventAt),
      };

      await update(payload);
      isEditDialogVisible.value = false;
    } finally {
      isSavingEdit.value = false;
    }
  }

  async function deleteFromEditDialog(): Promise<void> {
    if (!editForm.id) {
      return;
    }

    isSavingEdit.value = true;
    try {
      await remove(editForm.id);
      isEditDialogVisible.value = false;
    } finally {
      isSavingEdit.value = false;
    }
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Application Interactions</h1>

    <div
      class="rounded-xl border border-surface-200 bg-surface-0 p-4 shadow-sm"
    >
      <h2 class="text-sm font-semibold text-surface-900">
        Add interaction event
      </h2>
      <p class="mb-4 text-xs text-surface-500">
        Use stage paths like
        <span class="font-mono">Interview/Technical/Final</span>
        to create any tree depth.
      </p>

      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitCreate">
        <div class="space-y-1">
          <label
            class="text-sm font-medium text-surface-700"
            for="event-application-id"
          >
            Application ID
          </label>
          <InputText
            id="event-application-id"
            v-model="createForm.applicationId"
            fluid
            placeholder="Application UUID"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700" for="event-type">
            Interaction stage
          </label>
          <InputText
            id="event-type"
            v-model="createForm.type"
            fluid
            list="interaction-stage-options"
            placeholder="Interview/Technical"
          />
        </div>

        <div class="space-y-1 md:col-span-2">
          <label class="text-sm font-medium text-surface-700" for="event-title">
            Title
          </label>
          <InputText
            id="event-title"
            v-model="createForm.title"
            fluid
            placeholder="Technical interview scheduled"
          />
        </div>

        <div class="space-y-1 md:col-span-2">
          <label
            class="text-sm font-medium text-surface-700"
            for="event-description"
          >
            Description
          </label>
          <Textarea
            id="event-description"
            v-model="createForm.description"
            fluid
            auto-resize
            rows="2"
            placeholder="Notes from recruiter or follow-up action"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700" for="event-at">
            Event time
          </label>
          <InputText
            id="event-at"
            v-model="createForm.eventAt"
            type="datetime-local"
            fluid
          />
        </div>

        <div class="flex items-end justify-end">
          <Button type="submit" label="Add event" :loading="isSavingCreate" />
        </div>
      </form>

      <datalist id="interaction-stage-options">
        <option v-for="stage in stageSuggestions" :key="stage" :value="stage" />
      </datalist>
    </div>

    <div
      class="rounded-xl border border-surface-200 bg-surface-0 p-4 shadow-sm"
    >
      <h2 class="mb-3 text-sm font-semibold text-surface-900">
        Possible interaction stages
      </h2>
      <div class="flex flex-wrap gap-2">
        <Chip v-for="stage in stageSuggestions" :key="stage" :label="stage" />
      </div>
    </div>

    <div
      class="rounded-xl border border-surface-200 bg-surface-0 p-4 shadow-sm"
    >
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-surface-900">Interaction tree</h2>
        <span class="text-xs text-surface-500"
          >Double-click an event to edit</span
        >
      </div>

      <Tree
        v-model:expanded-keys="expandedKeys"
        :value="treeNodes"
        :loading="isLoading"
        class="w-full"
      >
        <template #default="slotProps">
          <div
            class="w-full rounded-md px-2 py-1 transition hover:bg-surface-100"
            @dblclick="onNodeDblClick(slotProps.node as TreeNode)"
          >
            <p class="text-sm font-medium text-surface-900">
              {{ slotProps.node.label }}
            </p>
            <p class="text-xs text-surface-500">
              {{
                formatNodeMeta(
                  (slotProps.node.data as EventTreeNodeData)?.event,
                )
              }}
            </p>
          </div>
        </template>
      </Tree>
    </div>

    <Dialog
      v-model:visible="isEditDialogVisible"
      modal
      header="Edit interaction"
      :style="{ width: '38rem' }"
      :breakpoints="{ '1199px': '70vw', '575px': '95vw' }"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-1 md:col-span-2">
          <label
            class="text-sm font-medium text-surface-700"
            for="edit-event-type"
          >
            Interaction stage
          </label>
          <InputText
            id="edit-event-type"
            v-model="editForm.type"
            fluid
            list="interaction-stage-options"
            placeholder="Interview/Technical"
          />
        </div>

        <div class="space-y-1 md:col-span-2">
          <label
            class="text-sm font-medium text-surface-700"
            for="edit-event-title"
          >
            Title
          </label>
          <InputText id="edit-event-title" v-model="editForm.title" fluid />
        </div>

        <div class="space-y-1 md:col-span-2">
          <label
            class="text-sm font-medium text-surface-700"
            for="edit-event-description"
          >
            Description
          </label>
          <Textarea
            id="edit-event-description"
            v-model="editForm.description"
            fluid
            auto-resize
            rows="3"
          />
        </div>

        <div class="space-y-1 md:col-span-2">
          <label
            class="text-sm font-medium text-surface-700"
            for="edit-event-at"
          >
            Event time
          </label>
          <InputText
            id="edit-event-at"
            v-model="editForm.eventAt"
            type="datetime-local"
            fluid
          />
        </div>
      </div>

      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <Button
            type="button"
            severity="danger"
            outlined
            label="Delete"
            :loading="isSavingEdit"
            @click="deleteFromEditDialog"
          />
          <div class="flex gap-2">
            <Button
              type="button"
              severity="secondary"
              label="Cancel"
              :disabled="isSavingEdit"
              @click="isEditDialogVisible = false"
            />
            <Button
              type="button"
              label="Save"
              :loading="isSavingEdit"
              @click="submitEdit"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>
