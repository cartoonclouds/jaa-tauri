<script setup lang="ts">
  import DOMPurify from "dompurify";
  import { marked } from "marked";
  import { computed } from "vue";

  interface Props {
    markdown: string;
    editorStyle?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    editorStyle: "height: 14rem",
  });

  const renderedHtml = computed(() => {
    const parsed = marked.parse(props.markdown, { async: false });
    const rawHtml = typeof parsed === "string" ? parsed : "";
    return DOMPurify.sanitize(rawHtml);
  });
</script>

<template>
  <section
    :style="props.editorStyle"
    :innerHTML="renderedHtml"
    class="markdown-content prose max-w-full overflow-auto wrap-break-word whitespace-pre-wrap"
  ></section>
</template>

<style scoped>
  .markdown-content {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .markdown-content :deep(pre) {
    white-space: pre-wrap;
  }
</style>
