<script setup lang="ts">
  import "quill/dist/quill.snow.css";
  import { ref, watch } from "vue";

  import { useHtmlToMarkdown } from "../../composables/useHtmlToMarkdown";
  import { useMarkdownToHtml } from "../../composables/useMarkdownToHtml";

  interface Props {
    modelValue: string;
    editorStyle?: string;
    placeholder?: string;
    readonly?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    editorStyle: "height: 14rem",
    placeholder: "Write notes in Markdown...",
    readonly: false,
  });

  const emit = defineEmits<{
    "update:modelValue": [value: string];
  }>();

  const htmlValue = ref("");
  let syncingFromModel = false;
  const { htmlToMarkdown } = useHtmlToMarkdown();
  const { markdownToHtml } = useMarkdownToHtml();

  watch(
    () => props.modelValue,
    (nextMarkdown) => {
      const nextHtml = markdownToHtml(nextMarkdown);

      if (nextHtml === htmlValue.value) {
        return;
      }

      syncingFromModel = true;
      htmlValue.value = nextHtml;
      syncingFromModel = false;
    },
    { immediate: true },
  );

  watch(htmlValue, (nextHtml) => {
    if (syncingFromModel) {
      return;
    }

    const nextMarkdown = htmlToMarkdown(nextHtml);
    if (nextMarkdown !== props.modelValue) {
      emit("update:modelValue", nextMarkdown);
    }
  });
</script>

<template>
  <Editor
    v-model="htmlValue"
    :editor-style="editorStyle"
    :placeholder="placeholder"
    :readonly="readonly"
  />
</template>
