<script setup lang="ts">
  import type { TagModelType as TagModelTypeValue } from "@modules/tags/domain/enums/TagModelType";

  import { useTag } from "@modules/tags/composables/useTag";
  import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
  import { normalizeTagName } from "@modules/tags/utils/pendingTagResolution";
  import { computed, onMounted, ref } from "vue";

  interface Props {
    modelValue?: string[];
    pendingTagNames?: string[];
    placeholder?: string;
    /** Scope tags to a model type. Only tags matching this type (plus 'general') are shown. */
    tagModelType?: TagModelTypeValue;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    pendingTagNames: () => [],
    placeholder: "Tags",
    tagModelType: () => TagModelType.General,
  });

  const emit = defineEmits<{
    "update:modelValue": [value: string[]];
    "update:pendingTagNames": [value: string[]];
  }>();

  const PENDING_TAG_PREFIX = "__pending_tag__:";

  const { items, refresh } = useTag();
  const searchDraft = ref("");

  const scopedItems = computed(() =>
    items.value.filter(
      (tag) =>
        tag.modelType.value === props.tagModelType.value ||
        tag.modelType.value === TagModelType.General.value,
    ),
  );

  const scopedTagIdSet = computed(
    () => new Set(scopedItems.value.map((tag) => tag.id)),
  );

  const tagOptions = computed(() =>
    scopedItems.value.map((tag) => ({
      label: tag.name,
      value: tag.id,
    })),
  );

  const pendingTagOptions = computed(() =>
    props.pendingTagNames.map((name) => ({
      label: `${name} (new)`,
      value: `${PENDING_TAG_PREFIX}${encodeURIComponent(name.trim())}`,
    })),
  );

  const displayedTagOptions = computed(() => [
    ...tagOptions.value,
    ...pendingTagOptions.value,
  ]);

  function normalizeSelectedTagIds(
    selectedTagIds: readonly string[],
  ): string[] {
    return selectedTagIds.filter(
      (tagId) => tagId.trim().length > 0 && scopedTagIdSet.value.has(tagId),
    );
  }

  function syncNormalizedModelValue(): void {
    const normalizedTagIds = normalizeSelectedTagIds(props.modelValue);

    const hasSameLength = normalizedTagIds.length === props.modelValue.length;
    const hasSameOrder = hasSameLength
      ? normalizedTagIds.every(
          (tagId, index) => tagId === props.modelValue[index],
        )
      : false;

    if (hasSameOrder) {
      return;
    }

    emit("update:modelValue", normalizedTagIds);
  }

  const displayedModelValue = computed(() => [
    ...normalizeSelectedTagIds(props.modelValue),
    ...pendingTagOptions.value.map((option) => option.value),
  ]);

  const filteredTagOptions = computed(() => {
    const keyword = searchDraft.value.trim().toLowerCase();
    if (!keyword) {
      return displayedTagOptions.value;
    }

    return displayedTagOptions.value.filter((option) =>
      option.label.toLowerCase().includes(keyword),
    );
  });

  onMounted(() => {
    void (async () => {
      try {
        await refresh();
        syncNormalizedModelValue();
      } catch {
        // Keep the previous selection unchanged if tags fail to load.
      }
    })();
  });

  function updateModel(value: string[]): void {
    const nextTagIds: string[] = [];
    const nextPendingTagNames: string[] = [];

    for (const currentValue of value) {
      if (!currentValue.trim()) {
        continue;
      }

      if (currentValue.startsWith(PENDING_TAG_PREFIX)) {
        const pendingName = decodeURIComponent(
          currentValue.slice(PENDING_TAG_PREFIX.length),
        );
        if (pendingName) {
          nextPendingTagNames.push(pendingName);
        }
        continue;
      }

      if (scopedTagIdSet.value.has(currentValue)) {
        nextTagIds.push(currentValue);
      }
    }

    emit("update:modelValue", [...new Set(nextTagIds)]);
    emit("update:pendingTagNames", [
      ...new Set(
        nextPendingTagNames.map((name) => name.trim()).filter(Boolean),
      ),
    ]);
  }

  function appendSelectedTagId(tagId: string): void {
    if (props.modelValue.includes(tagId)) {
      return;
    }

    emit("update:modelValue", [...props.modelValue, tagId]);
  }

  function appendPendingTagName(name: string): void {
    const normalizedName = normalizeTagName(name);
    if (!normalizedName) {
      return;
    }

    const alreadyPending = props.pendingTagNames.some(
      (pendingName) => normalizeTagName(pendingName) === normalizedName,
    );

    if (alreadyPending) {
      return;
    }

    emit("update:pendingTagNames", [...props.pendingTagNames, name.trim()]);
  }

  function removePendingTagName(nameToRemove: string): void {
    const normalizedNameToRemove = normalizeTagName(nameToRemove);
    emit(
      "update:pendingTagNames",
      props.pendingTagNames.filter(
        (pendingName) =>
          normalizeTagName(pendingName) !== normalizedNameToRemove,
      ),
    );
  }

  function resolveTagIdByName(name: string): string | null {
    const normalizedName = normalizeTagName(name);
    if (!normalizedName) {
      return null;
    }

    const existingTag = scopedItems.value.find(
      (tag) => normalizeTagName(tag.name) === normalizedName,
    );

    return existingTag?.id ?? null;
  }

  function queueOrSelectTagByName(name: string): void {
    const draft = name.trim();
    if (!draft) {
      return;
    }

    const existingTagId = resolveTagIdByName(draft);
    if (existingTagId) {
      appendSelectedTagId(existingTagId);
      return;
    }

    appendPendingTagName(draft);
  }

  function onSearchEnter(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  function onAddTagClick(): void {
    queueOrSelectTagByName(searchDraft.value);
    searchDraft.value = "";
  }
</script>

<template>
  <MultiSelect
    :model-value="displayedModelValue"
    :options="filteredTagOptions"
    option-label="label"
    option-value="value"
    display="chip"
    :placeholder="placeholder"
    @update:model-value="updateModel"
  >
    <template #header>
      <div class="p-2">
        <InputText
          v-model="searchDraft"
          placeholder="Search tags"
          class="w-full"
          @keydown.enter="onSearchEnter"
        />
        <Button
          type="button"
          class="mt-2 w-full"
          size="small"
          @click="onAddTagClick"
        >
          <Icon name="heroicons:plus" class="h-4 w-4" />
          <span>Add tag</span>
        </Button>
      </div>
    </template>
    <template #footer>
      <div class="p-2">
        <div
          v-if="pendingTagNames.length"
          class="flex flex-wrap items-center gap-2"
        >
          <Tag
            v-for="pendingName in pendingTagNames"
            :key="pendingName"
            severity="warn"
            rounded
          >
            <div class="flex items-center gap-1">
              <span>{{ pendingName }}</span>
              <Button
                type="button"
                text
                rounded
                size="small"
                aria-label="Remove pending tag"
                @click="removePendingTagName(pendingName)"
              >
                <Icon name="heroicons:x-mark" class="h-3.5 w-3.5" />
              </Button>
            </div>
          </Tag>
        </div>
      </div>
    </template>
  </MultiSelect>
</template>
