<script setup lang="ts">
  import type { Event } from "@modules/events/domain/entities/Event";
  import type { EventUpdatePayload } from "@modules/events/types";
  import type { TreeNode } from "primevue/treenode";

  import { useEvent } from "@modules/events/composables/useEvent";
  import {
    INTERACTION_STAGES,
    type InteractionStage,
    isInteractionStage,
  } from "@modules/events/constants";
  import EventInteractionEditDialog from "@modules/events/presentation/components/dialogs/EventInteractionEditDialog.vue";
  import { toErrorMessage } from "@shared/utils/error";
  import { temporalToEpochMilliseconds } from "@shared/utils/temporal";
  import {
    formatDisplayDate,
    formatDisplayDateTime,
  } from "@shared/utils/toDate";
  import { computed, reactive, ref, watch } from "vue";

  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  interface EventTreeNodeData {
    kind: "application" | "stage" | "event";
    event?: Event;
  }

  interface InteractionDialogFormState {
    id: string;
    applicationId: string;
    type: InteractionStage | "";
    title: string;
    description: string;
  }

  const { items, isLoading, error, clearError, create, update, remove } =
    useEvent();

  const interactionDialogMode = ref<"create" | "edit">("create");
  const interactionForm = reactive<InteractionDialogFormState>({
    id: "",
    applicationId: "",
    type: INTERACTION_STAGES[0],
    title: "",
    description: "",
  });

  const isInteractionDialogVisible = ref(false);
  const isSavingInteraction = ref(false);

  useBodyScrollLock(isInteractionDialogVisible);

  const expandedKeys = ref<Record<string, boolean>>({});

  const stageSuggestions = computed<readonly InteractionStage[]>(
    () => INTERACTION_STAGES,
  );

  const surfaceCardStyle = {
    background: "var(--p-content-background)",
    borderColor: "var(--p-content-border-color)",
    color: "var(--p-content-color)",
  } as const;

  const titleTextStyle = {
    color: "var(--p-text-color)",
  } as const;

  const mutedTextStyle = {
    color: "var(--p-text-muted-color)",
  } as const;

  function getNodeCardStyle(): Record<string, string> {
    return {
      background: "var(--p-content-background)",
      borderColor: "var(--p-content-border-color)",
      color: "var(--p-content-color)",
    };
  }

  function getNodeMetaStyle(): Record<string, string> {
    return {
      color: "var(--p-text-muted-color)",
    };
  }

  const eventErrorMessage = computed(() => {
    if (!error.value) {
      return "";
    }

    return toErrorMessage(error.value, "Failed to manage interaction.");
  });

  function buildTreeNodes(events: Event[]): TreeNode[] {
    const sorted = [...events].sort((a, b) => {
      const left = temporalToEpochMilliseconds(a.createdAt);
      const right = temporalToEpochMilliseconds(b.createdAt);
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

      const eventDateLabel = formatDisplayDate(event.createdAt);
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
    target: Record<string, boolean>,
  ): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0 && node.key) {
        target[node.key] = true;
        expandAllNodes(node.children, target);
      }
    }
  }

  function expandAll(): void {
    const allExpanded: Record<string, boolean> = {};
    expandAllNodes(treeNodes.value, allExpanded);
    expandedKeys.value = allExpanded;
  }

  function collapseAll(): void {
    expandedKeys.value = {};
  }

  watch(
    treeNodes,
    (nodes) => {
      const allExpanded: Record<string, boolean> = {};
      expandAllNodes(nodes, allExpanded);
      expandedKeys.value = allExpanded;
    },
    { immediate: true },
  );

  function formatNodeMeta(event: Event | undefined): string {
    if (!event) {
      return "";
    }

    const eventAtLabel = formatDisplayDateTime(event.createdAt);
    return `${eventAtLabel} | ${event.type}`;
  }

  function onNodeDblClick(node: TreeNode): void {
    const data = node.data as EventTreeNodeData | undefined;
    if (data?.kind !== "event" || !data.event) {
      return;
    }

    interactionDialogMode.value = "edit";
    interactionForm.id = data.event.id;
    interactionForm.applicationId = data.event.applicationId;
    interactionForm.type = isInteractionStage(data.event.type)
      ? data.event.type
      : INTERACTION_STAGES[0];
    interactionForm.title = data.event.title;
    interactionForm.description = data.event.description ?? "";
    isInteractionDialogVisible.value = true;
  }

  function openCreateInteractionDialog(): void {
    interactionDialogMode.value = "create";
    interactionForm.id = "";
    interactionForm.applicationId = "";
    interactionForm.type = INTERACTION_STAGES[0];
    interactionForm.title = "";
    interactionForm.description = "";
    isInteractionDialogVisible.value = true;
  }

  async function submitInteraction(): Promise<void> {
    if (interactionDialogMode.value === "create") {
      if (
        !interactionForm.applicationId.trim() ||
        !interactionForm.title.trim() ||
        !isInteractionStage(interactionForm.type)
      ) {
        return;
      }

      isSavingInteraction.value = true;
      try {
        await create({
          applicationId: interactionForm.applicationId.trim(),
          type: interactionForm.type,
          title: interactionForm.title.trim(),
          description: interactionForm.description.trim() || null,
        });

        isInteractionDialogVisible.value = false;
      } finally {
        isSavingInteraction.value = false;
      }

      return;
    }

    if (
      !interactionForm.id ||
      !interactionForm.title.trim() ||
      !isInteractionStage(interactionForm.type)
    ) {
      return;
    }

    isSavingInteraction.value = true;
    try {
      const payload: EventUpdatePayload = {
        id: interactionForm.id,
        type: interactionForm.type,
        title: interactionForm.title.trim(),
        description: interactionForm.description.trim() || null,
      };

      await update(payload);
      isInteractionDialogVisible.value = false;
    } finally {
      isSavingInteraction.value = false;
    }
  }

  async function deleteFromInteractionDialog(): Promise<void> {
    if (interactionDialogMode.value !== "edit" || !interactionForm.id) {
      return;
    }

    isSavingInteraction.value = true;
    try {
      await remove(interactionForm.id);
      isInteractionDialogVisible.value = false;
    } finally {
      isSavingInteraction.value = false;
    }
  }

  watch(isInteractionDialogVisible, (isVisible) => {
    if (!isVisible) {
      clearError();
    }
  });
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold" :style="titleTextStyle">
      Application Interactions
    </h1>

    <div class="rounded-xl border p-4 shadow-sm" :style="surfaceCardStyle">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold" :style="titleTextStyle">
            Add interaction event
          </h2>
          <p class="text-xs" :style="mutedTextStyle">
            Use stage paths like
            <span class="font-mono">Interview/Technical/Final</span>
            to create any tree depth.
          </p>
        </div>

        <Button type="button" @click="openCreateInteractionDialog">
          <Icon name="heroicons:plus" class="h-4 w-4" />
          <span>Add event</span>
        </Button>
      </div>

      <Message v-if="eventErrorMessage" severity="error">
        {{ eventErrorMessage }}
      </Message>
    </div>

    <div class="rounded-xl border p-4 shadow-sm" :style="surfaceCardStyle">
      <h2 class="mb-3 text-sm font-semibold" :style="titleTextStyle">
        Possible interaction stages
      </h2>
      <div class="flex flex-wrap gap-2">
        <Chip v-for="stage in stageSuggestions" :key="stage" :label="stage" />
      </div>
    </div>

    <div class="rounded-xl border p-4 shadow-sm" :style="surfaceCardStyle">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold" :style="titleTextStyle">
          Interaction tree
        </h2>
        <div class="flex items-center gap-2">
          <Button type="button" size="small" text @click="expandAll">
            <Icon name="heroicons:plus" class="h-4 w-4" />
            <span>Expand all</span>
          </Button>
          <Button type="button" size="small" text @click="collapseAll">
            <Icon name="heroicons:minus" class="h-4 w-4" />
            <span>Collapse all</span>
          </Button>
          <span class="text-xs" :style="mutedTextStyle"
            >Double-click an event to edit</span
          >
        </div>
      </div>

      <Tree
        v-model:expanded-keys="expandedKeys"
        :value="treeNodes"
        :loading="isLoading"
        filter
        filter-mode="lenient"
        filter-placeholder="Filter interactions"
        class="w-full"
      >
        <template #default="slotProps">
          <div
            class="w-full rounded-md border px-2 py-1 transition hover:bg-(--p-content-hover-background)"
            :style="getNodeCardStyle()"
            @dblclick="onNodeDblClick(slotProps.node as TreeNode)"
          >
            <p class="text-sm font-medium" :style="titleTextStyle">
              {{ slotProps.node.label }}
            </p>
            <p class="text-xs" :style="getNodeMetaStyle()">
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

    <EventInteractionEditDialog
      v-model:visible="isInteractionDialogVisible"
      :mode="interactionDialogMode"
      :application-id="interactionForm.applicationId"
      :event-type="interactionForm.type"
      :title="interactionForm.title"
      :description="interactionForm.description"
      :is-saving="isSavingInteraction"
      :error-message="eventErrorMessage"
      :stage-suggestions="stageSuggestions"
      :muted-text-style="mutedTextStyle"
      @update:application-id="interactionForm.applicationId = $event"
      @update:event-type="interactionForm.type = $event"
      @update:title="interactionForm.title = $event"
      @update:description="interactionForm.description = $event"
      @save="submitInteraction"
      @delete="deleteFromInteractionDialog"
    />
  </div>
</template>
